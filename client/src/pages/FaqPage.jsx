import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function FaqPage() {
  usePageTitle('FAQ', 'Frequently asked questions about RepoSense features, AI models, and security.');
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
    <div className="py-16 bg-[#EEF1F5] text-[#1F2A37]">
      <div className="max-w-3xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-[#2F6FDE] text-xs font-semibold">
            Help & Knowledge
          </span>
          <h1 className="text-2xl font-extrabold text-[#1F2A37]">Frequently Asked Questions</h1>
          <p className="text-xs text-[#5B6778]">Clear answers about RepoSense operation, security, and AI integrations.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] overflow-hidden shadow-xs">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-semibold text-[#1F2A37] cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === i ? 'rotate-180 text-[#2F6FDE]' : 'text-[#5B6778]'}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-xs text-[#5B6778] leading-relaxed border-t border-[#D3D9E2] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
