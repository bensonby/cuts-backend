<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Course;
use App\Models\Professor;
use App\Models\Period;
use App\Models\UserPeriod;

class UpdateCourses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:courses
                           {filename : YYYY_yyyymmdd_hhmm.txt}';

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
        $pgCoursecodes = config('courses.pg_coursecodes');

        // TODO: backup DB first
        DB::transaction(function () use ($filename, $year, $pgCoursecodes) {
          $coursecodes = $this->processFile($filename, $year, $pgCoursecodes);
          // check for deleted courses
          foreach([1, 2] as $term) {
            $this->deleteCourses(
              $coursecodes[$term],
              $year,
              $term,
            );
          }
        });

        return 0;
    }

    private function processFile($filename, $year, $pgCoursecodes) {
      $coursecodes = [[], [], []]; // return list of coursecodes for deletion
      $course_count = count(file($filename)) - 1; // header
      $bar = $this->output->createProgressBar($course_count);
      $bar->start();
      if (($handle = fopen($filename, "r")) !== FALSE) {
        $dummy = fgets($handle); // skip header
        while (($data = fgetcsv($handle, 0, "\t", '"')) !== FALSE) {
          $newCourse = $this->buildCourseFromData($data);
          if (!$newCourse) {
            continue;
          }
          // post grad courses handling
          if(intval($newCourse['coursecode'][4]) >= 5) {
            if (!in_array($newCourse['coursecode'], $pgCoursecodes)
              && !in_array(substr($newCourse['coursecode'], 0, 5), $pgCoursecodes)
            ) {
              $bar->advance();
              continue;
            }
          }
          if (in_array($newCourse['term'], [1, 2])) {
            $this->handleCourseUpdate($year, $newCourse);
            $coursecodes[$newCourse['term']][] = $newCourse['coursecode'];
          } else {
            $newCourse1 = $newCourse;
            $newCourse2 = $newCourse;
            $newCourse1['term'] = 1;
            $newCourse2['term'] = 2;
            $this->handleCourseUpdate($year, $newCourse1);
            $this->handleCourseUpdate($year, $newCourse2);
            $coursecodes[1][] = $newCourse['coursecode'];
            $coursecodes[2][] = $newCourse['coursecode'];
          }
          $bar->advance();
        }
      }
      $bar->finish();
      $this->output->newLine();
      return $coursecodes;
    }

    private function handleCourseUpdate($year, $newCourse) {
        // Course update
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
        $course_changed = false;
        // Period update
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
          if ($period->wasRecentlyCreated) {
            foreach($course->user_courses as $uc) {
              $userPeriod = new UserPeriod;
              $userPeriod->necessity = true;
              $userPeriod->user_course()->associate($uc);
              $userPeriod->period()->associate($period);
              $userPeriod->save();
            }
          }
        }
        $current_period_types = array_map(
          function ($p) { return $p['type']; },
          $newCourse['periods']
        );
        $periods_deleted = false;
        foreach($course->periods as $p) {
          if (!in_array($p->type, $current_period_types)) {
            $p->delete();
            $periods_deleted = true;
          }
        }
        if ($periods_deleted) {
          $course_changed = true;
        }
        // Professor update
        $professor_ids = array_map(function ($name) {
          $professor = Professor::firstOrCreate(['name' => $name], []);
          return $professor->id;
        }, $newCourse['professors']);
        $changed = $course->professors()->sync($professor_ids);
        if (count($changed['attached']) > 0 || count($changed['detached'])
          || count($changed['updated']) > 0) {
          // professor changed
          // https://laravel.io/forum/05-20-2014-how-can-i-tell-if-a-many-to-many-sync-actually-changed-anything
          $course_changed = true;
        }
        if ($course_changed) {
          foreach($course->user_courses as $uc) {
            $uc->touch();
          }
          $course->touch();
        }
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
          throw new \Exception('Coursecode is invalid: ' . $record['coursecode']);
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
          throw new \Exception($record['coursecode'] . ' has multiple periods having the same type.');
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
    private function deleteCourses($newCoursecodes, $year, $term) {
      $existingCoursecodes = Course::where('year', $year)
        ->where('term', $term)
        ->pluck('coursecode')
        ->toArray();
      $deletedCourses = array_diff($existingCoursecodes, $newCoursecodes);
      $courses = Course::where('year', $year)
        ->where('term', $term)
        ->whereIn('coursecode', $deletedCourses)
        ->with('user_courses')
        ->get();
      foreach($courses as $c) {
        foreach($c['user_courses'] as $uc) {
          $timetable = $uc->timetable;
          $timetable->unit = $timetable->unit - $c->unit;
          $timetable->save();
        }
      }
      Course::where('year', $year)
        ->where('term', $term)
        ->whereIn('coursecode', $deletedCourses)
        ->delete();
    }
}

function hasDuplicates($values) {
  // Note: $values can only contain integer or string for this function to work
  // otherwise use array_unique instead of array_flip
  return count($values) !== count(array_flip($values));
}
