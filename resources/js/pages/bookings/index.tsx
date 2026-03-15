import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Calendar, CalendarDays, CheckCircle, Clock, MapPin, AlertTriangle, ChevronRight } from 'lucide-react';
import CustomerLayout from '@/layouts/customer-layout';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { CustomerBooking } from '@/types/venue';
import type { PaginatedData } from '@/types/admin';
import type { BreadcrumbItem } from '@/types';

interface BookingsIndexProps {
    bookings: PaginatedData<CustomerBooking>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pemesanan', href: '/bookings' },
];

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatPrice(price: number): string {
    return 'Rp ' + price.toLocaleString('id-ID');
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'confirmed') {
        return <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Dikonfirmasi</span>;
    }
    return <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Dibatalkan</span>;
}

function PaymentBadge({ status }: { status: string }) {
    if (status === 'paid') {
        return <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">Lunas</span>;
    }
    return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Belum Bayar</span>;
}

export default function BookingsIndex({ bookings }: BookingsIndexProps) {
    const [cancelId, setCancelId] = useState<number | null>(null);
    const [cancelling, setCancelling] = useState(false);

    const now = new Date();
    const upcoming = bookings.data.filter(
        (b) => b.status === 'confirmed' && new Date(b.booking_date + 'T' + b.end_time) >= now,
    );
    const past = bookings.data.filter(
        (b) => b.status === 'cancelled' || new Date(b.booking_date + 'T' + b.end_time) < now,
    );

    const handleCancel = () => {
        if (!cancelId) return;
        setCancelling(true);
        router.delete(`/bookings/${cancelId}`, {
            onSuccess: () => {
                toast.success('Pemesanan berhasil dibatalkan.');
                setCancelId(null);
            },
            onError: (errs) => {
                toast.error((errs as Record<string, string>).booking ?? 'Gagal membatalkan pemesanan.');
            },
            onFinish: () => setCancelling(false),
        });
    };

    const BookingCard = ({ booking }: { booking: CustomerBooking }) => {
        const isUpcoming = booking.status === 'confirmed' && new Date(booking.booking_date + 'T' + booking.end_time) >= now;
        const canCancel = booking.status === 'confirmed' && booking.payment_status !== 'paid';

        return (
            <div className={`rounded-xl border bg-card transition-all ${
                isUpcoming ? 'border-primary/30 shadow-sm' : ''
            }`}>
                <div className="flex items-start justify-between gap-4 p-5">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Link
                                href={`/venues/${booking.venue.slug}`}
                                className="font-semibold hover:text-primary transition-colors"
                            >
                                {booking.venue.name}
                            </Link>
                            <StatusBadge status={booking.status} />
                            <PaymentBadge status={booking.payment_status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                {booking.court.name}
                                <span className={`ml-1 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                                    booking.court.place === 'indoor'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-green-100 text-green-700'
                                }`}>
                                    {booking.court.place === 'indoor' ? 'Indoor' : 'Outdoor'}
                                </span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                {formatDate(booking.booking_date)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                {booking.start_time} – {booking.end_time}
                            </span>
                        </div>
                        {booking.notes && (
                            <p className="mt-2 text-sm text-muted-foreground italic">"{booking.notes}"</p>
                        )}
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-primary">{formatPrice(booking.total_price)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">#{booking.id}</p>
                    </div>
                </div>

                {canCancel && (
                    <div className="border-t px-5 py-3 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Pembatalan gratis sebelum sesi dimulai</p>
                        <button
                            onClick={() => setCancelId(booking.id)}
                            className="text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors"
                        >
                            Batalkan Pesanan
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Pemesanan Saya" />

            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* Page heading */}
                <div>
                    <h1 className="text-2xl font-bold">Pemesanan Saya</h1>
                    <p className="text-muted-foreground mt-1">Pantau dan kelola semua jadwal pemesanan lapangan Anda.</p>
                </div>

                {bookings.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center mb-5">
                            <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <p className="text-lg font-semibold">Belum ada pemesanan</p>
                        <p className="text-sm text-muted-foreground mt-1">Temukan dan pesan lapangan padel favoritmu.</p>
                        <Link
                            href="/"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            Jelajahi Venue <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Upcoming */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <h2 className="font-semibold">Mendatang</h2>
                                <span className="rounded-full bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5">{upcoming.length}</span>
                            </div>
                            {upcoming.length === 0 ? (
                                <div className="rounded-xl border border-dashed p-8 text-center">
                                    <p className="text-sm text-muted-foreground">Tidak ada pesanan mendatang.</p>
                                    <Link href="/" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
                                        Temukan venue →
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}
                                </div>
                            )}
                        </div>

                        {/* Past */}
                        {past.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <h2 className="font-semibold">Riwayat</h2>
                                    <span className="rounded-full bg-muted text-muted-foreground text-xs font-bold px-2 py-0.5">{past.length}</span>
                                </div>
                                <div className="space-y-3">
                                    {past.map((b) => <BookingCard key={b.id} booking={b} />)}
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {(bookings.prev_page_url || bookings.next_page_url) && (
                            <div className="flex items-center justify-center gap-2 pt-2">
                                {bookings.prev_page_url && (
                                    <Button variant="outline" asChild>
                                        <Link href={bookings.prev_page_url}>← Sebelumnya</Link>
                                    </Button>
                                )}
                                <span className="text-sm text-muted-foreground px-2">
                                    {bookings.current_page} / {bookings.last_page}
                                </span>
                                {bookings.next_page_url && (
                                    <Button variant="outline" asChild>
                                        <Link href={bookings.next_page_url}>Berikutnya →</Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Cancel confirmation */}
            <Dialog open={cancelId !== null} onOpenChange={(open) => !open && setCancelId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Batalkan Pemesanan?
                        </DialogTitle>
                        <DialogDescription>
                            Tindakan ini tidak dapat dibatalkan setelah diproses. Slot waktu yang telah dipesan akan dibebaskan kembali.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" disabled={cancelling} onClick={() => setCancelId(null)}>
                            Tidak, Kembali
                        </Button>
                        <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                            {cancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CustomerLayout>
    );
}
