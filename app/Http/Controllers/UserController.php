<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;

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
}
