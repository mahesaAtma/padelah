<?php

namespace App\Http\Controllers;

use App\Models\Venue;
use Inertia\Inertia;
use Inertia\Response;

class VenueController extends Controller
{
    /**
     * Display a venue detail page.
     */
    public function __invoke(string $slug): Response
    {
        $venue = Venue::where('slug', $slug)
            ->published()
            ->with(['courts.schedules', 'facilities', 'photos'])
            ->firstOrFail();

        return Inertia::render('venues/show', [
            'venue' => $this->transformVenue($venue),
        ]);
    }

    /**
     * Transform a Venue model into the frontend Venue shape.
     */
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
            'id' => $venue->id,
            'slug' => $venue->slug,
            'name' => $venue->name,
            'location' => implode(', ', array_filter([$venue->city, $venue->province])),
            'city' => $venue->city ?? '',
            'province' => $venue->province ?? '',
            'address_1' => $venue->address_1,
            'address_2' => $venue->address_2,
            'description' => $venue->description,
            'image' => $imagePath,
            'gallery' => $photos->map(fn($p) => \Illuminate\Support\Facades\Storage::url($p->file_path))->values()->toArray(),
            'courtCount' => $courts->count(),
            'courts' => $courts->map(fn($c) => [
                'id' => (string) $c->id,
                'name' => $c->name,
                'type' => $c->place,
            ])->values()->toArray(),
            'facilities' => $facilities->map(fn($f) => [
                'name' => $f->name,
            ])->values()->toArray(),
            'priceRange' => $courts->flatMap(fn($c) => $c->relationLoaded('schedules') ? $c->schedules->pluck('price') : collect())->filter()->whenNotEmpty(fn($prices) => ['min' => $prices->min(), 'max' => $prices->max()], fn() => null),
            'isOfficial' => $venue->status === 'official',
            'isComplete' => $isComplete,
            'phone' => $venue->phone,
            'latitude' => $venue->latitude ? (float) $venue->latitude : null,
            'longitude' => $venue->longitude ? (float) $venue->longitude : null,
            'schedule' => [],
        ];
    }
}
