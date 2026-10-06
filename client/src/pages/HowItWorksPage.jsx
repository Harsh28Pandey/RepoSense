import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function HowItWorksPage() {
  usePageTitle('How It Works', 'Three simple steps to automate your GitHub maintenance.');

  return (
    <div className="py-16 bg-[#EEF1F5] text-[#1F2A37]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-[#2F6FDE] text-xs font-semibold">
            Simple Workflow
          </span>
          <h1 className="text-2xl font-extrabold text-[#1F2A37]">How RepoSense Works</h1>
          <p className="text-xs text-[#5B6778] max-w-lg mx-auto">
            Automate documentation, code reviews, issue triage, and repository health monitoring in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-center space-y-4 shadow-xs">
            <span className="w-10 h-10 rounded-full bg-[#E8ECF1] text-[#2F6FDE] font-extrabold text-sm flex items-center justify-center mx-auto">1</span>
            <h3 className="font-bold text-base text-[#1F2A37]">Create Account & Verify OTP</h3>
            <p className="text-xs text-[#5B6778] leading-relaxed">Register with your GitHub username and verify your email address via 6-digit OTP code.</p>
          </div>
          <div className="p-8 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-center space-y-4 shadow-xs">
            <span className="w-10 h-10 rounded-full bg-[#E8ECF1] text-[#2F6FDE] font-extrabold text-sm flex items-center justify-center mx-auto">2</span>
            <h3 className="font-bold text-base text-[#1F2A37]">Connect Repositories</h3>
            <p className="text-xs text-[#5B6778] leading-relaxed">Connect public or private repositories using GitHub OAuth or Personal Access Tokens.</p>
          </div>
          <div className="p-8 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-center space-y-4 shadow-xs">
            <span className="w-10 h-10 rounded-full bg-[#E8ECF1] text-[#2F6FDE] font-extrabold text-sm flex items-center justify-center mx-auto">3</span>
            <h3 className="font-bold text-base text-[#1F2A37]">Get Docs, Reviews & Fixes</h3>
            <p className="text-xs text-[#5B6778] leading-relaxed">Auto-generate READMEs, review PRs, triage issues, and commit PRs directly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
