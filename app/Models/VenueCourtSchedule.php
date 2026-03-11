<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VenueCourtSchedule extends Model
{
    protected $fillable = [
        'venue_court_id',
        'start_time',
        'end_time',
        'price',
        'day_type',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
        ];
    }

    public function court(): BelongsTo
    {
        return $this->belongsTo(VenueCourt::class, 'venue_court_id');
    }
}
