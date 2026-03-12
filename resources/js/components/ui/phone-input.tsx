import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CountryCode {
    code: string;
    name: string;
    dial: string;
    flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
    // Indonesia first (default)
    { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
    // Southeast Asia
    { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
    { code: 'SG', name: 'Singapura', dial: '+65', flag: '🇸🇬' },
    { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭' },
    { code: 'PH', name: 'Filipina', dial: '+63', flag: '🇵🇭' },
    { code: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
    { code: 'MM', name: 'Myanmar', dial: '+95', flag: '🇲🇲' },
    { code: 'KH', name: 'Kamboja', dial: '+855', flag: '🇰🇭' },
    { code: 'LA', name: 'Laos', dial: '+856', flag: '🇱🇦' },
    { code: 'BN', name: 'Brunei', dial: '+673', flag: '🇧🇳' },
    { code: 'TL', name: 'Timor Leste', dial: '+670', flag: '🇹🇱' },
    // Asia Pacific
    { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
    { code: 'NZ', name: 'Selandia Baru', dial: '+64', flag: '🇳🇿' },
    { code: 'JP', name: 'Jepang', dial: '+81', flag: '🇯🇵' },
    { code: 'KR', name: 'Korea Selatan', dial: '+82', flag: '🇰🇷' },
    { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
    { code: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰' },
    { code: 'TW', name: 'Taiwan', dial: '+886', flag: '🇹🇼' },
    { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
    { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
    { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩' },
    // Middle East
    { code: 'SA', name: 'Arab Saudi', dial: '+966', flag: '🇸🇦' },
    { code: 'AE', name: 'Uni Emirat Arab', dial: '+971', flag: '🇦🇪' },
    { code: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦' },
    { code: 'KW', name: 'Kuwait', dial: '+965', flag: '🇰🇼' },
    // Americas
    { code: 'US', name: 'Amerika Serikat', dial: '+1', flag: '🇺🇸' },
    { code: 'CA', name: 'Kanada', dial: '+1', flag: '🇨🇦' },
    { code: 'BR', name: 'Brasil', dial: '+55', flag: '🇧🇷' },
    // Europe
    { code: 'GB', name: 'Inggris', dial: '+44', flag: '🇬🇧' },
    { code: 'DE', name: 'Jerman', dial: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'Prancis', dial: '+33', flag: '🇫🇷' },
    { code: 'NL', name: 'Belanda', dial: '+31', flag: '🇳🇱' },
    { code: 'IT', name: 'Italia', dial: '+39', flag: '🇮🇹' },
    { code: 'ES', name: 'Spanyol', dial: '+34', flag: '🇪🇸' },
];

function parsePhone(value: string): { dial: string; number: string } {
    if (!value) return { dial: '+62', number: '' };

    // Sort by longest dial code first to avoid prefix collisions (e.g. +1 vs +62)
    const sorted = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length);
    for (const country of sorted) {
        if (value.startsWith(country.dial)) {
            return { dial: country.dial, number: value.slice(country.dial.length) };
        }
    }

    // Value doesn't start with any known code — keep as-is under default code
    return { dial: '+62', number: value };
}

interface PhoneInputProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function PhoneInput({ id, value, onChange, className }: PhoneInputProps) {
    const initial = parsePhone(value);
    const [dialCode, setDialCode] = useState(initial.dial);
    const [number, setNumber] = useState(initial.number);

    const handleDialChange = (newDial: string) => {
        setDialCode(newDial);
        onChange(newDial + number);
    };

    const handleNumberChange = (newNumber: string) => {
        // Allow digits, spaces, hyphens
        const cleaned = newNumber.replace(/[^\d\s-]/g, '');
        setNumber(cleaned);
        onChange(dialCode + cleaned);
    };

    return (
        <div
            className={cn(
                'border-input focus-within:border-ring focus-within:ring-ring/50 flex h-9 w-full overflow-hidden rounded-md border shadow-xs transition-[color,box-shadow] focus-within:ring-[3px]',
                className,
            )}
        >
            <select
                value={dialCode}
                onChange={(e) => handleDialChange(e.target.value)}
                aria-label="Kode negara"
                className="border-input bg-muted text-foreground cursor-pointer border-r px-2 text-sm focus:outline-none"
            >
                {COUNTRY_CODES.map((country) => (
                    <option key={`${country.code}-${country.dial}`} value={country.dial}>
                        {country.flag} {country.dial}
                    </option>
                ))}
            </select>
            <input
                id={id}
                type="tel"
                value={number}
                onChange={(e) => handleNumberChange(e.target.value)}
                placeholder="812 3456 7890"
                className="placeholder:text-muted-foreground flex-1 bg-transparent px-3 text-sm focus:outline-none"
            />
        </div>
    );
}
