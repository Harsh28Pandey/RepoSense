import React, { useState } from 'react';
import { getAvatarFallbackLetter, sanitizeAvatarUrl } from '../../utils/avatarUtils.js';

export { getAvatarFallbackLetter, sanitizeAvatarUrl };

export default function Avatar({ user, size = 36, className = '' }) {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const displayName = user?.fullName || user?.githubUsername || user?.name || 'User';
  const fallbackLetter = getAvatarFallbackLetter(displayName);
  const rawUrl = user?.avatarUrl || user?.avatar_url;
  const avatarUrl = sanitizeAvatarUrl(rawUrl);

  const sizePx = `${size}px`;
  const fontSize = size <= 24 ? 'text-[10px]' : size <= 32 ? 'text-xs' : size <= 36 ? 'text-[14px]' : 'text-lg';

  if (!avatarUrl || imgError) {
    return (
      <div
        style={{ width: sizePx, height: sizePx }}
        className={`rounded-full bg-[#EFF6FF] border border-[#D3D9E2] text-[#2F6FDE] font-semibold ${fontSize} flex items-center justify-center shrink-0 select-none ${className}`}
        title={displayName}
      >
        {fallbackLetter}
      </div>
    );
  }

  return (
    <div
      style={{ width: sizePx, height: sizePx }}
      className={`relative rounded-full border border-[#D3D9E2] overflow-hidden shrink-0 bg-[#EFF6FF] ${className}`}
      title={displayName}
    >
      {!loaded && (
        <div className={`absolute inset-0 bg-[#EFF6FF] text-[#2F6FDE] font-semibold ${fontSize} flex items-center justify-center select-none`}>
          {fallbackLetter}
        </div>
      )}
      <img
        src={avatarUrl}
        alt={displayName}
        width={size}
        height={size}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setImgError(true)}
        className={`w-full h-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
