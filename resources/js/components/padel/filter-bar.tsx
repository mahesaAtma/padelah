import { Search, SlidersHorizontal, Navigation } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterBarProps {
    onSearch: (query: string) => void;
    onFilterChange?: (filters: FilterState) => void;
    onNearMe?: (coords: { lat: number; lng: number } | null) => void;
    className?: string;
}

export interface FilterState {
    type: 'all' | 'indoor' | 'outdoor';
    official: 'all' | 'official' | 'community';
}

const typeOptions = [
    { value: 'all' as const, label: 'Semua Tipe' },
    { value: 'indoor' as const, label: 'Indoor' },
    { value: 'outdoor' as const, label: 'Outdoor' },
];

const officialOptions = [
    { value: 'all' as const, label: 'Semua Venue' },
    { value: 'official' as const, label: 'Resmi' },
    { value: 'community' as const, label: 'Komunitas' },
];

export function FilterBar({ onSearch, onFilterChange, onNearMe, className }: FilterBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({ type: 'all', official: 'all' });
    const [showFilters, setShowFilters] = useState(false);
    const [nearMeActive, setNearMeActive] = useState(false);
    const [nearMeLoading, setNearMeLoading] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const handleNearMe = () => {
        if (nearMeActive) {
            // Turn off
            setNearMeActive(false);
            onNearMe?.(null);
            return;
        }

        if (!navigator.geolocation) {
            alert('Browser Anda tidak mendukung geolokasi.');
            return;
        }

        setNearMeLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setNearMeActive(true);
                setNearMeLoading(false);
                onNearMe?.({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                setNearMeLoading(false);
                if (error.code === error.PERMISSION_DENIED) {
                    alert('Izin lokasi ditolak. Silakan aktifkan lokasi di pengaturan browser Anda.');
                } else {
                    alert('Gagal mendapatkan lokasi Anda.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    return (
        <div className={cn('space-y-3', className)}>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-padel-body" />
                    <input
                        type="text"
                        placeholder="Cari venue atau kota..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            onSearch(e.target.value);
                        }}
                        className="h-10 w-full rounded-lg border border-padel-divider bg-padel-card pl-10 pr-4 text-sm text-padel-dark placeholder:text-padel-body/50 focus:border-padel-primary/40 focus:ring-1 focus:ring-padel-primary/20 focus:outline-none"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleNearMe}
                    disabled={nearMeLoading}
                    className={cn(
                        'h-10 shrink-0 gap-1.5 border-padel-divider px-3 text-xs font-medium',
                        nearMeActive && 'bg-padel-primary text-white hover:bg-padel-primary/90 border-padel-primary',
                    )}
                >
                    <Navigation className="h-3.5 w-3.5" />
                    {nearMeActive ? 'Terdekat ✓' : 'Dekat Saya'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        'h-10 w-10 shrink-0 border-padel-divider cursor-pointer',
                        showFilters && 'bg-padel-primary/5 text-padel-primary',
                    )}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                </Button>
            </form>

            {/* Near Me Loading Overlay */}
            {nearMeLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="mx-4 flex flex-col items-center gap-4 rounded-2xl bg-gray-900 px-8 py-10 shadow-2xl ring-1 ring-white/10">
                        <div className="relative flex h-16 w-16 items-center justify-center">
                            <div className="absolute inset-0 animate-ping rounded-full bg-padel-primary/30" />
                            <div className="absolute inset-0 animate-pulse rounded-full bg-padel-primary/15" />
                            <Navigation className="h-8 w-8 text-padel-primary animate-bounce" />
                        </div>
                        <p className="max-w-xs text-center text-sm font-medium text-white">
                            🎾 Siapkan raket Anda, kami sedang mencari venue terdekat!
                        </p>
                        <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-padel-primary [animation-delay:0ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-padel-primary [animation-delay:150ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-padel-primary [animation-delay:300ms]" />
                        </div>
                    </div>
                </div>
            )}

            {/* Near Me Active Indicator */}
            {nearMeActive && (
                <div className="flex items-center gap-2 rounded-lg bg-padel-primary/5 px-3 py-2 text-xs text-padel-primary">
                    <Navigation className="h-3.5 w-3.5" />
                    <span className="font-medium">Diurutkan berdasarkan jarak dari lokasi Anda</span>
                    <button
                        onClick={() => {
                            setNearMeActive(false);
                            onNearMe?.(null);
                        }}
                        className="ml-auto text-padel-body hover:text-padel-dark"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Filter Options */}
            {showFilters && (
                <div className="flex flex-wrap gap-4">
                    {/* Type Filter */}
                    <div className="space-y-1.5">
                        <p className="text-xs font-medium text-padel-body">Tipe Lapangan</p>
                        <div className="flex gap-1">
                            {typeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => updateFilter('type', option.value)}
                                    className={cn(
                                        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                                        filters.type === option.value
                                            ? 'bg-padel-primary text-white'
                                            : 'bg-padel-light text-padel-body hover:bg-padel-divider',
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Official Filter */}
                    <div className="space-y-1.5">
                        <p className="text-xs font-medium text-padel-body">Status Venue</p>
                        <div className="flex gap-1">
                            {officialOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => updateFilter('official', option.value)}
                                    className={cn(
                                        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                                        filters.official === option.value
                                            ? 'bg-padel-primary text-white'
                                            : 'bg-padel-light text-padel-body hover:bg-padel-divider',
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
