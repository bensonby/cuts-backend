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

  public function saveTimetableByCoursecodes(Request $request, $year, $term) {
    $user = User::find(135026);
    $timetable = DB::transaction(function () use ($request, $user, $year, $term) {
      $timetable = $user->timetables()->firstOrCreate(
        ['year' => $year, 'term' => $term],
        ['unit' => 0]
      );
      $timetable->user_courses()->delete();
      foreach($request->input('coursecodes') as $coursecode) {
        $course = Course::where('coursecode', $coursecode)->where('year', $year)->where('term', $term)->first();
        $userCourse = new UserCourse;
        $userCourse->color = '4899BE';
        $userCourse->course()->associate($course);
        $userCourse->timetable()->associate($timetable);
        $userCourse->save();
        $userCourses[] = $userCourse;
        foreach($course->periods as $period) {
          $userPeriod = new UserPeriod;
          $userPeriod->necessity = true;
          $userPeriod->user_course()->associate($userCourse);
          $userPeriod->period()->associate($period);
          $userPeriod->save();
        }
      }
      $timetable->calculateUnit();
      $timetable->touch();
      $timetable->save();
      return $timetable;
    });
    $timetable->load(
      'user_courses.user_periods',
      'user_courses.course.professors',
      'user_courses.user_periods.period',
      'user_courses.user_periods.custom_period',
    );
    return response()->json(['timetable' => $timetable]);
  }

  public function saveTimetable(Request $request, $year, $term) {
    $user = Auth::user();
    $timetable = DB::transaction(function () use ($request, $user, $year, $term) {
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
          if ($up['customPeriod']) {
            $userPeriod->custom_period()->create([
              "day" => $up['customPeriod']['day'],
              "start" => $up['customPeriod']['start'],
              "end" => $up['customPeriod']['end'],
              "venue" => $up['customPeriod']['venue'],
            ]);
          }
          $userPeriods[] = $userPeriod;
        }
        // TODO check if userPeriods complete against course.periods
        // validate course's year and term = timetable year and term
      }
      // update timetable unit and score
      $timetable->calculateUnit();
      $timetable->save();
      return $timetable;
    });
    $timetable->load(
      'user_courses.user_periods',
      'user_courses.course.professors',
      'user_courses.user_periods.period',
      'user_courses.user_periods.custom_period',
    );
    return response()->json(['timetable' => $timetable]);
  }
}
