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
}
