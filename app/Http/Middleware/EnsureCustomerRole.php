<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomerRole
{
    /**
     * Redirect superadmin and venue-admin users to their admin profile.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && in_array($user->type, ['superadmin', 'venue-admin'])) {
            return redirect('/admin/profile');
        }

        return $next($request);
    }
}
