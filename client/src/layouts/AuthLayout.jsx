import React, { Suspense, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import DelayedSkeleton from '../components/DelayedSkeleton';

export default function AuthLayout() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__authLayoutMountCount = (window.__authLayoutMountCount || 0) + 1;
    }
  }, []);

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col justify-between bg-[#EEF1F5] text-[#1F2A37]">
      {/* Minimal Header */}
      <header className="w-full h-14 shrink-0 border-b border-[#D3D9E2] bg-[#F7F8FA] flex items-center px-6 lg:px-8">
        <Link to="/" aria-label="RepoSense Home">
          <Logo variant="full" size={26} />
        </Link>
      </header>

      {/* Main Auth Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <Suspense fallback={<DelayedSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
