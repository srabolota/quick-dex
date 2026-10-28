import React from 'react';
import { PokemonType } from '../types/pokemon';
import { ALL_TYPES } from '../utils/typeMatrix';
import { GENERATIONS } from '../utils/translations';
import { TypeBadge } from './TypeBadge';
import { sound } from '../utils/audio';
import { ArrowUpDown, RotateCcw } from 'lucide-react';

export type SortOption = 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc' | 'bst-desc' | 'bst-asc';

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
}) => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4">
        {/* Generation Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              sound.playClick();
              onSelectGen(null);
            }}
            className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              selectedGen === null
                ? 'bg-[#00d2ff] text-black shadow-[0_0_12px_rgba(0,210,255,0.4)]'
                : 'bg-[#142030] text-slate-400 hover:text-white border border-white/5'
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
              className={`flex items-center gap-1 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                selectedGen === gen.id
                  ? 'bg-gradient-to-r from-[#ffe600] to-amber-400 text-black shadow-[0_0_12px_rgba(255,230,0,0.4)]'
                  : 'bg-[#142030] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <span>{gen.name}</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">({gen.region})</span>
            </button>
          ))}
        </div>

        {/* Type Filter Pills Row & Sort Controls */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Scrollable Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mr-1 whitespace-nowrap">
              Tipos:
            </span>

            {ALL_TYPES.map((type) => {
              const isSelected = selectedType === type;
              return (
                <TypeBadge
                  key={type}
                  type={type}
                  size="sm"
                  isActive={isSelected}
                  onClick={() => {
                    sound.playClick();
                    onSelectType(isSelected ? null : type);
                  }}
                />
              );
            })}
          </div>

          {/* Sort Dropdown & Quick Reset */}
          <div className="flex items-center justify-between lg:justify-end gap-2.5 pt-1 lg:pt-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold">{totalFiltered}</span>
              <span>Pokémon</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <ArrowUpDown size={14} className="pointer-events-none absolute left-2.5 text-[#00d2ff]" />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    sound.playClick();
                    onSortChange(e.target.value as SortOption);
                  }}
                  className="rounded-xl bg-[#142030] border border-[#00d2ff]/30 py-1.5 pl-8 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#00d2ff]"
                >
                  <option value="id-asc">Número (#001 ➔ #1025)</option>
                  <option value="id-desc">Número (#1025 ➔ #001)</option>
                  <option value="name-asc">Nome (A ➔ Z)</option>
                  <option value="name-desc">Nome (Z ➔ A)</option>
                  <option value="bst-desc">Status BST (Maior)</option>
                  <option value="bst-asc">Status BST (Menor)</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onResetFilters();
                  }}
                  className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition-colors border border-white/10"
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
