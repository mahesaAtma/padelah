<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleOAuthController extends Controller
{
    /**
     * Handle the callback from Google after user grants consent.
     * Uses stateless() because the frontend redirects directly to Google
     * (bypassing Socialite's redirect which would set session state).
     */
    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect()
                ->route('home')
                ->with('error', 'Gagal masuk dengan Google. Silakan coba lagi.');
        }

        // Parse state param (JSON with returnUrl and role)
        $state = json_decode($request->input('state', '{}'), true);
        $redirectUrl = $state['returnUrl'] ?? route('home');
        $selectedRole = $state['role'] ?? 'customer';

        // Only allow venue-admin or customer (never superadmin via OAuth)
        if (!in_array($selectedRole, ['venue-admin', 'customer'])) {
            $selectedRole = 'customer';
        }

        // Try to find an existing user by google_id first, then by email
        $user = User::where('google_id', $googleUser->getId())->first();

        if (!$user) {
            $user = User::where('email', $googleUser->getEmail())->first();
        }

        if ($user) {
            // Update existing user with latest Google data
            $user->update([
                'google_id' => $googleUser->getId(),
                'name' => $user->name ?: $googleUser->getName(),
                'avatar' => $googleUser->getAvatar(),
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        } else {
            // Create a new user with the selected role
            $user = User::create([
                'google_id' => $googleUser->getId(),
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'email_verified_at' => now(),
                'avatar' => $googleUser->getAvatar(),
                'status' => 'active',
                'type' => $selectedRole,
            ]);
        }

        // Regenerate session to prevent session fixation
        $request->session()->regenerate();

        Auth::login($user, remember: true);

        // Role-based redirect
        if ($user->isSuperAdmin() || $user->isVenueAdmin()) {
            return redirect('/admin');
        }

        return redirect($redirectUrl);
    }
}

