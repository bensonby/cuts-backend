<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Period;
use App\Models\Timetable;
use App\Models\User;
use App\Models\UserCourse;
use App\Models\UserPeriod;

class UserController extends Controller
{
  public function getTimetables() {
    $user = Auth::user();
    $timetables = $user->timetables()->with([
      'user_courses.user_periods',
      'user_courses.course.professors',
      'user_courses.user_periods.period',
      'user_courses.user_periods.custom_period',
    ])->get();
    return response()->json($timetables);
  }

  public function saveTimetable(Request $request, $year, $term) {
    $user = Auth::user();
    DB::transaction(function () use ($request, $user, $year, $term) {
      $timetable = $user->timetables()->firstOrCreate(
        ['year' => $year, 'term' => $term],
        ['unit' => 0]
      );
      $timetable->user_courses()->delete();
      $inputUserCourses = $request->input('userCourses');
      foreach($inputUserCourses as $uc) {
        $userCourse = new UserCourse;
        $userCourse->color = $uc['color'];
        $course = Course::find($uc['course']['id']);
        $userCourse->course()->associate($course);
        $userCourse->timetable()->associate($timetable);
        $userCourse->save();
        $userCourses[] = $userCourse;
        foreach($uc['userPeriods'] as $up) {
          $userPeriod = new UserPeriod;
          $userPeriod->necessity = $up['necessity'];
          $userPeriod->user_course()->associate($userCourse);
          $period = Period::find($up['period']['id']);
          $userPeriod->period()->associate($period);
          $userPeriod->save();
          $userPeriods[] = $userPeriod;
        }
        // TODO check if userPeriods complete against course.periods
        // TODO custom_period
        // delete if no userCourses
        // validate course's year and term = timetable year and term
      }
      // update timetable unit and score
    });
    return response()->json(['userCourses' => $userCourses, 'userPeriods' => $userPeriods]);
  }
}
