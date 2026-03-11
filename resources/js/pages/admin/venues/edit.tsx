import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    ExternalLink,
    Trash2,
    Plus,
    GripVertical,
    Star,
    X,
    Eye,
    EyeOff,
} from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import type { AdminVenue, AdminFacility, BreadcrumbItem } from '@/types';

interface ProvinceCity {
    id: number;
    code: string;
    name: string;
}

interface VenueEditProps {
    venue: AdminVenue & { completeness: number };
    allFacilities: AdminFacility[];
    provinces: ProvinceCity[];
    cities: ProvinceCity[];
}

type Tab = 'info' | 'address' | 'photos' | 'facilities' | 'courts';

const tabLabels: Record<Tab, string> = {
    info: 'Informasi Dasar',
    address: 'Alamat & Lokasi',
    photos: 'Foto',
    facilities: 'Fasilitas',
    courts: 'Lapangan & Jadwal',
};

function CompletenessBar({ percentage }: { percentage: number }) {
    const color =
        percentage >= 80
            ? 'bg-green-500'
            : percentage >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500';
    return (
        <div className="flex items-center gap-3">
            <div className="h-2.5 flex-1 rounded-full bg-muted">
                <div
                    className={`h-2.5 rounded-full transition-all ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-sm font-medium">{percentage}%</span>
        </div>
    );
}

export default function VenueEdit({ venue, allFacilities, provinces, cities }: VenueEditProps) {
    const [activeTab, setActiveTab] = useState<Tab>('info');

    const provinceOptions: ComboboxOption[] = useMemo(
        () => provinces.map((p) => ({ value: p.name, label: p.name })),
        [provinces],
    );

    const cityOptions: ComboboxOption[] = useMemo(
        () => cities.map((c) => ({ value: c.name, label: c.name })),
        [cities],
    );

    // Basic info form
    const infoForm = useForm({
        name: venue.name,
        slug: venue.slug,
        phone: venue.phone,
        email: venue.email ?? '',
        description: venue.description ?? '',
        status: venue.status,
        is_published: venue.is_published,
        address_1: venue.address_1,
        address_2: venue.address_2 ?? '',
        city: venue.city,
        province: venue.province,
        postal_code: venue.postal_code,
        latitude: String(venue.latitude),
        longitude: String(venue.longitude),
        open_at: venue.open_at?.slice(0, 5) ?? '07:00',
        close_at: venue.close_at?.slice(0, 5) ?? '22:00',
    });

    // Court form
    const courtForm = useForm({
        court_number: '',
        name: '',
        place: 'indoor' as 'indoor' | 'outdoor',
    });

    // Schedule form
    const scheduleForm = useForm({
        start_time: '',
        end_time: '',
        price: '',
        day_type: 'weekday' as 'weekday' | 'weekend',
    });

    const [addingCourtOpen, setAddingCourtOpen] = useState(false);
    const [addingScheduleFor, setAddingScheduleFor] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Venues', href: '/admin/venues' },
        { title: venue.name, href: `/admin/venues/${venue.id}/edit` },
    ];

    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        infoForm.put(`/admin/venues/${venue.id}`);
    };

    const handleTogglePublish = () => {
        router.post(`/admin/venues/${venue.id}/toggle-publish`);
    };

    const handleAddCourt = (e: React.FormEvent) => {
        e.preventDefault();
        courtForm.post(`/admin/venues/${venue.id}/courts`, {
            onSuccess: () => {
                courtForm.reset();
                setAddingCourtOpen(false);
            },
        });
    };

    const handleDeleteCourt = (courtId: number) => {
        if (confirm('Hapus lapangan ini?')) {
            router.delete(`/admin/venues/${venue.id}/courts/${courtId}`);
        }
    };

    const handleAddSchedule = (e: React.FormEvent, courtId: number) => {
        e.preventDefault();
        scheduleForm.post(
            `/admin/venues/${venue.id}/courts/${courtId}/schedules`,
            {
                onSuccess: () => {
                    scheduleForm.reset();
                    setAddingScheduleFor(null);
                },
            },
        );
    };

    const handleDeleteSchedule = (courtId: number, scheduleId: number) => {
        router.delete(
            `/admin/venues/${venue.id}/courts/${courtId}/schedules/${scheduleId}`,
        );
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;

        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append('photos[]', file));

        router.post(`/admin/venues/${venue.id}/photos`, formData);
    };

    const handleSetCover = (photoId: number) => {
        router.post(`/admin/venues/${venue.id}/photos/${photoId}/cover`);
    };

    const handleDeletePhoto = (photoId: number) => {
        if (confirm('Hapus foto ini?')) {
            router.delete(`/admin/venues/${venue.id}/photos/${photoId}`);
        }
    };

    const handleSyncFacilities = (facilityIds: number[]) => {
        router.post(`/admin/venues/${venue.id}/facilities`, {
            facility_ids: facilityIds,
        });
    };

    const selectedFacilityIds =
        venue.facilities?.map((f) => f.id) ?? [];
    const [localFacilityIds, setLocalFacilityIds] =
        useState<number[]>(selectedFacilityIds);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${venue.name}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {venue.name}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {venue.city} · {venue.status}
                        </p>
                        <div className="mt-3 max-w-sm">
                            <CompletenessBar percentage={venue.completeness} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTogglePublish}
                        >
                            {venue.is_published ? (
                                <>
                                    <EyeOff className="mr-1 h-4 w-4" /> Tarik
                                    Publikasi
                                </>
                            ) : (
                                <>
                                    <Eye className="mr-1 h-4 w-4" />{' '}
                                    Publikasikan
                                </>
                            )}
                        </Button>
                        <a
                            href={`/venues/${venue.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" size="sm">
                                <ExternalLink className="mr-1 h-4 w-4" /> Lihat
                                Sebagai Pengunjung
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2">
                    <Badge
                        variant={
                            venue.status === 'official' ? 'default' : 'secondary'
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
                        <Badge variant="outline">Draft</Badge>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto rounded-lg border bg-muted/30 p-1">
                    {(Object.keys(tabLabels) as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab
                                ? 'bg-background shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tabLabels[tab]}
                        </button>
                    ))}
                </div>

                {/* Tab: Informasi Dasar */}
                {activeTab === 'info' && (
                    <form onSubmit={handleInfoSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Dasar</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nama *</Label>
                                        <Input
                                            id="name"
                                            value={infoForm.data.name}
                                            onChange={(e) =>
                                                infoForm.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={infoForm.errors.name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="slug">Slug *</Label>
                                        <Input
                                            id="slug"
                                            value={infoForm.data.slug}
                                            onChange={(e) =>
                                                infoForm.setData(
                                                    'slug',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={infoForm.errors.slug}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Telepon *</Label>
                                        <Input
                                            id="phone"
                                            value={infoForm.data.phone}
                                            onChange={(e) =>
                                                infoForm.setData(
                                                    'phone',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={infoForm.errors.phone}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={infoForm.data.email}
                                            onChange={(e) =>
                                                infoForm.setData(
                                                    'email',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={infoForm.errors.email}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">
                                        Deskripsi
                                    </Label>
                                    <textarea
                                        id="description"
                                        value={infoForm.data.description}
                                        onChange={(e) =>
                                            infoForm.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        rows={4}
                                        className="rounded-md border px-3 py-2 text-sm"
                                    />
                                    <InputError
                                        message={infoForm.errors.description}
                                    />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Status</Label>
                                        <select
                                            id="status"
                                            value={infoForm.data.status}
                                            onChange={(e) =>
                                                infoForm.setData(
                                                    'status',
                                                    e.target.value as
                                                    | 'official'
                                                    | 'partner',
                                                )
                                            }
                                            className="rounded-md border px-3 py-2 text-sm"
                                        >
                                            <option value="partner">
                                                Partner
                                            </option>
                                            <option value="official">
                                                Official
                                            </option>
                                        </select>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="open_at">Buka</Label>
                                            <Input
                                                id="open_at"
                                                type="time"
                                                value={infoForm.data.open_at}
                                                onChange={(e) =>
                                                    infoForm.setData(
                                                        'open_at',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="close_at">
                                                Tutup
                                            </Label>
                                            <Input
                                                id="close_at"
                                                type="time"
                                                value={infoForm.data.close_at}
                                                onChange={(e) =>
                                                    infoForm.setData(
                                                        'close_at',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={infoForm.processing}
                                    >
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                )}

                {/* Tab: Address */}
                {activeTab === 'address' && (
                    <form onSubmit={handleInfoSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Alamat & Lokasi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Alamat 1 *</Label>
                                    <Input
                                        value={infoForm.data.address_1}
                                        onChange={(e) =>
                                            infoForm.setData(
                                                'address_1',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Alamat 2</Label>
                                    <Input
                                        value={infoForm.data.address_2}
                                        onChange={(e) =>
                                            infoForm.setData(
                                                'address_2',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="grid gap-2">
                                        <Label>Kota *</Label>
                                        <Combobox
                                            options={cityOptions}
                                            value={infoForm.data.city}
                                            onChange={(val) =>
                                                infoForm.setData('city', val)
                                            }
                                            placeholder="Cari kota..."
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Provinsi *</Label>
                                        <Combobox
                                            options={provinceOptions}
                                            value={infoForm.data.province}
                                            onChange={(val) =>
                                                infoForm.setData('province', val)
                                            }
                                            placeholder="Cari provinsi..."
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Kode Pos</Label>
                                        <Input
                                            value={infoForm.data.postal_code}
                                            onChange={(e) =>
                                                infoForm.setData(
                                                    'postal_code',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Latitude *</Label>
                                        <Input
                                            type="number"
                                            step="0.0000001"
                                            value={infoForm.data.latitude}
                                            onChange={(e) =>
                                                infoForm.setData(
                                                    'latitude',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Longitude *</Label>
                                        <Input
                                            type="number"
                                            step="0.0000001"
                                            value={infoForm.data.longitude}
                                            onChange={(e) =>
                                                infoForm.setData(
                                                    'longitude',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                {infoForm.data.latitude &&
                                    infoForm.data.longitude && (
                                        <div className="overflow-hidden rounded-lg border">
                                            <iframe
                                                title="Lokasi"
                                                width="100%"
                                                height="350"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                src={`https://maps.google.com/maps?q=${infoForm.data.latitude},${infoForm.data.longitude}&z=15&output=embed`}
                                            />
                                        </div>
                                    )}
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={infoForm.processing}
                                    >
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                )}

                {/* Tab: Photos */}
                {activeTab === 'photos' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Foto Venue</CardTitle>
                            <label className="cursor-pointer">
                                <Button variant="outline" size="sm" asChild>
                                    <span>
                                        <Plus className="mr-1 h-4 w-4" /> Unggah
                                        Foto
                                    </span>
                                </Button>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                />
                            </label>
                        </CardHeader>
                        <CardContent>
                            {!venue.photos?.length ? (
                                <p className="py-8 text-center text-muted-foreground">
                                    Belum ada foto. Klik &quot;Unggah Foto&quot;
                                    untuk menambahkan.
                                </p>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {venue.photos.map((photo) => (
                                        <div
                                            key={photo.id}
                                            className="group relative overflow-hidden rounded-lg border"
                                        >
                                            <img
                                                src={`/storage/${photo.file_path}`}
                                                alt=""
                                                className="aspect-video w-full object-cover"
                                            />
                                            {photo.is_cover && (
                                                <Badge className="absolute top-2 left-2 bg-yellow-500">
                                                    <Star className="mr-1 h-3 w-3" />{' '}
                                                    Cover
                                                </Badge>
                                            )}
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                {!photo.is_cover && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="h-7 px-2"
                                                        onClick={() =>
                                                            handleSetCover(
                                                                photo.id,
                                                            )
                                                        }
                                                    >
                                                        <Star className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-7 px-2"
                                                    onClick={() =>
                                                        handleDeletePhoto(
                                                            photo.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tab: Facilities */}
                {activeTab === 'facilities' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Fasilitas</CardTitle>
                            <Button
                                size="sm"
                                onClick={() =>
                                    handleSyncFacilities(localFacilityIds)
                                }
                            >
                                Simpan Fasilitas
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                                {allFacilities.map((facility) => (
                                    <label
                                        key={facility.id}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <Checkbox
                                            checked={localFacilityIds.includes(
                                                facility.id,
                                            )}
                                            onCheckedChange={(checked) => {
                                                setLocalFacilityIds((prev) =>
                                                    checked
                                                        ? [...prev, facility.id]
                                                        : prev.filter(
                                                            (id) =>
                                                                id !==
                                                                facility.id,
                                                        ),
                                                );
                                            }}
                                        />
                                        <span className="text-sm font-medium">
                                            {facility.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {allFacilities.length === 0 && (
                                <p className="py-8 text-center text-muted-foreground">
                                    Belum ada fasilitas master. Superadmin perlu
                                    menambahkan data fasilitas terlebih dahulu.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tab: Courts & Schedules */}
                {activeTab === 'courts' && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Lapangan</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setAddingCourtOpen(!addingCourtOpen)
                                    }
                                >
                                    <Plus className="mr-1 h-4 w-4" /> Tambah
                                    Lapangan
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {/* Add court form */}
                                {addingCourtOpen && (
                                    <form
                                        onSubmit={handleAddCourt}
                                        className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-4"
                                    >
                                        <div className="grid gap-1">
                                            <Label className="text-xs">
                                                Nomor
                                            </Label>
                                            <Input
                                                type="number"
                                                value={
                                                    courtForm.data.court_number
                                                }
                                                onChange={(e) =>
                                                    courtForm.setData(
                                                        'court_number',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-20"
                                                placeholder="1"
                                            />
                                        </div>
                                        <div className="grid gap-1">
                                            <Label className="text-xs">
                                                Nama
                                            </Label>
                                            <Input
                                                value={courtForm.data.name}
                                                onChange={(e) =>
                                                    courtForm.setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Court 1"
                                            />
                                        </div>
                                        <div className="grid gap-1">
                                            <Label className="text-xs">
                                                Tipe
                                            </Label>
                                            <select
                                                value={courtForm.data.place}
                                                onChange={(e) =>
                                                    courtForm.setData(
                                                        'place',
                                                        e.target.value as
                                                        | 'indoor'
                                                        | 'outdoor',
                                                    )
                                                }
                                                className="rounded-md border px-3 py-2 text-sm"
                                            >
                                                <option value="indoor">
                                                    Indoor
                                                </option>
                                                <option value="outdoor">
                                                    Outdoor
                                                </option>
                                            </select>
                                        </div>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={courtForm.processing}
                                        >
                                            Tambah
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setAddingCourtOpen(false)
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </form>
                                )}

                                {/* Court list */}
                                {!venue.courts?.length ? (
                                    <p className="py-8 text-center text-muted-foreground">
                                        Belum ada lapangan.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {venue.courts.map((court) => (
                                            <div
                                                key={court.id}
                                                className="rounded-lg border"
                                            >
                                                <div className="flex items-center justify-between border-b p-4">
                                                    <div className="flex items-center gap-3">
                                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">
                                                                {court.name}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Court #
                                                                {
                                                                    court.court_number
                                                                }{' '}
                                                                · {court.place}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setAddingScheduleFor(
                                                                    addingScheduleFor ===
                                                                        court.id
                                                                        ? null
                                                                        : court.id,
                                                                )
                                                            }
                                                        >
                                                            <Plus className="mr-1 h-3 w-3" />{' '}
                                                            Jadwal
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDeleteCourt(
                                                                    court.id,
                                                                )
                                                            }
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Add schedule form */}
                                                {addingScheduleFor ===
                                                    court.id && (
                                                        <form
                                                            onSubmit={(e) =>
                                                                handleAddSchedule(
                                                                    e,
                                                                    court.id,
                                                                )
                                                            }
                                                            className="flex flex-wrap items-end gap-3 border-b bg-muted/30 p-4"
                                                        >
                                                            <div className="grid gap-1">
                                                                <Label className="text-xs">
                                                                    Mulai
                                                                </Label>
                                                                <Input
                                                                    type="time"
                                                                    value={
                                                                        scheduleForm
                                                                            .data
                                                                            .start_time
                                                                    }
                                                                    onChange={(e) =>
                                                                        scheduleForm.setData(
                                                                            'start_time',
                                                                            e.target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-32"
                                                                />
                                                            </div>
                                                            <div className="grid gap-1">
                                                                <Label className="text-xs">
                                                                    Selesai
                                                                </Label>
                                                                <Input
                                                                    type="time"
                                                                    value={
                                                                        scheduleForm
                                                                            .data
                                                                            .end_time
                                                                    }
                                                                    onChange={(e) =>
                                                                        scheduleForm.setData(
                                                                            'end_time',
                                                                            e.target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-32"
                                                                />
                                                            </div>
                                                            <div className="grid gap-1">
                                                                <Label className="text-xs">
                                                                    Harga (Rp)
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    value={
                                                                        scheduleForm
                                                                            .data
                                                                            .price
                                                                    }
                                                                    onChange={(e) =>
                                                                        scheduleForm.setData(
                                                                            'price',
                                                                            e.target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-32"
                                                                    placeholder="150000"
                                                                />
                                                            </div>
                                                            <div className="grid gap-1">
                                                                <Label className="text-xs">
                                                                    Tipe Hari
                                                                </Label>
                                                                <select
                                                                    value={
                                                                        scheduleForm
                                                                            .data
                                                                            .day_type
                                                                    }
                                                                    onChange={(e) =>
                                                                        scheduleForm.setData(
                                                                            'day_type',
                                                                            e.target
                                                                                .value as
                                                                            | 'weekday'
                                                                            | 'weekend',
                                                                        )
                                                                    }
                                                                    className="rounded-md border px-3 py-2 text-sm"
                                                                >
                                                                    <option value="weekday">
                                                                        Weekday
                                                                    </option>
                                                                    <option value="weekend">
                                                                        Weekend
                                                                    </option>
                                                                </select>
                                                            </div>
                                                            <Button
                                                                type="submit"
                                                                size="sm"
                                                            >
                                                                Tambah
                                                            </Button>
                                                        </form>
                                                    )}

                                                {/* Schedule list */}
                                                {court.schedules &&
                                                    court.schedules.length >
                                                    0 && (
                                                        <div className="p-4">
                                                            <table className="w-full text-sm">
                                                                <thead>
                                                                    <tr className="text-left text-muted-foreground">
                                                                        <th className="pb-2 font-medium">
                                                                            Jam
                                                                        </th>
                                                                        <th className="pb-2 font-medium">
                                                                            Harga
                                                                        </th>
                                                                        <th className="pb-2 font-medium">
                                                                            Tipe
                                                                        </th>
                                                                        <th className="pb-2" />
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {court.schedules.map(
                                                                        (
                                                                            schedule,
                                                                        ) => (
                                                                            <tr
                                                                                key={
                                                                                    schedule.id
                                                                                }
                                                                                className="border-t"
                                                                            >
                                                                                <td className="py-2">
                                                                                    {schedule.start_time?.slice(0, 5)}{' '}
                                                                                    –{' '}
                                                                                    {schedule.end_time?.slice(0, 5)}
                                                                                </td>
                                                                                <td className="py-2">
                                                                                    Rp{' '}
                                                                                    {schedule.price.toLocaleString(
                                                                                        'id-ID',
                                                                                    )}
                                                                                </td>
                                                                                <td className="py-2">
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className="text-xs"
                                                                                    >
                                                                                        {
                                                                                            schedule.day_type
                                                                                        }
                                                                                    </Badge>
                                                                                </td>
                                                                                <td className="py-2 text-right">
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() =>
                                                                                            handleDeleteSchedule(
                                                                                                court.id,
                                                                                                schedule.id,
                                                                                            )
                                                                                        }
                                                                                        className="h-7 text-destructive hover:text-destructive"
                                                                                    >
                                                                                        <Trash2 className="h-3 w-3" />
                                                                                    </Button>
                                                                                </td>
                                                                            </tr>
                                                                        ),
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
