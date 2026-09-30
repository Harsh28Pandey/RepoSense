import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import React from 'react'
import { useAuthModal } from "../../context/AuthModalContext";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import AuthSidePanel from "./AuthSidePanel";

const copy = {
    login: { title: "Welcome back", text: "Log in to continue managing your repositories." },
    signup: { title: "Create your account", text: "Connect your first repository in a few minutes." },
};

const tabs = [
    { mode: "login", label: "Log in" },
    { mode: "signup", label: "Sign up" },
];

export default function AuthModal() {
    const { mode, setMode, close } = useAuthModal();
    const panelRef = useRef(null);

    useEffect(() => {
        if (!mode) return undefined;
        const onKey = (event) => event.key === "Escape" && close();
        const previousOverflow = document.body.style.overflow;
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [mode, close]);

    useEffect(() => {
        if (mode) panelRef.current?.querySelector("input")?.focus();
    }, [mode]);

    if (!mode) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
        >
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={close} />

            <div className="relative flex max-h-[95vh] w-full animate-modal-in flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-slate-900 shadow-2xl motion-reduce:animate-none sm:max-w-md sm:rounded-3xl md:max-w-4xl md:flex-row">
                <AuthSidePanel />

                <div ref={panelRef} className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                        <div className="grid flex-1 grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.mode}
                                    type="button"
                                    onClick={() => setMode(tab.mode)}
                                    className={`rounded-lg py-2.5 text-sm font-medium transition-colors ${mode === tab.mode
                                            ? "bg-slate-800 text-white shadow"
                                            : "text-slate-500 hover:text-slate-300"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={close}
                            aria-label="Close"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <h2 id="auth-title" className="mt-8 text-2xl font-bold text-white sm:text-3xl">
                        {copy[mode].title}
                    </h2>
                    <p className="mb-7 mt-2 text-sm text-slate-400">{copy[mode].text}</p>

                    {mode === "login" ? <LoginForm /> : <SignupForm />}
                </div>
            </div>
        </div>
    );
}