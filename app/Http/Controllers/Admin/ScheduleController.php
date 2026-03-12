<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkScheduleRequest;
use App\Models\Venue;
use App\Models\VenueCourt;
use App\Models\VenueCourtSchedule;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function store(Request $request, Venue $venue, VenueCourt $court): RedirectResponse
    {
        $validated = $request->validate([
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'price' => ['required', 'integer', 'min:0'],
            'day_type' => ['required', 'in:weekday,weekend'],
        ]);

        $schedule = $court->schedules()->create($validated);

        ActivityLogger::log('schedule.created', $schedule, $venue);

        return redirect()
            ->back()
            ->with('success', 'Jadwal berhasil ditambahkan.');
    }

    public function update(Request $request, Venue $venue, VenueCourt $court, VenueCourtSchedule $schedule): RedirectResponse
    {
        $validated = $request->validate([
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'price' => ['required', 'integer', 'min:0'],
            'day_type' => ['required', 'in:weekday,weekend'],
        ]);

        $schedule->update($validated);

        ActivityLogger::logChanges('schedule.updated', $schedule, $venue);

        return redirect()
            ->back()
            ->with('success', 'Jadwal berhasil diperbarui.');
    }

    public function destroy(Venue $venue, VenueCourt $court, VenueCourtSchedule $schedule): RedirectResponse
    {
        ActivityLogger::log('schedule.deleted', $schedule, $venue);

        $schedule->delete();

        return redirect()
            ->back()
            ->with('success', 'Jadwal berhasil dihapus.');
    }

    public function bulkDestroy(Request $request, Venue $venue): RedirectResponse
    {
        $validated = $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:venue_court_schedules,id'],
        ]);

        $courtIds = $venue->courts()->pluck('id');
        $schedules = VenueCourtSchedule::whereIn('id', $validated['ids'])
            ->whereIn('venue_court_id', $courtIds)
            ->get();

        foreach ($schedules as $schedule) {
            ActivityLogger::log('schedule.deleted', $schedule, $venue);
            $schedule->delete();
        }

        return redirect()
            ->back()
            ->with('success', count($schedules) . ' jadwal berhasil dihapus.');
    }

    /**
     * Bulk create schedules across multiple courts.
     */
    public function bulkStore(BulkScheduleRequest $request, Venue $venue): RedirectResponse
    {
        $schedules = $request->validated()['schedules'];

        foreach ($schedules as $scheduleData) {
            $schedule = VenueCourtSchedule::create($scheduleData);
            ActivityLogger::log('schedule.created', $schedule, $venue);
        }

        return redirect()
            ->back()
            ->with('success', count($schedules) . ' jadwal berhasil ditambahkan.');
    }
}
