<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservasi extends Model
{
    protected $fillable = [
        'user_id',
        'barbershop_id',
        'layanan_id',
        'tukang_cukur_id',
        'tanggal',
        'waktu_mulai',
        'status',
        'promosi_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function barbershop()
    {
        return $this->belongsTo(Barbershop::class);
    }

    public function layanan()
    {
        return $this->belongsTo(Layanan::class);
    }

    public function tukangCukur()
    {
        return $this->belongsTo(TukangCukur::class);
    }

    public function ulasan()
    {
        return $this->hasOne(Ulasan::class);
    }

    public function promosi()
    {
        return $this->belongsTo(Promosi::class);
    }
}
