import { useEffect, useState } from "react";
import { GitBranch, Menu, X } from "lucide-react";
import { brand, navLinks } from "../data/content";
import useActiveSection from "../hooks/useActiveSection";
import { useAuthModal } from "../context/AuthModalContext";
import Button from "./ui/Button";
import React from 'react'

const sectionIds = navLinks.map((link) => link.id);

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const active = useActiveSection(sectionIds);
    const { openLogin, openSignup } = useAuthModal();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        const onKey = (event) => event.key === "Escape" && setOpen(false);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("keydown", onKey);
        };
    }, []);

    const linkClass = (id) =>
        `rounded-md px-3 py-2 text-sm font-medium transition-colors ${active === id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
        }`;

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 border-b transition-colors ${scrolled || open ? "border-white/10 bg-slate-950/90 backdrop-blur" : "border-transparent bg-transparent"
                }`}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-8">
                <a href="#top" className="flex items-center gap-2 justify-self-start text-lg font-bold text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-slate-950">
                        <GitBranch size={18} strokeWidth={2.5} />
                    </span>
                    {brand.name}
                </a>

                <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
                    {navLinks.map((link) => (
                        <a key={link.id} href={`#${link.id}`} className={linkClass(link.id)}>
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 justify-self-end lg:flex">
                    <Button variant="ghost" onClick={openLogin}>Log in</Button>
                    <Button onClick={openSignup}>Sign up</Button>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-expanded={open}
                    aria-label="Toggle menu"
                    className="rounded-md p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
                >
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {open && (
                <div className="border-t border-white/10 px-4 pb-6 pt-4 lg:hidden">
                    <nav className="flex flex-col gap-1" aria-label="Mobile">
                        {navLinks.map((link) => (
                            <a key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)} className={linkClass(link.id)}>
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <Button variant="secondary" onClick={() => { setOpen(false); openLogin(); }}>Log in</Button>
                        <Button onClick={() => { setOpen(false); openSignup(); }}>Sign up</Button>
                    </div>
                </div>
            )}
        </header>
    );
}