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
        $rows = file($filename);

        // TODO: backup DB first

        $bar = $this->output->createProgressBar(count($rows) - 1);
        $bar->start();

        // skip header
        for ($i = 0; $i < count($rows); $i++) {

            $bar->advance();
        }

        $bar->finish();
        $this->output->newLine();
        return 0;
    }
}
