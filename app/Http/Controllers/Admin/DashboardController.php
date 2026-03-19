<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\Facility;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
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

        $today = Carbon::today();
        $startDate = request('start_date')
            ? Carbon::parse(request('start_date'))->startOfDay()
            : $today->copy()->subDays(29);
        $endDate = request('end_date')
            ? Carbon::parse(request('end_date'))->startOfDay()
            : $today;

        // Clamp: end >= start, end <= today
        if ($endDate->lt($startDate)) $endDate = $startDate->copy();
        if ($endDate->gt($today)) $endDate = $today->copy();

        $chartData = $this->getVenueAdminChartData($venueIds->toArray(), $startDate, $endDate);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalVenues' => $venues->count(),
                'publishedVenues' => $venues->where('is_published', true)->count(),
                'draftVenues' => $venues->where('is_published', false)->count(),
                'totalBookings' => $chartData['totalBookings'],
                'totalRevenue' => $chartData['totalRevenue'],
                'confirmedBookings' => $chartData['confirmedBookings'],
            ],
            'dateRange' => [
                'startDate' => $startDate->toDateString(),
                'endDate' => $endDate->toDateString(),
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
            'chartData' => $chartData,
            'recentBookings' => \App\Models\Booking::with(['user', 'court', 'venue'])
                ->whereIn('venue_id', $venueIds)
                ->orderBy('booking_date', 'desc')
                ->orderBy('start_time')
                ->take(8)
                ->get()
                ->map(fn($b) => [
                    'id'           => $b->id,
                    'venue'        => ['id' => $b->venue->id, 'name' => $b->venue->name],
                    'user'         => ['name' => $b->user->name, 'email' => $b->user->email],
                    'court'        => ['name' => $b->court->name, 'place' => $b->court->place],
                    'booking_date' => $b->booking_date->format('Y-m-d'),
                    'start_time'   => substr($b->start_time, 0, 5),
                    'end_time'     => substr($b->end_time, 0, 5),
                    'total_price'  => $b->total_price,
                    'status'       => $b->status,
                ]),
        ]);
    }

    private function getVenueAdminChartData(array $venueIds, Carbon $startDate, Carbon $endDate): array
    {
        $dateRange = [$startDate->toDateString(), $endDate->toDateString()];

        // Daily bookings & revenue
        $dailyRaw = Booking::whereIn('venue_id', $venueIds)
            ->where('status', 'confirmed')
            ->whereBetween('booking_date', $dateRange)
            ->select(
                DB::raw('DATE(booking_date) as date'),
                DB::raw('COUNT(*) as bookings'),
                DB::raw('SUM(total_price) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $dailyBookings = [];
        $current = $startDate->copy();
        while ($current->lte($endDate)) {
            $date = $current->toDateString();
            $row = $dailyRaw->get($date);
            $dailyBookings[] = [
                'date' => $current->format('d/m'),
                'bookings' => $row ? (int)$row->bookings : 0,
                'revenue' => $row ? (int)$row->revenue : 0,
            ];
            $current->addDay();
        }

        // Bookings per court (top 6) within date range
        $byCourt = Booking::whereIn('bookings.venue_id', $venueIds)
            ->where('bookings.status', 'confirmed')
            ->whereBetween('bookings.booking_date', $dateRange)
            ->join('venue_courts', 'bookings.venue_court_id', '=', 'venue_courts.id')
            ->select('venue_courts.name as court', DB::raw('COUNT(*) as bookings'))
            ->groupBy('venue_courts.id', 'venue_courts.name')
            ->orderByDesc('bookings')
            ->take(6)
            ->get()
            ->map(fn($r) => ['court' => $r->court, 'bookings' => (int)$r->bookings])
            ->toArray();

        // Bookings by day of week within date range
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        $isSqlite = DB::getDriverName() === 'sqlite';
        $dowExpr = $isSqlite
            ? DB::raw("STRFTIME('%w', booking_date) as dow")
            : DB::raw('(DAYOFWEEK(booking_date) - 1) as dow');
        $byDayRaw = Booking::whereIn('venue_id', $venueIds)
            ->where('status', 'confirmed')
            ->whereBetween('booking_date', $dateRange)
            ->select($dowExpr, DB::raw('COUNT(*) as bookings'))
            ->groupBy('dow')
            ->get()
            ->keyBy('dow');

        $byDay = [];
        for ($d = 0; $d < 7; $d++) {
            $row = $byDayRaw->get((string)$d);
            $byDay[] = [
                'day' => $dayNames[$d],
                'bookings' => $row ? (int)$row->bookings : 0,
            ];
        }

        $totalBookings = Booking::whereIn('venue_id', $venueIds)
            ->whereBetween('booking_date', $dateRange)
            ->count();
        $confirmed = Booking::whereIn('venue_id', $venueIds)
            ->where('status', 'confirmed')
            ->whereBetween('booking_date', $dateRange)
            ->count();
        $totalRevenue = Booking::whereIn('venue_id', $venueIds)
            ->where('status', 'confirmed')
            ->whereBetween('booking_date', $dateRange)
            ->sum('total_price');

        return [
            'dailyBookings' => $dailyBookings,
            'byCourt' => $byCourt,
            'byDay' => $byDay,
            'totalBookings' => $totalBookings,
            'confirmedBookings' => $confirmed,
            'totalRevenue' => (int)$totalRevenue,
        ];
    }
}
