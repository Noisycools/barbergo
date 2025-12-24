<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Promosi;

class PromosiController extends Controller
{
    public function index(Request $request)
    {
        $query = Promosi::query();

        if ($request->has('barbershop_id')) {
            $query->where('barbershop_id', $request->barbershop_id);
        } else {
            // Global promos? or all?
            // Plan says: barbershop_id nullable for global.
            // If no barbershop_id sent, maybe show global?
            $query->whereNull('barbershop_id');
        }

        $promosis = $query->get();

        return response()->json($promosis);
    }
}
