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
        Schema::table('venues', function (Blueprint $table) {
            $table->string('phone')->nullable()->change();
            $table->time('open_at')->nullable()->change();
            $table->time('close_at')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('venues', function (Blueprint $table) {
            $table->string('phone')->nullable(false)->change();
            $table->time('open_at')->nullable(false)->change();
            $table->time('close_at')->nullable(false)->change();
        });
    }
};
