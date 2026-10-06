import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ShieldAlert, FileText, GitPullRequest, HelpCircle,
  Activity, MessageSquare, CheckCircle2, ChevronDown, Search,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "Does RepoSense modify my GitHub repo directly without approval?",
      a: "Never. RepoSense operates on a strict PR-first workflow. When you request a README update, PR review comment, or auto-fix, RepoSense creates a dedicated git branch and submits a Pull Request for your review."
    },
    {
      q: "Which AI models power RepoSense?",
      a: "RepoSense uses a LangGraph multi-agent pipeline routing between Groq (for sub-second fast chat and scans), Google Gemini (for multimodal code/screenshot analysis), and OpenAI GPT-4o (for deep PR reasoning)."
    },
    {
      q: "How does account registration work?",
      a: "Create an account using your GitHub username, full name, email, and password. We send a 6-digit OTP code to your email for verification before granting access."
    },
    {
      q: "Is security vulnerability scanning included?",
      a: "RepoSense focuses strictly on developer productivity: README auto-generation, PR reviews, issue triage, contributor onboarding, and repo health. Vulnerability and license scanning are explicitly out of scope."
    }
  ];

  return (
    <div className="w-full text-[#1F2A37]">
      {/* 2. Hero Section */}
      <section className="py-16 border-b border-[#D3D9E2] bg-[#F7F8FA]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-12 items-center">
            
            <div className="col-span-7 space-y-6">
              <span className="inline-block px-3 py-1 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-[#2F6FDE] text-xs font-semibold">
                AI Assistant for GitHub Repo Owners
              </span>

              <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2A37] leading-tight">
                Understand Your GitHub Repo, Keep It Documented, Move Faster.
              </h1>

              <p className="text-sm text-[#5B6778] leading-relaxed max-w-xl">
                Auto-generate production READMEs with live previews, run automated PR code reviews, triage issues, and monitor repository health in one workspace.
              </p>

              <div className="flex items-center gap-4 pt-2">
                <Link
                  to="/signup"
                  className="px-6 py-3 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-colors shadow-sm"
                >
                  Create Account
                </Link>
                <Link
                  to="/features"
                  className="px-6 py-3 rounded-2xl bg-[#E8ECF1] hover:bg-[#D3D9E2] text-[#1F2A37] font-semibold text-xs border border-[#D3D9E2] transition-colors"
                >
                  Explore Features →
                </Link>
              </div>
            </div>

            <div className="col-span-5">
              <div className="p-6 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#D3D9E2] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2F6FDE]" />
                    <span className="font-mono text-xs font-bold text-[#1F2A37]">Live Demo Preview</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-2xl bg-[#F0FDF4] text-[#2E8B57] text-[10px] font-mono font-bold">
                    Connected
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#E8ECF1] border border-[#D3D9E2]">
                    <p className="text-[#5B6778] text-[11px]">Repo: octocat/Spoon-Knife</p>
                    <p className="text-[#2F6FDE] font-semibold mt-1">Status: README Generated (PR #42 opened)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#E8ECF1] border border-[#D3D9E2]">
                    <p className="text-[#5B6778] text-[11px]">PR #43: Refactor API router</p>
                    <p className="text-[#2E8B57] font-semibold mt-1">Score: 92/100 (Safe to merge)</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Core Capabilities Grid */}
      <section className="py-16 bg-[#EEF1F5] border-b border-[#D3D9E2]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-[#1F2A37]">Built for Maintainers & Solo Engineers</h2>
            <p className="text-xs text-[#5B6778]">Everything you need to automate repository upkeep and maintain production standards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-3 shadow-xs">
              <FileText className="w-6 h-6 text-[#2F6FDE]" />
              <h3 className="text-sm font-bold text-[#1F2A37]">README Generator</h3>
              <p className="text-xs text-[#5B6778]">Auto-generate complete README.md files with live side-by-side GitHub preview and direct PR creation.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-3 shadow-xs">
              <GitPullRequest className="w-6 h-6 text-[#2F6FDE]" />
              <h3 className="text-sm font-bold text-[#1F2A37]">Automated PR Reviews</h3>
              <p className="text-xs text-[#5B6778]">Line-by-line code review feedback, security analysis, and automated quality scores posted to GitHub PRs.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] space-y-3 shadow-xs">
              <ShieldAlert className="w-6 h-6 text-[#2F6FDE]" />
              <h3 className="text-sm font-bold text-[#1F2A37]">Issue Triage & Vector Duplicates</h3>
              <p className="text-xs text-[#5B6778]">Vector embedding similarity matching to detect duplicate issues and apply automated priority labels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Workflow Section */}
      <section className="py-16 bg-[#F7F8FA] border-b border-[#D3D9E2]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-[#1F2A37]">How RepoSense Works</h2>
            <p className="text-xs text-[#5B6778]">Three simple steps to connect and automate your repository workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2F6FDE] font-bold text-xs flex items-center justify-center font-mono">1</div>
              <h3 className="text-sm font-bold text-[#1F2A37]">Connect GitHub Repo</h3>
              <p className="text-xs text-[#5B6778]">Authenticate with your GitHub PAT token. RepoSense accesses public and private repositories securely.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2F6FDE] font-bold text-xs flex items-center justify-center font-mono">2</div>
              <h3 className="text-sm font-bold text-[#1F2A37]">Run Deep Multidimensional Scan</h3>
              <p className="text-xs text-[#5B6778]">Evaluate documentation completeness, issue backlogs, PR diffs, and health scores in real time.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2F6FDE] font-bold text-xs flex items-center justify-center font-mono">3</div>
              <h3 className="text-sm font-bold text-[#1F2A37]">Submit PRs & Automate</h3>
              <p className="text-xs text-[#5B6778]">Apply suggested fixes and generated documentation straight to your GitHub repository with one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="py-16 bg-[#EEF1F5] border-b border-[#D3D9E2]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-xl font-bold text-[#1F2A37]">Frequently Asked Questions</h2>
            <p className="text-xs text-[#5B6778]">Everything you need to know about RepoSense security, workflows, and AI pipelines.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-xs font-semibold text-[#1F2A37] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#5B6778] transition-transform ${openFaq === idx ? 'transform rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-[#5B6778] leading-relaxed border-t border-[#D3D9E2] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Final Call to Action */}
      <section className="py-16 bg-[#F7F8FA] border-t border-[#D3D9E2] text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-[#1F2A37]">Start Automating Your GitHub Repos Today</h2>
          <p className="text-xs text-[#5B6778]">Create an account to generate READMEs, review PRs, and monitor repository health.</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-colors shadow-sm"
          >
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
