import React from "react";
import { healthBreakdown } from "../data/content";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RepoScoreCard({ score = 92 }) {
    const offset = CIRCUMFERENCE * (1 - score / 100);

    return (
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-emerald-500/5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500">Repository</p>
                    <p className="mt-1 font-mono text-sm text-slate-200">my-ecommerce-app</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">README present</span>
            </div>

            <div className="mt-6 flex items-center gap-6">
                <div className="relative h-28 w-28 shrink-0">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                        <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="8" className="stroke-slate-800" />
                        <circle
                            cx="50"
                            cy="50"
                            r={RADIUS}
                            fill="none"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={offset}
                            className="stroke-emerald-400"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white">{score}</span>
                        <span className="text-xs text-slate-500">of 100</span>
                    </div>
                </div>

                <ul className="w-full space-y-3">
                    {healthBreakdown.map((item) => (
                        <li key={item.label}>
                            <div className="mb-1 flex justify-between text-xs text-slate-400">
                                <span>{item.label}</span>
                                <span>{item.value}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-800">
                                <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${item.value}%` }} />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <p className="mt-6 rounded-lg bg-slate-800/60 px-3 py-2 text-xs text-slate-400">
                Trend: improving over the last 4 weeks
            </p>
        </div>
    );
}