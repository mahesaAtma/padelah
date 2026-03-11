<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'status',
        'type',
        'password',
        'avatar',
        'google_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function venues(): BelongsToMany
    {
        return $this->belongsToMany(Venue::class, 'user_venues')
            ->withTimestamps();
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    // --- Role Helpers ---

    public function isSuperAdmin(): bool
    {
        return $this->type === 'superadmin';
    }

    public function isVenueAdmin(): bool
    {
        return $this->type === 'venue-admin';
    }

    public function isCustomer(): bool
    {
        return $this->type === 'customer';
    }

    public function isAdmin(): bool
    {
        return $this->isSuperAdmin() || $this->isVenueAdmin();
    }

    public function canManageVenue(Venue $venue): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($this->isVenueAdmin()) {
            return $this->venues()->where('venues.id', $venue->id)->exists();
        }

        return false;
    }
}
