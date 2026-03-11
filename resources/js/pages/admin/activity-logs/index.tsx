import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminActivityLog, PaginatedData, BreadcrumbItem } from '@/types';

interface ActivityLogIndexProps {
    logs: PaginatedData<AdminActivityLog>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Activity Log', href: '/admin/activity-logs' },
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

const actionColors: Record<string, string> = {
    created: 'bg-green-500',
    updated: 'bg-blue-500',
    deleted: 'bg-red-500',
    published: 'bg-emerald-500',
    unpublished: 'bg-orange-500',
    uploaded: 'bg-cyan-500',
    synced: 'bg-purple-500',
    reordered: 'bg-yellow-500',
    cover_set: 'bg-amber-500',
};

function getActionDotColor(action: string): string {
    const parts = action.split('.');
    const verb = parts[parts.length - 1];
    return actionColors[verb] ?? 'bg-primary';
}

export default function ActivityLogIndex({ logs }: ActivityLogIndexProps) {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Log" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Activity Log
                    </h1>
                    <p className="text-muted-foreground">
                        Riwayat semua aktivitas CMS.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {logs.total} log tercatat
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {logs.data.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                Belum ada aktivitas.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {logs.data.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-start gap-4 rounded-lg border p-4"
                                    >
                                        <div
                                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getActionDotColor(log.action)}`}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm">
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

                                            {/* Show old/new values */}
                                            {log.properties &&
                                                ((log.properties as Record<string, unknown>).old ||
                                                    (log.properties as Record<string, unknown>).new) && (
                                                    <div className="mt-2 rounded bg-muted/50 p-2 text-xs">
                                                        {(log.properties as Record<string, unknown>).old && (
                                                            <div>
                                                                <span className="font-medium text-red-500">
                                                                    Sebelum:
                                                                </span>{' '}
                                                                {String(JSON.stringify(
                                                                    (log.properties as Record<string, unknown>)
                                                                        .old,
                                                                ))}
                                                            </div>
                                                        )}
                                                        {(log.properties as Record<string, unknown>).new && (
                                                            <div>
                                                                <span className="font-medium text-green-600">
                                                                    Sesudah:
                                                                </span>{' '}
                                                                {String(JSON.stringify(
                                                                    (log.properties as Record<string, unknown>)
                                                                        .new,
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {new Date(
                                                    log.created_at,
                                                ).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>

                                        <Badge variant="outline" className="text-xs shrink-0">
                                            {log.action}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}

                        {logs.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-center gap-1">
                                {logs.links.map((link, i) => (
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
