<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barbershop extends Model
{
    protected $fillable = [
        'user_id',
        'nama',
        'alamat',
        'jam_buka',
        'jam_tutup',
        'rating_rata_rata',
        'foto',
        'nomor_telepon',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function layanans()
    {
        return $this->hasMany(Layanan::class);
    }

    public function tukangCukurs()
    {
        return $this->hasMany(TukangCukur::class);
    }

    public function promosis()
    {
        return $this->hasMany(Promosi::class);
    }

    public function reservasis()
    {
        return $this->hasMany(Reservasi::class);
    }
}
