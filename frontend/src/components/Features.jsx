import React from "react";
import { features } from "../data/content";
import SectionHeading from "./ui/SectionHeading";

export default function Features() {
    return (
        <section id="features" className="scroll-mt-16 border-t border-white/5 bg-slate-900/30 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Features"
                    title="One workspace, ten focused tools"
                    description="Each tool targets a specific repository problem and works with the others."
                />
                <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {features.map(({ icon: Icon, title, text }) => (
                        <article
                            key={title}
                            className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition-colors hover:border-emerald-400/30"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                                <Icon size={20} />
                            </span>
                            <h3 className="mt-4 font-semibold text-white">{title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}