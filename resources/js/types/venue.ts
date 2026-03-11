export interface Facility {
    name: string;
    icon?: string;
}

export interface Court {
    id: string;
    name: string;
    type: 'indoor' | 'outdoor';
}

export interface ScheduleSlot {
    id: string;
    courtId: string;
    time: string; // e.g. "08:00"
    status: 'available' | 'booked' | 'selected' | 'confirmed';
    price?: number;
}

export interface Venue {
    id: number;
    slug: string;
    name: string;
    location: string;
    city: string;
    province: string;
    description: string | null;
    image: string | null;
    gallery: string[];
    courtCount: number;
    courts: Court[];
    facilities: Facility[];
    priceRange: {
        min: number;
        max: number;
    } | null;
    isOfficial: boolean;
    isComplete: boolean;
    phone: string | null;
    latitude: number | null;
    longitude: number | null;
    contactPhone?: string;
    contactWhatsapp?: string;
    schedule: ScheduleSlot[];
}
