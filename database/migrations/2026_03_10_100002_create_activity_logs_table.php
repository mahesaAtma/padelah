<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->unsignedInteger('venue_id')->nullable();
            $table->string('action'); // e.g. venue.created, court.updated, photo.deleted
            $table->string('subject_type')->nullable(); // morph type
            $table->unsignedBigInteger('subject_id')->nullable(); // morph id
            $table->json('properties')->nullable(); // old/new values
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
