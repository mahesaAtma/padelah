<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Facility;
use App\Models\User;
use App\Models\Venue;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $user = auth()->user();

        if ($user->isSuperAdmin()) {
            return Inertia::render('admin/dashboard', [
                'stats' => [
                    'totalVenues' => Venue::count(),
                    'publishedVenues' => Venue::published()->count(),
                    'draftVenues' => Venue::draft()->count(),
                    'totalCourts' => \App\Models\VenueCourt::count(),
                    'totalUsers' => User::count(),
                    'totalFacilities' => Facility::count(),
                ],
                'recentVenues' => Venue::latest()->take(5)->get(['id', 'name', 'slug', 'city', 'status', 'is_published', 'created_at']),
                'recentActivity' => ActivityLog::with('user:id,name,avatar')
                    ->latest()
                    ->take(10)
                    ->get(),
                'userType' => 'superadmin',
            ]);
        }

        // Venue-admin
        $venueIds = $user->venues()->pluck('venues.id');
        $venues = Venue::whereIn('id', $venueIds)->get();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalVenues' => $venues->count(),
                'publishedVenues' => $venues->where('is_published', true)->count(),
                'draftVenues' => $venues->where('is_published', false)->count(),
            ],
            'venues' => $venues->map(fn($venue) => [
                'id' => $venue->id,
                'name' => $venue->name,
                'slug' => $venue->slug,
                'city' => $venue->city,
                'status' => $venue->status,
                'is_published' => $venue->is_published,
                'completeness' => $venue->completeness_percentage,
                'court_count' => $venue->courts()->count(),
                'photo_count' => $venue->photos()->count(),
            ]),
            'recentActivity' => ActivityLog::with('user:id,name,avatar')
                ->whereIn('venue_id', $venueIds)
                ->latest()
                ->take(10)
                ->get(),
            'userType' => 'venue-admin',
        ]);
    }
}
