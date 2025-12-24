<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promosi extends Model
{
    protected $fillable = [
        'barbershop_id',
        'nama',
        'kode_promo',
        'diskon',
        'tanggal_mulai',
        'tanggal_berakhir',
    ];

    public function barbershop()
    {
        return $this->belongsTo(Barbershop::class);
    }
}
