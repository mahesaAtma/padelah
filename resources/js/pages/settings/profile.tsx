import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Eye, EyeOff, KeyRound, Loader2, Mail, ShieldCheck, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import CustomerLayout from '@/layouts/customer-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Auth, BreadcrumbItem } from '@/types';

interface ProfileProps {
    mustVerifyEmail: boolean;
    status?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profil Saya', href: '/settings/profile' },
];

export default function Profile({ mustVerifyEmail, status }: ProfileProps) {
    const { auth } = usePage<{ auth: { user: Auth['user'] } }>().props;
    const user = auth.user;

    const profileForm = useForm({ name: user.name ?? '', email: user.email ?? '' });
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const deleteForm = useForm({});

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch('/settings/profile', {
            preserveScroll: true,
            onSuccess: () => toast.success('Profil berhasil diperbarui.'),
        });
    };

    const handlePasswordSave = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kata sandi berhasil diperbarui.');
                passwordForm.reset();
            },
            onError: () => toast.error('Periksa kembali kata sandi Anda.'),
        });
    };

    const handleDeleteAccount = () => {
        deleteForm.delete('/settings/profile', {
            onSuccess: () => setDeleteOpen(false),
        });
    };

    const PasswordInput = ({
        id,
        value,
        onChange,
        show,
        onToggle,
        placeholder,
        error,
    }: {
        id: string;
        value: string;
        onChange: (v: string) => void;
        show: boolean;
        onToggle: () => void;
        placeholder: string;
        error?: string;
    }) => (
        <div className="space-y-1.5">
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 pr-11 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Saya" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-2xl">

                {/* Page heading */}
                <div>
                    <h1 className="text-2xl font-bold">Profil Saya</h1>
                    <p className="text-muted-foreground mt-1">Kelola informasi akun dan keamanan Anda.</p>
                </div>

                {/* Email verify notice */}
                {mustVerifyEmail && !user.email_verified_at && (
                    <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-amber-800">Email belum diverifikasi</p>
                            <p className="text-sm text-amber-700 mt-0.5">Cek inbox Anda dan klik tautan verifikasi.</p>
                        </div>
                    </div>
                )}

                {/* ── Profile info ── */}
                <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b">
                        <User className="h-4 w-4 text-primary" />
                        <h2 className="font-semibold">Informasi Profil</h2>
                    </div>
                    <form onSubmit={handleProfileSave} className="px-6 py-6 space-y-5">
                        <div className="grid sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Nama Lengkap
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
                                    placeholder="Nama lengkap Anda"
                                />
                                {profileForm.errors.name && <p className="text-sm text-destructive">{profileForm.errors.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
                                    placeholder="Email Anda"
                                />
                                {profileForm.errors.email && <p className="text-sm text-destructive">{profileForm.errors.email}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={profileForm.processing}>
                                {profileForm.processing ? (
                                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Menyimpan...</>
                                ) : (
                                    'Simpan Perubahan'
                                )}
                            </Button>
                            {profileForm.recentlySuccessful && (
                                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                                    <CheckCircle className="h-4 w-4" /> Tersimpan
                                </span>
                            )}
                        </div>
                    </form>
                </div>

                {/* ── Change password ── */}
                <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b">
                        <KeyRound className="h-4 w-4 text-primary" />
                        <h2 className="font-semibold">Ubah Kata Sandi</h2>
                    </div>
                    <form onSubmit={handlePasswordSave} className="px-6 py-6 space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="current_password" className="text-sm font-medium">
                                Kata Sandi Saat Ini
                            </label>
                            <PasswordInput
                                id="current_password"
                                value={passwordForm.data.current_password}
                                onChange={(v) => passwordForm.setData('current_password', v)}
                                show={showCurrent}
                                onToggle={() => setShowCurrent(!showCurrent)}
                                placeholder="Masukkan kata sandi saat ini"
                                error={passwordForm.errors.current_password}
                            />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Kata Sandi Baru
                                </label>
                                <PasswordInput
                                    id="password"
                                    value={passwordForm.data.password}
                                    onChange={(v) => passwordForm.setData('password', v)}
                                    show={showNew}
                                    onToggle={() => setShowNew(!showNew)}
                                    placeholder="Min. 8 karakter"
                                    error={passwordForm.errors.password}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="password_confirmation" className="text-sm font-medium">
                                    Konfirmasi Kata Sandi
                                </label>
                                <PasswordInput
                                    id="password_confirmation"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(v) => passwordForm.setData('password_confirmation', v)}
                                    show={showConfirm}
                                    onToggle={() => setShowConfirm(!showConfirm)}
                                    placeholder="Ulangi kata sandi baru"
                                    error={passwordForm.errors.password_confirmation}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={passwordForm.processing}>
                                {passwordForm.processing ? (
                                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Menyimpan...</>
                                ) : (
                                    'Perbarui Kata Sandi'
                                )}
                            </Button>
                            {passwordForm.recentlySuccessful && (
                                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                                    <CheckCircle className="h-4 w-4" /> Tersimpan
                                </span>
                            )}
                        </div>
                    </form>
                </div>

                {/* ── Security ── */}
                <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <h2 className="font-semibold">Keamanan Lanjutan</h2>
                    </div>
                    <div className="px-6 py-5">
                        <Link
                            href="/settings/two-factor"
                            className="flex items-center justify-between group"
                        >
                            <div>
                                <p className="text-sm font-medium">Autentikasi Dua Faktor</p>
                                <p className="text-sm text-muted-foreground mt-0.5">Tambahkan lapisan keamanan ekstra pada akun Anda.</p>
                            </div>
                            <span className="text-sm font-medium text-primary group-hover:underline shrink-0 ml-4">Atur →</span>
                        </Link>
                    </div>
                </div>

                {/* ── Danger zone ── */}
                <div className="rounded-xl border border-destructive/30 bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-destructive/20">
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <h2 className="font-semibold text-destructive">Hapus Akun</h2>
                    </div>
                    <div className="px-6 py-5 flex items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            Setelah akun dihapus, semua data tidak dapat dipulihkan.
                        </p>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteOpen(true)}
                            className="shrink-0"
                        >
                            Hapus Akun
                        </Button>
                    </div>
                </div>

            </div>

            {/* Delete confirmation */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Hapus Akun?
                        </DialogTitle>
                        <DialogDescription>
                            Semua data akun, termasuk riwayat pemesanan, akan dihapus permanen dan tidak dapat dipulihkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Batal</Button>
                        <Button variant="destructive" onClick={handleDeleteAccount}>
                            Ya, Hapus Akun Saya
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CustomerLayout>
    );
}
