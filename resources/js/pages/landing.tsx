import { Head, Link } from '@inertiajs/react';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';
import { Container } from '@/components/padel/container';
import { VenueCard } from '@/components/padel/venue-card';
import { FilterBar, type FilterState } from '@/components/padel/filter-bar';
import { useAuthModal } from '@/contexts/auth-modal-context';
import type { Venue } from '@/types/venue';
import type { PaginatedData } from '@/types/admin';

interface LandingProps {
    venues: PaginatedData<Venue>;
}

type VenueWithDistance = Venue & { distance?: number };

/**
 * Haversine formula — returns distance in km between two lat/lng points.
 */
function haversineDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number,
): number {
    const R = 6371;
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

function attachDistance(venues: Venue[], location: { lat: number; lng: number } | null): VenueWithDistance[] {
    if (!location) return venues.map((v) => ({ ...v, distance: undefined }));
    return venues.map((v) => ({
        ...v,
        distance: v.latitude && v.longitude
            ? haversineDistance(location.lat, location.lng, v.latitude, v.longitude)
            : undefined,
    }));
}

// ── Skeleton card matching VenueCard layout ───────────────────────────────────
function VenueCardSkeleton() {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-padel-divider/50 bg-padel-card">
            {/* Image placeholder */}
            <div className="relative aspect-[16/10] overflow-hidden bg-padel-divider/30">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-padel-card/60 to-transparent" />
            </div>
            {/* Content placeholder */}
            <div className="flex flex-1 flex-col gap-2.5 p-4">
                <div className="h-4 w-3/4 rounded bg-padel-divider/40" />
                <div className="h-3 w-1/2 rounded bg-padel-divider/30" />
                <div className="h-3 w-1/3 rounded bg-padel-divider/25" />
                <div className="mt-2 flex flex-wrap gap-1.5">
                    <div className="h-5 w-14 rounded-full bg-padel-divider/30" />
                    <div className="h-5 w-16 rounded-full bg-padel-divider/25" />
                    <div className="h-5 w-12 rounded-full bg-padel-divider/20" />
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="h-4 w-28 rounded bg-padel-divider/35" />
                    <div className="h-8 w-24 rounded-md bg-padel-divider/35" />
                </div>
            </div>
        </div>
    );
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <VenueCardSkeleton key={i} />
            ))}
        </div>
    );
}

export default function Landing({ venues: initialVenues }: LandingProps) {
    const { openLogin } = useAuthModal();

    // ── Filter / search state ────────────────────────────────────────────────
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({ type: 'all', official: 'all' });
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isSortingByDistance, setIsSortingByDistance] = useState(false);

    // ── Venue list state ─────────────────────────────────────────────────────
    const [allVenues, setAllVenues] = useState<VenueWithDistance[]>(
        attachDistance(initialVenues.data, null),
    );
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialVenues.next_page_url);
    const [total, setTotal] = useState(initialVenues.total);
    const [resetting, setResetting] = useState(false);   // full skeleton on filter change
    const [loadingMore, setLoadingMore] = useState(false); // spinner at bottom

    // ── Refs ─────────────────────────────────────────────────────────────────
    const sentinelRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMounted = useRef(false);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const buildUrl = useCallback((overrideUrl?: string | null, page = 1): string => {
        if (overrideUrl) return overrideUrl;
        const params = new URLSearchParams();
        if (query.trim()) params.set('search', query.trim());
        if (filters.type !== 'all') params.set('type', filters.type);
        if (filters.official !== 'all') params.set('official', filters.official);
        params.set('page', String(page));
        return `/?${params.toString()}`;
    }, [query, filters]);

    const fetchVenues = useCallback(async (url: string, append: boolean) => {
        try {
            const res = await fetch(url, { headers: { Accept: 'application/json' } });
            if (!res.ok) throw new Error('Request failed');
            const data: PaginatedData<Venue> = await res.json();
            const withDist = attachDistance(data.data, userLocation);
            setAllVenues((prev) => append ? [...prev, ...withDist] : withDist);
            setNextPageUrl(data.next_page_url);
            setTotal(data.total);
        } catch {
            // silently fail — existing list stays
        }
    }, [userLocation]);

    // ── Auto-detect location on mount ────────────────────────────────────────
    useEffect(() => {
        if ('permissions' in navigator) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                if (result.state === 'granted') {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    });
                }
            });
        }
    }, []);

    // ── Re-attach distances when location becomes available ──────────────────
    useEffect(() => {
        setAllVenues((prev) => attachDistance(prev, userLocation));
    }, [userLocation]);

    // ── Debounced refetch on filter / search change ──────────────────────────
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setResetting(true);
            setAllVenues([]);
            await fetchVenues(buildUrl(null, 1), false);
            setResetting(false);
        }, 400);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, filters]);

    // ── Infinite scroll ──────────────────────────────────────────────────────
    const loadMore = useCallback(async () => {
        if (!nextPageUrl || loadingMore || resetting) return;
        setLoadingMore(true);
        await fetchVenues(nextPageUrl, true);
        setLoadingMore(false);
    }, [nextPageUrl, loadingMore, resetting, fetchVenues]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) loadMore(); },
            { rootMargin: '200px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [loadMore]);

    // ── Near-me handler ──────────────────────────────────────────────────────
    const handleNearMe = useCallback((coords: { lat: number; lng: number } | null) => {
        setUserLocation(coords);
        setIsSortingByDistance(!!coords);
    }, []);

    // ── Client-side distance sort (applied on top of backend-ordered list) ───
    const displayedVenues = useMemo(() => {
        if (!isSortingByDistance || !userLocation) return allVenues;
        return [...allVenues].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }, [allVenues, isSortingByDistance, userLocation]);

    const hasMore = !!nextPageUrl;

    const handleBookNow = (_venue: Venue) => openLogin();
    const handleContactVenue = (venue: Venue) => {
        if (venue.phone) {
            const cleaned = venue.phone.replace(/[^0-9+]/g, '');
            window.open(`https://wa.me/${cleaned}`, '_blank');
        }
    };

    const heading = isSortingByDistance && userLocation
        ? 'Venue Terdekat'
        : query
        ? 'Hasil Pencarian'
        : 'Venue Populer';

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
                            <h2 className="text-lg font-semibold text-padel-dark">{heading}</h2>
                            <p className="mt-0.5 text-sm text-padel-body">
                                {resetting ? (
                                    <span className="inline-block h-3.5 w-24 rounded bg-padel-divider/40 animate-pulse" />
                                ) : (
                                    <>{total} venue ditemukan</>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Full skeleton while filter resets */}
                    {resetting ? (
                        <SkeletonGrid count={6} />
                    ) : displayedVenues.length > 0 ? (
                        <>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {displayedVenues.map((venue) => (
                                    <Link key={venue.id} href={`/venues/${venue.slug}`} className="block h-full">
                                        <VenueCard
                                            venue={venue}
                                            distance={venue.distance}
                                            onBookNow={handleBookNow}
                                            onContactVenue={handleContactVenue}
                                        />
                                    </Link>
                                ))}
                            </div>

                            {/* Sentinel */}
                            <div ref={sentinelRef} className="h-1 mt-8" />

                            {/* Load-more skeleton */}
                            {loadingMore && (
                                <div className="mt-2 space-y-5">
                                    <SkeletonGrid count={3} />
                                </div>
                            )}

                            {/* End-of-list */}
                            {!hasMore && !loadingMore && (
                                <p className="mt-8 text-center text-xs text-padel-body/40">
                                    Semua venue telah ditampilkan
                                </p>
                            )}
                        </>
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
        </PublicLayout>
    );
}
