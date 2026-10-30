<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->where('role', 'company')->update(['role' => 'manager']);
        DB::table('users')->where('role', 'customer')->update(['role' => 'employee']);
    }

    public function down(): void
    {
        DB::table('users')->where('role', 'manager')->update(['role' => 'company']);
    }
};
