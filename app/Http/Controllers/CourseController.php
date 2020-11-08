<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Database\Eloquent\Builder;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Timetable;

define('RESULT_LIMIT', 600);

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

  public function getByAdvanced(Request $request) {
    $yearFrom = $request->input('yearFrom');
    $yearTo = $request->input('yearTo');
    $terms = $request->input('terms');
    $coursecode = $request->input('coursecode');
    $coursename = $request->input('coursename');
    $professor = $request->input('professor');
    $days = $request->input('days');
    $periodFrom = $request->input('periodFrom');
    $periodTo = $request->input('periodTo');

    $query = Course::where('year', '>=', $yearFrom)
      ->where('year', '<=', $yearTo)
      ->whereIn('term', $terms);
    if ($coursecode) {
      $query = $query->where('coursecode', 'like', $coursecode . '%');
    }
    if ($coursename) {
      $query = $query->where(function ($query) use ($coursename) {
        $query->orwhere('coursename', 'like', '%' . $coursename . '%')
          ->orwhere('coursenamec', 'like', '%' . $coursename . '%');
      });
    }
    if ($professor) {
      $query = $query->whereHas('professors', function (Builder $q) use ($professor) {
        $q->where('name', 'like', '%' . $professor . '%');
      });
    }
    if ($days && count($days) < 6) {
      $query = $query->whereHas('periods', function (Builder $q) use ($days) {
        $q->whereIn('day', $days);
      });
    }
    if ($periodFrom && $periodTo) {
      if ($periodFrom > 1 || $periodTo < config('constants.period.max_period')) {
        $query = $query->whereHas('periods', function (Builder $q) use ($periodFrom, $periodTo) {
          $q->where('start', '<=', $periodTo)->where('end', '>=', $periodFrom);
        });
      }
    }
    $count = $query->count();
    if ($count > RESULT_LIMIT) {
      return response()->json([
        'courses' => [],
        'message' => 'Too many results found. Please narrow down your criteria.',
      ], 400);
    }
    $courses = $query->with([
      'periods',
      'professors',
    ])->get();
    return response()->json([
      'courses' => $courses,
      'message' => '',
    ]);
  }

  public function getSuggestions(Request $request, $year, $term) {
    $user = Auth::user();
    $query = Timetable::where('user_id', $user->id)
      ->where(function ($q) use ($year, $term) {
        $q->where('year', '<>', $year)
          ->orWhere('term', '<>', $term);
      })
      ->with('user_courses.course')
      ->get();
    $takenCoursegroups = $query->pluck('user_courses')->collapse()->pluck('course.coursegroup')->all();
    $takenCoursegroups = array_filter($takenCoursegroups, function($c) {
      return (substr($c, 0, 2) != 'GE' || substr($c, 0, 4) == 'GERM') && substr($c, 0, 2) != 'UG';
    });
    $currentTermCoursegroups = $request->input('coursegroups');
    $coursegroups = array_merge($takenCoursegroups, $currentTermCoursegroups);
    if(count($coursegroups) == 0) {
      return response()->json(['message' => 'You do not have any courses taken. No suggestions are available.'], 400);
    }
    $res = Http::post(config('courses.ml.host') . 'predict', [
      'coursegroups' => $coursegroups,
      'num_chunks' => config('courses.ml.num_chunks'),
      'api_key' => config('courses.ml.api_key'),
      'threshold' => config('courses.ml.threshold'),
    ]);
    if (!$res->ok()) {
      return response()->json(['message' => 'Request failed.'], 400);
    }
    $results = $res['results'];
    $courses = Course::where('year', $year)
      ->where('term', $term)
      ->whereIn('coursegroup', $results)
      ->with([
        'periods',
        'professors',
      ])->get();
    if (count($courses) == 0) {
      return response()->json(['message' => 'No courses found.'], 400);
    }
    foreach($courses as $course) {
      $relevance = array_search($course->coursegroup, $results);
      $course['relevance'] = $relevance;
    }
    return response()->json($courses);
  }
}
