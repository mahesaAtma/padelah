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
        Schema::create('venue_courts', function (Blueprint $table) {
            $table->increments('id');
            $table->foreignId('venue_id');
            $table->integer('court_number');
            $table->string('name');
            $table->enum('place', ['indoor', 'outdoor']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venue_courts');
    }
};
