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
        Schema::create('venues', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('address_1');
            $table->string('address_2')->nullable();
            $table->string('city');
            $table->string('province');
            $table->string('postal_code');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->time('open_at');
            $table->time('close_at');
            $table->text('description')->nullable();
            $table->enum('status', ['official', 'partner']);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venues');
    }
};
