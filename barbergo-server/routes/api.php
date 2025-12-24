<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BarbershopController;
use App\Http\Controllers\Api\V1\ReservasiController;
use App\Http\Controllers\Api\V1\PromosiController;

Route::prefix('v1')->group(function () {
    // Auth
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Public
    Route::get('/barbershop', [BarbershopController::class, 'index']);
    Route::get('/barbershop/{id}', [BarbershopController::class, 'show']);
    Route::get('/promosi', [PromosiController::class, 'index']);

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/user/profile', [AuthController::class, 'user']);

        // Pelanggan Actions
        Route::post('/reservasi', [ReservasiController::class, 'store']);
        Route::get('/reservasi/riwayat', [ReservasiController::class, 'riwayat']);
        Route::put('/reservasi/{id}/batal', [ReservasiController::class, 'cancel']);
        Route::post('/reservasi/{id}/ulasan', [\App\Http\Controllers\Api\V1\UlasanController::class, 'store']);

        // Admin Routes
        Route::prefix('admin')->group(function () {
            Route::get('/barbershop', [\App\Http\Controllers\Api\V1\Admin\BarbershopController::class, 'show']);
            Route::put('/barbershop', [\App\Http\Controllers\Api\V1\Admin\BarbershopController::class, 'update']);

            Route::apiResource('layanan', \App\Http\Controllers\Api\V1\Admin\LayananController::class);
            Route::apiResource('tukang-cukur', \App\Http\Controllers\Api\V1\Admin\TukangCukurController::class);
        });

        // Super Admin Routes
        Route::prefix('super-admin')->group(function () {
            Route::apiResource('barbershop', \App\Http\Controllers\Api\V1\SuperAdmin\BarbershopController::class);
            // Add user management later if needed
        });
    });
});
