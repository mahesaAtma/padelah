<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Venue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request, Venue $venue): Response
    {
        $query = Booking::with(['user', 'court'])
            ->where('venue_id', $venue->id);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
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

        return Inertia::render('admin/venues/bookings', [
            'venue'    => ['id' => $venue->id, 'name' => $venue->name, 'slug' => $venue->slug],
            'bookings' => $bookings->through(fn($b) => [
                'id'             => $b->id,
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
            'filters'  => $request->only(['status', 'date_from', 'date_to']),
        ]);
    }
}
