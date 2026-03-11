import { useState, useRef, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { useAuthModal } from '@/contexts/auth-modal-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Phone,
    MessageCircle,
    Mail,
    ArrowLeft,
    ChevronRight,
    Building2,
    UserCircle,
} from 'lucide-react';

type AuthStep = 'role-select' | 'phone' | 'otp' | 'email' | 'register-email';
type OtpChannel = 'whatsapp' | 'sms';
type UserRole = 'venue-admin' | 'customer';

// ──────────────────────────────────────────────
// Google icon SVG (no lucide equivalent)
// ──────────────────────────────────────────────
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
                fill="#EA4335"
            />
        </svg>
    );
}

// ──────────────────────────────────────────────
// Divider with text
// ──────────────────────────────────────────────
function Divider({ text }: { text: string }) {
    return (
        <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-padel-divider" />
            <span className="mx-3 flex-shrink text-xs text-padel-body/60">
                {text}
            </span>
            <div className="flex-grow border-t border-padel-divider" />
        </div>
    );
}

// ──────────────────────────────────────────────
// Step 1: Phone number input (default)
// ──────────────────────────────────────────────
function PhoneStep({
    onSendOtp,
    onSwitchToEmail,
    onSwitchToGoogle,
    isLogin,
    onToggleMode,
}: {
    onSendOtp: (phone: string, channel: OtpChannel) => void;
    onSwitchToEmail: () => void;
    onSwitchToGoogle: () => void;
    isLogin: boolean;
    onToggleMode: () => void;
}) {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    const formatPhone = (value: string) => {
        // Strip non-digits
        const digits = value.replace(/\D/g, '');
        return digits;
    };

    const handleSend = (channel: OtpChannel) => {
        const digits = formatPhone(phone);
        if (digits.length < 10) {
            setError('Nomor telepon minimal 10 digit.');
            return;
        }
        if (digits.length > 15) {
            setError('Nomor telepon terlalu panjang.');
            return;
        }
        setError('');
        onSendOtp(digits, channel);
    };

    return (
        <div className="flex flex-col gap-7">
            {/* Phone number input */}
            <div className="grid gap-3">
                <Label htmlFor="auth-phone" className="text-padel-dark font-medium">Nomor Telepon</Label>
                <div className="flex gap-2">
                    <div className="flex h-9 items-center rounded-md border border-padel-divider bg-padel-light px-3 text-sm text-padel-body">
                        +62
                    </div>
                    <Input
                        id="auth-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                            setPhone(e.target.value);
                            setError('');
                        }}
                        placeholder="812 3456 7890"
                        autoFocus
                        className="flex-1 border-padel-divider bg-padel-card text-padel-dark placeholder:text-padel-body/60"
                    />
                </div>
                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
            </div>

            {/* Send OTP buttons */}
            <div className="flex flex-col gap-4">
                <Button
                    type="button"
                    onClick={() => handleSend('whatsapp')}
                    className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#25D366]/90"
                >
                    <MessageCircle className="h-4 w-4" />
                    Kirim OTP via WhatsApp
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSend('sms')}
                    className="w-full gap-2 border-padel-divider bg-padel-card text-padel-dark hover:bg-padel-light"
                >
                    <Phone className="h-4 w-4" />
                    Kirim OTP via SMS
                </Button>
            </div>

            <Divider text="atau masuk dengan" />

            {/* Alternative methods */}
            <div className="flex flex-col gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onSwitchToEmail}
                    className="w-full gap-2 border-padel-divider bg-padel-card text-padel-dark hover:bg-padel-light"
                >
                    <Mail className="h-4 w-4" />
                    {isLogin
                        ? 'Masuk dengan Email & Password'
                        : 'Daftar dengan Email & Password'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onSwitchToGoogle}
                    className="w-full gap-2 border-padel-divider bg-padel-card text-padel-dark hover:bg-padel-light"
                >
                    <GoogleIcon className="h-4 w-4" />
                    {isLogin
                        ? 'Masuk dengan Google'
                        : 'Daftar dengan Google'}
                </Button>
            </div>

            {/* Toggle login/register */}
            <p className="text-center text-sm text-padel-body">
                {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                <button
                    type="button"
                    onClick={onToggleMode}
                    className="font-medium text-padel-primary hover:underline"
                >
                    {isLogin ? 'Daftar' : 'Masuk'}
                </button>
            </p>
        </div>
    );
}

