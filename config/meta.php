<?php

// prevent PHP Fatal Error for redeclaring the function
if (!function_exists('get_almanac')) {
  function get_almanac() {
    $earliestYear = intval(env('CUTS_DATA_EARLIEST_YEAR'));
    $latestYear = intval(env('CUTS_DATA_LATEST_YEAR'));
    $result = [];
    for ($year = $latestYear; $year >= $earliestYear; $year--) {
      for ($term = 1; $term <= 2; $term++) {
        $yearterm = $year . '_' . $term;
        $termStartDate = env('CUTS_TERM_START_DATE_' . $yearterm , '');
        if ($termStartDate == '') {
          continue;
        }
        $termEndDate = env('CUTS_TERM_END_DATE_' . $yearterm);
        $holidays = explode(',', env('CUTS_HOLIDAYS_' . $yearterm));
        if (!array_key_exists($year . '', $result)) {
          $result[$year . ''] = [];
        }
        $result[$year . ''][$term . ''] = [
          'term_start_date' => $termStartDate,
          'term_end_date' => $termEndDate,
          'holidays' => $holidays,
        ];
      }
    }
    return $result;
  }
}

return [
  'data_last_updated' => env('CUTS_DATA_LAST_UPDATE'),
  'latest_year' => intval(env('CUTS_DATA_LATEST_YEAR', 2020)),
  'almanac_version' => env('CUTS_ALMANAC_VERSION'),
  'almanac' => get_almanac(),
  'notice' => explode('|', env('CUTS_NOTICE')),
  'update_available_message' => env('CUTS_UPDATE_AVAILABLE_MESSAGE'),
  'is_update_available' => env('CUTS_IS_UPDATE_AVAILABLE'), // depreciated for ios_/android_latest_version
  'latest_version' => env('CUTS_LATEST_VERSION'), // depreciated since android v4 / ios v1, for android_ and ios_
  'ios_latest_version' => env('CUTS_IOS_LATEST_VERSION'),
  'android_latest_version' => env('CUTS_ANDROID_LATEST_VERSION'),
  'should_force_quit' => env('CUTS_SHOULD_FORCE_QUIT'),
  'ios_update_link' => env('CUTS_IOS_UPDATE_LINK'),
  'android_update_link' => env('CUTS_ANDROID_UPDATE_LINK'),
  'tos_link' => env('CUTS_TOS_LINK'),
  'privacy_policy_link' => env('CUTS_PRIVACY_POLICY_LINK'),
];
