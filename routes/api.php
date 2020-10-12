<?php

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CourseController;
use Illuminate\Support\Facades\DB;
use App\Models\Course;
use App\Models\UserCourse;
use App\Models\Professor;
use App\Models\Period;
use App\Models\UserPeriod;
use App\Models\User;

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

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/public', function (Request $request) {
  DB::transaction(function () {
    $course = Course::create([
      "year" => 2020,
      "term" => 1,
      "coursecode" => "FINA2220A",
      "coursegroup" => "FINA2220",
      "unit" => 3,
      "coursename" => "fin",
      "coursenamec" => "andrew blah",
      "quota" => 50,
    ]);
    $course->professors()->create([
      "name" => "Andrew NG",
    ]);
    $course->periods()->createMany([
      [
        "day" => "T",
        "start" => 3,
        "end" => 4,
        "venue" => "ELB 306",
        "type" => "LEC",
        "lang" => "E",
        "quota" => 50,
      ],
      [
        "day" => "H",
        "start" => 9,
        "end" => 10,
        "venue" => "ELB 307",
        "type" => "LEC",
        "lang" => "E",
        "quota" => 50,
      ],
    ]);
    $user = User::create([
      "name" => "test1",
      "email" => "test1@cuts.hk",
      "sub" => "auth0|abcdefg3",
    ]);
    $timetable = $user->timetables()->create([
      "year" => 2020,
      "term" => 1,
      "unit" => 12,
      "score" => 80,
    ]);
    $user_course = new UserCourse;
    $user_course->color = "#07ae35";
    $user_course->course()->associate($course);
    $user_course->timetable()->associate($timetable);
    $user_course->save();
    $user_period = new UserPeriod;
    $user_period->necessity = true;
    $user_period->user_course()->associate($user_course);
    $user_period->period()->associate($course->periods[0]);
    $user_period->save();
    $user_period->custom_period()->create([
      "day" => "F",
      "start" => 11,
      "end" => 11,
      "venue" => "CCCC",
    ]);
  });

  return response()->json(["message" => "Hello public"]);
});

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
