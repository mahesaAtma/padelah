import { cn } from '@/lib/utils';

interface FacilityTagProps {
    name: string;
    className?: string;
}

export function FacilityTag({ name, className }: FacilityTagProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full bg-padel-accent/20 px-2.5 py-0.5 text-xs font-medium text-padel-dark',
                className,
            )}
        >
            {name}
        </span>
    );
}
