import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminFacility, BreadcrumbItem } from '@/types';

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

    const addForm = useForm({ name: '' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/facilities', {
            onSuccess: () => addForm.reset(),
        });
    };

    const startEdit = (facility: AdminFacility) => {
        setEditingId(facility.id);
        setEditingName(facility.name);
    };

    const saveEdit = () => {
        if (editingId) {
            router.put(`/admin/facilities/${editingId}`, {
                name: editingName,
            });
            setEditingId(null);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus fasilitas ini?')) {
            router.delete(`/admin/facilities/${id}`);
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Fasilitas" />

            <div className="mx-auto max-w-2xl p-6">
                <h1 className="text-2xl font-bold tracking-tight">Fasilitas</h1>
                <p className="mt-1 text-muted-foreground">
                    Kelola master data fasilitas yang dapat dipilih venue.
                </p>

                {/* Add form */}
                <form
                    onSubmit={handleAdd}
                    className="mt-6 flex items-center gap-3"
                >
                    <Input
                        value={addForm.data.name}
                        onChange={(e) =>
                            addForm.setData('name', e.target.value)
                        }
                        placeholder="Nama fasilitas baru..."
                        className="flex-1"
                    />
                    <Button type="submit" disabled={addForm.processing}>
                        <Plus className="mr-1 h-4 w-4" /> Tambah
                    </Button>
                </form>

                {/* Facility list */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-base">
                            {facilities.length} fasilitas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {facilities.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                Belum ada fasilitas.
                            </p>
                        ) : (
                            <div className="divide-y">
                                {facilities.map((facility) => (
                                    <div
                                        key={facility.id}
                                        className="flex items-center justify-between py-3"
                                    >
                                        {editingId === facility.id ? (
                                            <div className="flex flex-1 items-center gap-2">
                                                <Input
                                                    value={editingName}
                                                    onChange={(e) =>
                                                        setEditingName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1"
                                                    autoFocus
                                                    onKeyDown={(e) =>
                                                        e.key === 'Enter' &&
                                                        saveEdit()
                                                    }
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={saveEdit}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setEditingId(null)
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="font-medium">
                                                    {facility.name}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            startEdit(facility)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleDelete(
                                                                facility.id,
                                                            )
                                                        }
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
