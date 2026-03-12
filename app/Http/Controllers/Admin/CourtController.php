<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourtRequest;
use App\Models\Venue;
use App\Models\VenueCourt;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CourtController extends Controller
{
    public function duplicate(Venue $venue, VenueCourt $court): RedirectResponse
    {
        $newNumber = ($venue->courts()->max('court_number') ?? 0) + 1;

        $name = $court->name;
        if (preg_match('/^(.*?)(\s*\d+)$/', $name, $m)) {
            $newName = $m[1] . ' ' . $newNumber;
        } else {
            $newName = $name . ' ' . $newNumber;
        }

        $newCourt = $venue->courts()->create([
            'court_number' => $newNumber,
            'name'         => trim($newName),
            'place'        => $court->place,
        ]);

        foreach ($court->schedules as $schedule) {
            $newCourt->schedules()->create([
                'start_time' => $schedule->start_time,
                'end_time'   => $schedule->end_time,
                'price'      => $schedule->price,
                'day_type'   => $schedule->day_type,
            ]);
        }

        ActivityLogger::log('court.duplicated', $newCourt, $venue, ['source_court_id' => $court->id]);

        return redirect()->back()->with('success', 'Lapangan berhasil diduplikasi.');
    }


    public function store(StoreCourtRequest $request, Venue $venue): RedirectResponse
    {
        $court = $venue->courts()->create($request->validated());

        ActivityLogger::log('court.created', $court, $venue);

        return redirect()
            ->back()
            ->with('success', 'Lapangan berhasil ditambahkan.');
    }

    public function update(Request $request, Venue $venue, VenueCourt $court): RedirectResponse
    {
        $validated = $request->validate([
            'court_number' => ['required', 'integer', 'min:1'],
            'name' => ['required', 'string', 'max:255'],
            'place' => ['required', 'in:indoor,outdoor'],
        ]);

        $court->update($validated);

        ActivityLogger::logChanges('court.updated', $court, $venue);

        return redirect()
            ->back()
            ->with('success', 'Lapangan berhasil diperbarui.');
    }

    public function destroy(Venue $venue, VenueCourt $court): RedirectResponse
    {
        ActivityLogger::log('court.deleted', $court, $venue, [
            'name' => $court->name,
        ]);

        $court->delete();

        return redirect()
            ->back()
            ->with('success', 'Lapangan berhasil dihapus.');
    }
}
