<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Promosi;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PromoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Promosi::with('barbershop')->withCount([
            'reservasis' => function ($q) {
                $q->whereIn('status', ['menunggu', 'dikonfirmasi', 'selesai']);
            }
        ]);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('kode_promo', 'like', "%{$search}%")
                    ->orWhere('diskon', 'like', "%{$search}%");
            });
        }

        // Filter Status
        if ($request->filled('status') && $request->status !== 'all') {
            $status = $request->status === 'active' ? 1 : 0;
            $query->where('status', $status);
        }

        // Filter Barbershop (Scope)
        if ($request->filled('barbershop_id') && $request->barbershop_id !== 'all') {
            if ($request->barbershop_id === 'global') {
                $query->where('is_global', true);
            } else {
                $query->where('barbershop_id', $request->barbershop_id);
            }
        }

        // Filter Date Range (Promos running within input range)
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $startDate = $request->start_date . ' 00:00:00';
            $endDate = $request->end_date . ' 23:59:59';
            // Overlap logic: StartA <= EndB AND EndA >= StartB
            $query->where(function ($q) use ($startDate, $endDate) {
                $q->where('tanggal_mulai', '<=', $endDate)
                    ->where('tanggal_berakhir', '>=', $startDate);
            });
        }

        // Sort
        $sortField = $request->input('sort_by', 'nama');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortField, $sortOrder);

        // Pagination
        $perPage = $request->input('per_page', 10);
        $promos = $query->paginate($perPage);

        return response()->json($promos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kode_promo' => 'required|string|unique:promosis,kode_promo|max:50|regex:/^\S*$/',
            'diskon' => 'required|integer|min:1|max:100',
            'tanggal_mulai' => 'required|date_format:Y-m-d H:i:s|after_or_equal:today',
            'tanggal_berakhir' => 'required|date_format:Y-m-d H:i:s|after:tanggal_mulai',
            'quota_limit' => 'required|integer|min:0',
            'status' => 'required|boolean',
            'barbershop_id' => 'nullable|exists:barbershops,id',
            'scope' => 'required|in:global,specific',
        ]);

        $isGlobal = $validated['scope'] === 'global';
        if ($isGlobal) {
            $validated['barbershop_id'] = null;
        } else {
            if (empty($validated['barbershop_id'])) {
                return response()->json(['message' => 'Barbershop is required for specific scope'], 422);
            }
        }

        $promo = Promosi::create([
            'nama' => $validated['nama'],
            'kode_promo' => $validated['kode_promo'],
            'diskon' => $validated['diskon'],
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_berakhir' => $validated['tanggal_berakhir'],
            'quota_limit' => $validated['quota_limit'],
            'status' => $validated['status'],
            'barbershop_id' => $validated['barbershop_id'],
            'is_global' => $isGlobal,
        ]);

        return response()->json(['message' => 'Promotion created successfully', 'data' => $promo], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $promo = Promosi::withCount([
            'reservasis' => function ($q) {
                $q->whereIn('status', ['menunggu', 'dikonfirmasi', 'selesai']);
            }
        ])->findOrFail($id);

        $isUsed = $promo->reservasis_count > 0;

        // If used, only allow status update
        if ($isUsed) {
            $validated = $request->validate([
                'status' => 'required|boolean'
            ]);

            $promo->update(['status' => $validated['status']]);

            return response()->json(['message' => 'Promotion status updated (other fields locked due to usage)', 'data' => $promo]);
        }

        // If not used, full update
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kode_promo' => ['required', 'string', 'max:50', Rule::unique('promosis')->ignore($promo->id), 'regex:/^\S*$/'],
            'diskon' => 'required|integer|min:1|max:100',
            'tanggal_mulai' => 'required|date_format:Y-m-d H:i:s',
            'tanggal_berakhir' => 'required|date_format:Y-m-d H:i:s|after:tanggal_mulai',
            'quota_limit' => 'required|integer|min:0',
            'status' => 'required|boolean',
            'barbershop_id' => 'nullable|exists:barbershops,id',
            'scope' => 'required|in:global,specific',
        ]);

        $isGlobal = $validated['scope'] === 'global';
        if ($isGlobal) {
            $validated['barbershop_id'] = null;
        } else {
            if (empty($validated['barbershop_id'])) {
                return response()->json(['message' => 'Barbershop is required for specific scope'], 422);
            }
        }

        $promo->update([
            'nama' => $validated['nama'],
            'kode_promo' => $validated['kode_promo'],
            'diskon' => $validated['diskon'],
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_berakhir' => $validated['tanggal_berakhir'],
            'quota_limit' => $validated['quota_limit'],
            'status' => $validated['status'],
            'barbershop_id' => $validated['barbershop_id'],
            'is_global' => $isGlobal,
        ]);

        return response()->json(['message' => 'Promotion updated successfully', 'data' => $promo]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $promo = Promosi::withCount([
            'reservasis' => function ($q) {
                $q->whereIn('status', ['menunggu', 'dikonfirmasi', 'selesai']);
            }
        ])->findOrFail($id);

        if ($promo->reservasis_count > 0) {
            return response()->json(['message' => 'Cannot delete promotion that has been used in reservations.'], 403);
        }

        $promo->delete();

        return response()->json(['message' => 'Promotion deleted successfully']);
    }
}
