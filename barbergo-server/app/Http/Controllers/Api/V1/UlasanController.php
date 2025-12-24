<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservasi;
use App\Models\Ulasan;
use App\Models\Barbershop;
use Illuminate\Support\Facades\DB;

class UlasanController extends Controller
{
    public function store(Request $request, $id)
    {
        $request->validate([
            'rating_barbershop' => 'required|integer|min:1|max:5',
            'komentar_barbershop' => 'nullable|string',
            'rating_tukang_cukur' => 'required|integer|min:1|max:5',
            'komentar_tukang_cukur' => 'nullable|string',
        ]);

        $reservasi = $request->user()->reservasis()->findOrFail($id);

        if ($reservasi->status !== 'selesai') {
            return response()->json(['message' => 'Only completed reservations can be reviewed.'], 403);
        }

        if ($reservasi->ulasan) {
            return response()->json(['message' => 'Reservation already reviewed.'], 403);
        }

        DB::transaction(function () use ($request, $reservasi) {
            $ulasan = Ulasan::create([
                'reservasi_id' => $reservasi->id,
                'user_id' => $request->user()->id,
                'rating_barbershop' => $request->rating_barbershop,
                'komentar_barbershop' => $request->komentar_barbershop,
                'rating_tukang_cukur' => $request->rating_tukang_cukur,
                'komentar_tukang_cukur' => $request->komentar_tukang_cukur,
            ]);

            // Update Barbershop Rating
            $barbershop = $reservasi->barbershop;
            // Get all reviews for this shop via reservations...
            // Or simpler: Ulasan has user_id but not barbershop_id directly in my implementation?
            // Wait, Ulasan schema: `reservasi_id`, `user_id`.
            // So to get shop reviews: Reservasi where barbershop_id.

            // avg query:
            $avg = Ulasan::whereHas('reservasi', function ($q) use ($barbershop) {
                $q->where('barbershop_id', $barbershop->id);
            })->avg('rating_barbershop');

            $barbershop->update(['rating_rata_rata' => $avg]);
        });

        return response()->json(['message' => 'Review submitted.']);
    }
} {
    //
}
