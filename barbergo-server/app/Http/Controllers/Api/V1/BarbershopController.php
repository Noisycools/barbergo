<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Barbershop;
use Illuminate\Http\Request;

class BarbershopController extends Controller
{
    public function index(Request $request)
    {
        $query = Barbershop::query();

        if ($request->has('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%')
                ->orWhere('alamat', 'like', '%' . $request->search . '%');
        }

        if ($request->has('min_rating')) {
            $query->where('rating_rata_rata', '>=', $request->min_rating);
        }

        $barbershops = $query->with('user')->paginate(10);

        return response()->json($barbershops);
    }

    public function show($id)
    {
        $barbershop = Barbershop::with(['layanans', 'tukangCukurs', 'promosis', 'user'])->findOrFail($id);

        return response()->json($barbershop);
    }
}
