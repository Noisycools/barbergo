<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BarbershopOperatingHour extends Model
{
    protected $fillable = [
        'barbershop_id',
        'day',
        'is_open',
        'start_time',
        'end_time',
    ];

    public function barbershop()
    {
        return $this->belongsTo(Barbershop::class);
    }
}
