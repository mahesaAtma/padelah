<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Venue extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'phone',
        'email',
        'address_1',
        'address_2',
        'city',
        'province',
        'postal_code',
        'latitude',
        'longitude',
        'open_at',
        'close_at',
        'description',
        'status',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_published' => 'boolean',
        ];
    }

    // --- Relationships ---

    public function courts(): HasMany
    {
        return $this->hasMany(VenueCourt::class);
    }

    public function facilities(): BelongsToMany
    {
        return $this->belongsToMany(Facility::class, 'venue_facilities')
            ->withPivot('description')
            ->withTimestamps();
    }

    public function photos(): HasMany
    {
        return $this->hasMany(VenuePhoto::class)->orderBy('sort_order');
    }

    public function admins(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_venues')
            ->withTimestamps();
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    // --- Scopes ---

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeDraft($query)
    {
        return $query->where('is_published', false);
    }

    // --- Accessors ---

    public function getCompletenessPercentageAttribute(): int
    {
        $checks = [
            !empty($this->description),
            !empty($this->phone),
            !empty($this->address_1),
            !empty($this->city),
            !empty($this->latitude) && !empty($this->longitude),
            $this->photos()->exists(),
            $this->courts()->exists(),
            $this->facilities()->exists(),
            $this->courts()->whereHas('schedules')->exists(),
        ];

        $passed = collect($checks)->filter()->count();

        return (int) round(($passed / count($checks)) * 100);
    }

    public function getCoverPhotoAttribute(): ?string
    {
        $cover = $this->photos()->where('is_cover', true)->first();

        return $cover?->file_path;
    }
}
