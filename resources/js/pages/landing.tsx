import { Head, Link } from '@inertiajs/react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';
import { Container } from '@/components/padel/container';
import { VenueCard } from '@/components/padel/venue-card';
import { FilterBar, type FilterState } from '@/components/padel/filter-bar';
import { LoginModal } from '@/components/padel/login-modal';
import type { Venue } from '@/types/venue';

interface LandingProps {
    venues: Venue[];
}

/**
 * Haversine formula — returns distance in km between two lat/lng points.
 */
function haversineDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number,
): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function Landing({ venues }: LandingProps) {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({ type: 'all', official: 'all' });
    const [loginOpen, setLoginOpen] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isSortingByDistance, setIsSortingByDistance] = useState(false);

    // Auto-detect location if permission already granted
    useEffect(() => {
        if ('permissions' in navigator) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                if (result.state === 'granted') {
                    navigator.geolocation.getCurrentPosition((position) => {
                        setUserLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    });
                }
            });
        }
    }, []);

    const handleNearMe = useCallback((coords: { lat: number; lng: number } | null) => {
        setUserLocation(coords);
        setIsSortingByDistance(!!coords);
    }, []);

    // Compute distances for all venues when user location is available
    const venuesWithDistance = useMemo(() => {
        if (!userLocation) return venues.map((v) => ({ ...v, distance: undefined as number | undefined }));

        return venues.map((v) => {
            let distance: number | undefined;
            if (v.latitude && v.longitude) {
                distance = haversineDistance(
                    userLocation.lat, userLocation.lng,
                    v.latitude, v.longitude,
                );
            }
            return { ...v, distance };
        });
    }, [venues, userLocation]);

    const filteredVenues = useMemo(() => {
        let results = venuesWithDistance;

        // Search filter
        if (query) {
            const q = query.toLowerCase();
            results = results.filter(
                (v) =>
                    v.name.toLowerCase().includes(q) ||
                    v.location.toLowerCase().includes(q) ||
                    v.city.toLowerCase().includes(q),
            );
        }

        // Type filter
        if (filters.type !== 'all') {
            results = results.filter((v) =>
                v.courts.some((c) => c.type === filters.type),
            );
        }

        // Official filter
        if (filters.official === 'official') {
            results = results.filter((v) => v.isOfficial);
        } else if (filters.official === 'community') {
            results = results.filter((v) => !v.isOfficial);
        }

        // Sort by distance if near-me is active
        if (isSortingByDistance && userLocation) {
            results = [...results].sort((a, b) => {
                const da = a.distance ?? Infinity;
                const db = b.distance ?? Infinity;
                return da - db;
            });
        }

        return results;
    }, [venuesWithDistance, query, filters, isSortingByDistance, userLocation]);

    const handleBookNow = (_venue: Venue) => {
        setLoginOpen(true);
    };

    const handleContactVenue = (venue: Venue) => {
        if (venue.phone) {
            const cleaned = venue.phone.replace(/[^0-9+]/g, '');
            window.open(`https://wa.me/${cleaned}`, '_blank');
        }
    };

    return (
        <PublicLayout>
            <Head title="Temukan Lapangan Padel" />

            {/* Hero Section */}
            <section className="pb-12 pt-16 md:pb-16 md:pt-24">
                <Container>
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-padel-dark md:text-4xl lg:text-5xl">
                            Temukan & Pesan{' '}
                            <span className="text-padel-primary">Lapangan Padel</span>{' '}
                            Terdekat
                        </h1>
                        <p className="mt-4 text-base text-padel-body md:text-lg">
                            Temukan venue padel terbaik di seluruh Indonesia. Cek ketersediaan, bandingkan fasilitas, dan pesan permainan berikutnya.
                        </p>
                    </div>

                    {/* Search & Filters */}
                    <div className="mx-auto mt-8 max-w-xl">
                        <FilterBar
                            onSearch={setQuery}
                            onFilterChange={setFilters}
                            onNearMe={handleNearMe}
                        />
                    </div>
                </Container>
            </section>

            {/* Venue Grid */}
            <section className="pb-16">
                <Container size="wide">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-padel-dark">
                                {isSortingByDistance && userLocation ? 'Venue Terdekat' : query ? 'Hasil Pencarian' : 'Venue Populer'}
                            </h2>
                            <p className="mt-0.5 text-sm text-padel-body">
                                {filteredVenues.length} venue ditemukan
                            </p>
                        </div>
                    </div>

                    {filteredVenues.length > 0 ? (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredVenues.map((venue) => (
                                <Link key={venue.id} href={`/venues/${venue.slug}`} className="block">
                                    <VenueCard
                                        venue={venue}
                                        distance={venue.distance}
                                        onBookNow={(v) => {
                                            handleBookNow(v);
                                        }}
                                        onContactVenue={(v) => {
                                            handleContactVenue(v);
                                        }}
                                    />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16">
                            <p className="text-base text-padel-body">Tidak ada venue yang sesuai dengan pencarian Anda.</p>
                            <button
                                onClick={() => {
                                    setQuery('');
                                    setFilters({ type: 'all', official: 'all' });
                                }}
                                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-padel-primary hover:text-padel-primary/80"
                            >
                                Hapus filter <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </Container>
            </section>

            <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
        </PublicLayout>
    );
}
