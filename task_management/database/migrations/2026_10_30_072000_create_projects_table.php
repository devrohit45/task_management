<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_to_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('Pending');
            $table->date('due_date')->nullable();
            $table->timestamps();

            $table->index(['created_by_id', 'assigned_to_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
