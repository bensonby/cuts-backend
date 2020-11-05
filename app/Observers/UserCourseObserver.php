<?php

namespace App\Observers;

use App\Models\UserCourse;

class UserCourseObserver
{
    /**
     * Handle the user course "deleting" event.
     *
     * @param  \App\Models\UserCourse  $userCourse
     * @return void
     */
    public function deleting(UserCourse $userCourse)
    {
      $timetable = $userCourse->timetable;
      $timetable->calculateUnit();
      $timetable->touch();
      $timetable->save();
    }

}
