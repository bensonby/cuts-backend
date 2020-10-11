<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
  * @property bigInteger $id
  * @property string $name
  * @property date $created_at
  * @property date $updated_at
 */
class Professor extends Model
{
    use HasFactory;

    protected $fillable = [
      "name",
    ];
}
