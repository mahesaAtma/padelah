import { createContext, useContext, useState, useCallback } from 'react';

type AuthModalView = 'login' | 'register' | null;

interface AuthModalContextType {
    view: AuthModalView;
    openLogin: () => void;
    openRegister: () => void;
    close: () => void;
    switchTo: (view: 'login' | 'register') => void;
}

const AuthModalContext = createContext<AuthModalContextType>({
    view: null,
    openLogin: () => { },
    openRegister: () => { },
    close: () => { },
    switchTo: () => { },
});

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
    const [view, setView] = useState<AuthModalView>(null);

    const openLogin = useCallback(() => setView('login'), []);
    const openRegister = useCallback(() => setView('register'), []);
    const close = useCallback(() => setView(null), []);
    const switchTo = useCallback((v: 'login' | 'register') => setView(v), []);

    return (
        <AuthModalContext.Provider value={{ view, openLogin, openRegister, close, switchTo }}>
            {children}
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    return useContext(AuthModalContext);
}
