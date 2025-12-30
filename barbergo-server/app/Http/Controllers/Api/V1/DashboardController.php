<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservasi;
use App\Models\Ulasan;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function pelangganStats(Request $request)
    {
        $user = Auth::user();

        // 1. Active Bookings: menunggu or dikonfirmasi
        $activeBookings = Reservasi::where('user_id', $user->id)
            ->whereIn('status', ['menunggu', 'dikonfirmasi'])
            ->whereDate('tanggal', '>=', now()->toDateString())
            ->count();

        // 2. Reviews Given
        $reviewsGiven = Ulasan::where('user_id', $user->id)->count();

        // 3. Total Visits: selesai
        $totalVisits = Reservasi::where('user_id', $user->id)
            ->where('status', 'selesai')
            ->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'active_bookings' => $activeBookings,
                'reviews_given' => $reviewsGiven,
                'total_visits' => $totalVisits,
            ]
        ]);
    }
}
