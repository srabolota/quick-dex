import React from 'react';
import { PokemonType } from '../types/pokemon';
import { TYPE_CONFIG } from '../utils/typeMatrix';

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({
  type,
  size = 'md',
  showIcon = true,
  isActive = false,
  onClick,
  className = '',
}) => {
  const config = TYPE_CONFIG[type] || {
    name: type,
    ptName: type,
    bgColor: '#718096',
    textColor: '#ffffff',
    borderColor: '#4a5568',
    gradient: 'from-gray-500 to-gray-700',
    iconSymbol: '⚪',
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1 rounded-md font-semibold tracking-wide',
    sm: 'px-2 py-0.5 text-xs gap-1.5 rounded-lg font-semibold tracking-wide',
    md: 'px-3 py-1 text-xs gap-1.5 rounded-xl font-bold tracking-wide',
    lg: 'px-4 py-1.5 text-sm gap-2 rounded-xl font-bold tracking-wider',
  };

  const clickableStyles = onClick
    ? 'cursor-pointer transition-all duration-200 active:scale-95 hover:scale-105'
    : '';

  const activeStyles = isActive
    ? 'ring-2 ring-[#ffe600] shadow-[0_0_12px_rgba(255,230,0,0.5)] scale-105 font-extrabold'
    : 'opacity-90 hover:opacity-100';

  return (
    <span
      onClick={onClick}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        border: `1px solid ${config.borderColor}`,
        boxShadow: isActive ? undefined : `0 2px 6px ${config.bgColor}40`,
      }}
      className={`inline-flex items-center justify-center select-none uppercase shadow-sm transition-all duration-200 ${sizeClasses[size]} ${clickableStyles} ${activeStyles} ${className}`}
    >
      {showIcon && <span className="text-[1.1em] leading-none">{config.iconSymbol}</span>}
      <span>{config.ptName}</span>
    </span>
  );
};
