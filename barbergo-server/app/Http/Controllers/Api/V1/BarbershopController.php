<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Barbershop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

        $barbershops = $query->with(['user', 'operatingHours'])->paginate(10);

        // Add full public image URL for each item (foto is stored as 'barbershops/filename.jpg')
        $barbershops->getCollection()->transform(function ($item) {
            // dd($item);
            $item->image_url = $item->foto ? Storage::url($item->foto) : null;
            return $item;
        });

        return response()->json($barbershops);
    }

    public function show($id)
    {
        $barbershop = Barbershop::with(['layanans', 'tukangCukurs', 'promosis', 'user', 'operatingHours'])->findOrFail($id);

        // Append public image URL
        $barbershop->image_url = $barbershop->foto ? Storage::url($barbershop->foto) : null;

        return response()->json($barbershop);
    }
}