// ──────────────────────────────────────────────
// Step 2: OTP verification
// ──────────────────────────────────────────────
function OtpStep({
    phone,
    channel,
    onBack,
    onVerified,
}: {
    phone: string;
    channel: OtpChannel;
    onBack: () => void;
    onVerified: () => void;
}) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError('');

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all filled
        if (newOtp.every((d) => d !== '') && index === 5) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, 6);
        if (pasted.length === 6) {
            const newOtp = pasted.split('');
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
            handleVerify(pasted);
        }
    };

    const handleVerify = (code: string) => {
        setProcessing(true);
        // TODO: POST to /api/auth/otp/verify with { phone, code }
        // For now, simulate API call
        router.post(
            '/api/auth/otp/verify',
            { phone, code, channel },
            {
                onSuccess: () => {
                    onVerified();
                },
                onError: (errors) => {
                    setError(
                        (errors as Record<string, string>).code ??
                        'Kode OTP tidak valid atau sudah kedaluwarsa.',
                    );
                    setProcessing(false);
                },
            },
        );
    };

    const handleResend = () => {
        setCountdown(60);
        // TODO: POST to /api/auth/otp/send to resend
        router.post('/api/auth/otp/send', { phone, channel });
    };

    const displayPhone =
        phone.length > 4
            ? `+62 ${phone.slice(0, 3)}•••••${phone.slice(-3)}`
            : `+62 ${phone}`;

    const channelLabel = channel === 'whatsapp' ? 'WhatsApp' : 'SMS';

    return (
        <div className="flex flex-col gap-8">
            {/* Back button */}
            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1 self-start text-sm text-padel-body/60 transition-colors hover:text-padel-dark"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali
            </button>

            {/* Info text */}
            <div className="text-center">
                <p className="text-sm text-padel-body">
                    Kode OTP telah dikirim via{' '}
                    <span className="font-medium text-padel-dark">
                        {channelLabel}
                    </span>{' '}
                    ke
                </p>
                <p className="mt-1 text-base font-semibold text-padel-dark">
                    {displayPhone}
                </p>
            </div>

            {/* OTP inputs */}
            <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        ref={(el) => {
                            inputRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={i === 0 ? handlePaste : undefined}
                        className="h-12 w-10 rounded-lg border border-padel-divider bg-padel-card text-padel-dark text-center text-lg font-semibold transition-colors focus:border-padel-primary focus:outline-none focus:ring-2 focus:ring-padel-primary/20 sm:h-14 sm:w-12"
                    />
                ))}
            </div>

            {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
            )}

            {/* Verify button */}
            <Button
                type="button"
                onClick={() => handleVerify(otp.join(''))}
                disabled={processing || otp.some((d) => d === '')}
                className="w-full"
            >
                {processing ? 'Memverifikasi...' : 'Verifikasi'}
            </Button>

            {/* Resend */}
            <p className="text-center text-sm text-padel-body">
                Tidak menerima kode?{' '}
                {countdown > 0 ? (
                    <span className="text-padel-body/60">
                        Kirim ulang dalam {countdown}s
                    </span>
                ) : (
                    <button
                        type="button"
                        onClick={handleResend}
                        className="font-medium text-padel-primary hover:underline"
                    >
                        Kirim ulang
                    </button>
                )}
            </p>
        </div>
    );
}

// ──────────────────────────────────────────────
// Email & Password Login
// ──────────────────────────────────────────────
function EmailLoginForm({ onBack }: { onBack: () => void }) {
    const { close } = useAuthModal();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onSuccess: () => {
                reset();
                close();
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1 self-start text-sm text-padel-body/60 transition-colors hover:text-padel-dark"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali
            </button>

            <div className="grid gap-2">
                <Label htmlFor="email-login-email" className="text-padel-dark font-medium">Email</Label>
                <Input
                    id="email-login-email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="email@contoh.com"
                    autoFocus
                    required
                    className="border-padel-divider bg-padel-card text-padel-dark placeholder:text-padel-body/60"
                />
                <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email-login-password" className="text-padel-dark font-medium">Password</Label>
                <Input
                    id="email-login-password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Password"
                    required
                    className="border-padel-divider bg-padel-card text-padel-dark placeholder:text-padel-body/60"
                />
                <InputError message={errors.password} />
            </div>

            <div className="flex items-center space-x-3">
                <Checkbox
                    id="email-login-remember"
                    checked={data.remember}
                    onCheckedChange={(checked) =>
                        setData('remember', checked === true)
                    }
                />
                <Label htmlFor="email-login-remember" className="text-sm text-padel-dark">
                    Ingat saya
                </Label>
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
                {processing ? 'Memproses...' : 'Masuk'}
            </Button>
        </form>
    );
}

