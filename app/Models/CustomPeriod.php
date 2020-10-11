<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
  * @property bigInteger $id
  * @property bigInteger $user_period_id
  * @property string $day
  * @property integer $start
  * @property integer $end
  * @property string $venue
  * @property date $created_at
  * @property date $updated_at
 */
class CustomPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
      "day",
      "start",
      "end",
      "venue",
    ];

    public function user_period() {
      return $this->belongsTo('App\Models\UserPeriod');
    }
}
