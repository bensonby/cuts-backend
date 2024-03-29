<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
  * @property bigInteger $id
  * @property bigInteger $user_id
  * @property integer $year
  * @property integer $term
  * @property integer $unit
  * @property float $score
  * @property date $created_at
  * @property date $updated_at
 */
class Timetable extends Model
{
    use HasFactory;

    protected $attributes = [
      'score' => 0, // TODO
    ];

    protected $fillable = [
      "year",
      "term",
      "unit",
      "score",
    ];

    protected $casts = [
      'year' => 'int',
      'term' => 'int',
      'unit' => 'int',
      'score' => 'int',
    ];

    // TODO consider making this event to automatically update
    public function calculateUnit() {
      $this->unit = array_sum(
        array_map(
          function ($uc) {
            return $uc->course->unit;
          },
          $this->user_courses->all(),
        )
      );
    }

    public function user() {
      return $this->belongsTo('App\Models\User');
    }

    public function user_courses() {
      return $this->hasMany('App\Models\UserCourse');
    }
}
