<?php

namespace App\Http\Controllers;

use App\Mail\BookingConfirmed;
use App\Models\Booking;
use App\Models\Venue;
use App\Models\VenueCourt;
use App\Models\VenueCourtSchedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $bookings = Booking::with(['venue', 'court'])
            ->where('user_id', $user->id)
            ->orderByRaw("CASE WHEN status = 'confirmed' AND booking_date >= CURDATE() THEN 0 ELSE 1 END")
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->paginate(15);

        return Inertia::render('bookings/index', [
            'bookings' => $bookings->through(fn($b) => $this->transformBooking($b)),
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'venue_id'        => ['required', 'integer', 'exists:venues,id'],
            'venue_court_id'  => ['required', 'integer', 'exists:venue_courts,id'],
            'booking_date'    => ['required', 'date', 'after_or_equal:today', 'before_or_equal:' . now()->addDays(30)->format('Y-m-d')],
            'start_time'      => ['required', 'date_format:H:i'],
            'end_time'        => ['required', 'date_format:H:i', 'after:start_time'],
            'notes'           => ['nullable', 'string', 'max:500'],
        ]);

        // Load venue and verify it's official + complete
        $venue = Venue::with(['courts.schedules', 'facilities', 'photos'])
            ->findOrFail($validated['venue_id']);

        if ($venue->status !== 'official') {
            throw ValidationException::withMessages(['booking' => ['Pemesanan hanya tersedia untuk venue resmi.']]);
        }

        if ($venue->completeness_percentage < 100) {
            throw ValidationException::withMessages(['booking' => ['Venue belum memenuhi syarat untuk menerima pemesanan.']]);
        }

        // Verify court belongs to venue
        $court = VenueCourt::where('id', $validated['venue_court_id'])
            ->where('venue_id', $venue->id)
            ->firstOrFail();

        // Min 1-hour lead time
        $bookingDatetime = Carbon::parse($validated['booking_date'] . ' ' . $validated['start_time'] . ':00');
        if ($bookingDatetime->lt(now()->addHour())) {
            throw ValidationException::withMessages(['booking' => ['Pemesanan harus dilakukan minimal 1 jam sebelum waktu mulai.']]);
        }

        // Derive day_type from date
        $dayOfWeek = Carbon::parse($validated['booking_date'])->dayOfWeek;
        $dayType = in_array($dayOfWeek, [Carbon::SATURDAY, Carbon::SUNDAY]) ? 'weekend' : 'weekday';

        // Find all schedules covering the requested range
        $schedules = VenueCourtSchedule::where('venue_court_id', $court->id)
            ->where('day_type', $dayType)
            ->where('start_time', '>=', $validated['start_time'] . ':00')
            ->where('end_time', '<=', $validated['end_time'] . ':00')
            ->orderBy('start_time')
            ->get();

        if ($schedules->isEmpty()) {
            throw ValidationException::withMessages(['booking' => ['Tidak ada slot tersedia untuk rentang waktu yang dipilih.']]);
        }

        // Verify the schedules form a consecutive chain matching exactly start→end
        $firstStart = substr($schedules->first()->start_time, 0, 5);
        $lastEnd = substr($schedules->last()->end_time, 0, 5);

        if ($firstStart !== $validated['start_time'] || $lastEnd !== $validated['end_time']) {
            throw ValidationException::withMessages(['booking' => ['Slot waktu tidak valid atau tidak berurutan.']]);
        }

        $totalPrice = $schedules->sum('price');

        // Conflict check and insert in a transaction
        $booking = DB::transaction(function () use ($validated, $user, $venue, $court, $totalPrice) {
            $conflict = Booking::where('venue_court_id', $court->id)
                ->where('booking_date', $validated['booking_date'])
                ->where('status', 'confirmed')
                ->where('start_time', '<', $validated['end_time'] . ':00')
                ->where('end_time', '>', $validated['start_time'] . ':00')
                ->lockForUpdate()
                ->exists();

            if ($conflict) {
                throw ValidationException::withMessages(['booking' => ['Slot yang Anda pilih sudah dipesan oleh orang lain. Silakan pilih slot lain.']]);
            }

            return Booking::create([
                'venue_id'       => $venue->id,
                'venue_court_id' => $court->id,
                'user_id'        => $user->id,
                'booking_date'   => $validated['booking_date'],
                'start_time'     => $validated['start_time'] . ':00',
                'end_time'       => $validated['end_time'] . ':00',
                'total_price'    => $totalPrice,
                'status'         => 'confirmed',
                'payment_status' => 'unpaid',
                'notes'          => $validated['notes'] ?? null,
            ]);
        });

        $booking->load(['venue', 'court', 'user']);

        // Send confirmation email
        try {
            Mail::to($user->email)->send(new BookingConfirmed($booking));
        } catch (\Throwable $e) {
            // Non-fatal: booking already created
        }

        return redirect()->route('bookings.index')->with('success', 'Pesanan dikonfirmasi! Cek email Anda.');
    }

    public function destroy(Request $request, Booking $booking): \Illuminate\Http\RedirectResponse
    {
        $user = $request->user();

        if ($booking->user_id !== $user->id) {
            abort(403);
        }

        if ($booking->payment_status === 'paid') {
            throw ValidationException::withMessages(['booking' => ['Pemesanan yang sudah dibayar tidak dapat dibatalkan.']]);
        }

        if ($booking->status === 'cancelled') {
            throw ValidationException::withMessages(['booking' => ['Pemesanan ini sudah dibatalkan.']]);
        }

        $booking->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return back();
    }

    private function transformBooking(Booking $booking): array
    {
        return [
            'id'             => $booking->id,
            'venue'          => ['id' => $booking->venue->id, 'name' => $booking->venue->name, 'slug' => $booking->venue->slug],
            'court'          => ['id' => $booking->court->id, 'name' => $booking->court->name, 'place' => $booking->court->place],
            'booking_date'   => $booking->booking_date->format('Y-m-d'),
            'start_time'     => substr($booking->start_time, 0, 5),
            'end_time'       => substr($booking->end_time, 0, 5),
            'total_price'    => $booking->total_price,
            'status'         => $booking->status,
            'payment_status' => $booking->payment_status,
            'notes'          => $booking->notes,
            'cancelled_at'   => $booking->cancelled_at?->toISOString(),
            'created_at'     => $booking->created_at->toISOString(),
        ];
    }
}
