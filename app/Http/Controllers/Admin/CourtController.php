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
