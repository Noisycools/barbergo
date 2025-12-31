<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::where('role', '!=', 'super_admin')
            ->with('barbershop');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        // Filter by Role
        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Filter by Barbershop
        if ($request->filled('barbershop_id') && $request->barbershop_id !== 'all') {
            $query->whereHas('barbershop', function($q) use ($request) {
                $q->where('id', $request->barbershop_id);
            });
        }

        // Sort
        $sortField = $request->input('sort_by', 'name');
        // map frontend sort fields to db columns if needed, but names match for now
        $allowedSorts = ['created_at', 'name', 'role', 'email'];
        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'name';
        }
        $sortOrder = $request->input('sort_order', 'asc');
        
        $query->orderBy($sortField, $sortOrder);

        // Pagination
        $perPage = $request->input('per_page', 10);
        $users = $query->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        // Validation
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email:filter', Rule::unique('users')->ignore($user->id)],
            'phone_number' => [
                'required', 
                'regex:/^0[8-9][0-9]{6,12}$|^0[1-9]{1}[0-9]{1,4}[0-9]{6,7}$/',
                Rule::unique('users')->ignore($user->id)
            ],
            'password' => 'nullable|string|min:8',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
        ];

        if (!empty($validated['password'])) {
            $userData['password'] = bcrypt($validated['password']);
        }

        $user->update($userData);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user->load('barbershop')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        if ($user->role !== 'pelanggan') {
            return response()->json([
                'message' => 'Only customers can be deleted.'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
