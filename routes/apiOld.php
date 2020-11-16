<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\GetAppMeta;

/* deprecated APIs */
Route::get('/app_meta_info.php', GetAppMeta::class);

Route::prefix('')->get('app_coursecode_list.php', function (Request $request) {
  $year = intval($request->input('year'));
  $term = intval($request->input('term'));
  $controller = new CourseController;
  return $controller->getCoursecodes($year, $term);
});

Route::get(
  'ajax_planner2_get_course.php',
  [CourseController::class, 'getCoursesWithOldApi']
);

Route::get(
  'ajax_planner2_get_course_by_period.php',
  [CourseController::class, 'getCoursesByPeriodWithOldApi']
);

Route::post(
  'app_course_search.php',
  [CourseController::class, 'getCoursesAdvancedWithOldApi']
);
