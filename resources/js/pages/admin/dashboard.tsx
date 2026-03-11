import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    LayoutGrid,
    Users,
    Eye,
    EyeOff,
    ArrowRight,
    Tags,
} from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type {
    DashboardStats,
    VenueOverview,
    AdminActivityLog,
    AdminVenue,
    BreadcrumbItem,
} from '@/types';

interface DashboardProps {
    stats: DashboardStats;
    userType: 'superadmin' | 'venue-admin';
    recentVenues?: Pick<
        AdminVenue,
        'id' | 'name' | 'slug' | 'city' | 'status' | 'is_published' | 'created_at'
    >[];
    venues?: VenueOverview[];
    recentActivity: AdminActivityLog[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
];

const actionLabels: Record<string, string> = {
    'venue.created': 'membuat venue',
    'venue.updated': 'mengubah venue',
    'venue.deleted': 'menghapus venue',
    'venue.published': 'mempublikasikan venue',
    'venue.unpublished': 'menarik publikasi venue',
    'court.created': 'menambahkan lapangan',
    'court.updated': 'mengubah lapangan',
    'court.deleted': 'menghapus lapangan',
    'schedule.created': 'menambahkan jadwal',
    'schedule.updated': 'mengubah jadwal',
    'schedule.deleted': 'menghapus jadwal',
    'photo.uploaded': 'mengunggah foto',
    'photo.deleted': 'menghapus foto',
    'photo.reordered': 'mengubah urutan foto',
    'photo.cover_set': 'mengubah foto sampul',
    'facility.created': 'menambahkan fasilitas',
    'facility.updated': 'mengubah fasilitas',
    'facility.deleted': 'menghapus fasilitas',
    'venue.facilities_synced': 'mengubah fasilitas venue',
    'user.created': 'membuat user',
    'user.updated': 'mengubah user',
    'user.deleted': 'menghapus user',
};

function StatCard({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: number;
    icon: React.ElementType;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

function CompletenessBar({ percentage }: { percentage: number }) {
    const color =
        percentage >= 80
            ? 'bg-green-500'
            : percentage >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500';

    return (
        <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-muted">
                <div
                    className={`h-2 rounded-full transition-all ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-xs text-muted-foreground">{percentage}%</span>
        </div>
    );
}

export default function Dashboard({
    stats,
    userType,
    recentVenues,
    venues,
    recentActivity,
}: DashboardProps) {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        {userType === 'superadmin'
                            ? 'Overview semua venue dan aktivitas platform.'
                            : 'Overview venue yang Anda kelola.'}
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Venue"
                        value={stats.totalVenues}
                        icon={Building2}
                    />
                    <StatCard
                        title="Dipublikasikan"
                        value={stats.publishedVenues}
                        icon={Eye}
                    />
                    <StatCard
                        title="Draft"
                        value={stats.draftVenues}
                        icon={EyeOff}
                    />
                    {stats.totalCourts !== undefined && (
                        <StatCard
                            title="Total Lapangan"
                            value={stats.totalCourts}
                            icon={LayoutGrid}
                        />
                    )}
                    {stats.totalUsers !== undefined && (
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers}
                            icon={Users}
                        />
                    )}
                    {stats.totalFacilities !== undefined && (
                        <StatCard
                            title="Total Fasilitas"
                            value={stats.totalFacilities}
                            icon={Tags}
                        />
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Venue List / Recent Venues */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                {userType === 'superadmin'
                                    ? 'Venue Terbaru'
                                    : 'Venue Saya'}
                            </CardTitle>
                            <Link
                                href="/admin/venues"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                                Lihat semua <ArrowRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {userType === 'superadmin' &&
                                    recentVenues?.map((venue) => (
                                        <Link
                                            key={venue.id}
                                            href={`/admin/venues/${venue.id}/edit`}
                                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {venue.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {venue.city}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
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
                                                {venue.is_published ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-green-500 text-green-600"
                                                    >
                                                        Published
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">
                                                        Draft
                                                    </Badge>
                                                )}
                                            </div>
                                        </Link>
                                    ))}

                                {userType === 'venue-admin' &&
                                    venues?.map((venue) => (
                                        <Link
                                            key={venue.id}
                                            href={`/admin/venues/${venue.id}/edit`}
                                            className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">
                                                        {venue.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {venue.city} ·{' '}
                                                        {venue.court_count}{' '}
                                                        lapangan ·{' '}
                                                        {venue.photo_count}{' '}
                                                        foto
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {venue.is_published ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-green-500 text-green-600"
                                                        >
                                                            Published
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            Draft
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <CompletenessBar
                                                    percentage={
                                                        venue.completeness
                                                    }
                                                />
                                            </div>
                                        </Link>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                Aktivitas Terbaru
                            </CardTitle>
                            <Link
                                href="/admin/activity-logs"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                                Lihat semua <ArrowRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentActivity.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada aktivitas.
                                    </p>
                                )}
                                {recentActivity.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-start gap-3 text-sm"
                                    >
                                        <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                        <div className="flex-1">
                                            <p>
                                                <span className="font-medium">
                                                    {log.user?.name ?? 'System'}
                                                </span>{' '}
                                                {actionLabels[log.action] ??
                                                    log.action}
                                                {log.venue && (
                                                    <>
                                                        {' '}
                                                        di{' '}
                                                        <span className="font-medium">
                                                            {log.venue.name}
                                                        </span>
                                                    </>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                    log.created_at,
                                                ).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
