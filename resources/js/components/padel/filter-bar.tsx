import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterBarProps {
    onSearch: (query: string) => void;
    onFilterChange?: (filters: FilterState) => void;
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

export function FilterBar({ onSearch, onFilterChange, className }: FilterBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({ type: 'all', official: 'all' });
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
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
                        className="h-10 w-full rounded-lg border border-padel-divider bg-white pl-10 pr-4 text-sm text-padel-dark placeholder:text-padel-body/50 focus:border-padel-primary/40 focus:ring-1 focus:ring-padel-primary/20 focus:outline-none"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        'h-10 w-10 shrink-0 border-padel-divider',
                        showFilters && 'bg-padel-primary/5 text-padel-primary',
                    )}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                </Button>
            </form>

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
