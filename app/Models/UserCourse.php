<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
  * @property bigInteger $id
  * @property bigInteger $course_id
  * @property bigInteger $timetable_id
  * @property string $comment
  * @property string $color
  * @property date $created_at
  * @property date $updated_at
 */
class UserCourse extends Model
{
    use HasFactory;

    protected $fillable = [
      "comment",
      "color",
    ];

    public function course() {
      return $this->belongsTo('App\Models\Course');
    }

    public function user_periods() {
      return $this->hasMany('App\Models\UserPeriod');
    }

    public function timetable() {
      return $this->belongsTo('App\Models\Timetable');
    }
}
