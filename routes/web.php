<?php

use App\Http\Controllers\GoogleOAuthController;
use App\Http\Controllers\VenueController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'landing')->name('home');
Route::get('/venues/{slug}', VenueController::class)->name('venues.show');

Route::get('/api/oauth/google/redirect', [GoogleOAuthController::class, 'redirect'])->name('oauth.google.redirect');
Route::get('/api/oauth/google/callback', [GoogleOAuthController::class, 'callback'])->name('oauth.google.callback');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/admin.php';
