import React, { useId } from 'react';

// Architect's compass "A" mark on the indigo → violet tile (matches the app icons)
export const LogoMark: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => {
  // Unique per instance: a shared id breaks when the first copy sits in a hidden element
  const gradientId = `architect-logo-${useId().replace(/:/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#9333EA" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
      <path d="M9.6 24 16 8M16 8l6.4 16M12.3 18.6h7.4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="8" r="2.2" fill="#fff" />
      <circle cx="16" cy="8" r="0.9" fill="#6366F1" />
    </svg>
  );
};

export const Logo: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 26 }) => (
  <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
    <LogoMark size={size} />
    <span>Architect<span className="text-indigo-500">.ai</span></span>
  </span>
);
