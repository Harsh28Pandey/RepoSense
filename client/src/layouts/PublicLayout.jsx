import React, { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DelayedSkeleton from '../components/DelayedSkeleton';

export default function PublicLayout() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__publicLayoutMountCount = (window.__publicLayoutMountCount || 0) + 1;
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF1F5] text-[#1F2A37]">
      <Navbar />
      <main className="flex-1 w-full">
        <Suspense fallback={<DelayedSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
