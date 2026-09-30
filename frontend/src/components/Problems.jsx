import React from "react";
import { useState } from "react";
import { Check } from "lucide-react";
import { problems } from "../data/content";
import SectionHeading from "./ui/SectionHeading";

export default function Problems() {
    const [selected, setSelected] = useState(problems[0].id);
    const current = problems.find((item) => item.id === selected);

    return (
        <section id="problems" className="scroll-mt-16 border-t border-white/5 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Problems we solve"
                    title="The everyday problems every repository owner faces"
                    description="Select a problem to see exactly how RepoSense removes it."
                />

                <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                    <div role="tablist" aria-label="Problems" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                        {problems.map((item) => (
                            <button
                                key={item.id}
                                role="tab"
                                aria-selected={selected === item.id}
                                onClick={() => setSelected(item.id)}
                                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${selected === item.id
                                        ? "border-emerald-400/40 bg-emerald-400/10 text-white"
                                        : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                                    }`}
                            >
                                {item.pain}
                            </button>
                        ))}
                    </div>

                    <div role="tabpanel" className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">{current.feature}</p>
                        <h3 className="mt-3 text-2xl font-bold text-white">{current.pain}</h3>
                        <p className="mt-4 leading-7 text-slate-400">{current.solution}</p>
                        <ul className="mt-6 space-y-3">
                            {current.outcomes.map((outcome) => (
                                <li key={outcome} className="flex items-start gap-3 text-sm text-slate-300">
                                    <Check size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                                    {outcome}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}