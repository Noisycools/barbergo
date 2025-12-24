<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ulasan extends Model
{
    protected $fillable = [
        'reservasi_id',
        'user_id',
        'rating_barbershop',
        'komentar_barbershop',
        'rating_tukang_cukur',
        'komentar_tukang_cukur',
    ];

    public function reservasi()
    {
        return $this->belongsTo(Reservasi::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
