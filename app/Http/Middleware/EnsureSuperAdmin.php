<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    /**
     * Only superadmin can pass.
     * Used for facilities master data, user management, etc.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isSuperAdmin()) {
            abort(403, 'Hanya superadmin yang dapat mengakses halaman ini.');
        }

        return $next($request);
    }
}
