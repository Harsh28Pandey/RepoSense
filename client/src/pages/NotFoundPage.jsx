import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="py-20 flex items-center justify-center text-center text-[#1F2A37]">
      <div className="max-w-md space-y-6 p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] border border-[#C93C3C]/20 text-[#C93C3C] flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1F2A37]">404 - Page Not Found</h1>
        <p className="text-xs text-[#5B6778] leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-medium text-xs shadow-sm"
          >
            <Home className="w-4 h-4" /> Return to Home
          </Link>
          <Link
            to="/app/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#E8ECF1] hover:bg-[#D3D9E2] text-[#1F2A37] font-medium text-xs border border-[#D3D9E2]"
          >
            <ArrowLeft className="w-4 h-4" /> Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
