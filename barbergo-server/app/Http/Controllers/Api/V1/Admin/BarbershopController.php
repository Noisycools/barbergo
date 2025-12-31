<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Barbershop;
use App\Models\Reservasi;
use Illuminate\Support\Facades\DB;
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
            ->with(['layanan', 'tukangCukur', 'user'])
            ->get();

        // Calculate total revenue
        $totalRevenue = $completedReservations->sum(function($reservation) {
            return $reservation->layanan->harga ?? 0;
        });

        // Revenue by service
        $byService = $completedReservations->groupBy('layanan_id')->map(function($group) {
            $layanan = $group->first()->layanan;
            return [
                'service_name' => $layanan->nama_layanan,
                'bookings_count' => $group->count(),
                'total_revenue' => $group->sum(fn($r) => $r->layanan->harga ?? 0)
            ];
        })->values()->sortByDesc('total_revenue')->values();

        // Revenue by barber
        $byBarber = $completedReservations->groupBy('tukang_cukur_id')->map(function($group) {
            $barber = $group->first()->tukangCukur;
            return [
                'barber_name' => $barber->nama,
                'bookings_count' => $group->count(),
                'total_revenue' => $group->sum(fn($r) => $r->layanan->harga ?? 0)
            ];
        })->values()->sortByDesc('total_revenue')->values();

        // Recent transactions (last 10)
        $recentTransactions = $completedReservations->sortByDesc('tanggal')
            ->take(10)
            ->map(function($reservation) {
                return [
                    'tanggal' => $reservation->tanggal,
                    'waktu_mulai' => $reservation->waktu_mulai,
                    'customer_name' => $reservation->user->name,
                    'service_name' => $reservation->layanan->nama_layanan,
                    'barber_name' => $reservation->tukangCukur->nama,
                    'revenue' => $reservation->layanan->harga
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
