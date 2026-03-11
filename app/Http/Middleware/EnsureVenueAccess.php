<?php

namespace App\Http\Middleware;

use App\Models\Venue;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureVenueAccess
{
    /**
     * Ensure the user can manage the given venue.
     * Superadmin: always allowed.
     * Venue-admin: only if linked via user_venues.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $venue = $request->route('venue');

        // Resolve venue if it's an ID string
        if (!$venue instanceof Venue) {
            $venue = Venue::findOrFail($venue);
        }

        if (!$user->canManageVenue($venue)) {
            abort(403, 'Anda tidak memiliki akses ke venue ini.');
        }

        return $next($request);
    }
}
