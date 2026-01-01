<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReservasiController extends Controller
{
    public function index(Request $request)
    {
        $barbershop = $request->user()->barbershop;
        if (!$barbershop) {
            return response()->json(['message' => 'Barbershop not found'], 404);
        }

        $query = $barbershop->reservasis()
            ->with(['user', 'layanan', 'tukangCukur', 'promosi'])
            ->latest();

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('tanggal', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('date')) {
            $query->whereDate('tanggal', $request->date);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $reservasis = $query->paginate(10);

        return response()->json($reservasis);
    }

    public function update(Request $request, string $id)
    {
        Log::debug($request->all());
        $barbershop = $request->user()->barbershop;
        if (!$barbershop) {
            return response()->json(['message' => 'Barbershop not found'], 404);
        }

        $reservasi = $barbershop->reservasis()->with(['user', 'layanan', 'tukangCukur'])->findOrFail($id);

        $request->validate([
            'status' => 'required|in:menunggu,dikonfirmasi,ditolak,selesai,dibatalkan'
        ]);

        $reservasi->update(['status' => $request->status]);

        return response()->json($reservasi);
    }

    public function destroy(Request $request, string $id)
    {
        $barbershop = $request->user()->barbershop;
        if (!$barbershop) {
            return response()->json(['message' => 'Barbershop not found'], 404);
        }

        $reservasi = $barbershop->reservasis()->findOrFail($id);
        $reservasi->delete();

        return response()->json(['message' => 'Reservation deleted successfully']);
    }
}
