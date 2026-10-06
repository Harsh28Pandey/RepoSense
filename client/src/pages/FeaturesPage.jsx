import React from 'react';
import { Search, FileText, GitPullRequest, HelpCircle, ShieldAlert, Activity, MessageSquare } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function FeaturesPage() {
  usePageTitle('Features', 'Comprehensive developer tools for GitHub repository owners.');

  const features = [
    { icon: Search, title: "Repo Deep Scan", desc: "Automated analysis of README quality, docs completeness, and PR metrics." },
    { icon: FileText, title: "ReadMe Generator", desc: "Auto-detect tech stack and generate Markdown with live GitHub split preview." },
    { icon: GitPullRequest, title: "Automated PR Review", desc: "Line-by-line feedback, quality score, and safe-to-merge verdict." },
    { icon: FileText, title: "Docs Manager", desc: "Track missing route documentation and auto-draft CHANGELOG PRs." },
    { icon: HelpCircle, title: "Contributor Onboarding", desc: "Personalised roadmap, visual codebase map, and good first issues." },
    { icon: ShieldAlert, title: "Issue Triage & Duplicates", desc: "Vector similarity duplicate detection and automatic label assignment." },
    { icon: Activity, title: "Health Score", desc: "0-100 radial score with customizable weight sliders and trend charts." },
    { icon: MessageSquare, title: "Ask RepoSense Chat", desc: "Multi-LLM agent answering queries with direct feature action buttons." }
  ];

  return (
    <div className="py-16 bg-[#EEF1F5] text-[#1F2A37]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-[#2F6FDE] text-xs font-semibold">
            Product Capabilities
          </span>
          <h1 className="text-2xl font-extrabold text-[#1F2A37]">8 Integrated Developer Tools</h1>
          <p className="text-xs text-[#5B6778] max-w-lg mx-auto">
            Comprehensive features designed specifically for GitHub repository owners and maintainers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-3 shadow-xs">
              <f.icon className="w-6 h-6 text-[#2F6FDE]" />
              <h3 className="font-bold text-sm text-[#1F2A37]">{f.title}</h3>
              <p className="text-xs text-[#5B6778] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
