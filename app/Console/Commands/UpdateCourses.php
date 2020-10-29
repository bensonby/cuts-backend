<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Course;
use App\Models\Professor;
use App\Models\Period;

class UpdateCourses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:courses {filename : YYYY_yyyymmdd_hhmm.txt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or Update course information for an academic year.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $filename = $this->argument('filename');
        $isMatched = preg_match('/^([0-9]{4})_([0-9]{8})_([0-9]{4}).txt$/', basename($filename), $matches);
        if ($isMatched != 1) {
            $this->error('filename not in expected format: YYYY_yyyymmdd_hhmm.txt');
            return 1;
        }
        $year = $matches[1];
        $course_count = count(file($filename)) - 1; // header

        // TODO: backup DB first
        // TODO: also get undergrad

        $bar = $this->output->createProgressBar($course_count);
        $bar->start();

        $existingCourses = Course::where('year', $year)->get();
        if (($handle = fopen($filename, "r")) !== FALSE) {
            $dummy = fgets($handle); // skip header
            while (($data = fgetcsv($handle, 0, "\t", '"')) !== FALSE) {
              $newCourse = $this->buildCourseFromData($data);
              if (!$newCourse) {
                continue;
              }
              if (in_array($newCourse['term'], [1, 2])) {
                $this->handleCourseUpdate($year, $newCourse);
              } else {
                $newCourse1 = $newCourse;
                $newCourse2 = $newCourse;
                $newCourse1['term'] = 1;
                $newCourse2['term'] = 2;
                $this->handleCourseUpdate($year, $newCourse1);
                $this->handleCourseUpdate($year, $newCourse2);
              }

              $bar->advance();
            }
        }

        $bar->finish();
        // TODO: remove deleted courses and periods
        $this->output->newLine();
        return 0;
    }

    private function handleCourseUpdate($year, $newCourse) {
        $course = Course::updateOrCreate(
          [
            'coursecode' => $newCourse['coursecode'],
            'year' => $year,
            'term' => $newCourse['term'],
          ],
          [
            'coursegroup' => substr($newCourse['coursecode'], 0, 8),
            'unit' => $newCourse['unit'],
            'coursename' => $newCourse['coursenameLong'],
            'coursenamec' => $newCourse['coursenamec'],
          ]
        );
        // TODO: check if period information is unique by type
        foreach ($newCourse['periods'] as $period) {
          $period = $course->periods()->updateOrCreate(
            [
              'type' => $period['type'],
            ],
            [
              'quota' => $period['quota'],
              'lang' => $period['lang'],
              'venue' => $period['venue'],
              'day' => $period['day'],
              'start' => $period['start'],
              'end' => $period['end'],
            ],
          );
          // TODO: add to user's periods if new
          // $period->wasRecentlyCreated
        }
        $professor_ids = array_map(function ($name) {
          $professor = Professor::firstOrCreate(['name' => $name], []);
          return $professor->id;
        }, $newCourse['professors']);
        $course->professors()->sync($professor_ids);
        // TODO: check if updated by using the result from sync
        // https://laravel.io/forum/05-20-2014-how-can-i-tell-if-a-many-to-many-sync-actually-changed-anything
    }

    private function buildCourseFromData($data) {
        // 1	AIST1000	Introduction to Artificial Intelligence and Machine Learning	Introduction to AI & ML	人工智能與機器學習入門	1	50:English only:LEC/MP1/01:NRR:T:6:6|50:English only:PRJ/MP1/01:NRR:T:7:7	Dr. CHAU Chuck Jee|Mr. FUNG Ping Fu
        $keys = [
            'term',
            'coursecode',
            'coursenameLong',
            'coursenameShort',
            'coursenamec',
            'unit',
            'periodsStr',
            'professorsStr',
        ];
        $record = array_combine($keys, $data);
        if (strlen($record['coursecode']) < 2) {
          return false;
        }
        $record['term'] = intval($record['term']);
        $record['unit'] = intval($record['unit']);
        if (strlen($record['professorsStr']) <= 1) {
            $record['professorsStr'] = 'UNKNOWN';
        }
        if (strlen($record['coursenamec']) <= 1) { // may show 0 in ELTU1002
            $record['coursenamec'] = $record['coursenameShort'];
        }
        $record['professors'] = explode('|', $record['professorsStr']);
        $record['periods'] = array_map(array($this, 'buildPeriodFromData'), explode('|', $record['periodsStr']));
        $types = array_map(function ($p) { return $p['type']; }, $record['periods']);
        if (hasDuplicates($types)) {
          $this->output->newLine();
          $this->error($record['coursecode'] . ' has multiple periods having the same type.');
          return false;
        }
        return $record;
    }

    private function buildPeriodFromData($data) {
        // 20:English only:TUT/MP1/01:NRR:W:5:5
        $keys = ['quota', 'lang', 'type', 'venue', 'day', 'start', 'end'];
        $record = array_combine($keys, explode(':', $data));
        $record['quota'] = intval($record['quota']);
        $record['start'] = intval($record['start']);
        $record['end'] = intval($record['end']);
        return $record;
    }
}

function hasDuplicates($values) {
  // Note: $values can only contain integer or string for this function to work
  // otherwise use array_unique instead of array_flip
  return count($values) !== count(array_flip($values));
}
