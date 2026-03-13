<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/facilities/index', [
            'facilities' => Facility::orderBy('category')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255', 'unique:facilities,name'],
            'category' => ['nullable', 'string', 'max:255'],
        ]);

        $facility = Facility::create($validated);

        ActivityLogger::log('facility.created', $facility);

        return redirect()
            ->back()
            ->with('success', 'Fasilitas berhasil ditambahkan.');
    }

    public function update(Request $request, Facility $facility): RedirectResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255', 'unique:facilities,name,' . $facility->id],
            'category' => ['nullable', 'string', 'max:255'],
        ]);

        $facility->update($validated);

        ActivityLogger::logChanges('facility.updated', $facility);

        return redirect()
            ->back()
            ->with('success', 'Fasilitas berhasil diperbarui.');
    }

    public function destroy(Facility $facility): RedirectResponse
    {
        ActivityLogger::log('facility.deleted', $facility, null, [
            'name' => $facility->name,
        ]);

        $facility->delete();

        return redirect()
            ->back()
            ->with('success', 'Fasilitas berhasil dihapus.');
    }
}
