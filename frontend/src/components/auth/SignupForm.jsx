import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import React from 'react'
import { signup } from "../../services/authService";
import { validateSignup } from "../../utils/validators";
import useAuthForm from "../../hooks/useAuthForm";
import { useAuthModal } from "../../context/AuthModalContext";
import Field from "../ui/Field";
import Button from "../ui/Button";
import PasswordStrength from "./PasswordStrength";

export default function SignupForm() {
    const { setMode } = useAuthModal();
    const { values, errors, status, handleChange, handleSubmit } = useAuthForm({
        initialValues: { name: "", email: "", password: "" },
        validate: validateSignup,
        onSubmit: async (data) => {
            await signup(data);
            window.location.assign("/dashboard");
        },
    });

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field
                label="Full name"
                name="name"
                icon={User}
                autoComplete="name"
                placeholder="Your full name"
                value={values.name}
                onChange={handleChange}
                error={errors.name}
            />
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
            <div>
                <Field
                    label="Password"
                    name="password"
                    type="password"
                    icon={Lock}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={values.password}
                    onChange={handleChange}
                    error={errors.password}
                />
                <PasswordStrength password={values.password} />
            </div>
            {status.error && (
                <p role="alert" className="rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                    {status.error}
                </p>
            )}
            <Button type="submit" disabled={status.loading} className="w-full py-3.5">
                {status.loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {status.loading ? "Creating account" : "Create account"}
                {!status.loading && <ArrowRight size={16} />}
            </Button>
            <p className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")} className="font-medium text-emerald-400 hover:text-emerald-300">
                    Log in
                </button>
            </p>
        </form>
    );
}