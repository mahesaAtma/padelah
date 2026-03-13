export interface AdminVenue {
    id: number;
    name: string;
    slug: string;
    phone: string;
    email: string | null;
    address_1: string;
    address_2: string | null;
    city: string;
    province: string;
    postal_code: string;
    latitude: number;
    longitude: number;
    open_at: string;
    close_at: string;
    description: string | null;
    status: 'official' | 'partner';
    is_published: boolean;
    created_at: string;
    updated_at: string;
    courts_count?: number;
    photos_count?: number;
    facilities_count?: number;
    completeness?: number;
    courts?: AdminCourt[];
    facilities?: AdminFacility[];
    photos?: AdminPhoto[];
    admins?: { id: number; name: string; email: string }[];
}

export interface AdminCourt {
    id: number;
    venue_id: number;
    court_number: number;
    name: string;
    place: 'indoor' | 'outdoor';
    schedules?: AdminSchedule[];
}

export interface AdminSchedule {
    id: number;
    venue_court_id: number;
    start_time: string;
    end_time: string;
    price: number;
    day_type: 'weekday' | 'weekend';
}

export interface AdminPhoto {
    id: number;
    venue_id: number;
    file_path: string;
    sort_order: number;
    is_cover: boolean;
}

export interface AdminFacility {
    id: number;
    name: string;
    category: string | null;
    pivot?: {
        description: string | null;
    };
}

export interface AdminUser {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    status: 'not-registered' | 'pending-activation' | 'inactive' | 'active';
    type: 'superadmin' | 'venue-admin' | 'customer';
    avatar: string | null;
    created_at: string;
    venue_ids?: number[];
}

export interface AdminActivityLog {
    id: number;
    user_id: number;
    venue_id: number | null;
    action: string;
    subject_type: string | null;
    subject_id: number | null;
    properties: Record<string, unknown> | null;
    created_at: string;
    user?: { id: number; name: string; avatar: string | null };
    venue?: { id: number; name: string } | null;
}

export interface DashboardStats {
    totalVenues: number;
    publishedVenues: number;
    draftVenues: number;
    totalCourts?: number;
    totalUsers?: number;
    totalFacilities?: number;
}

export interface VenueOverview {
    id: number;
    name: string;
    slug: string;
    city: string;
    status: 'official' | 'partner';
    is_published: boolean;
    completeness: number;
    court_count: number;
    photo_count: number;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}
