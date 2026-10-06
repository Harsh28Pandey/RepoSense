import React from 'react';
import { Sparkles, Cpu, ShieldCheck } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function AboutPage() {
  usePageTitle('About Us', 'Engineering an intelligent co-pilot for open-source maintainers and developers.');

  return (
    <div className="py-16 bg-[#EEF1F5] text-[#1F2A37]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-[#2F6FDE] text-xs font-semibold">
            Our Mission
          </span>
          <h1 className="text-2xl font-extrabold text-[#1F2A37]">About RepoSense</h1>
          <p className="text-[#5B6778] text-xs max-w-xl mx-auto leading-relaxed">
            Engineering an intelligent co-pilot for open-source maintainers and solo developers to solve everyday repo friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-3 shadow-xs">
            <Sparkles className="w-7 h-7 text-[#2F6FDE]" />
            <h3 className="font-bold text-sm text-[#1F2A37]">Multi-LLM Pipeline</h3>
            <p className="text-xs text-[#5B6778] leading-relaxed">
              Dynamically routes queries between Groq, Gemini, and OpenAI based on speed, multimodal attachments, and complex reasoning requirements.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-3 shadow-xs">
            <Cpu className="w-7 h-7 text-[#2F6FDE]" />
            <h3 className="font-bold text-sm text-[#1F2A37]">RAG Vector Search</h3>
            <p className="text-xs text-[#5B6778] leading-relaxed">
              Indexes code files, issues, PRs, and documentation into MongoDB Atlas vector chunks for context-aware assistant responses.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-3 shadow-xs">
            <ShieldCheck className="w-7 h-7 text-[#2E8B57]" />
            <h3 className="font-bold text-sm text-[#1F2A37]">PR-First Safety</h3>
            <p className="text-xs text-[#5B6778] leading-relaxed">
              All documentation updates and automated fixes are committed as clean, isolated Pull Requests so you stay in total control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
