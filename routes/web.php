<?php

use App\Http\Controllers\GoogleOAuthController;
use App\Http\Controllers\VenueController;
use App\Models\Venue;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    $venues = Venue::published()
        ->with(['courts', 'facilities', 'photos'])
        ->latest()
        ->get();

    return Inertia::render('landing', [
        'venues' => $venues->map(fn($v) => VenueController::transformVenue($v))->values()->toArray(),
    ]);
})->name('home');
Route::get('/venues/{slug}', VenueController::class)->name('venues.show');

Route::get('/api/oauth/google/redirect', [GoogleOAuthController::class, 'redirect'])->name('oauth.google.redirect');
Route::get('/api/oauth/google/callback', [GoogleOAuthController::class, 'callback'])->name('oauth.google.callback');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/admin.php';
