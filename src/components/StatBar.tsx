import React from 'react';
import { STAT_NAMES_PT, STAT_SHORT_PT } from '../utils/natures';

interface StatBarProps {
  statName: 'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed';
  value: number;
  maxBase?: number;
  natureMultiplier?: number; // 1.1 (+10%), 0.9 (-10%), or 1.0 (neutral)
}

export const StatBar: React.FC<StatBarProps> = ({
  statName,
  value,
  maxBase = 255,
  natureMultiplier = 1.0,
}) => {
  const percentage = Math.min(100, Math.round((value / maxBase) * 100));

  // Determine color based on base stat thresholds
  let barGradient = 'from-red-500 to-rose-600';
  let badgeColor = 'text-red-400';
  if (value >= 150) {
    barGradient = 'from-[#00d2ff] via-[#4de1ff] to-[#ffe600]';
    badgeColor = 'text-[#00d2ff]';
  } else if (value >= 110) {
    barGradient = 'from-emerald-400 to-teal-500';
    badgeColor = 'text-emerald-400';
  } else if (value >= 80) {
    barGradient = 'from-[#ffe600] to-amber-500';
    badgeColor = 'text-[#ffe600]';
  } else if (value >= 50) {
    barGradient = 'from-orange-400 to-amber-600';
    badgeColor = 'text-orange-400';
  }

  // Calculate Lv. 100 Min and Max stats according to competitive Pokemon formulas
  // For HP: floor(((2*Base)*100)/100) + 100 + 10 = 2*Base + 110 (Min with 0 IV, 0 EV)
  // HP Max: floor(((2*Base + 31 + 63)*100)/100) + 110 = 2*Base + 204
  // For other stats: Min = floor((2*Base + 5) * 0.9)
  // Max = floor((2*Base + 31 + 63 + 5) * 1.1)
  let minLv100 = 0;
  let maxLv100 = 0;
  if (statName === 'hp') {
    minLv100 = value === 1 ? 1 : Math.floor(2 * value + 110);
    maxLv100 = value === 1 ? 1 : Math.floor(2 * value + 204);
  } else {
    minLv100 = Math.floor((2 * value + 5) * 0.9);
    maxLv100 = Math.floor((2 * value + 99) * 1.1);
  }

  // Adjusted value if Nature modifier is active
  const hasNatureBonus = natureMultiplier > 1.0;
  const hasNaturePenalty = natureMultiplier < 1.0;

  return (
    <div className="flex flex-col gap-1 py-1.5 text-xs sm:text-sm">
      <div className="flex items-center justify-between font-medium">
        <div className="flex items-center gap-2">
          <span className="w-16 font-bold text-slate-300 sm:w-20">
            {STAT_SHORT_PT[statName] || statName}
          </span>
          <span className="text-[11px] text-slate-400 hidden md:inline">
            ({STAT_NAMES_PT[statName]?.split(' ')[0]})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {hasNatureBonus && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
              +10%
            </span>
          )}
          {hasNaturePenalty && (
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30 font-bold">
              -10%
            </span>
          )}
          <span className={`w-10 text-right font-extrabold ${badgeColor}`}>
            {value}
          </span>
          <span className="text-[11px] text-slate-500 w-24 text-right hidden sm:inline">
            Lv.100: {minLv100}-{maxLv100}
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#131d2a] p-0.5 ring-1 ring-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500 ease-out`}
          style={{ width: `${Math.max(4, percentage)}%` }}
        />
      </div>
    </div>
  );
};
