import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import type { AdminUser, BreadcrumbItem } from '@/types';

interface UserEditProps {
    editUser: AdminUser;
    venues: { id: number; name: string }[];
}

export default function UserEdit({ editUser, venues }: UserEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Users', href: '/admin/users' },
        { title: editUser.name, href: `/admin/users/${editUser.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: editUser.name,
        email: editUser.email ?? '',
        phone: editUser.phone ?? '',
        type: editUser.type,
        status: editUser.status,
        password: '',
        venue_ids: editUser.venue_ids ?? [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${editUser.id}`);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${editUser.name}`} />

            <div className="mx-auto max-w-2xl p-6">
                <h1 className="text-2xl font-bold tracking-tight">
                    Edit User: {editUser.name}
                </h1>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi User</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Telepon</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Tipe *</Label>
                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(e) =>
                                            setData(
                                                'type',
                                                e.target.value as
                                                | 'superadmin'
                                                | 'venue-admin'
                                                | 'customer',
                                            )
                                        }
                                        className="rounded-md border px-3 py-2 text-sm"
                                    >
                                        <option value="customer">
                                            Customer
                                        </option>
                                        <option value="venue-admin">
                                            Venue Admin
                                        </option>
                                        <option value="superadmin">
                                            Superadmin
                                        </option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) =>
                                            setData('status', e.target.value as 'not-registered' | 'pending-activation' | 'inactive' | 'active')
                                        }
                                        className="rounded-md border px-3 py-2 text-sm"
                                    >
                                        <option value="active">Active</option>
                                        <option value="pending-activation">
                                            Pending Activation
                                        </option>
                                        <option value="inactive">
                                            Inactive
                                        </option>
                                        <option value="not-registered">
                                            Not Registered
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    Password{' '}
                                    <span className="text-xs text-muted-foreground">
                                        (kosongkan jika tidak diubah)
                                    </span>
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                />
                                <InputError message={errors.password} />
                            </div>
                        </CardContent>
                    </Card>

                    {data.type === 'venue-admin' && venues.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Assign Venue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {venues.map((venue) => (
                                        <label
                                            key={venue.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                                        >
                                            <Checkbox
                                                checked={data.venue_ids.includes(
                                                    venue.id,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    setData(
                                                        'venue_ids',
                                                        checked
                                                            ? [
                                                                ...data.venue_ids,
                                                                venue.id,
                                                            ]
                                                            : data.venue_ids.filter(
                                                                (id) =>
                                                                    id !==
                                                                    venue.id,
                                                            ),
                                                    )
                                                }
                                            />
                                            <span className="text-sm">
                                                {venue.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
