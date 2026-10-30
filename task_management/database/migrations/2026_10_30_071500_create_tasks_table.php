<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('To do');
            $table->string('priority')->default('Medium');
            $table->date('due_date');
            $table->timestamps();

            $table->index(['user_id', 'assignee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
