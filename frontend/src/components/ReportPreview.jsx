import { Lock } from "lucide-react";
import { reportMetrics } from "../data/content";
import SectionHeading from "./ui/SectionHeading";
import Button from "./ui/Button";
import { useAuthModal } from "../context/AuthModalContext";
import React from 'react'

export default function ReportPreview() {
    const { openSignup } = useAuthModal();

    return (
        <section id="report" className="scroll-mt-16 border-t border-white/5 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Sample report"
                    title="See what a scan tells you"
                    description="A preview of the report generated for a repository with no README."
                />
                <div className="relative mx-auto mt-14 max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                        <p className="font-mono text-sm text-slate-200">portfolio-site</p>
                        <span className="rounded-full bg-rose-400/10 px-3 py-1 text-xs text-rose-300">README missing</span>
                    </div>
                    <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {reportMetrics.map((metric) => (
                            <div key={metric.label} className="rounded-xl bg-slate-950/60 p-4">
                                <dt className="text-xs text-slate-500">{metric.label}</dt>
                                <dd className={`mt-1 text-lg font-semibold ${metric.tone}`}>{metric.value}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="relative mt-6 rounded-xl bg-slate-950/60 p-4">
                        <p className="select-none text-sm leading-6 text-slate-400 blur-sm">
                            This is a React portfolio project. It is active, but the README and documentation are missing, which makes
                            it difficult for visitors and recruiters to understand the work.
                        </p>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 ring-1 ring-white/10">
                                <Lock size={14} /> Full summary available after connecting
                            </span>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-center">
                        <Button onClick={openSignup}>Generate README Now</Button>
                    </div>
                </div>
            </div>
        </section>
    );
}