import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import React from 'react'

export default function Field({ label, type = "text", icon: Icon, error, ...props }) {
    const id = useId();
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";

    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-300">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                )}
                <input
                    id={id}
                    type={isPassword && visible ? "text" : type}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={`w-full rounded-xl border bg-slate-950/70 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 ${error ? "border-rose-400/60" : "border-white/10 hover:border-white/20"
                        } ${Icon ? "pl-10" : "pl-3.5"} ${isPassword ? "pr-11" : "pr-3.5"}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setVisible((value) => !value)}
                        aria-label={visible ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-slate-300"
                    >
                        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && (
                <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-300">
                    {error}
                </p>
            )}
        </div>
    );
}