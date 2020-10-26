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

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/public', function (Request $request) {
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
