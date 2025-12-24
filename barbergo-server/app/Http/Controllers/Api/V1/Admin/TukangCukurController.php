<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TukangCukur;

class TukangCukurController extends Controller
{
    public function index(Request $request)
    {
        $barbershop = $request->user()->barbershop;
        if (!$barbershop) return response()->json([]);
        return response()->json($barbershop->tukangCukurs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string',
            'spesialisasi' => 'nullable|string',
        ]);

        $barbershop = $request->user()->barbershop;
        if (!$barbershop) return response()->json(['message' => 'No barbershop associated'], 403);

        $tukangCukur = $barbershop->tukangCukurs()->create($request->all());

        return response()->json($tukangCukur, 201);
    }

    public function update(Request $request, $id)
    {
        $barbershop = $request->user()->barbershop;
        $tukangCukur = $barbershop->tukangCukurs()->findOrFail($id);

        $tukangCukur->update($request->all());

        return response()->json($tukangCukur);
    }

    public function destroy(Request $request, $id)
    {
        $barbershop = $request->user()->barbershop;
        $tukangCukur = $barbershop->tukangCukurs()->findOrFail($id);
        $tukangCukur->delete();

        return response()->json(['message' => 'Deleted']);
    }
} {
    //
}
