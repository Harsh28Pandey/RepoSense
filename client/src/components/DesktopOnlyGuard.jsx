import React, { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';

export default function DesktopOnlyGuard({ children }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-[#EEF1F5] flex flex-col items-center justify-center p-6 text-center text-[#1F2A37]">
        <div className="w-16 h-16 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-[#2F6FDE] flex items-center justify-center mb-4">
          <Monitor className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#1F2A37] mb-2">Desktop Screen Required</h2>
        <p className="text-xs text-[#5B6778] max-w-sm leading-relaxed">
          RepoSense is available on desktop only. Please open it on a larger screen (minimum 1280px width).
        </p>
      </div>
    );
  }

  return children;
}
