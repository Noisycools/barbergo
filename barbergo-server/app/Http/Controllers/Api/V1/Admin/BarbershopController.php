<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Barbershop;
use App\Models\Reservasi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class BarbershopController extends Controller
{
    public function show(Request $request)
    {
        // Return current admin's barbershop
        $barbershop = $request->user()->barbershop;
        if (!$barbershop) {
            return response()->json(['message' => 'Barbershop not found'], 404);
        }
        $barbershop->load('operatingHours');
        return response()->json($barbershop);
    }

    public function update(Request $request)
    {
        $barbershop = $request->user()->barbershop;
        if (!$barbershop) {
            return response()->json(['message' => 'Barbershop not found'], 404);
        }

        $request->validate([
            'nama' => 'required|string',
            'alamat' => 'required|string',
            'jam_buka' => 'required',
            'jam_tutup' => 'required',
            'foto' => 'nullable|image|max:2048',
            'delete_foto' => 'boolean'
        ]);

        $data = $request->only([
            'nama',
            'alamat',
            'jam_buka',
            'jam_tutup',
            'nomor_telepon'
        ]);

        // Handle File Delete
        if ($request->boolean('delete_foto')) {
            if ($barbershop->foto) {
                Storage::disk('public')->delete($barbershop->foto);
                $data['foto'] = null;
            }
        }

        // Handle File Upload
        if ($request->hasFile('foto')) {
            // Delete old photo if exists
            if ($barbershop->foto) {
                Storage::disk('public')->delete($barbershop->foto);
            }
            $path = $request->file('foto')->store('barbershops', 'public');
            $data['foto'] = $path;
        }

        $barbershop->update($data);

        // Reload to get fresh data including potential new image path
        return response()->json($barbershop->refresh());
    }


    public function getSchedule(Request $request)
    {
        $barbershop = $request->user()->barbershop;
        if (!$barbershop) {
            return response()->json(['message' => 'Barbershop not found'], 404);
        }
        return response()->json(['schedule' => $barbershop->operatingHours]);
    }

    public function updateSchedule(Request $request)
    {
        $barbershop = $request->user()->barbershop;
        if (!$barbershop) {
            return response()->json(['message' => 'Barbershop not found'], 404);
        }

        $request->validate([
            'schedule' => 'required|array',
            'schedule.*.day' => 'required|string',
            'schedule.*.is_open' => 'required|boolean',
            'schedule.*.start_time' => 'nullable',
            'schedule.*.end_time' => 'nullable',
        ]);

        foreach ($request->schedule as $daySchedule) {
            $barbershop->operatingHours()->updateOrCreate(
                ['day' => $daySchedule['day']],
                [
                    'is_open' => $daySchedule['is_open'],
                    'start_time' => $daySchedule['start_time'],
                    'end_time' => $daySchedule['end_time'],
                ]
            );
        }

        return response()->json(['message' => 'Schedule updated successfully', 'schedule' => $barbershop->operatingHours]);
    }

    public function getRevenue(Request $request)
    {
        $barbershop = $request->user()->barbershop;
        if (!$barbershop) {
            return response()->json(['message' => 'Barbershop not found'], 404);
        }

        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        // Get all completed reservations in date range
        $completedReservations = Reservasi::where('barbershop_id', $barbershop->id)
            ->where('status', 'selesai')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->with(['layanan', 'tukangCukur', 'user', 'promosi'])
            ->get();

        // Helper to calculate revenue for a reservation
        $calculateRevenue = function ($reservation) {
            $price = $reservation->layanan->harga ?? 0;
            if ($reservation->promosi) {
                $discount = $reservation->promosi->diskon;
                $price = $price - ($price * $discount / 100);
            }
            return $price;
        };

        // Calculate total revenue
        $totalRevenue = $completedReservations->sum($calculateRevenue);

        // Revenue by service
        $byService = $completedReservations->groupBy('layanan_id')->map(function ($group) use ($calculateRevenue) {
            $layanan = $group->first()->layanan;
            return [
                'service_name' => $layanan->nama_layanan,
                'bookings_count' => $group->count(),
                'total_revenue' => $group->sum($calculateRevenue)
            ];
        })->values()->sortByDesc('total_revenue')->values();

        // Revenue by barber
        $byBarber = $completedReservations->groupBy('tukang_cukur_id')->map(function ($group) use ($calculateRevenue) {
            $barber = $group->first()->tukangCukur;
            return [
                'barber_name' => $barber->nama,
                'bookings_count' => $group->count(),
                'total_revenue' => $group->sum($calculateRevenue)
            ];
        })->values()->sortByDesc('total_revenue')->values();

        // Recent transactions (last 10)
        $recentTransactions = $completedReservations->sortByDesc('tanggal')
            ->take(10)
            ->map(function ($reservation) use ($calculateRevenue) {
                return [
                    'tanggal' => $reservation->tanggal,
                    'waktu_mulai' => $reservation->waktu_mulai,
                    'customer_name' => $reservation->user->name,
                    'service_name' => $reservation->layanan->nama_layanan,
                    'barber_name' => $reservation->tukangCukur->nama,
                    'revenue' => $calculateRevenue($reservation)
                ];
            })->values();

        return response()->json([
            'total_revenue' => $totalRevenue,
            'total_completed' => $completedReservations->count(),
            'by_service' => $byService,
            'by_barber' => $byBarber,
            'recent_transactions' => $recentTransactions
        ]);
    }
}
