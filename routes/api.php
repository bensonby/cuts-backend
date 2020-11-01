<?php

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CourseController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

function get_almanac() {
  $earliestYear = env('CUTS_DATA_EARLIEST_YEAR');
  $latestYear = env('CUTS_DATA_LATEST_YEAR');
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

function get_meta_info() {
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
}

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/app_meta_info.php', function (Request $request) {
  return response()->json(get_meta_info());
});

Route::get('meta', function (Request $request) {
  return response()->json(get_meta_info());
})->middleware('version.check:5.0.0-dev,2.0.0-dev');

Route::middleware('jwt')->group(function () {
  Route::get('/private', function (Request $request) {
    return response()->json(["message" => "Hello private"]);
  });

  Route::post(
    '/app_get_timetable.php',
    [UserController::class, 'getTimetables']
  )->middleware('version.check:5.0.0-dev,2.0.0-dev');

  Route::post(
    '/timetable/{year}/{term}',
    [UserController::class, 'saveTimetable']
  )->middleware('version.check:5.0.0-dev,2.0.0-dev');

  Route::post(
    'suggestions/{year}/{term}',
    [CourseController::class, 'getSuggestions']
  )->middleware('version.check:5.0.0-dev,2.0.0-dev');
});

Route::get('ajax_save_timetable.php', function (Request $request) {
  return response()->json(["message" => "Please update your App"], 400);
});

Route::get('app_coursecode_list.php', function (Request $request) {
  return response()->json(["message" => "Please update your App"], 400);
});

Route::get(
  'coursecodes/{year}/{term}',
  [CourseController::class, 'getCoursecodes']
)->middleware('version.check:5.0.0-dev,2.0.0-dev');

Route::get(
  'courses/{year}/{term}/{coursecode}',
  [CourseController::class, 'getCourses']
)->middleware('version.check:5.0.0-dev,2.0.0-dev');

Route::post(
  'courses/{year}/{term}',
  [CourseController::class, 'getByCoursegroups']
)->middleware('version.check:5.0.0-dev,2.0.0-dev');

Route::post(
  'courses',
  [CourseController::class, 'getByAdvanced']
)->middleware('version.check:5.0.0-dev,2.0.0-dev');
