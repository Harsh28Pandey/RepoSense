import React from 'react'

const variants = {
    primary: "bg-emerald-400 text-slate-950 hover:bg-emerald-300",
    secondary: "border border-white/15 text-slate-100 hover:bg-white/10",
    ghost: "text-slate-300 hover:text-white",
};

export default function Button({ href, variant = "primary", className = "", children, ...props }) {
    const classes = `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`;

    if (href) {
        return (
            <a href={href} className={classes} {...props}>
                {children}
            </a>
        );
    }

    return (
        <button type="button" className={classes} {...props}>
            {children}
        </button>
    );
}