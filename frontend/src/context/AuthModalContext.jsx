import { createContext, useCallback, useContext, useMemo, useState } from "react";
import React from 'react'

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
    const [mode, setMode] = useState(null);
    const openLogin = useCallback(() => setMode("login"), []);
    const openSignup = useCallback(() => setMode("signup"), []);
    const close = useCallback(() => setMode(null), []);

    const value = useMemo(
        () => ({ mode, setMode, openLogin, openSignup, close }),
        [mode, openLogin, openSignup, close]
    );

    return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal() {
    const context = useContext(AuthModalContext);
    if (!context) throw new Error("useAuthModal must be used inside AuthModalProvider");
    return context;
}