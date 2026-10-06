import React from 'react';

export default function Logo({ variant = 'full', size = 26, className = '' }) {
  if (variant === 'mark') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-[#2F6FDE] ${className}`}
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="7.5" cy="7.5" r="1.5" />
        <circle cx="7.5" cy="16.5" r="1.5" />
        <circle cx="16.5" cy="12" r="1.5" />
        <path d="M7.5 9v6" />
        <path d="M7.5 12c3 0 5-1.5 7.5-1.5" />
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#2F6FDE] shrink-0"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="7.5" cy="7.5" r="1.5" />
        <circle cx="7.5" cy="16.5" r="1.5" />
        <circle cx="16.5" cy="12" r="1.5" />
        <path d="M7.5 9v6" />
        <path d="M7.5 12c3 0 5-1.5 7.5-1.5" />
      </svg>
      <span className="font-sans text-base font-semibold text-[#1F2A37] tracking-tight">
        Repo<span className="text-[#2F6FDE]">Sense</span>
      </span>
    </div>
  );
}
