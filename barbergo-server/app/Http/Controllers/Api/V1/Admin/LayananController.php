<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Layanan;

class LayananController extends Controller
{
    public function index(Request $request)
    {
        $barbershop = $request->user()->barbershop;
        if (!$barbershop) return response()->json([]);
        return response()->json($barbershop->layanans);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_layanan' => 'required|string',
            'harga' => 'required|numeric',
            'durasi_menit' => 'required|integer',
        ]);

        $barbershop = $request->user()->barbershop;
        if (!$barbershop) return response()->json(['message' => 'No barbershop associated'], 403);

        $layanan = $barbershop->layanans()->create($request->all());

        return response()->json($layanan, 201);
    }

    public function update(Request $request, $id)
    {
        $barbershop = $request->user()->barbershop;
        $layanan = $barbershop->layanans()->findOrFail($id);

        $layanan->update($request->all());

        return response()->json($layanan);
    }

    public function destroy(Request $request, $id)
    {
        $barbershop = $request->user()->barbershop;
        $layanan = $barbershop->layanans()->findOrFail($id);
        $layanan->delete();

        return response()->json(['message' => 'Deleted']);
    }
} {
    //
}
