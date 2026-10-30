<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin',
                'email' => 'admin@test.com',
                'password' => Hash::make('12345678'),
                'role' => 'admin',
                'is_active' => true,
            ],
            [
                'name' => 'Manager',
                'email' => 'company@test.com',
                'password' => Hash::make('12345678'),
                'role' => 'manager',
                'is_active' => true,
            ],
            [
                'name' => 'Employee',
                'email' => 'employee@test.com',
                'password' => Hash::make('12345678'),
                'role' => 'employee',
                'is_active' => true,
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                $user
            );
        }
    }
}