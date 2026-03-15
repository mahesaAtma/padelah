<?php

use App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Routes for the CMS dashboard, accessible by superadmin and venue-admin.
| All routes are prefixed with /admin and protected by auth + admin middleware.
|
*/

Route::middleware(['auth', 'verified', \App\Http\Middleware\EnsureAdminRole::class])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // Dashboard
        Route::get('/', Admin\DashboardController::class)->name('dashboard');

        // Profile (admin-specific)
        Route::get('profile', [Admin\ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('profile', [Admin\ProfileController::class, 'update'])->name('profile.update');

        // Venue Management
        Route::get('venues', [Admin\VenueController::class, 'index'])->name('venues.index');
        Route::get('venues/create', [Admin\VenueController::class, 'create'])->name('venues.create');
        Route::post('venues', [Admin\VenueController::class, 'store'])->name('venues.store');

        // Venue-specific routes (with venue access check)
        Route::middleware(\App\Http\Middleware\EnsureVenueAccess::class)
            ->prefix('venues/{venue}')
            ->name('venues.')
            ->group(function () {
            Route::get('edit', [Admin\VenueController::class, 'edit'])->name('edit');
            Route::put('/', [Admin\VenueController::class, 'update'])->name('update');
            Route::delete('/', [Admin\VenueController::class, 'destroy'])->name('destroy');
            Route::post('toggle-publish', [Admin\VenueController::class, 'togglePublish'])->name('toggle-publish');

            // Courts
            Route::post('courts', [Admin\CourtController::class, 'store'])->name('courts.store');
            Route::put('courts/{court}', [Admin\CourtController::class, 'update'])->name('courts.update');
            Route::delete('courts/{court}', [Admin\CourtController::class, 'destroy'])->name('courts.destroy');
            Route::post('courts/{court}/duplicate', [Admin\CourtController::class, 'duplicate'])->name('courts.duplicate');

            // Schedules
            Route::post('courts/{court}/schedules', [Admin\ScheduleController::class, 'store'])->name('schedules.store');
            Route::put('courts/{court}/schedules/{schedule}', [Admin\ScheduleController::class, 'update'])->name('schedules.update');
            Route::delete('courts/{court}/schedules/{schedule}', [Admin\ScheduleController::class, 'destroy'])->name('schedules.destroy');
            Route::post('schedules/bulk', [Admin\ScheduleController::class, 'bulkStore'])->name('schedules.bulk');
            Route::delete('schedules/bulk', [Admin\ScheduleController::class, 'bulkDestroy'])->name('schedules.bulk-destroy');

            // Photos
            Route::post('photos', [Admin\PhotoController::class, 'store'])->name('photos.store');
            Route::put('photos/order', [Admin\PhotoController::class, 'updateOrder'])->name('photos.order');
            Route::post('photos/{photo}/cover', [Admin\PhotoController::class, 'setCover'])->name('photos.cover');
            Route::delete('photos/{photo}', [Admin\PhotoController::class, 'destroy'])->name('photos.destroy');

            // Facility sync
            Route::post('facilities', [Admin\VenueFacilityController::class, 'sync'])->name('facilities.sync');

            // Bookings
            Route::get('bookings', [Admin\BookingController::class, 'index'])->name('bookings.index');
        });

        // Superadmin only routes
        Route::middleware(\App\Http\Middleware\EnsureSuperAdmin::class)->group(function () {
            // Facilities Master Data
            Route::get('facilities', [Admin\FacilityController::class, 'index'])->name('facilities.index');
            Route::post('facilities', [Admin\FacilityController::class, 'store'])->name('facilities.store');
            Route::put('facilities/{facility}', [Admin\FacilityController::class, 'update'])->name('facilities.update');
            Route::delete('facilities/{facility}', [Admin\FacilityController::class, 'destroy'])->name('facilities.destroy');

            // User Management
            Route::get('users', [Admin\UserController::class, 'index'])->name('users.index');
            Route::get('users/create', [Admin\UserController::class, 'create'])->name('users.create');
            Route::post('users', [Admin\UserController::class, 'store'])->name('users.store');
            Route::get('users/{user}/edit', [Admin\UserController::class, 'edit'])->name('users.edit');
            Route::put('users/{user}', [Admin\UserController::class, 'update'])->name('users.update');
            Route::delete('users/{user}', [Admin\UserController::class, 'destroy'])->name('users.destroy');
        });

        // Activity Logs (both roles, scoped in controller)
        Route::get('activity-logs', Admin\ActivityLogController::class)->name('activity-logs');
    });
