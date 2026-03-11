<?php

namespace Database\Seeders;

use App\Models\Venue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VenueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = base_path('listpadel/Web Scrapping Data/output.json');
        $items = json_decode(file_get_contents($jsonPath), true);

        // Clear existing venues
        Venue::query()->forceDelete();

        foreach ($items as $item) {
            $title = trim($item['title']);
            $address = trim($item['address'] ?? '');
            $parsed = $this->parseAddress($address);

            // Generate unique slug
            $baseSlug = Str::slug($title);
            $slug = $baseSlug;
            $counter = 1;
            while (Venue::withTrashed()->where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            Venue::create([
                'name' => $title,
                'slug' => $slug,
                'phone' => $item['phoneNumber'] ?? null,
                'email' => null,
                'address_1' => $parsed['address_1'],
                'address_2' => null,
                'city' => $parsed['city'],
                'province' => $parsed['province'],
                'postal_code' => $parsed['postal_code'],
                'latitude' => $item['latitude'],
                'longitude' => $item['longitude'],
                'open_at' => null,
                'close_at' => null,
                'description' => null,
                'status' => 'partner',
                'is_published' => true,
            ]);
        }

        $this->command->info("Seeded " . count($items) . " venues from output.json");
    }

    /**
     * Parse Indonesian address string to extract city, province, postal code.
     *
     * Typical format:
     * "Jl. Soekarno-Hatta No.571, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275, Indonesia"
     */
    private function parseAddress(string $raw): array
    {
        // Remove leading newlines/whitespace
        $address = trim($raw, "\n\r\t ");

        // Remove trailing ", Indonesia"
        $address = preg_replace('/,\s*Indonesia\s*$/i', '', $address);

        // Split by comma
        $parts = array_map('trim', explode(',', $address));

        $city = '';
        $province = '';
        $postalCode = null;

        // Work backwards: last part should be "Province PostalCode", second-to-last is "Kota/Kabupaten City"
        if (count($parts) >= 2) {
            $lastPart = array_pop($parts);

            // Extract province and postal code from last segment: "Jawa Barat 40275"
            if (preg_match('/^(.+?)\s+(\d{5})$/', $lastPart, $m)) {
                $province = trim($m[1]);
                $postalCode = $m[2];
            } else {
                $province = trim($lastPart);
            }

            // Extract city from second-to-last segment: "Kota Bandung" or "Kabupaten Bandung" or "Bandung City"
            $cityPart = array_pop($parts);
            $city = trim($cityPart);
            // Normalize: remove "Kota " / "Kabupaten " prefix, or " City" suffix
            $city = preg_replace('/^(Kota|Kabupaten)\s+/i', '', $city);
            $city = preg_replace('/\s+City$/i', '', $city);
        }

        // The remaining parts form address_1
        $address1 = implode(', ', $parts);
        if (empty($address1)) {
            $address1 = $address;
        }

        return [
            'address_1' => $address1,
            'city' => $city ?: 'Unknown',
            'province' => $province ?: 'Unknown',
            'postal_code' => $postalCode,
        ];
    }
}
