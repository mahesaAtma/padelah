import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    LayoutGrid,
    Users,
    Eye,
    EyeOff,
    ArrowRight,
    Tags,
    CalendarCheck,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type {
    DashboardStats,
    VenueOverview,
    AdminActivityLog,
    AdminVenue,
    BreadcrumbItem,
    VenueAdminChartData,
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
    chartData?: VenueAdminChartData;
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
    sub,
}: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    sub?: string;
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
                {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
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

function formatRupiah(value: number): string {
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
    if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
    return `Rp ${value}`;
}

const TEAL = '#0d9488';
const TEAL_LIGHT = '#99f6e4';
const BAR_COLORS = [
    '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1',
];

function TooltipRupiah({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border bg-white px-3 py-2 text-xs shadow-lg">
            <p className="font-medium text-gray-700">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} style={{ color: p.color }}>
                    {p.name === 'revenue'
                        ? formatRupiah(p.value)
                        : `${p.value} booking`}
                </p>
            ))}
        </div>
    );
}

function BookingCharts({ data }: { data: VenueAdminChartData }) {
    const maxDay = data.byDay.reduce((a, b) => (b.bookings > a.bookings ? b : a), data.byDay[0]);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Bookings — Bar */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Booking Harian (30 hari terakhir)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.dailyBookings} barSize={6}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                interval={4}
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                                width={24}
                            />
                            <Tooltip content={<TooltipRupiah />} />
                            <Bar dataKey="bookings" name="bookings" fill={TEAL} radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Daily Revenue — Area */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pendapatan Harian (30 hari terakhir)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={data.dailyBookings}>
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={TEAL} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                interval={4}
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                width={40}
                                tickFormatter={(v) => formatRupiah(v)}
                            />
                            <Tooltip content={<TooltipRupiah />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                name="revenue"
                                stroke={TEAL}
                                strokeWidth={2}
                                fill="url(#revenueGrad)"
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Bookings by Court */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Booking per Lapangan</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.byCourt.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">Belum ada data booking.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={data.byCourt} layout="vertical" barSize={14}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                                <YAxis
                                    dataKey="court"
                                    type="category"
                                    tick={{ fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={80}
                                />
                                <Tooltip content={<TooltipRupiah />} />
                                <Bar dataKey="bookings" name="bookings" radius={[0, 3, 3, 0]}>
                                    {data.byCourt.map((_, i) => (
                                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Bookings by Day of Week */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Booking per Hari</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.byDay.every((d) => d.bookings === 0) ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">Belum ada data booking.</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <BarChart data={data.byDay} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} width={24} />
                                    <Tooltip content={<TooltipRupiah />} />
                                    <Bar dataKey="bookings" name="bookings" radius={[4, 4, 0, 0]}>
                                        {data.byDay.map((d, i) => (
                                            <Cell
                                                key={i}
                                                fill={d.day === maxDay.day ? TEAL : TEAL_LIGHT}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <p className="mt-2 text-center text-xs text-muted-foreground">
                                Hari tersibuk:{' '}
                                <span className="font-semibold text-teal-600">{maxDay.day}</span>
                                {' '}({maxDay.bookings} booking)
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function Dashboard({
    stats,
    userType,
    recentVenues,
    venues,
    recentActivity,
    chartData,
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
                    <StatCard title="Total Venue" value={stats.totalVenues} icon={Building2} />
                    <StatCard title="Dipublikasikan" value={stats.publishedVenues} icon={Eye} />
                    <StatCard title="Draft" value={stats.draftVenues} icon={EyeOff} />
                    {stats.totalCourts !== undefined && (
                        <StatCard title="Total Lapangan" value={stats.totalCourts} icon={LayoutGrid} />
                    )}
                    {stats.totalUsers !== undefined && (
                        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
                    )}
                    {stats.totalFacilities !== undefined && (
                        <StatCard title="Total Fasilitas" value={stats.totalFacilities} icon={Tags} />
                    )}
                    {stats.totalBookings !== undefined && (
                        <StatCard
                            title="Total Booking"
                            value={stats.totalBookings}
                            icon={CalendarCheck}
                            sub={`${stats.confirmedBookings} dikonfirmasi`}
                        />
                    )}
                    {stats.totalRevenue !== undefined && (
                        <StatCard
                            title="Total Pendapatan"
                            value={formatRupiah(stats.totalRevenue)}
                            icon={Wallet}
                            sub="dari booking terkonfirmasi"
                        />
                    )}
                </div>

                {/* Charts — venue-admin only */}
                {userType === 'venue-admin' && chartData && (
                    <BookingCharts data={chartData} />
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Venue List / Recent Venues */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                {userType === 'superadmin' ? 'Venue Terbaru' : 'Venue Saya'}
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
                                                <p className="font-medium">{venue.name}</p>
                                                <p className="text-sm text-muted-foreground">{venue.city}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={venue.status === 'official' ? 'default' : 'secondary'}>
                                                    {venue.status}
                                                </Badge>
                                                {venue.is_published ? (
                                                    <Badge variant="outline" className="border-green-500 text-green-600">
                                                        Published
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Draft</Badge>
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
                                                    <p className="font-medium">{venue.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {venue.city} · {venue.court_count} lapangan · {venue.photo_count} foto
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {venue.is_published ? (
                                                        <Badge variant="outline" className="border-green-500 text-green-600">
                                                            Published
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">Draft</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <CompletenessBar percentage={venue.completeness} />
                                            </div>
                                        </Link>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
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
                                    <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
                                )}
                                {recentActivity.map((log) => (
                                    <div key={log.id} className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                        <div className="flex-1">
                                            <p>
                                                <span className="font-medium">{log.user?.name ?? 'System'}</span>{' '}
                                                {actionLabels[log.action] ?? log.action}
                                                {log.venue && (
                                                    <> di <span className="font-medium">{log.venue.name}</span></>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(log.created_at).toLocaleDateString('id-ID', {
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

