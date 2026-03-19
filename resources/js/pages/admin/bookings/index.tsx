import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { AdminBooking, PaginatedData, BreadcrumbItem } from '@/types';

interface AdminBookingWithVenue extends AdminBooking {
    venue: { id: number; name: string };
}

interface AllBookingsProps {
    venues: { id: number; name: string }[];
    bookings: PaginatedData<AdminBookingWithVenue>;
    filters: {
        status?: string;
        venue_id?: string;
        date_from?: string;
        date_to?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Pemesanan', href: '/admin/bookings' },
];

function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatPrice(price: number): string {
    return 'Rp ' + price.toLocaleString('id-ID');
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'confirmed')
        return (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Dikonfirmasi
            </span>
        );
    if (status === 'pending_payment')
        return (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                Menunggu Bayar
            </span>
        );
    return (
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            Dibatalkan
        </span>
    );
}

export default function AllBookings({ venues, bookings, filters }: AllBookingsProps) {
    const [status, setStatus] = useState(filters.status ?? '');
    const [venueId, setVenueId] = useState(filters.venue_id ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    function applyFilter() {
        router.get('/admin/bookings', {
            status: status || undefined,
            venue_id: venueId || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, { preserveState: true });
    }

    function resetFilter() {
        setStatus(''); setVenueId(''); setDateFrom(''); setDateTo('');
        router.get('/admin/bookings');
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Pemesanan" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pemesanan</h1>
                    <p className="text-muted-foreground">Semua booking dari venue yang Anda kelola.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
                    {/* Venue filter — only shown when admin has >1 venue */}
                    {venues.length > 1 && (
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Venue</label>
                            <select
                                value={venueId}
                                onChange={(e) => setVenueId(e.target.value)}
                                className="rounded-lg border px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                            >
                                <option value="">Semua Venue</option>
                                {venues.map((v) => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-lg border px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                        >
                            <option value="">Semua Status</option>
                            <option value="pending_payment">Menunggu Pembayaran</option>
                            <option value="confirmed">Dikonfirmasi</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Dari Tanggal</label>
                        <Input
                            type="date"
                            value={dateFrom}
                            max={dateTo || undefined}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Sampai Tanggal</label>
                        <Input
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    <Button onClick={applyFilter} className="bg-teal-600 text-white hover:bg-teal-700">
                        Filter
                    </Button>
                    <Button variant="outline" onClick={resetFilter}>Reset</Button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50 text-left">
                                    <th className="px-4 py-3 font-medium text-muted-foreground">#</th>
                                    {venues.length > 1 && (
                                        <th className="px-4 py-3 font-medium text-muted-foreground">Venue</th>
                                    )}
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Pelanggan</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Lapangan</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Waktu</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {bookings.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={venues.length > 1 ? 8 : 7} className="px-4 py-16 text-center text-muted-foreground">
                                            <Calendar className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                                            Belum ada pemesanan.
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.data.map((b) => (
                                        <tr key={b.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-muted-foreground">#{b.id}</td>
                                            {venues.length > 1 && (
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/admin/venues/${b.venue.id}/bookings`}
                                                        className="font-medium text-teal-600 hover:underline"
                                                    >
                                                        {b.venue.name}
                                                    </Link>
                                                </td>
                                            )}
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{b.user.name}</div>
                                                <div className="text-xs text-muted-foreground">{b.user.email}</div>
                                                {b.user.phone && (
                                                    <div className="text-xs text-muted-foreground">{b.user.phone}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{b.court.name}</div>
                                                <Badge variant="outline" className="mt-0.5 text-xs">
                                                    {b.court.place === 'indoor' ? 'Indoor' : 'Outdoor'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {formatDate(b.booking_date)}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {b.start_time} – {b.end_time}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-teal-700">
                                                {formatPrice(b.total_price)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={b.status} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {bookings.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">
                                {bookings.total} pemesanan · Halaman {bookings.current_page} dari {bookings.last_page}
                            </p>
                            <div className="flex gap-1">
                                {bookings.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`rounded px-3 py-1.5 text-xs ${
                                            link.active
                                                ? 'bg-teal-600 text-white'
                                                : link.url
                                                    ? 'text-muted-foreground hover:bg-gray-100'
                                                    : 'cursor-not-allowed text-gray-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
