<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreVenueRequest;
use App\Http\Requests\Admin\UpdateVenueRequest;
use App\Models\Facility;
use App\Models\Venue;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VenueController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Venue::query()
            ->withCount(['courts', 'photos', 'facilities']);

        // Venue-admin can only see their own venues
        if ($user->isVenueAdmin()) {
            $query->whereHas('admins', fn($q) => $q->where('users.id', $user->id));
        }

        // Filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(fn($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('city', 'like', "%{$search}%"));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('published')) {
            $query->where('is_published', $request->input('published') === 'true');
        }

        $venues = $query->latest()->paginate(15)->withQueryString();

        // Append completeness to each venue
        $venues->getCollection()->transform(function ($venue) {
            $venue->completeness = $venue->completeness_percentage;
            return $venue;
        });

        return Inertia::render('admin/venues/index', [
            'venues' => $venues,
            'filters' => $request->only(['search', 'status', 'published']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/venues/create', [
            'facilities' => Facility::orderBy('name')->get(),
        ]);
    }

    public function store(StoreVenueRequest $request): RedirectResponse
    {
        $venue = Venue::create($request->validated());

        // If venue-admin, auto-link to their venues
        if ($request->user()->isVenueAdmin()) {
            $request->user()->venues()->attach($venue->id);
        }

        ActivityLogger::log('venue.created', $venue);

        return redirect()
            ->route('admin.venues.edit', $venue->id)
            ->with('success', 'Venue berhasil dibuat.');
    }

    public function edit(Venue $venue): Response
    {
        $venue->load([
            'courts.schedules',
            'facilities',
            'photos',
            'admins:id,name,email',
        ]);

        return Inertia::render('admin/venues/edit', [
            'venue' => array_merge($venue->toArray(), [
                'completeness' => $venue->completeness_percentage,
            ]),
            'allFacilities' => Facility::orderBy('name')->get(),
        ]);
    }

    public function update(UpdateVenueRequest $request, Venue $venue): RedirectResponse
    {
        $venue->update($request->validated());

        ActivityLogger::logChanges('venue.updated', $venue);

        return redirect()
            ->back()
            ->with('success', 'Venue berhasil diperbarui.');
    }

    public function destroy(Venue $venue): RedirectResponse
    {
        ActivityLogger::log('venue.deleted', $venue, null, [
            'name' => $venue->name,
        ]);

        $venue->delete();

        return redirect()
            ->route('admin.venues.index')
            ->with('success', 'Venue berhasil dihapus.');
    }

    public function togglePublish(Venue $venue): RedirectResponse
    {
        $venue->update(['is_published' => !$venue->is_published]);

        $action = $venue->is_published ? 'venue.published' : 'venue.unpublished';
        ActivityLogger::log($action, $venue);

        return redirect()
            ->back()
            ->with('success', $venue->is_published ? 'Venue dipublikasikan.' : 'Venue ditarik dari publikasi.');
    }
}