// ──────────────────────────────────────────────
// Email & Password Register (with role)
// ──────────────────────────────────────────────
function EmailRegisterForm({ onBack, role }: { onBack: () => void; role: UserRole }) {
    const { close } = useAuthModal();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        type: role,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register', {
            onSuccess: () => {
                reset();
                close();
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1 self-start text-sm text-padel-body/60 transition-colors hover:text-padel-dark"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali
            </button>

            <div className="grid gap-2">
                <Label htmlFor="register-name" className="text-padel-dark font-medium">Nama</Label>
                <Input
                    id="register-name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Nama lengkap"
                    autoFocus
                    required
                    className="border-padel-divider bg-padel-card text-padel-dark placeholder:text-padel-body/60"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="register-email" className="text-padel-dark font-medium">Email</Label>
                <Input
                    id="register-email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="email@contoh.com"
                    required
                    className="border-padel-divider bg-padel-card text-padel-dark placeholder:text-padel-body/60"
                />
                <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="register-password" className="text-padel-dark font-medium">Password</Label>
                <Input
                    id="register-password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Minimal 8 karakter"
                    required
                    className="border-padel-divider bg-padel-card text-padel-dark placeholder:text-padel-body/60"
                />
                <InputError message={errors.password} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="register-password-confirm" className="text-padel-dark font-medium">
                    Konfirmasi Password
                </Label>
                <Input
                    id="register-password-confirm"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    placeholder="Ulangi password"
                    required
                    className="border-padel-divider bg-padel-card text-padel-dark placeholder:text-padel-body/60"
                />
                <InputError message={errors.password_confirmation} />
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
                {processing ? 'Memproses...' : 'Buat Akun'}
            </Button>
        </form>
    );
}

