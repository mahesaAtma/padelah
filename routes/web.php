<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\CustomerDashboardController;
use App\Http\Controllers\GoogleOAuthController;
use App\Http\Controllers\VenueController;
use App\Models\Venue;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $venues = Venue::published()
        ->with(['courts', 'facilities', 'photos'])
        ->latest()
        ->get();

    return Inertia::render('landing', [
    'venues' => $venues->map(fn($v) => VenueController::transformVenue($v))->values()->toArray(),
    ]);
})->name('home');

Route::get('/venues/{slug}', [VenueController::class , 'show'])->name('venues.show');
Route::get('/venues/{slug}/availability', [VenueController::class , 'availability'])->name('venues.availability');

Route::get('/api/oauth/google/redirect', [GoogleOAuthController::class , 'redirect'])->name('oauth.google.redirect');
Route::get('/api/oauth/google/callback', [GoogleOAuthController::class , 'callback'])->name('oauth.google.callback');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::redirect('/dashboard', '/settings/dashboard')->name('dashboard');
});

// Customer-only booking routes
Route::middleware(['auth', 'verified', \App\Http\Middleware\EnsureCustomerRole::class])
    ->group(function () {
        Route::get('/bookings', [BookingController::class , 'index'])->name('bookings.index');
        Route::post('/bookings', [BookingController::class , 'store'])->name('bookings.store');
        Route::delete('/bookings/{booking}', [BookingController::class , 'destroy'])->name('bookings.destroy');
    });

require __DIR__ . '/settings.php';
require __DIR__ . '/admin.php';
