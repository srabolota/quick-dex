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
      className={`inline-block drop-shadow-[0_0_8px_rgba(0,210,255,0.4)] ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="qbGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#4de1ff" />
          <stop offset="60%" stopColor="#00d2ff" />
          <stop offset="100%" stopColor="#0077b6" />
        </radialGradient>
        <linearGradient id="yellowArrow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff04d" />
          <stop offset="100%" stopColor="#ffe600" />
        </linearGradient>
      </defs>

      {/* Main Sphere Outer Border */}
      <circle cx="50" cy="50" r="46" fill="#0d1520" stroke="#00d2ff" strokeWidth="2.5" />

      {/* Cyan Base Ball Body */}
      <circle cx="50" cy="50" r="44" fill="url(#qbGrad)" />

      {/* Dark divider band */}
      <line x1="6" y1="50" x2="94" y2="50" stroke="#0d1520" strokeWidth="6" />

      {/* Quick Ball Distinctive Yellow Pattern - Top V-Wing */}
      <path
        d="M20 18 L50 44 L80 18 L68 13 L50 32 L32 13 Z"
        fill="url(#yellowArrow)"
        stroke="#0d1520"
        strokeWidth="1.5"
      />

      {/* Quick Ball Distinctive Yellow Pattern - Bottom V-Wing */}
      <path
        d="M20 82 L50 56 L80 82 L68 87 L50 68 L32 87 Z"
        fill="url(#yellowArrow)"
        stroke="#0d1520"
        strokeWidth="1.5"
      />

      {/* Center Release Mechanism Outer Ring */}
      <circle cx="50" cy="50" r="14" fill="#ffffff" stroke="#0d1520" strokeWidth="4.5" />
      {/* Inner Push Button with Cyan Core */}
      <circle cx="50" cy="50" r="7" fill="#00d2ff" stroke="#0d1520" strokeWidth="2" />
      <circle cx="48" cy="48" r="2" fill="#ffffff" opacity="0.8" />
    </svg>
  );
};
