<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalKerja extends Model
{
    protected $fillable = [
        'tukang_cukur_id',
        'hari',
        'jam_mulai',
        'jam_selesai',
    ];

    public function tukangCukur()
    {
        return $this->belongsTo(TukangCukur::class);
    }
}
