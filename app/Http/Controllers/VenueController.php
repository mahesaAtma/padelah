<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class VenueController extends Controller
{
    /**
     * Display a venue detail page.
     * Mock data is handled on the frontend for Phase 1.
     */
    public function __invoke(string $slug): Response
    {
        return Inertia::render('venues/show', [
            'slug' => $slug,
        ]);
    }
}
