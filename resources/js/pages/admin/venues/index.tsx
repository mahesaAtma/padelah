import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminVenue, PaginatedData, BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface VenueIndexProps {
    venues: PaginatedData<AdminVenue>;
    filters: { search?: string; status?: string; published?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Venues', href: '/admin/venues' },
];

function CompletenessBar({ percentage }: { percentage: number }) {
    const color =
        percentage >= 80
            ? 'bg-green-500'
            : percentage >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500';
    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-muted">
                <div
                    className={`h-1.5 rounded-full ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-xs text-muted-foreground">{percentage}%</span>
        </div>
    );
}

export default function VenueIndex({ venues, filters }: VenueIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = () => {
        router.get('/admin/venues', { search }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(
            '/admin/venues',
            { ...filters, [key]: value || undefined },
            { preserveState: true },
        );
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Venue" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Venues
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola semua venue padel.
                        </p>
                    </div>
                    <Link href="/admin/venues/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Venue
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex flex-1 items-center gap-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama atau kota..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    className="max-w-xs"
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleSearch}
                                >
                                    Cari
                                </Button>
                            </div>
                            <select
                                value={filters.status ?? ''}
                                onChange={(e) =>
                                    handleFilter('status', e.target.value)
                                }
                                className="rounded-md border px-3 py-2 text-sm"
                            >
                                <option value="">Semua Status</option>
                                <option value="official">Official</option>
                                <option value="partner">Partner</option>
                            </select>
                            <select
                                value={filters.published ?? ''}
                                onChange={(e) =>
                                    handleFilter('published', e.target.value)
                                }
                                className="rounded-md border px-3 py-2 text-sm"
                            >
                                <option value="">Semua</option>
                                <option value="true">Published</option>
                                <option value="false">Draft</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Venue Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {venues.total} venue ditemukan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-3 font-medium">
                                            Nama
                                        </th>
                                        <th className="pb-3 font-medium">
                                            Kota
                                        </th>
                                        <th className="pb-3 font-medium">
                                            Status
                                        </th>
                                        <th className="pb-3 font-medium">
                                            Publikasi
                                        </th>
                                        <th className="pb-3 font-medium">
                                            Lapangan
                                        </th>
                                        <th className="pb-3 font-medium">
                                            Kelengkapan
                                        </th>
                                        <th className="pb-3 font-medium">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {venues.data.map((venue) => (
                                        <tr
                                            key={venue.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="py-3 font-medium">
                                                {venue.name}
                                            </td>
                                            <td className="py-3 text-muted-foreground">
                                                {venue.city}
                                            </td>
                                            <td className="py-3">
                                                <Badge
                                                    variant={
                                                        venue.status ===
                                                            'official'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {venue.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3">
                                                {venue.is_published ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600">
                                                        <Eye className="h-3.5 w-3.5" />{' '}
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                        <EyeOff className="h-3.5 w-3.5" />{' '}
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-muted-foreground">
                                                {venue.courts_count ?? 0}
                                            </td>
                                            <td className="py-3">
                                                <CompletenessBar
                                                    percentage={
                                                        venue.completeness ?? 0
                                                    }
                                                />
                                            </td>
                                            <td className="py-3">
                                                <Link
                                                    href={`/admin/venues/${venue.id}/edit`}
                                                    className="text-sm font-medium text-primary hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {venues.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-1">
                                {venues.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        className={`rounded-md px-3 py-1 text-sm ${link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted'
                                            } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
