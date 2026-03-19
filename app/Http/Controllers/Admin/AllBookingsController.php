<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Venue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AllBookingsController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = auth()->user();
        $venueIds = $user->venues()->pluck('venues.id');

        $venues = Venue::whereIn('id', $venueIds)
            ->orderBy('name')
            ->get(['id', 'name']);

        $query = Booking::with(['user', 'court', 'venue'])
            ->whereIn('venue_id', $venueIds);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('venue_id')) {
            $query->where('venue_id', $request->venue_id);
        }

        if ($request->filled('date_from')) {
            $query->where('booking_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('booking_date', '<=', $request->date_to);
        }

        $bookings = $query->orderBy('booking_date', 'desc')
            ->orderBy('start_time')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/bookings/index', [
            'venues'   => $venues,
            'bookings' => $bookings->through(fn($b) => [
                'id'             => $b->id,
                'venue'          => ['id' => $b->venue->id, 'name' => $b->venue->name],
                'user'           => ['id' => $b->user->id, 'name' => $b->user->name, 'email' => $b->user->email, 'phone' => $b->user->phone],
                'court'          => ['id' => $b->court->id, 'name' => $b->court->name, 'place' => $b->court->place],
                'booking_date'   => $b->booking_date->format('Y-m-d'),
                'start_time'     => substr($b->start_time, 0, 5),
                'end_time'       => substr($b->end_time, 0, 5),
                'total_price'    => $b->total_price,
                'status'         => $b->status,
                'payment_status' => $b->payment_status,
                'notes'          => $b->notes,
                'cancelled_at'   => $b->cancelled_at?->toISOString(),
                'created_at'     => $b->created_at->toISOString(),
            ]),
            'filters' => $request->only(['status', 'venue_id', 'date_from', 'date_to']),
        ]);
    }
}
