<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Course;

class CourseController extends Controller
{
  public function getCourses($year, $term, $coursecode) {
    preg_match('/^[A-Za-z0-9]+/', $coursecode, $matches);
    if (count($matches) != 1 || strlen($matches[0]) < 3) {
      return response()->json(['message' => 'Bad Request'], 400);
    }
    $courses = Course::where('year', $year)
      ->where('term', $term)
      ->where('coursecode', 'like', $matches[0] . '%')
      ->with([
        'periods',
        'professors',
      ])->get();
    return response()->json($courses);
  }

  public function getByCoursegroups(Request $request, $year, $term) {
    $coursegroups = $request->input('coursegroups');
    if (count($coursegroups) == 0) {
      return response()->json([]);
    }
    $courses = Course::where('year', $year)
      ->where('term', $term)
      ->where(function ($query) use ($coursegroups) {
        foreach($coursegroups as $c) {
          $query->orwhere('coursecode', 'like', $c . '%');
        }
      })
      ->with([
        'periods',
        'professors',
      ])->get();
    return response()->json($courses);
  }

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

  public function getSuggestions(Request $request, $year, $term) {
    $current_coursegroups = $request->input('coursegroups');
    return response()->json(['message' => 'TODO'], 400);
  }
}
