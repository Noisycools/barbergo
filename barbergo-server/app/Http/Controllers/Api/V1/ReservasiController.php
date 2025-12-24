<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservasi;
use Illuminate\Support\Facades\Validation;

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
