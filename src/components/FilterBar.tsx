import React from 'react';
import { PokemonType } from '../types/pokemon';
import { ALL_TYPES } from '../utils/typeMatrix';
import { GENERATIONS } from '../utils/translations';
import { TypeBadge } from './TypeBadge';
import { sound } from '../utils/audio';
import { ArrowUpDown, RotateCcw, SlidersHorizontal } from 'lucide-react';

export type SortOption =
  | 'id-asc'
  | 'id-desc'
  | 'name-asc'
  | 'name-desc'
  | 'bst-desc'
  | 'bst-asc'
  | 'hp-desc'
  | 'attack-desc'
  | 'defense-desc'
  | 'speed-desc';

interface FilterBarProps {
  selectedGen: number | null; // null = Todas
  onSelectGen: (gen: number | null) => void;
  selectedType: PokemonType | null;
  onSelectType: (type: PokemonType | null) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalFiltered: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onOpenAdvancedFilters?: () => void;
  activeFilterCount?: number;
  theme?: 'dark' | 'light';
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedGen,
  onSelectGen,
  selectedType,
  onSelectType,
  sortBy,
  onSortChange,
  totalFiltered,
  onResetFilters,
  hasActiveFilters,
  onOpenAdvancedFilters,
  activeFilterCount = 0,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2.5">
      <div className="flex flex-col gap-2.5">
        {/* Generation Selector Tabs - Smooth Touch Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
          <button
            onClick={() => {
              sound.playClick();
              onSelectGen(null);
            }}
            className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              selectedGen === null
                ? 'bg-[#48A0B6] text-[#123244] shadow-[0_0_12px_rgba(72,160,182,0.4)] font-black'
                : isLight
                ? 'bg-[#FFFFFF] text-[#123244] border border-[#DCBD85] hover:bg-[#F4EFE6]'
                : 'bg-[#0d2433] text-[#B8DAE3]/70 hover:text-white border border-[#046683]'
            }`}
          >
            Todas Gerações
          </button>

          {GENERATIONS.map((gen) => (
            <button
              key={gen.id}
              onClick={() => {
                sound.playClick();
                onSelectGen(gen.id);
              }}
              className={`shrink-0 flex items-center gap-1 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                selectedGen === gen.id
                  ? 'bg-gradient-to-r from-[#EFD7AD] to-[#DCBD85] text-[#123244] shadow-[0_0_12px_rgba(220,189,133,0.4)] font-black'
                  : isLight
                  ? 'bg-[#FFFFFF] text-[#123244] border border-[#DCBD85] hover:bg-[#F4EFE6]'
                  : 'bg-[#0d2433] text-[#B8DAE3]/70 hover:text-white border border-[#046683]'
              }`}
            >
              <span>{gen.name}</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">({gen.region})</span>
            </button>
          ))}
        </div>

        {/* Type Filter Pills Row & Advanced Filters Launcher */}
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Scrollable Type Pills on Mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
            <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shrink-0 mr-0.5 whitespace-nowrap ${
              isLight ? 'text-[#046683]' : 'text-[#B8DAE3]/70'
            }`}>
              Tipos:
            </span>

            {ALL_TYPES.map((type) => {
              const isSelected = selectedType === type;
              return (
                <div key={type} className="shrink-0">
                  <TypeBadge
                    type={type}
                    size="sm"
                    isActive={isSelected}
                    onClick={() => {
                      sound.playClick();
                      onSelectType(isSelected ? null : type);
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center justify-between lg:justify-end gap-2 pt-0.5 lg:pt-0">
            {/* Advanced Filters Button Trigger */}
            {onOpenAdvancedFilters && (
              <button
                onClick={onOpenAdvancedFilters}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition-all active:scale-95 shadow-sm ${
                  isLight
                    ? 'bg-[#FFFFFF] border-[#DCBD85] text-[#046683] hover:bg-[#F4EFE6]'
                    : 'bg-gradient-to-r from-[#0d2433] to-[#163c50] border-[#046683] text-[#48A0B6] hover:text-[#DCBD85] hover:border-[#DCBD85]'
                }`}
                title="Abrir Filtros Avançados"
              >
                <SlidersHorizontal size={14} />
                <span>Filtros Avançados</span>
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-[#DCBD85] px-1.5 py-0.2 text-[10px] font-black text-[#123244]">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <ArrowUpDown size={13} className="pointer-events-none absolute left-2.5 text-[#48A0B6]" />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    sound.playClick();
                    onSortChange(e.target.value as SortOption);
                  }}
                  className={`rounded-xl border py-1.5 pl-8 pr-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#48A0B6] ${
                    isLight
                      ? 'bg-white border-[#DCBD85] text-[#123244]'
                      : 'bg-[#0d2433] border-[#046683] text-[#B8DAE3]'
                  }`}
                >
                  <option value="id-asc">Número (#001 ➔ #1302)</option>
                  <option value="id-desc">Número (#1302 ➔ #001)</option>
                  <option value="name-asc">Nome (A ➔ Z)</option>
                  <option value="name-desc">Nome (Z ➔ A)</option>
                  <option value="bst-desc">Status BST (Maior)</option>
                  <option value="bst-asc">Status BST (Menor)</option>
                  <option value="speed-desc">Velocidade (Mais Rápido)</option>
                  <option value="attack-desc">Ataque (Mais Forte)</option>
                  <option value="defense-desc">Defesa (Mais Resistente)</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onResetFilters();
                  }}
                  className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors border ${
                    isLight
                      ? 'bg-white text-[#123244] border-[#DCBD85] hover:bg-[#F4EFE6]'
                      : 'bg-[#0d2433] text-[#B8DAE3] border-[#046683] hover:bg-[#163c50]'
                  }`}
                  title="Limpar todos os filtros"
                >
                  <RotateCcw size={13} />
                  <span className="hidden sm:inline">Limpar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
