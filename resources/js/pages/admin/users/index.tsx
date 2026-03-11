import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminUser, PaginatedData, BreadcrumbItem } from '@/types';

interface UserIndexProps {
    users: PaginatedData<AdminUser>;
    filters: { search?: string; type?: string; status?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Users', href: '/admin/users' },
];

const typeBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
    superadmin: 'default',
    'venue-admin': 'secondary',
    customer: 'outline',
};

const statusColors: Record<string, string> = {
    active: 'text-green-600',
    'pending-activation': 'text-yellow-600',
    inactive: 'text-red-500',
    'not-registered': 'text-muted-foreground',
};

export default function UserIndex({ users, filters }: UserIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = () => {
        router.get('/admin/users', { search }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(
            '/admin/users',
            { ...filters, [key]: value || undefined },
            { preserveState: true },
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus user ini?')) {
            router.delete(`/admin/users/${id}`);
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Users" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Users
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola semua user di platform.
                        </p>
                    </div>
                    <Link href="/admin/users/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah User
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex flex-1 items-center gap-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama atau email..."
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
                                value={filters.type ?? ''}
                                onChange={(e) =>
                                    handleFilter('type', e.target.value)
                                }
                                className="rounded-md border px-3 py-2 text-sm"
                            >
                                <option value="">Semua Tipe</option>
                                <option value="superadmin">Superadmin</option>
                                <option value="venue-admin">
                                    Venue Admin
                                </option>
                                <option value="customer">Customer</option>
                            </select>
                            <select
                                value={filters.status ?? ''}
                                onChange={(e) =>
                                    handleFilter('status', e.target.value)
                                }
                                className="rounded-md border px-3 py-2 text-sm"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Active</option>
                                <option value="pending-activation">
                                    Pending
                                </option>
                                <option value="inactive">Inactive</option>
                                <option value="not-registered">
                                    Not Registered
                                </option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {users.total} user ditemukan
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
                                            Email
                                        </th>
                                        <th className="pb-3 font-medium">
                                            Tipe
                                        </th>
                                        <th className="pb-3 font-medium">
                                            Status
                                        </th>
                                        <th className="pb-3 font-medium">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="py-3 font-medium">
                                                {user.name}
                                            </td>
                                            <td className="py-3 text-muted-foreground">
                                                {user.email ?? '-'}
                                            </td>
                                            <td className="py-3">
                                                <Badge
                                                    variant={
                                                        typeBadgeVariant[
                                                        user.type
                                                        ] ?? 'outline'
                                                    }
                                                >
                                                    {user.type}
                                                </Badge>
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={`font-medium ${statusColors[user.status] ?? ''}`}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/admin/users/${user.id}/edit`}
                                                        className="text-sm font-medium text-primary hover:underline"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                user.id,
                                                            )
                                                        }
                                                        className="h-7 text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {users.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-1">
                                {users.links.map((link, i) => (
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
