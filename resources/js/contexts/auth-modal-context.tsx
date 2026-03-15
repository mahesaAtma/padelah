import { createContext, useContext, useState, useCallback } from 'react';

type AuthModalView = 'login' | 'register' | null;

interface AuthModalContextType {
    view: AuthModalView;
    returnUrl: string | null;
    openLogin: (returnUrl?: string) => void;
    openRegister: (returnUrl?: string) => void;
    close: () => void;
    switchTo: (view: 'login' | 'register') => void;
}

const AuthModalContext = createContext<AuthModalContextType>({
    view: null,
    returnUrl: null,
    openLogin: () => { },
    openRegister: () => { },
    close: () => { },
    switchTo: () => { },
});

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
    const [view, setView] = useState<AuthModalView>(null);
    const [returnUrl, setReturnUrl] = useState<string | null>(null);

    const openLogin = useCallback((url?: string) => { setReturnUrl(url ?? null); setView('login'); }, []);
    const openRegister = useCallback((url?: string) => { setReturnUrl(url ?? null); setView('register'); }, []);
    const close = useCallback(() => { setView(null); setReturnUrl(null); }, []);
    const switchTo = useCallback((v: 'login' | 'register') => setView(v), []);

    return (
        <AuthModalContext.Provider value={{ view, returnUrl, openLogin, openRegister, close, switchTo }}>
            {children}
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    return useContext(AuthModalContext);
}
