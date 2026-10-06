import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import Logo from './Logo';

export default function Navbar() {
  const { isAuthenticated } = useStore();

  const navLinkClass = ({ isActive }) =>
    `transition-colors ${isActive ? 'text-[#2F6FDE] font-bold' : 'text-[#5B6778] hover:text-[#1F2A37]'}`;

  return (
    <header className="sticky top-0 z-50 bg-[#F7F8FA] border-b border-[#D3D9E2]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="group" aria-label="RepoSense Home">
            <Logo variant="full" size={26} />
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-8 text-xs font-semibold" aria-label="Main Navigation">
            <NavLink to="/features" className={navLinkClass}>Features</NavLink>
            <NavLink to="/how-it-works" className={navLinkClass}>How It Works</NavLink>
            <NavLink to="/faq" className={navLinkClass}>FAQ</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/app/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-colors shadow-sm"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 text-xs font-semibold text-[#5B6778] hover:text-[#1F2A37] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-colors shadow-sm"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
