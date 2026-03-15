<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Venue;
use App\Models\VenueCourt;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VenueController extends Controller
{
    public function show(string $slug): Response
    {
        $venue = Venue::where('slug', $slug)
            ->published()
            ->with(['courts.schedules', 'facilities', 'photos'])
            ->firstOrFail();

        return Inertia::render('venues/show', [
            'venue' => $this->transformVenue($venue),
        ]);
    }

    public function availability(Request $request, string $slug): JsonResponse
    {
        $request->validate([
            'date'     => ['required', 'date', 'after_or_equal:today', 'before_or_equal:' . now()->addDays(30)->format('Y-m-d')],
            'court_id' => ['required', 'integer'],
        ]);

        $venue = Venue::where('slug', $slug)->published()->firstOrFail();

        $court = VenueCourt::where('id', $request->court_id)
            ->where('venue_id', $venue->id)
            ->with('schedules')
            ->firstOrFail();

        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->dayOfWeek;
        $dayType = in_array($dayOfWeek, [Carbon::SATURDAY, Carbon::SUNDAY]) ? 'weekend' : 'weekday';

        $schedules = $court->schedules
            ->where('day_type', $dayType)
            ->sortBy('start_time')
            ->values();

        // Get confirmed bookings for this court on this date
        $bookedRanges = Booking::where('venue_court_id', $court->id)
            ->where('booking_date', $date->format('Y-m-d'))
            ->where('status', 'confirmed')
            ->get(['start_time', 'end_time']);

        $minStart = now()->addHour()->format('H:i:s');

        $slots = $schedules->map(function ($schedule) use ($bookedRanges, $minStart, $date) {
            $isToday = $date->isToday();
            $tooSoon = $isToday && $schedule->start_time <= $minStart;

            $isBooked = $bookedRanges->contains(function ($booking) use ($schedule) {
                return $booking->start_time < $schedule->end_time
                    && $booking->end_time > $schedule->start_time;
            });

            return [
                'schedule_id' => $schedule->id,
                'start_time'  => substr($schedule->start_time, 0, 5),
                'end_time'    => substr($schedule->end_time, 0, 5),
                'price'       => $schedule->price,
                'available'   => !$isBooked && !$tooSoon,
            ];
        });

        return response()->json(['slots' => $slots]);
    }

    public static function transformVenue(Venue $venue): array
    {
        $courts = $venue->relationLoaded('courts') ? $venue->courts : collect();
        $facilities = $venue->relationLoaded('facilities') ? $venue->facilities : collect();
        $photos = $venue->relationLoaded('photos') ? $venue->photos : collect();

        $coverPhoto = $photos->where('is_cover', true)->first();
        $rawPath = $coverPhoto ? $coverPhoto->file_path : ($photos->first()?->file_path ?? null);
        $imagePath = $rawPath ? \Illuminate\Support\Facades\Storage::url($rawPath) : null;

        $isComplete = !empty($venue->description)
            && $photos->count() > 0
            && $courts->count() > 0
            && $facilities->count() > 0;

        return [
            'id'         => $venue->id,
            'slug'       => $venue->slug,
            'name'       => $venue->name,
            'location'   => implode(', ', array_filter([$venue->city, $venue->province])),
            'city'       => $venue->city ?? '',
            'province'   => $venue->province ?? '',
            'address_1'  => $venue->address_1,
            'address_2'  => $venue->address_2,
            'description'=> $venue->description,
            'image'      => $imagePath,
            'gallery'    => $photos->map(fn($p) => \Illuminate\Support\Facades\Storage::url($p->file_path))->values()->toArray(),
            'courtCount' => $courts->count(),
            'courts'     => $courts->map(fn($c) => [
                'id'   => (string) $c->id,
                'name' => $c->name,
                'type' => $c->place,
            ])->values()->toArray(),
            'facilities' => $facilities->map(fn($f) => ['name' => $f->name])->values()->toArray(),
            'priceRange' => (function () use ($courts) {
                $prices = $courts->flatMap(fn($c) => $c->relationLoaded('schedules') ? $c->schedules->pluck('price') : collect())->filter();
                return $prices->isEmpty() ? null : ['min' => $prices->min(), 'max' => $prices->max()];
            })(),
            'isOfficial' => $venue->status === 'official',
            'isComplete' => $isComplete,
            'phone'      => $venue->phone,
            'latitude'   => $venue->latitude ? (float) $venue->latitude : null,
            'longitude'  => $venue->longitude ? (float) $venue->longitude : null,
            'schedule'   => [],
        ];
    }
}
