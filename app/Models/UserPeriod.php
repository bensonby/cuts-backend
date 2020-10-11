<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
  * @property bigInteger $id
  * @property bigInteger $user_course_id
  * @property bigInteger $period_id
  * @property bigInteger $custom_period_id
  * @property boolean $necessity
  * @property date $created_at
  * @property date $updated_at
 */
class UserPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
      "necessity",
    ];

    public function user_course() {
      return $this->belongsTo('App\Models\UserCourse');
    }

    public function period() {
      return $this->belongsTo('App\Models\Period');
    }

    public function custom_period() {
      return $this->hasOne('App\Models\CustomPeriod');
    }
}
