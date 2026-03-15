import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, Clock, MapPin, ChevronRight, Trophy, CheckCircle, Info } from 'lucide-react';
import CustomerLayout from '@/layouts/customer-layout';
import type { CustomerBooking } from '@/types/venue';
import type { Auth, BreadcrumbItem } from '@/types';

interface DashboardProps {
    bookings: CustomerBooking[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/settings/dashboard' },
];

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatPrice(price: number): string {
    return 'Rp ' + price.toLocaleString('id-ID');
}

function formatMemberSince(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export default function CustomerDashboard({ bookings }: DashboardProps) {
    const { auth } = usePage<{ auth: { user: Auth['user'] } }>().props;
    const user = auth.user;

    const now = new Date();
    const upcoming = bookings.filter(
        (b) => b.status === 'confirmed' && new Date(b.booking_date + 'T' + b.end_time) >= now,
    );
    const totalSpend = bookings
        .filter((b) => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.total_price, 0);

    const recentUpcoming = upcoming.slice(0, 3);

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* Page heading */}
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Selamat datang kembali, {user.name}!</p>
                </div>

                {/* ── Stats row ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border bg-card p-6">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <CalendarDays className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-3xl font-bold">{upcoming.length}</p>
                        <p className="text-sm text-muted-foreground mt-1">Pesanan Mendatang</p>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold">{bookings.length}</p>
                        <p className="text-sm text-muted-foreground mt-1">Total Pesanan</p>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                            <Trophy className="h-5 w-5 text-amber-500" />
                        </div>
                        <p className="text-xl font-bold leading-tight">
                            {totalSpend > 0 ? formatPrice(totalSpend) : '—'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Total Transaksi</p>
                    </div>
                </div>

                {/* ── Upcoming bookings ── */}
                <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            <h2 className="font-semibold">Pesanan Mendatang</h2>
                        </div>
                        <Link
                            href="/bookings"
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            Lihat semua <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {recentUpcoming.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                            <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                                <CalendarDays className="h-7 w-7 text-muted-foreground/40" />
                            </div>
                            <p className="font-medium">Belum ada pesanan mendatang</p>
                            <p className="text-sm text-muted-foreground mt-1">Temukan dan pesan lapangan padel favoritmu.</p>
                            <Link
                                href="/"
                                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Jelajahi Venue <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {recentUpcoming.map((booking) => (
                                <div key={booking.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors">
                                    <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <CalendarDays className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{booking.venue.name}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                {booking.court.name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                                {formatDate(booking.booking_date)} · {booking.start_time}–{booking.end_time}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="font-bold text-primary">{formatPrice(booking.total_price)}</p>
                                        <span className="inline-block mt-1 text-[11px] rounded-full bg-green-100 text-green-700 px-2 py-0.5 font-medium">Dikonfirmasi</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Account info ── */}
                <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary" />
                            <h2 className="font-semibold">Informasi Akun</h2>
                        </div>
                        <Link
                            href="/settings/profile"
                            className="text-sm text-primary hover:underline"
                        >
                            Edit Profil
                        </Link>
                    </div>
                    <div className="divide-y">
                        {[
                            { label: 'Nama', value: user.name },
                            { label: 'Email', value: user.email },
                            { label: 'Member sejak', value: formatMemberSince(user.created_at) },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between px-6 py-4">
                                <span className="text-sm text-muted-foreground">{label}</span>
                                <span className="text-sm font-medium">{value}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between px-6 py-4">
                            <span className="text-sm text-muted-foreground">Status email</span>
                            {user.email_verified_at ? (
                                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                                    <CheckCircle className="h-4 w-4" /> Terverifikasi
                                </span>
                            ) : (
                                <span className="text-sm font-medium text-amber-600">Belum diverifikasi</span>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </CustomerLayout>
    );
}
