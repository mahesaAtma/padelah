<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('venue_court_schedules', function (Blueprint $table) {
            $table->increments('id');
            $table->foreignId('venue_court_id');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedInteger('price');
            $table->enum('day_type', ['weekday', 'weekend']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venue_court_schedules');
    }
};
