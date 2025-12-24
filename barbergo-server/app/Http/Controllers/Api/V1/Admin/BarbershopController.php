<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Barbershop;

class BarbershopController extends Controller
{
    public function show(Request $request)
    {
        // Return current admin's barbershop
        $barbershop = $request->user()->barbershop;
        if (!$barbershop) {
            return response()->json(['message' => 'Barbershop not found'], 404);
        }
        return response()->json($barbershop);
    }

    public function update(Request $request)
    {
        $barbershop = $request->user()->barbershop;
        if (!$barbershop) {
            // Create if not exists? Or error. Plan says "Kelola informasi", usually update.
            // Let's allow create if null? No, SuperAdmin usually creates shop/admin linkage.
            return response()->json(['message' => 'Barbershop not found'], 404);
        }

        $request->validate([
            'nama' => 'required|string',
            'alamat' => 'required|string',
            'jam_buka' => 'required',
            'jam_tutup' => 'required',
        ]);

        $barbershop->update($request->only([
            'nama',
            'alamat',
            'jam_buka',
            'jam_tutup',
            'nomor_telepon',
            'foto'
        ]));

        return response()->json($barbershop);
    }
} {
    //
}
