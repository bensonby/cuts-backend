<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Course;

class CourseController extends Controller
{
  public function getCoursecodes($year, $term) {
    $coursegroups = Course::where('year', $year)
      ->where('term', $term)
      ->select('coursegroup')
      ->groupBy('coursegroup')
      ->get()
      ->toArray();
    $result = array();
    foreach($coursegroups as $course) {
      $coursegroup = $course['coursegroup'];
      preg_match('/^([A-Z]+)([0-9]+)/', $coursegroup, $matches);
      $first_char = $coursegroup[0];
      $subject = $matches[1];
      $code = $matches[2];
      if (!array_key_exists($first_char, $result)) {
        $result[$first_char] = array();
      }
      if (!array_key_exists($subject, $result[$first_char])) {
        $result[$first_char][$subject] = array();
      }

      $result[$first_char][$subject][] = $code;
    }
    return response()->json($result);
  }
}
