import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function PrivacyPage() {
  usePageTitle('Privacy Policy', 'Data storage, encryption, and GitHub access security policy.');

  return (
    <div className="py-16 bg-[#EEF1F5] text-[#1F2A37]">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-[#2F6FDE] text-xs font-semibold">
            Security & Trust
          </span>
          <h1 className="text-2xl font-extrabold text-[#1F2A37]">Privacy Policy & Security Disclosures</h1>
        </div>

        <div className="p-8 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-6 text-xs text-[#5B6778] leading-relaxed shadow-xs">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#1F2A37]">1. Data Storage & Encryption</h2>
            <p>All connected GitHub tokens stored in RepoSense are encrypted at rest using industry-standard AES-256-GCM encryption.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#1F2A37]">2. GitHub Code Execution Policy</h2>
            <p>RepoSense never executes your repository code. We only inspect file trees and Markdown text via official GitHub REST API endpoints with strict file size limits.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
