<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Barbershop;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class BarbershopController extends Controller
{
    public function index()
    {
        $barbershops = Barbershop::with('user')->latest()->get();
        return response()->json(['data' => $barbershops]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'required|string',
            'jam_buka' => 'required',
            'jam_tutup' => 'required',
            'email' => 'required|email|unique:users,email', // Create user for shop
            'password' => 'required|min:6', // Create user password
            'user_name' => 'required|string'
        ]);

        return DB::transaction(function () use ($request) {
            // Create Admin User
            $user = User::create([
                'name' => $request->user_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'admin_barbershop'
            ]);

            // Create Barbershop
            $barbershop = Barbershop::create([
                'user_id' => $user->id,
                'nama' => $request->nama,
                'alamat' => $request->alamat,
                'jam_buka' => $request->jam_buka,
                'jam_tutup' => $request->jam_tutup,
                'rating_rata_rata' => 0
            ]);

            // Auto-generate Weekly Schedule
            $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            foreach ($days as $day) {
                $barbershop->operatingHours()->create([
                    'day' => $day,
                    'is_open' => true,
                    'start_time' => $request->jam_buka,
                    'end_time' => $request->jam_tutup,
                ]);
            }

            return response()->json(['message' => 'Barbershop created', 'data' => $barbershop], 201);
        });
    }

    public function update(Request $request, $id)
    {
        $barbershop = Barbershop::findOrFail($id);

        $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'required|string',
            'jam_buka' => 'required',
            'jam_tutup' => 'required',
        ]);

        $barbershop->update($request->only(['nama', 'alamat', 'jam_buka', 'jam_tutup']));

        return response()->json(['message' => 'Barbershop updated', 'data' => $barbershop]);
    }

    public function destroy($id)
    {
        $barbershop = Barbershop::findOrFail($id);
        // Optional: Delete user too? For now just delete shop.
        $barbershop->delete();
        return response()->json(['message' => 'Barbershop deleted']);
    }
}
