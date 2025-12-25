<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Barbershop;

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
}
