import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Clock, CreditCard, MapPin, AlertTriangle } from 'lucide-react';
import CustomerLayout from '@/layouts/customer-layout';
import { Button } from '@/components/ui/button';
import type { CustomerBooking } from '@/types/venue';
import type { BreadcrumbItem } from '@/types';

interface BookingPayProps {
    booking: CustomerBooking;
    snapToken: string;
    clientKey: string;
    isProduction: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pemesanan', href: '/bookings' },
    { title: 'Pembayaran', href: '#' },
];

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatPrice(price: number): string {
    return 'Rp ' + price.toLocaleString('id-ID');
}

declare global {
    interface Window {
        snap: {
            pay: (
                snapToken: string,
                callbacks: {
                    onSuccess?: (result: Record<string, string>) => void;
                    onPending?: (result: Record<string, string>) => void;
                    onError?: (result: Record<string, string>) => void;
                    onClose?: () => void;
                },
            ) => void;
        };
    }
}

export default function BookingPay({ booking, snapToken, clientKey, isProduction }: BookingPayProps) {
    const { flash } = usePage().props as { flash: { success?: string; error?: string; info?: string } };
    const [snapReady, setSnapReady] = useState(false);
    const [paying, setPaying] = useState(false);
    const scriptRef = useRef<HTMLScriptElement | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
        if (flash?.info)    toast.info(flash.info);
    }, []);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = isProduction
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', clientKey);
        script.async = true;
        script.onload = () => {
            setSnapReady(true);
        };
        document.body.appendChild(script);
        scriptRef.current = script;

        return () => {
            if (scriptRef.current) {
                document.body.removeChild(scriptRef.current);
            }
        };
    }, [clientKey, isProduction]);

    // Auto-open popup once Snap JS is ready
    useEffect(() => {
        if (snapReady) {
            openSnap();
        }
    }, [snapReady]);

    const openSnap = () => {
        if (!window.snap) return;
        setPaying(true);
        window.snap.pay(snapToken, {
            onSuccess: () => {
                toast.success('Pembayaran berhasil! Pemesanan Anda telah dikonfirmasi.');
                router.visit('/bookings', { replace: true });
            },
            onPending: () => {
                toast.success('Menunggu konfirmasi pembayaran. Cek riwayat pemesanan Anda.');
                router.visit('/bookings', { replace: true });
            },
            onError: () => {
                toast.error('Pembayaran gagal. Silakan coba lagi.');
                setPaying(false);
            },
            onClose: () => {
                setPaying(false);
            },
        });
    };

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Selesaikan Pembayaran" />

            <div className="flex flex-1 flex-col items-center gap-6 p-6">
                <div className="w-full max-w-md space-y-5">

                    <div>
                        <h1 className="text-2xl font-bold">Selesaikan Pembayaran</h1>
                        <p className="text-muted-foreground mt-1">Selesaikan pembayaran untuk mengkonfirmasi pesanan Anda.</p>
                    </div>

                    {/* Booking Summary */}
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <div className="bg-primary/8 px-5 py-3 border-b">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">Ringkasan Pesanan #{booking.id}</span>
                        </div>
                        <div className="divide-y p-0">
                            <div className="flex items-center gap-3 px-5 py-3.5">
                                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Venue</p>
                                    <p className="font-semibold">{booking.venue.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-3.5">
                                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Lapangan</p>
                                    <p className="font-semibold">
                                        {booking.court.name}
                                        <span className={`ml-2 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                                            booking.court.place === 'indoor'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                            {booking.court.place === 'indoor' ? 'Indoor' : 'Outdoor'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-3.5">
                                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Tanggal</p>
                                    <p className="font-semibold">{formatDate(booking.booking_date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-3.5">
                                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Waktu</p>
                                    <p className="font-semibold">{booking.start_time} – {booking.end_time}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between bg-primary/5 px-5 py-4 border-t">
                            <span className="font-bold">Total Bayar</span>
                            <span className="text-2xl font-bold text-primary">{formatPrice(booking.total_price)}</span>
                        </div>
                    </div>

                    {/* Pay button */}
                    <Button
                        onClick={openSnap}
                        disabled={!snapReady || paying}
                        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    >
                        {!snapReady ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />
                                Memuat payment gateway...
                            </>
                        ) : paying ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />
                                Menunggu pembayaran...
                            </>
                        ) : (
                            <>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Bayar Sekarang
                            </>
                        )}
                    </Button>

                    {/* Expiry note */}
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700">
                            Selesaikan pembayaran dalam <strong>24 jam</strong> sejak pemesanan dibuat.
                            Lewat dari itu, pesanan akan otomatis dibatalkan.
                        </p>
                    </div>

                    <Link href="/bookings" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Kembali ke Pemesanan Saya
                    </Link>
                </div>
            </div>
        </CustomerLayout>
    );
}
