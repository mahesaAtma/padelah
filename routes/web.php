<?php

use App\Http\Controllers\VenueController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'landing')->name('home');
Route::get('/venues/{slug}', VenueController::class)->name('venues.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__ . '/settings.php';
