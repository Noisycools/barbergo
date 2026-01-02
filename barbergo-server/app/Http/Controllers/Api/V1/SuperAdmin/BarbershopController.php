<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Barbershop;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BarbershopController extends Controller
{
    public function index()
    {
        $barbershops = Barbershop::with('user')->latest()->get();
        return response()->json(['data' => $barbershops]);
    }

    public function store(Request $request)
    {
        // validate input including optional foto
        $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'required|string',
            'jam_buka' => 'required|date_format:H:i',
            'jam_tutup' => 'required|date_format:H:i',
            'email' => 'required|email|unique:users,email', // Create user for shop
            'password' => 'required|min:6', // Create user password
            'user_name' => 'required|string',
            'foto' => 'nullable|image|max:2048',
        ]);

        return DB::transaction(function () use ($request) {
            // Create Admin User
            $user = User::create([
                'name' => $request->user_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'admin_barbershop'
            ]);

            // Prepare Barbershop data
            $barbershopData = [
                'user_id' => $user->id,
                'nama' => $request->nama,
                'alamat' => $request->alamat,
                'jam_buka' => $request->jam_buka,
                'jam_tutup' => $request->jam_tutup,
                'rating_rata_rata' => 0,
            ];

            // Handle optional foto upload and store on the public disk
            if ($request->hasFile('foto')) {
                $path = $request->file('foto')->store('barbershops', 'public');
                $barbershopData['foto'] = $path;
            }

            // Create Barbershop
            $barbershop = Barbershop::create($barbershopData);

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
            'foto' => 'nullable|image|max:2048',
            'delete_foto' => 'boolean'
        ]);

        $data = $request->only(['nama', 'alamat', 'jam_buka', 'jam_tutup']);

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

        return response()->json(['message' => 'Barbershop updated', 'data' => $barbershop]);
    }

    public function destroy($id)
    {
        $barbershop = Barbershop::findOrFail($id);
        if ($barbershop->foto) {
            Storage::disk('public')->delete($barbershop->foto);
        }
        $barbershop->delete();
        return response()->json(['message' => 'Barbershop deleted']);
    }
}
