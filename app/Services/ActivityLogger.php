<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityLogger
{
    /**
     * Log an activity.
     */
    public static function log(
        string $action,
        ?Model $subject = null,
        ?Venue $venue = null,
        array $properties = [],
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => Auth::id(),
            'venue_id' => $venue?->id ?? ($subject instanceof Venue ? $subject->id : null),
            'action' => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->id,
            'properties' => !empty($properties) ? $properties : null,
        ]);
    }

    /**
     * Log with old/new diff.
     */
    public static function logChanges(
        string $action,
        Model $subject,
        ?Venue $venue = null,
    ): ActivityLog {
        $changes = $subject->getChanges();
        $original = collect($subject->getOriginal())
            ->only(array_keys($changes))
            ->toArray();

        return static::log($action, $subject, $venue, [
            'old' => $original,
            'new' => $changes,
        ]);
    }
}
