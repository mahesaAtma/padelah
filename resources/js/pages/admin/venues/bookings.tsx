import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Calendar, ChevronLeft } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { AdminBooking, PaginatedData } from '@/types/admin';

interface AdminBookingsProps {
    venue: { id: number; name: string; slug: string };
    bookings: PaginatedData<AdminBooking>;
    filters: { status?: string; date_from?: string; date_to?: string };
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatPrice(price: number): string {
    return 'Rp ' + price.toLocaleString('id-ID');
}

export default function AdminBookings({ venue, bookings, filters }: AdminBookingsProps) {
    const [status, setStatus] = useState(filters.status ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const handleFilter = () => {
        router.get(`/admin/venues/${venue.id}/bookings`, {
            status: status || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setStatus('');
        setDateFrom('');
        setDateTo('');
        router.get(`/admin/venues/${venue.id}/bookings`);
    };

    return (
        <AdminLayout>
            <Head title={`Pemesanan — ${venue.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/venues/${venue.id}/edit`}
                        className="text-sm text-padel-body hover:text-padel-dark flex items-center gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" /> {venue.name}
                    </Link>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-padel-dark">Pemesanan</h1>
                    <p className="text-sm text-padel-body mt-1">{venue.name}</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-end gap-3 rounded-lg border border-padel-divider bg-white p-4">
                    <div>
                        <label className="block text-xs font-medium text-padel-body mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-padel-primary focus:outline-none"
                        >
                            <option value="">Semua</option>
                            <option value="confirmed">Dikonfirmasi</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-padel-body mb-1">Dari Tanggal</label>
                        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-padel-body mb-1">Sampai Tanggal</label>
                        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm" />
                    </div>
                    <Button onClick={handleFilter} className="bg-padel-primary text-white hover:bg-padel-primary/90">Filter</Button>
                    <Button variant="outline" onClick={handleReset}>Reset</Button>
                </div>

                {/* Table */}
                <div className="rounded-lg border border-padel-divider bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-padel-divider bg-gray-50 text-left">
                                    <th className="px-4 py-3 font-medium text-padel-body">#</th>
                                    <th className="px-4 py-3 font-medium text-padel-body">Pelanggan</th>
                                    <th className="px-4 py-3 font-medium text-padel-body">Lapangan</th>
                                    <th className="px-4 py-3 font-medium text-padel-body">Tanggal</th>
                                    <th className="px-4 py-3 font-medium text-padel-body">Waktu</th>
                                    <th className="px-4 py-3 font-medium text-padel-body">Total</th>
                                    <th className="px-4 py-3 font-medium text-padel-body">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-padel-divider">
                                {bookings.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-padel-body">
                                            <Calendar className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                            Belum ada pemesanan.
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.data.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-padel-body">#{booking.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-padel-dark">{booking.user.name}</div>
                                                <div className="text-xs text-padel-body">{booking.user.email}</div>
                                                {booking.user.phone && (
                                                    <div className="text-xs text-padel-body">{booking.user.phone}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-padel-dark">{booking.court.name}</div>
                                                <Badge variant="outline" className="mt-0.5 text-xs">
                                                    {booking.court.place === 'indoor' ? 'Indoor' : 'Outdoor'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-padel-body">{formatDate(booking.booking_date)}</td>
                                            <td className="px-4 py-3 text-padel-body">{booking.start_time} – {booking.end_time}</td>
                                            <td className="px-4 py-3 font-semibold text-padel-primary">{formatPrice(booking.total_price)}</td>
                                            <td className="px-4 py-3">
                                                {booking.status === 'confirmed' ? (
                                                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                                        Dikonfirmasi
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                                        Dibatalkan
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {bookings.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-padel-divider px-4 py-3">
                            <p className="text-sm text-padel-body">
                                {bookings.total} pemesanan · Halaman {bookings.current_page} dari {bookings.last_page}
                            </p>
                            <div className="flex gap-1">
                                {bookings.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`px-3 py-1.5 rounded text-xs ${
                                            link.active
                                                ? 'bg-padel-primary text-white'
                                                : link.url
                                                ? 'hover:bg-gray-100 text-padel-body'
                                                : 'text-gray-300 cursor-not-allowed'
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
