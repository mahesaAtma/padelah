<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VenueCourt extends Model
{
    protected $fillable = [
        'venue_id',
        'court_number',
        'name',
        'place',
    ];

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(VenueCourtSchedule::class);
    }
}
