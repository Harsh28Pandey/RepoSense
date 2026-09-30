import { ArrowRight } from "lucide-react";
import { painPoints } from "../data/content";
import Button from "./ui/Button";
import { useAuthModal } from "../context/AuthModalContext";
import RepoScoreCard from "./RepoScoreCard";
import React from 'react'

export default function Hero() {
    const { openSignup } = useAuthModal();

    return (
        <section id="top" className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-b from-emerald-500/10 via-slate-950/0 to-transparent" />
            <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-28">
                <div>
                    <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                        Built for every GitHub repository owner
                    </p>
                    <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Understand your repository, keep it documented, and keep moving forward.
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
                        RepoSense analyzes your GitHub project, writes the missing documentation, reviews your pull requests and
                        explains exactly what to fix next.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button onClick={openSignup} className="px-6 py-3">
                            Connect Your Repo <ArrowRight size={16} />
                        </Button>
                        <Button href="#how-it-works" variant="secondary" className="px-6 py-3">
                            See how it works
                        </Button>
                    </div>
                    <ul className="mt-10 flex flex-wrap gap-2">
                        {painPoints.map((item) => (
                            <li key={item} className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-400">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex justify-center lg:justify-end">
                    <RepoScoreCard />
                </div>
            </div>
        </section>
    );
}