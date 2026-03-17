<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF');
            DB::statement("
                CREATE TABLE bookings_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    venue_id INTEGER NOT NULL,
                    venue_court_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    booking_date DATE NOT NULL,
                    start_time TIME NOT NULL,
                    end_time TIME NOT NULL,
                    total_price INTEGER NOT NULL,
                    status TEXT CHECK(status IN ('pending_payment','confirmed','cancelled')) NOT NULL DEFAULT 'pending_payment',
                    payment_status TEXT CHECK(payment_status IN ('unpaid','paid')) NOT NULL DEFAULT 'unpaid',
                    payment_token TEXT NULL,
                    payment_method TEXT NULL,
                    notes TEXT NULL,
                    cancelled_at TIMESTAMP NULL,
                    created_at TIMESTAMP NULL,
                    updated_at TIMESTAMP NULL,
                    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
                    FOREIGN KEY (venue_court_id) REFERENCES venue_courts(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ");
            DB::statement('
                INSERT INTO bookings_new
                SELECT id, venue_id, venue_court_id, user_id, booking_date, start_time, end_time,
                       total_price, status, payment_status, payment_token, NULL AS payment_method,
                       notes, cancelled_at, created_at, updated_at
                FROM bookings
            ');
            DB::statement('DROP TABLE bookings');
            DB::statement('ALTER TABLE bookings_new RENAME TO bookings');
            DB::statement('PRAGMA foreign_keys = ON');
        } else {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending_payment','confirmed','cancelled') NOT NULL DEFAULT 'pending_payment'");
            Schema::table('bookings', function (Blueprint $table) {
                $table->string('payment_method')->nullable()->after('payment_token');
            });
        }
    }

    public function down(): void
    {
        DB::table('bookings')->where('status', 'pending_payment')->update(['status' => 'cancelled']);

        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF');
            DB::statement("
                CREATE TABLE bookings_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    venue_id INTEGER NOT NULL,
                    venue_court_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    booking_date DATE NOT NULL,
                    start_time TIME NOT NULL,
                    end_time TIME NOT NULL,
                    total_price INTEGER NOT NULL,
                    status TEXT CHECK(status IN ('confirmed','cancelled')) NOT NULL DEFAULT 'confirmed',
                    payment_status TEXT CHECK(payment_status IN ('unpaid','paid')) NOT NULL DEFAULT 'unpaid',
                    payment_token TEXT NULL,
                    notes TEXT NULL,
                    cancelled_at TIMESTAMP NULL,
                    created_at TIMESTAMP NULL,
                    updated_at TIMESTAMP NULL,
                    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
                    FOREIGN KEY (venue_court_id) REFERENCES venue_courts(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ");
            DB::statement('
                INSERT INTO bookings_new
                SELECT id, venue_id, venue_court_id, user_id, booking_date, start_time, end_time,
                       total_price, status, payment_status, payment_token, notes, cancelled_at,
                       created_at, updated_at
                FROM bookings
            ');
            DB::statement('DROP TABLE bookings');
            DB::statement('ALTER TABLE bookings_new RENAME TO bookings');
            DB::statement('PRAGMA foreign_keys = ON');
        } else {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropColumn('payment_method');
            });
            DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed'");
        }
    }
};
