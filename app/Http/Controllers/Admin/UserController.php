<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Models\User;
use App\Models\Venue;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(fn($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'venues' => Venue::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $venueIds = $data['venue_ids'] ?? [];
        unset($data['venue_ids']);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        if (!empty($venueIds) && $user->isVenueAdmin()) {
            $user->venues()->sync($venueIds);
        }

        ActivityLogger::log('user.created', $user);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User berhasil dibuat.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'editUser' => array_merge($user->toArray(), [
                'venue_ids' => $user->venues()->pluck('venues.id')->toArray(),
            ]),
            'venues' => Venue::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(StoreUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();
        $venueIds = $data['venue_ids'] ?? [];
        unset($data['venue_ids']);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        if ($user->isVenueAdmin()) {
            $user->venues()->sync($venueIds);
        } else {
            $user->venues()->detach();
        }

        ActivityLogger::logChanges('user.updated', $user);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        ActivityLogger::log('user.deleted', $user, null, [
            'name' => $user->name,
            'email' => $user->email,
        ]);

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User berhasil dihapus.');
    }
}
