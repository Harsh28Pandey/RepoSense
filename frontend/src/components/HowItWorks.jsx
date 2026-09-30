import React from "react";
import { steps } from "../data/content";
import SectionHeading from "./ui/SectionHeading";

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="scroll-mt-16 border-t border-white/5 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading eyebrow="How it works" title="From connection to results in three steps" />
                <ol className="mt-14 grid gap-6 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <li key={step.title} className="relative rounded-2xl border border-white/10 bg-slate-900/60 p-6">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 font-bold text-slate-950">
                                {index + 1}
                            </span>
                            <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}