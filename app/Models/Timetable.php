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

    public function getUnit() {
      return 3; // TODO
    }

    public function user() {
      return $this->belongsTo('App\Models\User');
    }

    public function user_courses() {
      return $this->hasMany('App\Models\UserCourse');
    }
}
