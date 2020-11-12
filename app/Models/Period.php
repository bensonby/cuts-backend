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

    static public function toOldJson($period) {
      return [
        'year' => $period->course->year,
        'term' => $period->course->term,
        'pid' => $period->id,
        'cid' => $period->course->id,
        'day' => $period->day,
        'start' => $period->start,
        'end' => $period->end,
        'venue' => $period->venue,
        'type' => $period->type,
        'lang' => $period->lang,
        'remarks' => $period->remarks,
        'quota' => $period->quota,
        'is_tsa' => $period->day == 'Z' || $period->start == 0 || $period->end == 0 || $period->venue == 'TBA' || $period->venue == 'TSA',
        'original_venue' => $period->venue,
      ];
    }
}
