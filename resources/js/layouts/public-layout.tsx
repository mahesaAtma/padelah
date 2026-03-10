import { Link } from '@inertiajs/react';
import { Container } from '@/components/padel/container';

interface PublicLayoutProps {
    children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-padel-light">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm">
                <Container size="wide">
                    <div className="flex h-14 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-lg font-bold text-padel-primary">padelah</span>
                        </Link>

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

                        <div className="flex items-center gap-3">
                            <button className="text-sm font-medium text-padel-primary hover:text-padel-primary/80">
                                Masuk
                            </button>
                        </div>
                    </div>
                </Container>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t border-padel-divider bg-white">
                <Container size="wide">
                    <div className="flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
                        <div>
                            <span className="text-lg font-bold text-padel-primary">padelah</span>
                            <p className="mt-1 text-sm text-padel-body">
                                Temukan dan pesan lapangan padel di seluruh Indonesia.
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
                            &copy; {new Date().getFullYear()} Padelah. Hak cipta dilindungi.
                        </p>
                    </div>
                </Container>
            </footer>
        </div>
    );
}
