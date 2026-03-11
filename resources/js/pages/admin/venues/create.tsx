import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import type { AdminFacility, BreadcrumbItem } from '@/types';
import { useMemo } from 'react';

interface ProvinceCity {
    id: number;
    code: string;
    name: string;
}

interface VenueCreateProps {
    facilities: AdminFacility[];
    provinces: ProvinceCity[];
    cities: ProvinceCity[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Venues', href: '/admin/venues' },
    { title: 'Buat Venue', href: '/admin/venues/create' },
];

export default function VenueCreate({ facilities, provinces, cities }: VenueCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        phone: '',
        email: '',
        address_1: '',
        address_2: '',
        city: '',
        province: '',
        postal_code: '',
        latitude: '',
        longitude: '',
        open_at: '07:00',
        close_at: '22:00',
        description: '',
        status: 'partner' as 'official' | 'partner',
        is_published: false,
    });

    const provinceOptions: ComboboxOption[] = useMemo(
        () => provinces.map((p) => ({ value: p.name, label: p.name })),
        [provinces],
    );

    const cityOptions: ComboboxOption[] = useMemo(
        () => cities.map((c) => ({ value: c.name, label: c.name })),
        [cities],
    );

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleNameChange = (value: string) => {
        setData((prev) => ({
            ...prev,
            name: value,
            slug: generateSlug(value),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/venues');
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Venue Baru" />

            <div className="mx-auto max-w-3xl p-6">
                <h1 className="text-2xl font-bold tracking-tight">
                    Buat Venue Baru
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Isi informasi dasar venue. Anda dapat melengkapi detail
                    lainnya setelah venue dibuat.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Venue *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        handleNameChange(e.target.value)
                                    }
                                    placeholder="Padel Arena Jakarta"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) =>
                                        setData('slug', e.target.value)
                                    }
                                    placeholder="padel-arena-jakarta"
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Telepon *</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                        placeholder="+62 812 3456 7890"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="info@venue.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    rows={4}
                                    className="rounded-md border px-3 py-2 text-sm"
                                    placeholder="Deskripsi lengkap venue..."
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status *</Label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) =>
                                        setData(
                                            'status',
                                            e.target.value as
                                            | 'official'
                                            | 'partner',
                                        )
                                    }
                                    className="rounded-md border px-3 py-2 text-sm"
                                >
                                    <option value="partner">Partner</option>
                                    <option value="official">Official</option>
                                </select>
                                <InputError message={errors.status} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Alamat & Lokasi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="address_1">Alamat 1 *</Label>
                                <Input
                                    id="address_1"
                                    value={data.address_1}
                                    onChange={(e) =>
                                        setData('address_1', e.target.value)
                                    }
                                    placeholder="Jl. Sudirman No. 10"
                                />
                                <InputError message={errors.address_1} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address_2">Alamat 2</Label>
                                <Input
                                    id="address_2"
                                    value={data.address_2}
                                    onChange={(e) =>
                                        setData('address_2', e.target.value)
                                    }
                                    placeholder="Gedung A, Lantai 3"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="city">Kota *</Label>
                                    <Combobox
                                        id="city"
                                        options={cityOptions}
                                        value={data.city}
                                        onChange={(val) => setData('city', val)}
                                        placeholder="Cari kota..."
                                    />
                                    <InputError message={errors.city} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="province">Provinsi *</Label>
                                    <Combobox
                                        id="province"
                                        options={provinceOptions}
                                        value={data.province}
                                        onChange={(val) => setData('province', val)}
                                        placeholder="Cari provinsi..."
                                    />
                                    <InputError message={errors.province} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="postal_code">
                                        Kode Pos
                                    </Label>
                                    <Input
                                        id="postal_code"
                                        value={data.postal_code}
                                        onChange={(e) =>
                                            setData(
                                                'postal_code',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="12190"
                                    />
                                    <InputError message={errors.postal_code} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="latitude">Latitude *</Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        step="0.0000001"
                                        value={data.latitude}
                                        onChange={(e) =>
                                            setData('latitude', e.target.value)
                                        }
                                        placeholder="-6.2088"
                                    />
                                    <InputError message={errors.latitude} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="longitude">
                                        Longitude *
                                    </Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        step="0.0000001"
                                        value={data.longitude}
                                        onChange={(e) =>
                                            setData('longitude', e.target.value)
                                        }
                                        placeholder="106.8456"
                                    />
                                    <InputError message={errors.longitude} />
                                </div>
                            </div>

                            {/* Google Maps Embed */}
                            {data.latitude && data.longitude && (
                                <div className="overflow-hidden rounded-lg border">
                                    <iframe
                                        title="Lokasi Venue"
                                        width="100%"
                                        height="300"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        src={`https://maps.google.com/maps?q=${data.latitude},${data.longitude}&z=15&output=embed`}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Operating Hours */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Jam Operasional</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="open_at">Buka *</Label>
                                    <Input
                                        id="open_at"
                                        type="time"
                                        value={data.open_at}
                                        onChange={(e) =>
                                            setData('open_at', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.open_at} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="close_at">Tutup *</Label>
                                    <Input
                                        id="close_at"
                                        type="time"
                                        value={data.close_at}
                                        onChange={(e) =>
                                            setData('close_at', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.close_at} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="submit"
                            disabled={processing}
                        >
                            Buat Venue
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
