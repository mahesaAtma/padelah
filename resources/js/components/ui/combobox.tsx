import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
    value: string;
    label: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    id?: string;
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = 'Pilih...',
    className,
    id,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Sync search text with external value
    React.useEffect(() => {
        const match = options.find((o) => o.value === value);
        setSearch(match ? match.label : value);
    }, [value, options]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = React.useMemo(() => {
        if (!search.trim()) return options;
        const q = search.toLowerCase();
        return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [search, options]);

    const handleSelect = (option: ComboboxOption) => {
        onChange(option.value);
        setSearch(option.label);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className="relative">
            <input
                ref={inputRef}
                id={id}
                type="text"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setOpen(true);
                    // If user clears, also clear the value
                    if (!e.target.value) {
                        onChange('');
                    }
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                autoComplete="off"
                className={cn(
                    'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:opacity-50 md:text-sm',
                    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                    className,
                )}
            />

            {open && filtered.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                    {filtered.slice(0, 50).map((option) => (
                        <li
                            key={option.value}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(option);
                            }}
                            className={cn(
                                'cursor-pointer rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                                option.value === value &&
                                'bg-accent text-accent-foreground',
                            )}
                        >
                            {option.label}
                        </li>
                    ))}
                    {filtered.length > 50 && (
                        <li className="px-3 py-2 text-xs text-muted-foreground">
                            Ketik untuk mempersempit hasil...
                        </li>
                    )}
                </ul>
            )}

            {open && filtered.length === 0 && search.trim() && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-md">
                    Tidak ditemukan.
                </div>
            )}
        </div>
    );
}
