import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import React from 'react'
import { login } from "../../services/authService";
import { validateLogin } from "../../utils/validators";
import useAuthForm from "../../hooks/useAuthForm";
import { useAuthModal } from "../../context/AuthModalContext";
import Field from "../ui/Field";
import Button from "../ui/Button";

export default function LoginForm() {
    const { setMode } = useAuthModal();
    const { values, errors, status, handleChange, handleSubmit } = useAuthForm({
        initialValues: { email: "", password: "" },
        validate: validateLogin,
        onSubmit: async (data) => {
            await login(data);
            window.location.assign("/dashboard");
        },
    });

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field
                label="Email"
                name="email"
                type="email"
                icon={Mail}
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
            />
            <Field
                label="Password"
                name="password"
                type="password"
                icon={Lock}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={values.password}
                onChange={handleChange}
                error={errors.password}
            />
            {status.error && (
                <p role="alert" className="rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                    {status.error}
                </p>
            )}
            <Button type="submit" disabled={status.loading} className="w-full py-3.5">
                {status.loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {status.loading ? "Logging in" : "Log in"}
                {!status.loading && <ArrowRight size={16} />}
            </Button>
            <p className="text-center text-sm text-slate-400">
                New to RepoSense?{" "}
                <button type="button" onClick={() => setMode("signup")} className="font-medium text-emerald-400 hover:text-emerald-300">
                    Create an account
                </button>
            </p>
        </form>
    );
}