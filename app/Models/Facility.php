<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Facility extends Model
{
    protected $fillable = [
        'name',
        'category',
    ];

    public function venues(): BelongsToMany
    {
        return $this->belongsToMany(Venue::class, 'venue_facilities')
            ->withPivot('description')
            ->withTimestamps();
    }
}
