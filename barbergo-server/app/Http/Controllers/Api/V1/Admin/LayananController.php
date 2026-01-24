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
        $validated = $request->validate([
            'nama_layanan' => 'required|string|max:255',
            'harga' => 'required|numeric|min:0',
            'durasi_menit' => 'required|integer|min:1',
        ]);

        $barbershop = $request->user()->barbershop;
        if (!$barbershop) {
            return response()->json(['message' => 'No barbershop associated'], 403);
        }

        // Sanitize untuk mencegah XSS
        $validated['nama_layanan'] = strip_tags($validated['nama_layanan']);

        $layanan = $barbershop->layanans()->create($validated);

        return response()->json($layanan, 201);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nama_layanan' => 'sometimes|required|string|max:255',
            'harga' => 'sometimes|required|numeric|min:0',
            'durasi_menit' => 'sometimes|required|integer|min:1',
        ]);

        $barbershop = $request->user()->barbershop;
        $layanan = $barbershop->layanans()->findOrFail($id);

        // Sanitize jika ada
        if (isset($validated['nama_layanan'])) {
            $validated['nama_layanan'] = strip_tags($validated['nama_layanan']);
        }

        $layanan->update($validated);

        return response()->json($layanan);
    }

    public function destroy(Request $request, $id)
    {
        $barbershop = $request->user()->barbershop;
        $layanan = $barbershop->layanans()->findOrFail($id);
        $layanan->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
