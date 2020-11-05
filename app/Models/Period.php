<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
  * @property bigInteger $id
  * @property string $day
  * @property integer $start
  * @property integer $end
  * @property string $venue
  * @property string $type
  * @property string $lang
  * @property integer $quota
  * @property string $remarks
  * @property date $created_at
  * @property date $updated_at
 */
class Period extends Model
{
    use HasFactory;

    protected $fillable = [
      "day",
      "start",
      "end",
      "venue",
      "type",
      "lang",
      "quota",
      "remarks",
    ];

    protected $touches = ['course'];

    public function course() {
      return $this->belongsTo('App\Models\Course');
    }
}
