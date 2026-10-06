import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-[#F7F8FA] border-t border-[#D3D9E2] pt-12 pb-8 text-[#5B6778] text-xs">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <Link to="/" aria-label="RepoSense Home">
              <Logo variant="full" size={24} />
            </Link>
            <p className="text-xs text-[#5B6778]">
              Automated README generation, code reviews, issue triage, and repository health monitoring.
            </p>
          </div>

          <div>
            <h4 className="text-[#1F2A37] font-semibold mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-[#1F2A37]">Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#1F2A37]">How It Works</Link></li>
              <li><Link to="/faq" className="hover:text-[#1F2A37]">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#1F2A37] font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-[#1F2A37]">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#1F2A37]">Contact Support</Link></li>
              <li><Link to="/privacy" className="hover:text-[#1F2A37]">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#1F2A37] font-semibold mb-3">Infrastructure</h4>
            <div className="flex flex-wrap gap-1.5">
              {['Gemini', 'Groq', 'OpenAI', 'LangChain', 'MongoDB', 'Redis'].map(badge => (
                <span key={badge} className="px-2 py-0.5 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-[10px] font-mono font-medium text-[#1F2A37]">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#D3D9E2] flex items-center justify-between text-[11px]">
          <p>© {new Date().getFullYear()} RepoSense. All rights reserved.</p>
          <p>Built for GitHub repository maintainers.</p>
        </div>
      </div>
    </footer>
  );
}
