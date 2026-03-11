import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface LoginModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
    const [phone, setPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length >= 10) {
            setOtpSent(true);
        }
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        // UI only — no real verification
        onOpenChange(false);
        setPhone('');
        setOtp('');
        setOtpSent(false);
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            setPhone('');
            setOtp('');
            setOtpSent(false);
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-padel-dark">
                        {otpSent ? 'Masukkan kode verifikasi' : 'Masuk untuk melanjutkan'}
                    </DialogTitle>
                    <DialogDescription>
                        {otpSent
                            ? `Kami telah mengirim kode ke ${phone}`
                            : 'Masukkan nomor telepon Anda untuk memesan lapangan atau menyimpan favorit.'}
                    </DialogDescription>
                </DialogHeader>

                {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium text-padel-dark">
                                Nomor Telepon
                            </label>
                            <div className="relative">
                                <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-padel-body" />
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="+62 812 3456 7890"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="h-10 w-full rounded-lg border border-padel-divider bg-padel-card pl-10 pr-4 text-sm text-padel-dark placeholder:text-padel-body/50 focus:border-padel-primary/40 focus:ring-1 focus:ring-padel-primary/20 focus:outline-none"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-padel-primary text-white hover:bg-padel-primary/90"
                            disabled={phone.length < 10}
                        >
                            Kirim OTP
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="otp" className="text-sm font-medium text-padel-dark">
                                Kode Verifikasi
                            </label>
                            <input
                                id="otp"
                                type="text"
                                placeholder="Masukkan 6 digit kode"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                className="h-10 w-full rounded-lg border border-padel-divider bg-padel-card px-4 text-center text-lg tracking-[0.3em] text-padel-dark placeholder:text-padel-body/50 placeholder:tracking-normal placeholder:text-sm focus:border-padel-primary/40 focus:ring-1 focus:ring-padel-primary/20 focus:outline-none"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-padel-primary text-white hover:bg-padel-primary/90"
                            disabled={otp.length < 6}
                        >
                            Verifikasi & Lanjutkan
                        </Button>
                        <button
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="w-full text-center text-sm text-padel-body hover:text-padel-primary"
                        >
                            Gunakan nomor lain
                        </button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
