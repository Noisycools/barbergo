<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Layanan extends Model
{
    protected $fillable = [
        'barbershop_id',
        'nama_layanan',
        'harga',
        'durasi_menit',
    ];

    public function barbershop()
    {
        return $this->belongsTo(Barbershop::class);
    }

    public function reservasis()
    {
        return $this->hasMany(Reservasi::class);
    }
}
