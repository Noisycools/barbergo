<?php

namespace App\Models;

use DateTimeInterface;
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
        'status',
        'is_global',
        'quota_limit',
    ];

    protected $casts = [
        'status' => 'boolean',
        'is_global' => 'boolean',
        'tanggal_mulai' => 'datetime',
        'tanggal_berakhir' => 'datetime',
    ];

    /**
     * Prepare a date for array / JSON serialization.
     */
    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->format('Y-m-d H:i:s');
    }

    public function barbershop()
    {
        return $this->belongsTo(Barbershop::class);
    }

    public function reservasis()
    {
        return $this->hasMany(Reservasi::class, 'promosi_id');
    }
}
