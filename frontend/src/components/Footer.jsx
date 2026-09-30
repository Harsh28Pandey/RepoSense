import React from "react";
import { brand, footerLinks } from "../data/content";

export default function Footer() {
    return (
        <footer className="border-t border-white/10 py-10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row lg:px-8">
                <div className="text-center md:text-left">
                    <p className="font-bold text-white">{brand.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{brand.tagline}</p>
                </div>
                <ul className="flex flex-wrap justify-center gap-6">
                    {footerLinks.map((label) => (
                        <li key={label}>
                            <a href="#" className="text-sm text-slate-400 hover:text-white">{label}</a>
                        </li>
                    ))}
                </ul>
            </div>
        </footer>
    );
}