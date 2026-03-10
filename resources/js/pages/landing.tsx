import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';
import { Container } from '@/components/padel/container';
import { VenueCard } from '@/components/padel/venue-card';
import { FilterBar, type FilterState } from '@/components/padel/filter-bar';
import { LoginModal } from '@/components/padel/login-modal';
import { mockVenues, searchVenues } from '@/data/mock-venues';
import type { Venue } from '@/types/venue';

export default function Landing() {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({ type: 'all', official: 'all' });
    const [loginOpen, setLoginOpen] = useState(false);

    const filteredVenues = useMemo(() => {
        let results = searchVenues(query);

        if (filters.type !== 'all') {
            results = results.filter((v) =>
                v.courts.some((c) => c.type === filters.type),
            );
        }

        if (filters.official === 'official') {
            results = results.filter((v) => v.isOfficial);
        } else if (filters.official === 'community') {
            results = results.filter((v) => !v.isOfficial);
        }

        return results;
    }, [query, filters]);

    const handleBookNow = (_venue: Venue) => {
        setLoginOpen(true);
    };

    const handleContactVenue = (venue: Venue) => {
        if (venue.contactWhatsapp) {
            window.open(`https://wa.me/${venue.contactWhatsapp}`, '_blank');
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
                                {query ? 'Hasil Pencarian' : 'Venue Populer'}
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
                                        onBookNow={(v) => {
                                            // Prevent navigation when clicking the button
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
