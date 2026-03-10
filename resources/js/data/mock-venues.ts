import type { Venue, ScheduleSlot } from '@/types/venue';

// Helper to generate schedule slots for a venue
function generateScheduleSlots(courts: { id: string }[]): ScheduleSlot[] {
    const times = [
        '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
        '19:00', '20:00', '21:00',
    ];
    const statuses: ScheduleSlot['status'][] = ['available', 'booked', 'confirmed', 'available'];

    const slots: ScheduleSlot[] = [];
    let slotId = 1;

    for (const court of courts) {
        for (const time of times) {
            // Create a deterministic but varied pattern
            const hash = (court.id.charCodeAt(court.id.length - 1) + parseInt(time)) % 7;
            let status: ScheduleSlot['status'] = 'available';
            if (hash === 0 || hash === 3) status = 'booked';
            else if (hash === 5) status = 'confirmed';

            slots.push({
                id: `slot-${slotId++}`,
                courtId: court.id,
                time,
                status,
                price: parseInt(time) >= 17 ? 200000 : 150000,
            });
        }
    }

    return slots;
}

export const mockVenues: Venue[] = [
    {
        id: 'v1',
        slug: 'padel-arena-jakarta',
        name: 'Padel Arena Jakarta',
        location: 'Senayan, Jakarta Selatan',
        city: 'Jakarta',
        description:
            'Lapangan padel premium di jantung kota Jakarta. Dilengkapi fasilitas indoor dan outdoor kelas dunia, pelatih profesional, dan komunitas yang ramah untuk pemain semua level.',
        image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&h=600&fit=crop',
        ],
        courtCount: 4,
        courts: [
            { id: 'c1', name: 'Court 1', type: 'indoor' },
            { id: 'c2', name: 'Court 2', type: 'indoor' },
            { id: 'c3', name: 'Court 3', type: 'outdoor' },
            { id: 'c4', name: 'Court 4', type: 'outdoor' },
        ],
        facilities: [
            { name: 'Indoor' },
            { name: 'Outdoor' },
            { name: 'Parkir' },
            { name: 'Pro Shop' },
            { name: 'Café' },
            { name: 'Pelatihan' },
        ],
        priceRange: { min: 150000, max: 250000 },
        isOfficial: true,
        schedule: [],
    },
    {
        id: 'v2',
        slug: 'bali-padel-club',
        name: 'Bali Padel Club',
        location: 'Canggu, Bali',
        city: 'Bali',
        description:
            'Rasakan bermain padel di surga tropis. Lapangan kami menawarkan pengalaman bermain unik dengan pemandangan pulau yang memukau dan suasana yang santai.',
        image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&h=400&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop',
        ],
        courtCount: 3,
        courts: [
            { id: 'c5', name: 'Court A', type: 'outdoor' },
            { id: 'c6', name: 'Court B', type: 'outdoor' },
            { id: 'c7', name: 'Court C', type: 'indoor' },
        ],
        facilities: [
            { name: 'Outdoor' },
            { name: 'Indoor' },
            { name: 'Tepi Pantai' },
            { name: 'Café' },
            { name: 'Sewa Peralatan' },
        ],
        priceRange: { min: 175000, max: 275000 },
        isOfficial: true,
        schedule: [],
    },
    {
        id: 'v3',
        slug: 'surabaya-padel-center',
        name: 'Surabaya Padel Center',
        location: 'Pakuwon, Surabaya',
        city: 'Surabaya',
        description:
            'Fasilitas padel unggulan di Jawa Timur dengan lapangan indoor mutakhir, pendingin udara, dan komunitas lokal yang berkembang pesat.',
        image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=600&h=400&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop',
        ],
        courtCount: 2,
        courts: [
            { id: 'c8', name: 'Court 1', type: 'indoor' },
            { id: 'c9', name: 'Court 2', type: 'indoor' },
        ],
        facilities: [
            { name: 'Indoor' },
            { name: 'Ber-AC' },
            { name: 'Parkir' },
            { name: 'Ruang Ganti' },
        ],
        priceRange: { min: 120000, max: 180000 },
        isOfficial: false,
        contactPhone: '+62 31 5678 9012',
        contactWhatsapp: '6231567890',
        schedule: [],
    },
    {
        id: 'v4',
        slug: 'bandung-padel-sport',
        name: 'Bandung Padel Sport',
        location: 'Dago, Bandung',
        city: 'Bandung',
        description:
            'Terletak di dataran tinggi Bandung yang sejuk, nikmati bermain padel dengan iklim pegunungan yang menyegarkan dan pemandangan indah.',
        image: 'https://images.unsplash.com/photo-1599586120429-48281b6f4ece?w=600&h=400&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1599586120429-48281b6f4ece?w=800&h=600&fit=crop',
        ],
        courtCount: 2,
        courts: [
            { id: 'c10', name: 'Court Utama', type: 'outdoor' },
            { id: 'c11', name: 'Court Kedua', type: 'outdoor' },
        ],
        facilities: [
            { name: 'Outdoor' },
            { name: 'Parkir' },
            { name: 'Café' },
        ],
        priceRange: { min: 100000, max: 160000 },
        isOfficial: false,
        contactPhone: '+62 22 1234 5678',
        contactWhatsapp: '622212345678',
        schedule: [],
    },
    {
        id: 'v5',
        slug: 'medan-padel-hub',
        name: 'Medan Padel Hub',
        location: 'Polonia, Medan',
        city: 'Medan',
        description:
            'Venue padel pertama di Sumatera Utara. Fasilitas modern yang menyambut pemain pemula maupun berpengalaman.',
        image: 'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=600&h=400&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800&h=600&fit=crop',
        ],
        courtCount: 3,
        courts: [
            { id: 'c12', name: 'Court 1', type: 'indoor' },
            { id: 'c13', name: 'Court 2', type: 'indoor' },
            { id: 'c14', name: 'Court 3', type: 'indoor' },
        ],
        facilities: [
            { name: 'Indoor' },
            { name: 'Ber-AC' },
            { name: 'Sewa Peralatan' },
            { name: 'Pelatihan' },
            { name: 'Parkir' },
        ],
        priceRange: { min: 130000, max: 200000 },
        isOfficial: true,
        schedule: [],
    },
    {
        id: 'v6',
        slug: 'yogya-padel-court',
        name: 'Yogya Padel Court',
        location: 'Sleman, Yogyakarta',
        city: 'Yogyakarta',
        description:
            'Klub padel komunitas yang ramah di jantung budaya Jawa. Harga terjangkau dengan suasana yang bersahabat.',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
        ],
        courtCount: 2,
        courts: [
            { id: 'c15', name: 'Court A', type: 'outdoor' },
            { id: 'c16', name: 'Court B', type: 'outdoor' },
        ],
        facilities: [
            { name: 'Outdoor' },
            { name: 'Parkir' },
            { name: 'Kantin' },
        ],
        priceRange: { min: 80000, max: 130000 },
        isOfficial: false,
        contactPhone: '+62 274 987 6543',
        contactWhatsapp: '622749876543',
        schedule: [],
    },
];

// Generate schedule slots for each venue
mockVenues.forEach((venue) => {
    venue.schedule = generateScheduleSlots(venue.courts);
});

export function getVenueBySlug(slug: string): Venue | undefined {
    return mockVenues.find((v) => v.slug === slug);
}

export function getVenuesByCity(city: string): Venue[] {
    if (!city) return mockVenues;
    return mockVenues.filter((v) => v.city.toLowerCase().includes(city.toLowerCase()));
}

export function searchVenues(query: string): Venue[] {
    if (!query) return mockVenues;
    const lowerQuery = query.toLowerCase();
    return mockVenues.filter(
        (v) =>
            v.name.toLowerCase().includes(lowerQuery) ||
            v.location.toLowerCase().includes(lowerQuery) ||
            v.city.toLowerCase().includes(lowerQuery),
    );
}
