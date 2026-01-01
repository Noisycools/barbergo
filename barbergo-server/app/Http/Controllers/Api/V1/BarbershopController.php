<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Barbershop;
use App\Models\Reservasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

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

        // Get today's date and day name
        $today = Carbon::now();
        $dayName = $today->format('l');

        // Get operating hours for today
        $operatingHour = $barbershop->operatingHours()
            ->where('day', $dayName)
            ->where('is_open', 1)
            ->first();

        // Calculate available times for each barber
        $barbersAvailability = [];

        if ($operatingHour) {
            foreach ($barbershop->tukangCukurs as $barber) {
                // Get all confirmed/pending reservations for this barber today
                $reservations = Reservasi::where('tukang_cukur_id', $barber->id)
                    ->where('tanggal', $today->toDateString())
                    ->whereIn('status', ['menunggu', 'dikonfirmasi'])
                    ->with('layanan')
                    ->orderBy('waktu_mulai')
                    ->get();

                // Calculate next available time
                $startTime = Carbon::parse($operatingHour->start_time);
                $endTime = Carbon::parse($operatingHour->end_time);
                $nextAvailableTime = $startTime->copy();

                // Find the latest end time from all bookings
                foreach ($reservations as $reservation) {
                    $bookingStart = Carbon::parse($reservation->waktu_mulai);
                    $bookingEnd = $bookingStart->copy()->addMinutes($reservation->layanan->durasi_menit ?? 0);

                    if ($bookingEnd->gt($nextAvailableTime)) {
                        $nextAvailableTime = $bookingEnd;
                    }
                }

                // If next available time is in the past (before now), set it to now
                if ($nextAvailableTime->lt($today)) {
                    $nextAvailableTime = $today->copy();
                }

                // Make sure it's within operating hours
                if ($nextAvailableTime->gte($endTime)) {
                    $nextAvailableTime = null; // No more slots today
                }

                $barbersAvailability[] = [
                    'barber_id' => $barber->id,
                    'barber_name' => $barber->nama,
                    'next_available_time' => $nextAvailableTime ? $nextAvailableTime->format('H:i') : null,
                    'operating_hours' => [
                        'start' => $operatingHour->start_time,
                        'end' => $operatingHour->end_time,
                    ],
                    'total_bookings_today' => $reservations->count(),
                ];
            }
        }

        $barbershop->barbers_availability = $barbersAvailability;
        $barbershop->is_open_today = $operatingHour ? true : false;

        return response()->json($barbershop);
    }
}
