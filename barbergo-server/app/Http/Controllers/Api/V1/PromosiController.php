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
            $query->where(function ($q) use ($request) {
                $q->where('barbershop_id', $request->barbershop_id)
                    ->orWhere('is_global', true);
            });
        } else {
            $query->where('is_global', true);
        }

        $promosis = $query->get();

        return response()->json($promosis);
    }
}
