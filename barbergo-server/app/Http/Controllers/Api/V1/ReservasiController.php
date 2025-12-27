<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservasi;
use App\Models\BarbershopOperatingHour;
use Carbon\Carbon;

class ReservasiController extends Controller
{

    public function store(Request $request)
    {
        $request->validate([
            'barbershop_id' => 'required|exists:barbershops,id',
            'layanan_id' => 'required|exists:layanans,id',
            'tukang_cukur_id' => 'required|exists:tukang_cukurs,id',
            'tanggal' => 'required|date|after_or_equal:today',
            'waktu_mulai' => 'required|date_format:H:i',
        ]);

        // Mengecek hari dari tanggal yang dipilih
        $tanggal = Carbon::parse($request->tanggal);
        $dayName = $tanggal->format('l'); // Monday, Tuesday, etc.

        // Cek apakah barbershop buka pada hari tersebut
        $operatingHour = BarbershopOperatingHour::where('barbershop_id', $request->barbershop_id)
            ->where('day', $dayName)
            ->where('is_open', 1)
            ->first();

        if (!$operatingHour) {
            return response()->json([
                'message' => 'Barbershop closed on ' . $dayName . '. Please choose another date.'
            ], 422);
        }

        // Validasi waktu reservasi sesuai jam operasional
        $waktuMulai = Carbon::parse($request->waktu_mulai);
        $startTime = Carbon::parse($operatingHour->start_time);
        $endTime = Carbon::parse($operatingHour->end_time);

        if ($waktuMulai->lt($startTime) || $waktuMulai->gte($endTime)) {
            return response()->json([
                'message' => 'Reservation times outside operating hours. Opening hours: ' . 
                            $operatingHour->start_time . ' - ' . $operatingHour->end_time
            ], 422);
        }

        

        $reservasi = Reservasi::create([
            'user_id' => $request->user()->id,
            'barbershop_id' => $request->barbershop_id,
            'layanan_id' => $request->layanan_id,
            'tukang_cukur_id' => $request->tukang_cukur_id,
            'tanggal' => $request->tanggal,
            'waktu_mulai' => $request->waktu_mulai,
            'status' => 'menunggu',
        ]);

        return response()->json($reservasi, 201);
    }

    public function riwayat(Request $request)
    {
        $reservasis = $request->user()->reservasis()->with(['barbershop', 'layanan'])->latest()->get();
        return response()->json($reservasis);
    }

    public function cancel(Request $request, $id)
    {
        $reservasi = $request->user()->reservasis()->findOrFail($id);

        if ($reservasi->status !== 'menunggu') {
            return response()->json(['message' => 'Cannot cancel reservation that is not pending.'], 403);
        }

        $reservasi->update(['status' => 'dibatalkan']);

        return response()->json(['message' => 'Reservation cancelled.']);
    }
}
