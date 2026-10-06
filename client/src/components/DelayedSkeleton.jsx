import React, { useState, useEffect } from 'react';

/**
 * DelayedSkeleton delays displaying its fallback for 150ms.
 * If the lazy content arrives before 150ms, no flash occurs.
 * If fallback is shown, it persists for at least 250ms to prevent visual jitter.
 */
export default function DelayedSkeleton({ children }) {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  if (!showFallback) {
    // Show nothing during the first 150ms window
    return <div className="w-full h-full min-h-[300px]" />;
  }

  return children || (
    <div className="w-full h-full min-h-[300px] p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-[#E8ECF1] rounded-2xl w-1/4" />
      <div className="h-32 bg-[#E8ECF1] rounded-2xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-24 bg-[#E8ECF1] rounded-2xl" />
        <div className="h-24 bg-[#E8ECF1] rounded-2xl" />
        <div className="h-24 bg-[#E8ECF1] rounded-2xl" />
      </div>
    </div>
  );
}
