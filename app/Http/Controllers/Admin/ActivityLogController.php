<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $query = ActivityLog::with(['user:id,name,avatar', 'venue:id,name'])
            ->latest();

        // Venue-admin can only see logs for their own venues
        if ($user->isVenueAdmin()) {
            $venueIds = $user->venues()->pluck('venues.id');
            $query->whereIn('venue_id', $venueIds);
        }

        $logs = $query->paginate(25)->withQueryString();

        return Inertia::render('admin/activity-logs/index', [
            'logs' => $logs,
        ]);
    }
}