// ──────────────────────────────────────────────
// Role selection step
// ──────────────────────────────────────────────
function RoleSelectStep({
    onSelectRole,
    isLogin,
    onToggleMode,
}: {
    onSelectRole: (role: UserRole) => void;
    isLogin: boolean;
    onToggleMode: () => void;
}) {
    return (
        <div className="flex flex-col gap-7">
            <p className="text-sm text-padel-body">
                {isLogin ? 'Pilih jenis akun Anda:' : 'Anda ingin mendaftar sebagai:'}
            </p>

            <div className="flex flex-col gap-4">
                <button
                    type="button"
                    onClick={() => onSelectRole('customer')}
                    className="cursor-pointer flex items-center gap-4 rounded-xl border border-padel-divider bg-padel-card p-4 text-left transition-all hover:border-padel-primary hover:bg-padel-primary/5 hover:shadow-sm"
                >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-padel-primary/10">
                        <UserCircle className="h-6 w-6 text-padel-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-padel-dark">Customer</p>
                        <p className="text-sm text-padel-body">
                            Cari dan pesan lapangan padel
                        </p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 text-padel-body/60" />
                </button>

                <button
                    type="button"
                    onClick={() => onSelectRole('venue-admin')}
                    className="cursor-pointer flex items-center gap-4 rounded-xl border border-padel-divider bg-padel-card p-4 text-left transition-all hover:border-padel-primary hover:bg-padel-primary/5 hover:shadow-sm"
                >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                        <Building2 className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-padel-dark">Venue Admin</p>
                        <p className="text-sm text-padel-body">
                            Kelola dan publikasikan venue Anda
                        </p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 text-padel-body/60" />
                </button>
            </div>

            {/* Toggle login/register */}
            <p className="text-center text-sm text-padel-body">
                {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                <button
                    type="button"
                    onClick={onToggleMode}
                    className="font-medium text-padel-primary hover:underline"
                >
                    {isLogin ? 'Daftar' : 'Masuk'}
                </button>
            </p>
        </div>
    );
}

// ──────────────────────────────────────────────
// Main modal orchestrator
// ──────────────────────────────────────────────
export default function AuthModal() {
    const { view, close, switchTo } = useAuthModal();
    const [step, setStep] = useState<AuthStep>('role-select');
    const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
    const [otpPhone, setOtpPhone] = useState('');
    const [otpChannel, setOtpChannel] = useState<OtpChannel>('whatsapp');

    const isLogin = view === 'login';

    // Reset state when modal opens/closes or view switches
    useEffect(() => {
        if (view) {
            setStep('role-select');
            setSelectedRole('customer');
            setOtpPhone('');
            setOtpChannel('whatsapp');
        }
    }, [view]);

    const handleRoleSelected = (role: UserRole) => {
        setSelectedRole(role);
        setStep('phone');
    };

    const handleSendOtp = (phone: string, channel: OtpChannel) => {
        setOtpPhone(phone);
        setOtpChannel(channel);
        // TODO: POST to /api/auth/otp/send to trigger actual OTP sending
        // router.post('/api/auth/otp/send', { phone, channel });
        setStep('otp');
    };

    const handleOtpVerified = () => {
        // On success, Inertia will redirect / reload the page
        close();
    };

    const handleGoogleLogin = () => {
        // Encode both the return URL and the selected role in the state param
        const stateData = JSON.stringify({
            returnUrl: window.location.href,
            role: selectedRole,
        });

        const params = new URLSearchParams({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
            response_type: 'code',
            scope: [
                'openid',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ].join(' '),
            state: stateData,
            access_type: 'offline',
            prompt: 'select_account',
        });

        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    };

    const getTitle = () => {
        switch (step) {
            case 'role-select':
                return isLogin ? 'Masuk ke Padelah' : 'Daftar di Padelah';
            case 'phone':
                return isLogin ? 'Masuk ke Padelah' : 'Daftar di Padelah';
            case 'otp':
                return 'Verifikasi OTP';
            case 'email':
                return 'Masuk dengan Email';
            case 'register-email':
                return 'Daftar dengan Email';
        }
    };

    const getDescription = () => {
        const roleLabel = selectedRole === 'venue-admin' ? 'Venue Admin' : 'Customer';
        switch (step) {
            case 'role-select':
                return isLogin
                    ? 'Pilih jenis akun untuk melanjutkan.'
                    : 'Pilih jenis akun yang ingin Anda buat.';
            case 'phone':
                return isLogin
                    ? `Masuk sebagai ${roleLabel} dengan nomor telepon.`
                    : `Daftar sebagai ${roleLabel} dengan nomor telepon.`;
            case 'otp':
                return 'Masukkan 6 digit kode verifikasi.';
            case 'email':
                return `Masuk sebagai ${roleLabel} dengan email dan password.`;
            case 'register-email':
                return `Daftar sebagai ${roleLabel}. Isi data berikut.`;
        }
    };

    return (
        <Dialog open={view !== null} onOpenChange={(open) => !open && close()}>
            <DialogContent className="sm:max-w-lg bg-padel-card text-padel-dark border-padel-divider p-10 gap-8 [&_[data-slot=dialog-close]]:text-padel-body">
                <DialogHeader className="gap-3">
                    <DialogTitle className="text-2xl text-padel-dark">{getTitle()}</DialogTitle>
                    <DialogDescription className="text-padel-body text-base">{getDescription()}</DialogDescription>
                </DialogHeader>

                {step === 'role-select' && (
                    <RoleSelectStep
                        onSelectRole={handleRoleSelected}
                        isLogin={isLogin}
                        onToggleMode={() =>
                            switchTo(isLogin ? 'register' : 'login')
                        }
                    />
                )}

                {step === 'phone' && (
                    <PhoneStep
                        onSendOtp={handleSendOtp}
                        onSwitchToEmail={() =>
                            setStep(isLogin ? 'email' : 'register-email')
                        }
                        onSwitchToGoogle={handleGoogleLogin}
                        isLogin={isLogin}
                        onToggleMode={() =>
                            switchTo(isLogin ? 'register' : 'login')
                        }
                    />
                )}

                {step === 'otp' && (
                    <OtpStep
                        phone={otpPhone}
                        channel={otpChannel}
                        onBack={() => setStep('phone')}
                        onVerified={handleOtpVerified}
                    />
                )}

                {step === 'email' && (
                    <EmailLoginForm onBack={() => setStep('phone')} />
                )}

                {step === 'register-email' && (
                    <EmailRegisterForm
                        onBack={() => setStep('phone')}
                        role={selectedRole}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
