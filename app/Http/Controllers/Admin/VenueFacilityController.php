<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VenueFacilityController extends Controller
{
    /**
     * Sync selected facilities for a venue.
     */
    public function sync(Request $request, Venue $venue): RedirectResponse
    {
        $validated = $request->validate([
            'facility_ids' => ['nullable', 'array'],
            'facility_ids.*' => ['integer', 'exists:facilities,id'],
        ]);

        $venue->facilities()->sync($validated['facility_ids'] ?? []);

        ActivityLogger::log('venue.facilities_synced', $venue, null, [
            'facility_ids' => $validated['facility_ids'] ?? [],
        ]);

        return redirect()
            ->back()
            ->with('success', 'Fasilitas venue berhasil diperbarui.');
    }
}
