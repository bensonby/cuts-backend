<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
  * @property bigInteger $id
  * @property integer $year
  * @property integer $term
  * @property string $coursecode
  * @property string $coursegroup
  * @property integer $unit
  * @property string $coursename
  * @property string $coursenamec
  * @property integer $quota
  * @property date $created_at
  * @property date $updated_at
 */
class Course extends Model
{
    use HasFactory;

    protected $fillable = [
      "year",
      "term",
      "coursecode",
      "coursegroup",
      "unit",
      "coursename",
      "coursenamec",
      "quota",
    ];

    public function professors() {
      return $this->belongsToMany('App\Models\Professor')->withTimestamps();
    }

    public function periods() {
      return $this->hasMany('App\Models\Period');
    }

    public function user_courses() {
      return $this->hasMany('App\Models\UserCourse');
    }

    static public function toOldJson($course) {
      return [
        'year' => $course->year,
        'term' => $course->term,
        'cid' => $course->id,
        'coursecode' => $course->coursecode,
        'coursename' => $course->coursename,
        'coursenamec' => $course->coursenamec,
        'coursegroup' => $course->coursegroup,
        'periods' => $course->periods->map('App\Models\Period::toOldJson'),
        'prof' => $course->professors->pluck('name')->all(),
        'unit' => $course->unit,
        'quota' => $course->quota,
        'lang' => $course['periods'][0]['lang'],
      ];
    }
}
