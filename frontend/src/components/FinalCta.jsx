import { ArrowRight } from "lucide-react";
import Button from "./ui/Button";
import { useAuthModal } from "../context/AuthModalContext";
import React from 'react'

export default function FinalCta() {
    const { openSignup } = useAuthModal();

    return (
        <section className="border-t border-white/5 py-20 sm:py-24">
            <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-400/20 bg-gradient-to-b from-emerald-400/10 to-transparent px-6 py-14 text-center sm:px-12">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Give your repository the attention it deserves</h2>
                <p className="mx-auto mt-4 max-w-xl text-slate-400">
                    Connect with GitHub and get your first full report in minutes.
                </p>
                <div className="mt-8 flex justify-center">
                    <Button onClick={openSignup} className="px-8 py-3 text-base">
                        Start with GitHub <ArrowRight size={16} />
                    </Button>
                </div>
            </div>
        </section>
    );
}