import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Calendar, Clock, X, CheckCircle, MapPin, ChevronRight } from 'lucide-react';
import type { Venue, AvailableSlot } from '@/types/venue';

interface BookingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    venue: Venue;
}

function formatPrice(price: number): string {
    return 'Rp ' + price.toLocaleString('id-ID');
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatDateLong(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function BookingModal({ open, onOpenChange, venue }: BookingModalProps) {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);

    const todayStr = today.toISOString().split('T')[0];
    const maxDateStr = maxDate.toISOString().split('T')[0];

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedCourtId, setSelectedCourtId] = useState('');
    const [slots, setSlots] = useState<AvailableSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!open) {
            setSelectedDate('');
            setSelectedCourtId('');
            setSlots([]);
            setSelectedIds(new Set());
            setNotes('');
        }
    }, [open]);

    useEffect(() => {
        if (!selectedDate || !selectedCourtId) {
            setSlots([]);
            setSelectedIds(new Set());
            return;
        }
        const fetchSlots = async () => {
            setLoadingSlots(true);
            setSlots([]);
            setSelectedIds(new Set());
            try {
                const res = await fetch(`/venues/${venue.slug}/availability?date=${selectedDate}&court_id=${selectedCourtId}`);
                const data = await res.json();
                setSlots(data.slots ?? []);
            } catch {
                toast.error('Gagal memuat jadwal. Silakan coba lagi.');
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [selectedDate, selectedCourtId]);

    if (!open) return null;

    const selectedCourt = venue.courts.find((c) => c.id === selectedCourtId);

    const handleSlotClick = (slot: AvailableSlot) => {
        if (!slot.available) return;
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(slot.schedule_id)) {
                next.delete(slot.schedule_id);
            } else {
                next.add(slot.schedule_id);
            }
            return next;
        });
    };

    // Derive ordered selected slots from the slot list (preserves time order)
    const selectedSlots = slots.filter((s) => selectedIds.has(s.schedule_id));
    const totalPrice = selectedSlots.reduce((sum, s) => sum + s.price, 0);

    // For submission: use earliest start and latest end of selected slots
    const bookingStart = selectedSlots.length > 0 ? selectedSlots[0].start_time : null;
    const bookingEnd   = selectedSlots.length > 0 ? selectedSlots[selectedSlots.length - 1].end_time : null;

    const canSubmit = !!(selectedDate && selectedCourtId && selectedSlots.length > 0);

    const handleSubmit = () => {
        if (!bookingStart || !bookingEnd) return;
        setSubmitting(true);
        router.post('/bookings', {
            venue_id: venue.id,
            venue_court_id: parseInt(selectedCourtId),
            booking_date: selectedDate,
            start_time: bookingStart,
            end_time: bookingEnd,
            notes: notes || null,
        }, {
            onSuccess: () => {
                toast.success('Pesanan dikonfirmasi! Cek email Anda.');
                onOpenChange(false);
            },
            onError: (errors) => {
                toast.error((errors as Record<string, string>).booking ?? 'Terjadi kesalahan. Silakan coba lagi.');
            },
            onFinish: () => setSubmitting(false),
        });
    };

    // Slot hint text
    const slotHint = selectedSlots.length === 0
        ? 'Ketuk slot untuk memilih'
        : `${selectedSlots.length} slot dipilih`;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />

            {/* Modal */}
            <div className="relative z-10 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-padel-card shadow-2xl flex flex-col max-h-[92vh]">

                {/* ── Gradient Header ── */}
                <div className="relative shrink-0 overflow-hidden rounded-t-2xl bg-gradient-to-br from-padel-primary to-padel-primary/80 px-6 pt-5 pb-5">
                    {/* Decorative background blobs */}
                    <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/[0.06]" />
                    <div className="pointer-events-none absolute right-6 bottom-0 h-16 w-16 translate-y-1/2 rounded-full bg-white/[0.06]" />

                    {/* Venue info + close */}
                    <div className="relative flex items-start justify-between mb-4">
                        <div className="min-w-0 pr-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50 mb-0.5">Pesan Lapangan</p>
                            <h2 className="text-lg font-bold text-white leading-snug truncate">{venue.name}</h2>
                            <div className="flex items-center gap-1 mt-1 text-white/55 text-xs">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{venue.location}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="shrink-0 rounded-full p-1.5 text-white/60 hover:text-white hover:bg-white/15 transition-all"
                            aria-label="Tutup"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Progress chips */}
                    <div className="relative flex items-center gap-1 flex-wrap">
                        {/* Date chip */}
                        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                            selectedDate ? 'bg-white/25 text-white' : 'bg-white/10 text-white/45'
                        }`}>
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>{selectedDate ? formatDate(selectedDate) : 'Tanggal'}</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-white/20 shrink-0" />
                        {/* Court chip */}
                        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                            selectedCourtId ? 'bg-white/25 text-white' : 'bg-white/10 text-white/45'
                        }`}>
                            <span>{selectedCourt ? selectedCourt.name : 'Lapangan'}</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-white/20 shrink-0" />
                        {/* Time chip */}
                        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                            selectedSlots.length > 0 ? 'bg-white/25 text-white' : 'bg-white/10 text-white/45'
                        }`}>
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{selectedSlots.length > 0 ? `${bookingStart} – ${bookingEnd}` : 'Waktu'}</span>
                        </div>
                    </div>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                    {/* ── Section: Date ── */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-padel-primary shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider text-padel-body">Tanggal Bermain</span>
                            {selectedDate && <CheckCircle className="h-3.5 w-3.5 text-padel-success ml-auto" />}
                        </div>
                        <input
                            type="date"
                            min={todayStr}
                            max={maxDateStr}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full rounded-xl border-2 border-padel-divider bg-padel-card text-padel-dark px-4 py-2.5 text-sm font-medium focus:border-padel-primary focus:outline-none transition-colors cursor-pointer"
                        />
                    </div>

                    {/* ── Section: Court ── */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-padel-body">Pilih Lapangan</span>
                            {selectedCourtId && <CheckCircle className="h-3.5 w-3.5 text-padel-success ml-auto" />}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {venue.courts.map((court) => (
                                <button
                                    key={court.id}
                                    onClick={() => setSelectedCourtId(court.id)}
                                    className={`relative flex flex-col items-start rounded-xl border-2 px-4 py-3 text-left transition-all ${
                                        selectedCourtId === court.id
                                            ? 'border-padel-primary bg-padel-primary/5 shadow-sm shadow-padel-primary/10'
                                            : 'border-padel-divider bg-padel-card hover:border-padel-primary/40 hover:bg-padel-primary/[0.03]'
                                    }`}
                                >
                                    {selectedCourtId === court.id && (
                                        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-padel-primary" />
                                    )}
                                    <span className="text-sm font-semibold text-padel-dark pr-4">{court.name}</span>
                                    <span className="flex items-center gap-1.5 mt-1 text-[11px]">
                                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${court.type === 'indoor' ? 'bg-blue-400' : 'bg-green-400'}`} />
                                        <span className="text-padel-body/70">{court.type === 'indoor' ? 'Indoor' : 'Outdoor'}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Section: Time Slots (auto-appears) ── */}
                    {selectedDate && selectedCourtId && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-padel-primary shrink-0" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-padel-body">Pilih Waktu</span>
                                    {selectedSlots.length > 0 && <CheckCircle className="h-3.5 w-3.5 text-padel-success" />}
                                </div>
                                <span className="text-[11px] text-padel-body/55 shrink-0">{slotHint}</span>
                            </div>

                            {loadingSlots ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2.5">
                                    <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-padel-primary/20 border-t-padel-primary" />
                                    <p className="text-xs text-padel-body/50">Memuat jadwal...</p>
                                </div>
                            ) : slots.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-padel-divider py-8 gap-2">
                                    <Clock className="h-7 w-7 text-padel-body/25" />
                                    <p className="text-sm font-medium text-padel-body/60">Tidak ada jadwal tersedia</p>
                                    <p className="text-xs text-padel-body/40">Coba tanggal atau lapangan lain</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {slots.map((slot) => {
                                        const isSelected = selectedIds.has(slot.schedule_id);
                                        return (
                                            <button
                                                key={slot.schedule_id}
                                                onClick={() => handleSlotClick(slot)}
                                                disabled={!slot.available}
                                                className={`relative flex flex-col rounded-xl border-2 p-2.5 text-left transition-all ${
                                                    !slot.available
                                                        ? 'border-padel-divider/40 bg-padel-light/40 cursor-not-allowed'
                                                        : isSelected
                                                        ? 'border-padel-primary bg-padel-primary shadow-lg shadow-padel-primary/25 scale-[1.02]'
                                                        : 'border-padel-divider bg-padel-card hover:border-padel-primary/50 hover:shadow-sm hover:scale-[1.01] cursor-pointer'
                                                }`}
                                            >
                                                {/* Selected checkmark */}
                                                {isSelected && (
                                                    <span className="absolute top-1.5 right-1.5">
                                                        <CheckCircle className="h-3 w-3 text-white/80" />
                                                    </span>
                                                )}
                                                <span className={`text-sm font-bold leading-none ${isSelected ? 'text-white' : slot.available ? 'text-padel-dark' : 'text-padel-body/25'}`}>
                                                    {slot.start_time}
                                                </span>
                                                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/65' : slot.available ? 'text-padel-body/55' : 'text-padel-body/20'}`}>
                                                    – {slot.end_time}
                                                </span>
                                                <span className={`text-[10px] font-semibold mt-2 ${
                                                    !slot.available
                                                        ? 'text-padel-body/25 line-through'
                                                        : isSelected
                                                        ? 'text-white'
                                                        : 'text-padel-primary'
                                                }`}>
                                                    {slot.available ? formatPrice(slot.price) : 'Dipesan'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Booking Summary (receipt-style) ── */}
                    {selectedSlots.length > 0 && (
                        <div className="overflow-hidden rounded-xl ring-1 ring-inset ring-padel-primary/20">
                            {/* Summary header */}
                            <div className="bg-padel-primary/8 px-4 py-2.5 border-b border-padel-primary/10">
                                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-padel-primary">Ringkasan Pesanan</span>
                            </div>
                            {/* Summary rows */}
                            <div className="divide-y divide-padel-primary/8">
                                <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                                    <span className="text-padel-body/70">Lapangan</span>
                                    <span className="font-semibold text-padel-dark">{selectedCourt?.name}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                                    <span className="text-padel-body/70">Tanggal</span>
                                    <span className="font-semibold text-padel-dark">{formatDateLong(selectedDate)}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                                    <span className="text-padel-body/70">Waktu</span>
                                    <span className="font-semibold text-padel-dark">
                                        {bookingStart} – {bookingEnd}
                                        <span className="ml-1 text-xs font-normal text-padel-body/60">({selectedSlots.length} slot)</span>
                                    </span>
                                </div>
                            </div>
                            {/* Total row */}
                            <div className="flex items-center justify-between bg-padel-primary/5 px-4 py-3 border-t border-padel-primary/15">
                                <span className="text-sm font-bold text-padel-dark">Total Bayar</span>
                                <span className="text-xl font-bold text-padel-primary">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>
                    )}

                    {/* ── Notes ── */}
                    {selectedSlots.length > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-padel-body">
                                    Catatan <span className="normal-case font-normal text-padel-body/60">(opsional)</span>
                                </label>
                                <span className="text-[10px] text-padel-body/40">{notes.length}/500</span>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                maxLength={500}
                                placeholder="Misal: butuh raket extra, dll."
                                className="w-full rounded-xl border-2 border-padel-divider bg-padel-card text-padel-dark placeholder:text-padel-body/35 px-4 py-2.5 text-sm resize-none focus:border-padel-primary focus:outline-none transition-colors"
                            />
                        </div>
                    )}

                    <div className="h-1" />
                </div>

                {/* ── Footer ── */}
                <div className="shrink-0 border-t border-padel-divider bg-padel-card px-6 pt-4 pb-5 space-y-3">
                    {/* Trust badge */}
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-padel-body/50">
                        <CheckCircle className="h-3.5 w-3.5 text-padel-success/70" />
                        <span>Konfirmasi instan · Bayar di venue saat hadir</span>
                    </div>
                    {/* CTA button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || submitting}
                        className={`w-full h-12 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                            canSubmit && !submitting
                                ? 'bg-padel-primary text-white shadow-lg shadow-padel-primary/30 hover:bg-padel-primary/90 active:scale-[0.99]'
                                : 'bg-padel-light text-padel-body/40 cursor-not-allowed'
                        }`}
                    >
                        {submitting ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                <span>Memproses...</span>
                            </>
                        ) : canSubmit ? (
                            <>
                                <CheckCircle className="h-4 w-4 shrink-0" />
                                <span>Konfirmasi Pesanan · {formatPrice(totalPrice)}</span>
                            </>
                        ) : (
                            <span>Lengkapi pilihan di atas</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
