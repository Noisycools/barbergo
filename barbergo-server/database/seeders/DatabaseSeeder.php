<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::insert([
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@example.com',
                'role' => 'super_admin',
                'password' => bcrypt('123456')
            ],
            [
                'name' => 'Admin Barbershop',
                'email' => 'adminbarbershop@example.com',
                'role' => 'admin_barbershop',
                'password' => bcrypt('123456')
            ],
            [
                'name' => 'Pelanggan',
                'email' => 'pelanggan@example.com',
                'role' => 'pelanggan',
                'password' => bcrypt('123456')
            ],
        ]);
    }
}
