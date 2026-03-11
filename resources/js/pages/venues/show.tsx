import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { MapPin, LayoutGrid, Clock, AlertTriangle, AlertCircle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';
import { Container } from '@/components/padel/container';
import { FacilityTag } from '@/components/padel/facility-tag';
import { ScheduleGrid } from '@/components/padel/schedule-grid';
import { LoginModal } from '@/components/padel/login-modal';
import { Button } from '@/components/ui/button';
import type { Venue } from '@/types/venue';

interface VenueShowProps {
    venue: Venue;
}

export default function VenueShow({ venue }: VenueShowProps) {
    const [loginOpen, setLoginOpen] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    if (!venue) {
        return (
            <PublicLayout>
                <Head title="Venue Tidak Ditemukan" />
                <Container>
                    <div className="flex flex-col items-center justify-center py-24">
                        <h1 className="text-2xl font-bold text-padel-dark">Venue Tidak Ditemukan</h1>
                        <p className="mt-2 text-padel-body">Venue yang Anda cari tidak tersedia.</p>
                        <Link
                            href="/"
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-padel-primary hover:text-padel-primary/80"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Venue
                        </Link>
                    </div>
                </Container>
            </PublicLayout>
        );
    }

    const handleBookNow = () => {
        setLoginOpen(true);
    };

    const handleContact = () => {
        if (venue.phone) {
            const cleaned = venue.phone.replace(/[^0-9+]/g, '');
            window.open(`https://wa.me/${cleaned}`, '_blank');
        }
    };

    const hasGallery = venue.gallery.length > 0;
    const totalImages = venue.gallery.length;

    const goNext = () => {
        setActiveImage((prev) => (prev + 1) % totalImages);
    };

    const goPrev = () => {
        setActiveImage((prev) => (prev - 1 + totalImages) % totalImages);
    };

    return (
        <PublicLayout>
            <Head title={venue.name} />

            {/* Incomplete Data Banner */}
            {!venue.isComplete && (
                <div className="bg-amber-50 border-b border-amber-200">
                    <Container>
                        <div className="flex items-center gap-2 py-3 text-sm text-amber-800">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span className="font-medium">Data Belum Lengkap</span>
                            <span className="text-amber-600">— Informasi venue ini masih dalam proses kelengkapan.</span>
                        </div>
                    </Container>
                </div>
            )}

            {/* Gallery Carousel */}
            {hasGallery ? (
                <section className="bg-padel-card">
                    <Container size="wide">
                        <div className="py-6 space-y-3">
                            {/* Main Image with Arrows */}
                            <div className="relative aspect-[16/9] overflow-hidden rounded-xl group">
                                <img
                                    src={venue.gallery[activeImage]}
                                    alt={`${venue.name} - Foto ${activeImage + 1}`}
                                    className="h-full w-full object-cover transition-all duration-300"
                                />

                                {totalImages > 1 && (
                                    <>
                                        <button
                                            onClick={goPrev}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-padel-card/80 text-padel-dark shadow-md backdrop-blur-sm transition-all hover:bg-padel-card hover:scale-105 opacity-0 group-hover:opacity-100"
                                            aria-label="Foto sebelumnya"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>

                                        <button
                                            onClick={goNext}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-padel-card/80 text-padel-dark shadow-md backdrop-blur-sm transition-all hover:bg-padel-card hover:scale-105 opacity-0 group-hover:opacity-100"
                                            aria-label="Foto berikutnya"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </>
                                )}

                                <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                    {activeImage + 1} / {totalImages}
                                </div>
                            </div>

                            {/* Thumbnails Row */}
                            {totalImages > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {venue.gallery.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImage(index)}
                                            className={`relative shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${activeImage === index
                                                ? 'ring-2 ring-padel-primary ring-offset-2 opacity-100'
                                                : 'opacity-50 hover:opacity-80'
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${venue.name} - Thumbnail ${index + 1}`}
                                                className="h-16 w-24 object-cover sm:h-20 sm:w-32"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Container>
                </section>
            ) : (
                <section className="bg-padel-card">
                    <Container size="wide">
                        <div className="py-6">
                            <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-gradient-to-br from-padel-primary/10 to-padel-primary/5">
                                <div className="text-center">
                                    <span className="text-6xl font-bold text-padel-primary/20">
                                        {venue.name.charAt(0)}
                                    </span>
                                    <p className="mt-2 text-sm text-padel-body">Foto belum tersedia</p>
                                </div>
                            </div>
                        </div>
                    </Container>
                </section>
            )}

            {/* Venue Info */}
            <section className="py-8">
                <Container>
                    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                        {/* Left Column - Info */}
                        <div className="space-y-8">
                            {/* Header */}
                            <div>
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold text-padel-dark md:text-3xl">
                                            {venue.name}
                                        </h1>
                                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-padel-body">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {venue.location}
                                            </span>
                                            {venue.courtCount > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <LayoutGrid className="h-4 w-4" />
                                                    {venue.courtCount} lapangan
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {venue.isOfficial && (
                                        <span className="shrink-0 rounded-full bg-padel-primary px-3 py-1 text-xs font-medium text-white">
                                            Venue Resmi
                                        </span>
                                    )}
                                </div>

                                {venue.description ? (
                                    <p className="mt-4 text-sm leading-relaxed text-padel-body">
                                        {venue.description}
                                    </p>
                                ) : (
                                    <p className="mt-4 text-sm italic text-padel-body/60">
                                        Deskripsi belum tersedia.
                                    </p>
                                )}
                            </div>

                            {/* Facilities */}
                            {venue.facilities.length > 0 && (
                                <div>
                                    <h2 className="text-base font-semibold text-padel-dark">Fasilitas</h2>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {venue.facilities.map((facility) => (
                                            <FacilityTag key={facility.name} name={facility.name} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Non-official Notice */}
                            {!venue.isOfficial && (
                                <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">
                                            Venue Partner
                                        </p>
                                        <p className="mt-0.5 text-sm text-amber-700">
                                            Jadwal dan harga dapat berubah. Silakan konfirmasi langsung ke venue sebelum berkunjung.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Schedule */}
                            {venue.courts.length > 0 && venue.schedule.length > 0 && (
                                <div>
                                    <h2 className="text-base font-semibold text-padel-dark">Jadwal Lapangan</h2>
                                    <p className="mt-1 text-sm text-padel-body">
                                        {venue.isOfficial
                                            ? 'Pilih jadwal untuk memesan lapangan Anda.'
                                            : 'Jadwal ditampilkan sebagai referensi saja.'
                                        }
                                    </p>
                                    <div className="mt-4">
                                        <ScheduleGrid
                                            courts={venue.courts}
                                            schedule={venue.schedule}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Google Maps */}
                            {venue.latitude && venue.longitude && (
                                <div>
                                    <h2 className="text-base font-semibold text-padel-dark">Lokasi</h2>
                                    <div className="mt-3 overflow-hidden rounded-lg border border-padel-divider">
                                        <iframe
                                            title={`Lokasi ${venue.name}`}
                                            width="100%"
                                            height="350"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${venue.name}, ${venue.city}, ${venue.province}`)}&z=15&output=embed`}
                                        />
                                    </div>
                                    <p className="mt-2 flex items-center gap-1 text-xs text-padel-body">
                                        <MapPin className="h-3 w-3" />
                                        {venue.location}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Booking Sidebar */}
                        <div className="lg:sticky lg:top-20">
                            <div className="rounded-lg bg-padel-card p-5">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-padel-body">
                                            Harga per jam
                                        </p>
                                        {venue.priceRange ? (
                                            <p className="mt-1 text-2xl font-bold text-padel-dark">
                                                Rp {venue.priceRange.min.toLocaleString('id-ID')}
                                                <span className="text-base font-normal text-padel-body">
                                                    {' '}– {venue.priceRange.max.toLocaleString('id-ID')}
                                                </span>
                                            </p>
                                        ) : (
                                            <p className="mt-1 text-base italic text-padel-body">
                                                Belum tersedia
                                            </p>
                                        )}
                                    </div>

                                    {venue.courts.length > 0 && (
                                        <div className="border-t border-padel-divider pt-4">
                                            <p className="text-xs text-padel-body">
                                                {venue.courtCount} lapangan tersedia
                                            </p>
                                            <div className="mt-1 flex flex-wrap gap-1.5">
                                                {venue.courts.map((court) => (
                                                    <span
                                                        key={court.id}
                                                        className="rounded bg-padel-light px-2 py-0.5 text-xs text-padel-body"
                                                    >
                                                        {court.name} ({court.type})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {venue.isOfficial ? (
                                        <Button
                                            onClick={handleBookNow}
                                            className="w-full bg-padel-primary text-white hover:bg-padel-primary/90"
                                            size="lg"
                                        >
                                            Pesan Sekarang
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleContact}
                                            variant="outline"
                                            className="w-full border-padel-primary/30 text-padel-primary hover:bg-padel-primary/5"
                                            size="lg"
                                        >
                                            Hubungi Venue
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
        </PublicLayout>
    );
}
