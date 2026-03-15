<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerDashboardController extends Controller
{
    public function index(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        $user = $request->user();

        // Redirect admins to their panel
        if (in_array($user->type, ['superadmin', 'venue-admin'])) {
            return redirect('/admin');
        }

        $bookings = Booking::with(['venue', 'court'])
            ->where('user_id', $user->id)
            ->orderByRaw("CASE WHEN status = 'confirmed' AND booking_date >= CURDATE() THEN 0 ELSE 1 END")
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->get()
            ->map(fn($b) => [
                'id'             => $b->id,
                'venue'          => ['id' => $b->venue->id, 'name' => $b->venue->name, 'slug' => $b->venue->slug],
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
            ]);

        return Inertia::render('settings/dashboard', [
            'bookings'        => $bookings,
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status'          => $request->session()->get('status'),
        ]);
    }
}
