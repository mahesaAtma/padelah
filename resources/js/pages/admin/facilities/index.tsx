import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { AdminFacility, BreadcrumbItem } from '@/types';

const CATEGORIES: { value: string; label: string }[] = [
    { value: 'court_features',    label: 'Court Features' },
    { value: 'player_facilities', label: 'Player Facilities' },
    { value: 'rental_services',   label: 'Rental Services' },
    { value: 'comfort_facilities',label: 'Comfort Facilities' },
    { value: 'lifestyle',         label: 'Lifestyle & Social' },
    { value: 'training',          label: 'Training & Coaching' },
    { value: 'events',            label: 'Events & Community' },
];

function categoryLabel(value: string | null): string {
    return CATEGORIES.find(c => c.value === value)?.label ?? value ?? '—';
}

interface FacilitiesIndexProps {
    facilities: AdminFacility[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Fasilitas', href: '/admin/facilities' },
];

export default function FacilitiesIndex({ facilities }: FacilitiesIndexProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingCategory, setEditingCategory] = useState<string>('');

    const addForm = useForm({ name: '', category: '' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/facilities', {
            onSuccess: () => {
                addForm.reset();
                toast.success('Fasilitas berhasil ditambahkan.');
            },
            onError: () => toast.error('Gagal menambahkan fasilitas.'),
        });
    };

    const startEdit = (facility: AdminFacility) => {
        setEditingId(facility.id);
        setEditingName(facility.name);
        setEditingCategory(facility.category ?? '');
    };

    const saveEdit = () => {
        if (editingId) {
            router.put(`/admin/facilities/${editingId}`, {
                name: editingName,
                category: editingCategory,
            }, {
                onSuccess: () => toast.success('Fasilitas berhasil diperbarui.'),
                onError: () => toast.error('Gagal memperbarui fasilitas.'),
            });
            setEditingId(null);
        }
    };

    const handleDelete = (id: number) => {
        toast.warning('Hapus fasilitas ini?', {
            description: 'Fasilitas akan dihapus secara permanen.',
            action: {
                label: 'Ya, Hapus',
                onClick: () => {
                    router.delete(`/admin/facilities/${id}`, {
                        onSuccess: () => toast.success('Fasilitas berhasil dihapus.'),
                        onError: () => toast.error('Gagal menghapus fasilitas.'),
                    });
                },
            },
            cancel: {
                label: 'Batal',
                onClick: () => {},
            },
            duration: 6000,
        });
    };

    // Group facilities by category
    const grouped = CATEGORIES.map(cat => ({
        ...cat,
        items: facilities.filter(f => f.category === cat.value),
    })).filter(g => g.items.length > 0);

    const uncategorized = facilities.filter(f => !f.category);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Fasilitas" />

            <div className="mx-auto max-w-3xl p-6">
                <h1 className="text-2xl font-bold tracking-tight">Fasilitas</h1>
                <p className="mt-1 text-muted-foreground">
                    Kelola master data fasilitas yang dapat dipilih venue.
                </p>

                {/* Add form */}
                <form onSubmit={handleAdd} className="mt-6 rounded-lg border bg-muted/30 p-4">
                    <p className="mb-3 text-sm font-medium">Tambah Fasilitas Baru</p>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="grid gap-1">
                            <Label className="text-xs">Kategori</Label>
                            <select
                                value={addForm.data.category}
                                onChange={e => addForm.setData('category', e.target.value)}
                                className="rounded-md border px-3 py-2 text-sm"
                            >
                                <option value="">— Pilih kategori —</option>
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid flex-1 gap-1">
                            <Label className="text-xs">Nama</Label>
                            <Input
                                value={addForm.data.name}
                                onChange={e => addForm.setData('name', e.target.value)}
                                placeholder="Nama fasilitas..."
                            />
                        </div>
                        <Button type="submit" disabled={addForm.processing}>
                            <Plus className="mr-1 h-4 w-4" /> Tambah
                        </Button>
                    </div>
                </form>

                {/* Grouped facility list */}
                <div className="mt-6 space-y-4">
                    {grouped.map(group => (
                        <Card key={group.value}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    {group.label}
                                    <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground/60">
                                        ({group.items.length})
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="divide-y">
                                    {group.items.map(facility => (
                                        <FacilityRow
                                            key={facility.id}
                                            facility={facility}
                                            editingId={editingId}
                                            editingName={editingName}
                                            editingCategory={editingCategory}
                                            setEditingName={setEditingName}
                                            setEditingCategory={setEditingCategory}
                                            onEdit={startEdit}
                                            onSave={saveEdit}
                                            onCancel={() => setEditingId(null)}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {uncategorized.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Tanpa Kategori
                                    <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground/60">
                                        ({uncategorized.length})
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="divide-y">
                                    {uncategorized.map(facility => (
                                        <FacilityRow
                                            key={facility.id}
                                            facility={facility}
                                            editingId={editingId}
                                            editingName={editingName}
                                            editingCategory={editingCategory}
                                            setEditingName={setEditingName}
                                            setEditingCategory={setEditingCategory}
                                            onEdit={startEdit}
                                            onSave={saveEdit}
                                            onCancel={() => setEditingId(null)}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {facilities.length === 0 && (
                        <p className="py-12 text-center text-muted-foreground">
                            Belum ada fasilitas.
                        </p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

interface FacilityRowProps {
    facility: AdminFacility;
    editingId: number | null;
    editingName: string;
    editingCategory: string;
    setEditingName: (v: string) => void;
    setEditingCategory: (v: string) => void;
    onEdit: (f: AdminFacility) => void;
    onSave: () => void;
    onCancel: () => void;
    onDelete: (id: number) => void;
}

function FacilityRow({
    facility, editingId, editingName, editingCategory,
    setEditingName, setEditingCategory,
    onEdit, onSave, onCancel, onDelete,
}: FacilityRowProps) {
    if (editingId === facility.id) {
        return (
            <div className="flex flex-wrap items-center gap-2 py-3">
                <select
                    value={editingCategory}
                    onChange={e => setEditingCategory(e.target.value)}
                    className="rounded-md border px-2 py-1.5 text-sm"
                >
                    <option value="">— Kategori —</option>
                    {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
                <Input
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && onSave()}
                />
                <Button size="sm" variant="ghost" onClick={onSave}>
                    <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between py-3">
            <span className="font-medium">{facility.name}</span>
            <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => onEdit(facility)}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(facility.id)}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
