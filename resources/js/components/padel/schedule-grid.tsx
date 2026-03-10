import { useState } from 'react';
import type { ScheduleSlot, Court } from '@/types/venue';
import { cn } from '@/lib/utils';

interface ScheduleGridProps {
    courts: Court[];
    schedule: ScheduleSlot[];
    onSlotClick?: (slot: ScheduleSlot) => void;
    className?: string;
}

const statusStyles: Record<ScheduleSlot['status'], string> = {
    available: 'bg-padel-accent/30 text-padel-dark hover:bg-padel-accent/50 cursor-pointer',
    selected: 'bg-padel-primary text-white',
    booked: 'bg-padel-danger/15 text-padel-danger/70 cursor-not-allowed',
    confirmed: 'bg-padel-success/20 text-padel-success cursor-not-allowed',
};

const statusLabels: Record<ScheduleSlot['status'], string> = {
    available: 'Tersedia',
    selected: 'Dipilih',
    booked: 'Terpesan',
    confirmed: 'Dikonfirmasi',
};

export function ScheduleGrid({ courts, schedule, onSlotClick, className }: ScheduleGridProps) {
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

    // Get unique times from schedule
    const times = Array.from(new Set(schedule.map((s) => s.time))).sort();

    const getSlot = (courtId: string, time: string): ScheduleSlot | undefined => {
        return schedule.find((s) => s.courtId === courtId && s.time === time);
    };

    const handleSlotClick = (slot: ScheduleSlot) => {
        if (slot.status === 'booked' || slot.status === 'confirmed') return;

        const newSelected = new Set(selectedSlots);
        if (newSelected.has(slot.id)) {
            newSelected.delete(slot.id);
        } else {
            newSelected.add(slot.id);
        }
        setSelectedSlots(newSelected);
        onSlotClick?.(slot);
    };

    const getEffectiveStatus = (slot: ScheduleSlot): ScheduleSlot['status'] => {
        if (selectedSlots.has(slot.id)) return 'selected';
        return slot.status;
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Legend */}
            <div className="flex flex-wrap gap-4">
                {(Object.keys(statusStyles) as ScheduleSlot['status'][]).map((status) => (
                    <div key={status} className="flex items-center gap-1.5">
                        <div
                            className={cn('h-3 w-3 rounded', statusStyles[status].split(' ').slice(0, 1).join(' '))}
                        />
                        <span className="text-xs text-padel-body">{statusLabels[status]}</span>
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                    {/* Header Row */}
                    <div
                        className="mb-1 grid gap-1"
                        style={{ gridTemplateColumns: `80px repeat(${courts.length}, 1fr)` }}
                    >
                        <div className="p-2 text-xs font-medium text-padel-body">Waktu</div>
                        {courts.map((court) => (
                            <div key={court.id} className="p-2 text-center text-xs font-medium text-padel-dark">
                                {court.name}
                            </div>
                        ))}
                    </div>

                    {/* Time Rows */}
                    {times.map((time) => (
                        <div
                            key={time}
                            className="mb-1 grid gap-1"
                            style={{ gridTemplateColumns: `80px repeat(${courts.length}, 1fr)` }}
                        >
                            <div className="flex items-center p-2 text-xs font-medium text-padel-body">{time}</div>
                            {courts.map((court) => {
                                const slot = getSlot(court.id, time);
                                if (!slot) return <div key={court.id} className="rounded bg-gray-50 p-2" />;

                                const effectiveStatus = getEffectiveStatus(slot);

                                return (
                                    <button
                                        key={court.id}
                                        onClick={() => handleSlotClick(slot)}
                                        disabled={slot.status === 'booked' || slot.status === 'confirmed'}
                                        className={cn(
                                            'rounded p-2 text-center text-xs font-medium transition-colors',
                                            statusStyles[effectiveStatus],
                                        )}
                                    >
                                        {slot.price ? `Rp ${(slot.price / 1000).toFixed(0)}k` : statusLabels[effectiveStatus]}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
