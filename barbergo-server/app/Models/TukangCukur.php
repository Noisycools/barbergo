<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TukangCukur extends Model
{
    protected $fillable = [
        'barbershop_id',
        'nama',
        'spesialisasi',
        'foto',
        'is_active',
    ];

    public function barbershop()
    {
        return $this->belongsTo(Barbershop::class);
    }

    public function jadwalKerjas()
    {
        return $this->hasMany(JadwalKerja::class);
    }

    public function reservasis()
    {
        return $this->hasMany(Reservasi::class);
    }
}
