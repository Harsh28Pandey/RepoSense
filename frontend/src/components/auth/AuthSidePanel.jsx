import { Check, GitBranch } from "lucide-react";
import React from 'react'
import { brand } from "../../data/content";

const highlights = [
    "Generate a complete README with a live preview",
    "Get automated feedback on every pull request",
    "Track repository health with a single score",
    "Keep documentation and issues organized",
];

export default function AuthSidePanel() {
    return (
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 p-8 md:flex md:w-5/12">
            <div>
                <div className="flex items-center gap-2 text-lg font-bold text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-slate-950">
                        <GitBranch size={18} strokeWidth={2.5} />
                    </span>
                    {brand.name}
                </div>
                <h3 className="mt-10 text-2xl font-bold leading-snug text-white">
                    Everything your repository needs, in one place.
                </h3>
                <ul className="mt-6 space-y-3">
                    {highlights.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                            <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-10 rounded-2xl border border-white/10 bg-slate-950/50 p-4 backdrop-blur">
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono">my-ecommerce-app</span>
                    <span>Health score</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-slate-800">
                        <div className="h-2 w-[78%] rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold text-white">78</span>
                </div>
            </div>
        </aside>
    );
}