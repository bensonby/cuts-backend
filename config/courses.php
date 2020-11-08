<?php

return [
  'pg_coursecodes' => explode(',', env('CUTS_PG_COURSES')),
  'ml' => [
    'host' => env('CUTS_ML_HOST'),
    'num_chunks' => env('CUTS_ML_NUM_CHUNKS'),
    'api_key' => env('CUTS_ML_API_KEY'),
    'threshold' => env('CUTS_ML_THRESHOLD'),
  ],
];
