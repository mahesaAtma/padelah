import { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Toaster } from 'sonner';
import { Container } from '@/components/padel/container';
import { LogOut, LayoutDashboard, User, ChevronDown, Menu, X } from 'lucide-react';
import { AuthModalProvider, useAuthModal } from '@/contexts/auth-modal-context';
import AuthModal from '@/components/auth-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import type { Auth } from '@/types';

interface PublicLayoutProps {
    children: React.ReactNode;
}

function UserDropdown({ user }: { user: Auth['user'] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-full border border-padel-divider bg-padel-card px-3 py-1.5 text-sm font-medium text-padel-dark transition-colors hover:bg-padel-light cursor-pointer"
            >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-padel-primary text-xs font-bold text-white">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-7 w-7 rounded-full object-cover"
                        />
                    ) : (
                        initials
                    )}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-padel-body" />
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-padel-divider bg-padel-card shadow-lg">
                    <div className="border-b border-padel-divider px-4 py-3">
                        <p className="text-sm font-medium text-padel-dark">
                            {user.name}
                        </p>
                        <p className="text-xs text-padel-body">{user.email}</p>
                    </div>
                    <div className="py-1">
                        {(user.type === 'superadmin' || user.type === 'venue-admin') && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-padel-dark transition-colors hover:bg-padel-light"
                                onClick={() => setOpen(false)}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                        )}
                        <Link
                            href="/settings/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-padel-dark transition-colors hover:bg-padel-light"
                            onClick={() => setOpen(false)}
                        >
                            <User className="h-4 w-4" />
                            Profil Saya
                        </Link>
                    </div>
                    <div className="border-t border-padel-divider py-1">
                        <button
                            onClick={() => router.post('/logout')}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                            <LogOut className="h-4 w-4" />
                            Keluar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function PublicLayoutInner({ children }: PublicLayoutProps) {
    const { auth } = usePage<{ auth: { user: Auth['user'] | null } }>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { openLogin, openRegister } = useAuthModal();
    const user = auth?.user;

    return (
        <div className="flex min-h-screen flex-col bg-padel-light">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-padel-divider/50 bg-padel-card/80 backdrop-blur-sm">
                <Container size="wide">
                    <div className="flex h-14 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/images/logo.png" alt="Padelah" className="h-8 w-8" />
                            <span className="text-2xl font-bold">
                                <span className="text-padel-primary">padelah</span>
                                <span className="text-padel-success">.com</span>
                            </span>
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden items-center gap-6 md:flex">
                            <Link
                                href="/"
                                className="text-sm font-medium text-padel-body transition-colors hover:text-padel-dark"
                            >
                                Venue
                            </Link>
                            <Link
                                href="/"
                                className="text-sm font-medium text-padel-body transition-colors hover:text-padel-dark"
                            >
                                Tentang
                            </Link>
                        </nav>

                        {/* Desktop auth + theme toggle */}
                        <div className="hidden items-center gap-3 md:flex">
                            <ThemeToggle />
                            {user ? (
                                <UserDropdown user={user} />
                            ) : (
                                <>
                                    <button
                                        onClick={openLogin}
                                        className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-padel-primary transition-colors hover:bg-padel-primary/5"
                                    >
                                        Masuk
                                    </button>
                                    <button
                                        onClick={openRegister}
                                        className="cursor-pointer rounded-lg bg-padel-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-padel-primary/90"
                                    >
                                        Daftar
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile menu toggle */}
                        <button
                            className="flex items-center md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-5 w-5 text-padel-dark" />
                            ) : (
                                <Menu className="h-5 w-5 text-padel-dark" />
                            )}
                        </button>
                    </div>
                </Container>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="border-t border-padel-divider bg-padel-card md:hidden">
                        <Container size="wide">
                            <div className="flex flex-col gap-1 py-4">
                                <Link
                                    href="/"
                                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-padel-body transition-colors hover:bg-padel-light"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Venue
                                </Link>
                                <Link
                                    href="/"
                                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-padel-body transition-colors hover:bg-padel-light"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Tentang
                                </Link>

                                <div className="my-2 border-t border-padel-divider" />

                                {/* Mobile theme toggle */}
                                <ThemeToggle />

                                <div className="my-2 border-t border-padel-divider" />

                                {user ? (
                                    <>
                                        <div className="px-3 py-2">
                                            <p className="text-sm font-medium text-padel-dark">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-padel-body">
                                                {user.email}
                                            </p>
                                        </div>
                                        {(user.type === 'superadmin' || user.type === 'venue-admin') && (
                                            <Link
                                                href="/admin"
                                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-padel-body transition-colors hover:bg-padel-light"
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                            >
                                                <LayoutDashboard className="h-4 w-4" />
                                                Dashboard
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                router.post('/logout');
                                            }}
                                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Keluar
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-2 px-3">
                                        <button
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                openLogin();
                                            }}
                                            className="rounded-lg border border-padel-primary px-4 py-2.5 text-center text-sm font-medium text-padel-primary transition-colors hover:bg-padel-primary/5"
                                        >
                                            Masuk
                                        </button>
                                        <button
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                openRegister();
                                            }}
                                            className="rounded-lg bg-padel-primary px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-padel-primary/90"
                                        >
                                            Daftar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Container>
                    </div>
                )}
            </header>

            {/* Auth Modal */}
            <AuthModal />
            <Toaster position="bottom-right" richColors closeButton />

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t border-padel-divider bg-padel-card">
                <Container size="wide">
                    <div className="flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
                        <div>
                            <div className="flex items-center gap-2">
                                <img src="/images/logo.png" alt="Padelah" className="h-8 w-8" />
                                <span className="text-2xl font-bold">
                                    <span className="text-padel-primary">padelah</span>
                                    <span className="text-padel-success">.com</span>
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-padel-body">
                                Temukan dan pesan lapangan padel di seluruh
                                Indonesia.
                            </p>
                        </div>

                        <div className="flex gap-6">
                            <Link
                                href="/"
                                className="text-sm text-padel-body transition-colors hover:text-padel-dark"
                            >
                                Venue
                            </Link>
                            <Link
                                href="/"
                                className="text-sm text-padel-body transition-colors hover:text-padel-dark"
                            >
                                Tentang
                            </Link>
                            <Link
                                href="/"
                                className="text-sm text-padel-body transition-colors hover:text-padel-dark"
                            >
                                Kontak
                            </Link>
                        </div>

                        <p className="text-xs text-padel-body/60">
                            &copy; {new Date().getFullYear()} Padelah.com. Hak cipta
                            dilindungi.
                        </p>
                    </div>
                </Container>
            </footer>
        </div>
    );
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <AuthModalProvider>
            <PublicLayoutInner>{children}</PublicLayoutInner>
        </AuthModalProvider>
    );
}
