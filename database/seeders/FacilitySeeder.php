<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['category' => 'court_features', 'facilities' => [
                'Night Lighting', 'Glass Wall Court', 'Professional Standard Court', 'Scoreboard',
            ]],
            ['category' => 'player_facilities', 'facilities' => [
                'Shower', 'Locker Room', 'Locker', 'Toilet', 'Air Conditioning',
            ]],
            ['category' => 'rental_services', 'facilities' => [
                'Racket Rental', 'Ball Rental', 'Equipment Shop',
            ]],
            ['category' => 'comfort_facilities', 'facilities' => [
                'Parking Area', 'Waiting Area', 'Seating Area', 'WiFi', 'Charging Station',
            ]],
            ['category' => 'lifestyle', 'facilities' => [
                'Cafe', 'Restaurant', 'Juice Bar', 'Lounge Area',
            ]],
            ['category' => 'training', 'facilities' => [
                'Coaching Available', 'Training Program', 'Padel Academy', 'Ball Machine',
            ]],
            ['category' => 'events', 'facilities' => [
                'Tournament Hosting', 'Event Space', 'Community League',
            ]],
        ];

        foreach ($data as $group) {
            foreach ($group['facilities'] as $name) {
                Facility::updateOrCreate(
                    ['name' => $name],
                    ['category' => $group['category']],
                );
            }
        }
    }
}
