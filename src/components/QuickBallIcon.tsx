import React from 'react';

interface QuickBallIconProps {
  className?: string;
  size?: number;
}

export const QuickBallIcon: React.FC<QuickBallIconProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`inline-block drop-shadow-[0_0_8px_rgba(72,160,182,0.45)] ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="qbGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#B8DAE3" />
          <stop offset="45%" stopColor="#48A0B6" />
          <stop offset="100%" stopColor="#046683" />
        </radialGradient>
        <linearGradient id="goldArrow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EFD7AD" />
          <stop offset="100%" stopColor="#DCBD85" />
        </linearGradient>
      </defs>

      {/* Main Sphere Outer Border */}
      <circle cx="50" cy="50" r="46" fill="#123244" stroke="#48A0B6" strokeWidth="2.5" />

      {/* Petroleum Blue Ball Body */}
      <circle cx="50" cy="50" r="44" fill="url(#qbGrad)" />

      {/* Dark divider band */}
      <line x1="6" y1="50" x2="94" y2="50" stroke="#123244" strokeWidth="6" />

      {/* Quick Ball Distinctive Gold Pattern - Top V-Wing */}
      <path
        d="M20 18 L50 44 L80 18 L68 13 L50 32 L32 13 Z"
        fill="url(#goldArrow)"
        stroke="#123244"
        strokeWidth="1.5"
      />

      {/* Quick Ball Distinctive Gold Pattern - Bottom V-Wing */}
      <path
        d="M20 82 L50 56 L80 82 L68 87 L50 68 L32 87 Z"
        fill="url(#goldArrow)"
        stroke="#123244"
        strokeWidth="1.5"
      />

      {/* Center Release Mechanism Outer Ring */}
      <circle cx="50" cy="50" r="14" fill="#EFD7AD" stroke="#123244" strokeWidth="4.5" />
      {/* Inner Push Button with Cyan-Petroleum Core */}
      <circle cx="50" cy="50" r="7" fill="#48A0B6" stroke="#123244" strokeWidth="2" />
      <circle cx="48" cy="48" r="2" fill="#ffffff" opacity="0.8" />
    </svg>
  );
};
