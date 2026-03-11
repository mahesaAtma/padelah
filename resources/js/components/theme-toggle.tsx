import { Sun, Moon } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export function ThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    const toggleTheme = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-lg border border-padel-divider bg-padel-card px-3 py-1.5 text-sm font-medium text-padel-body transition-all hover:bg-padel-primary/10 hover:text-padel-dark cursor-pointer"
            title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
        >
            {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{isDark ? 'Terang' : 'Gelap'}</span>
        </button>
    );
}
