<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use App\Models\VenuePhoto;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PhotoController extends Controller
{
    public function store(Request $request, Venue $venue): RedirectResponse
    {
        $request->validate([
            'photos' => ['required', 'array', 'min:1'],
            'photos.*' => ['image', 'max:5120'], // max 5MB per photo
        ]);

        $maxOrder = $venue->photos()->max('sort_order') ?? 0;
        $isFirst = $venue->photos()->count() === 0;

        foreach ($request->file('photos') as $index => $photo) {
            $path = $photo->store('venues/' . $venue->id, 'public');

            $venuePhoto = $venue->photos()->create([
                'file_path' => $path,
                'sort_order' => $maxOrder + $index + 1,
                'is_cover' => $isFirst && $index === 0,
            ]);

            ActivityLogger::log('photo.uploaded', $venuePhoto, $venue);
        }

        return redirect()
            ->back()
            ->with('success', 'Foto berhasil diunggah.');
    }

    public function updateOrder(Request $request, Venue $venue): RedirectResponse
    {
        $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:venue_photos,id'],
        ]);

        foreach ($request->input('order') as $index => $photoId) {
            VenuePhoto::where('id', $photoId)
                ->where('venue_id', $venue->id)
                ->update(['sort_order' => $index + 1]);
        }

        ActivityLogger::log('photo.reordered', null, $venue);

        return redirect()
            ->back()
            ->with('success', 'Urutan foto berhasil diperbarui.');
    }

    public function setCover(Venue $venue, VenuePhoto $photo): RedirectResponse
    {
        // Unset all covers for this venue
        $venue->photos()->update(['is_cover' => false]);

        // Set the selected photo as cover
        $photo->update(['is_cover' => true]);

        ActivityLogger::log('photo.cover_set', $photo, $venue);

        return redirect()
            ->back()
            ->with('success', 'Foto sampul berhasil diperbarui.');
    }

    public function destroy(Venue $venue, VenuePhoto $photo): RedirectResponse
    {
        ActivityLogger::log('photo.deleted', $photo, $venue);

        // Delete file from storage
        \Illuminate\Support\Facades\Storage::disk('public')->delete($photo->file_path);

        $photo->delete();

        return redirect()
            ->back()
            ->with('success', 'Foto berhasil dihapus.');
    }
}
