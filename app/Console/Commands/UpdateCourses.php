<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

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

        $bar = $this->output->createProgressBar($course_count);
        $bar->start();

        // skip header
        if (($handle = fopen($filename, "r")) !== FALSE) {
            $dummy = fgets($handle); // header
            while (($data = fgetcsv($handle, 0, "\t", '"')) !== FALSE) {
              $course = $this->buildCourseFromData($data);

              $bar->advance();
            }
        }

        $bar->finish();
        $this->output->newLine();
        return 0;
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
