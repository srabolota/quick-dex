import React from 'react';
import {
  X,
  RotateCcw,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Heart,
  Check,
} from 'lucide-react';
import { PokemonType } from '../types/pokemon';
import { ALL_TYPES } from '../utils/typeMatrix';
import { GENERATIONS } from '../utils/translations';
import { SPECIAL_GROUPS, SpecialGroupKey } from '../utils/specialGroups';
import { TypeBadge } from './TypeBadge';
import { sound } from '../utils/audio';

export type SortField = 'id' | 'name' | 'bst' | 'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed';
export type SortDirection = 'asc' | 'desc';
export type TypeFilterMode = 'any' | 'single' | 'dual' | 'exact';

export interface AdvancedFilterState {
  sortField: SortField;
  sortDirection: SortDirection;
  selectedTypes: PokemonType[];
  typeMode: TypeFilterMode;
  selectedGens: number[]; // empty = all
  selectedSpecialGroups: SpecialGroupKey[];
  onlyFavorites: boolean;
  globalShinyMode: boolean;
  bstMin: number;
}

interface AdvancedFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilterState;
  onUpdateFilters: (updater: (prev: AdvancedFilterState) => AdvancedFilterState) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  activeFilterCount: number;
  theme?: 'dark' | 'light';
}

export const AdvancedFilterDrawer: React.FC<AdvancedFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onResetFilters,
  totalFilteredCount,
  activeFilterCount,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleSortField = (field: SortField) => {
    sound.playClick();
    onUpdateFilters((prev) => ({ ...prev, sortField: field }));
  };

  const handleSortDir = (dir: SortDirection) => {
    sound.playClick();
    onUpdateFilters((prev) => ({ ...prev, sortDirection: dir }));
  };

  const handleToggleType = (type: PokemonType) => {
    sound.playClick();
    onUpdateFilters((prev) => {
      const exists = prev.selectedTypes.includes(type);
      return {
        ...prev,
        selectedTypes: exists
          ? prev.selectedTypes.filter((t) => t !== type)
          : [...prev.selectedTypes, type],
      };
    });
  };

  const handleTypeMode = (mode: TypeFilterMode) => {
    sound.playClick();
    onUpdateFilters((prev) => ({ ...prev, typeMode: mode }));
  };

  const handleToggleGen = (genId: number) => {
    sound.playClick();
    onUpdateFilters((prev) => {
      const exists = prev.selectedGens.includes(genId);
      return {
        ...prev,
        selectedGens: exists
          ? prev.selectedGens.filter((g) => g !== genId)
          : [...prev.selectedGens, genId],
      };
    });
  };

  const handleToggleSpecialGroup = (key: SpecialGroupKey) => {
    sound.playClick();
    onUpdateFilters((prev) => {
      const exists = prev.selectedSpecialGroups.includes(key);
      return {
        ...prev,
        selectedSpecialGroups: exists
          ? prev.selectedSpecialGroups.filter((k) => k !== key)
          : [...prev.selectedSpecialGroups, key],
      };
    });
  };

  const handleToggleFavorites = () => {
    sound.playClick();
    onUpdateFilters((prev) => ({ ...prev, onlyFavorites: !prev.onlyFavorites }));
  };

  const handleToggleGlobalShiny = () => {
    sound.playShiny();
    onUpdateFilters((prev) => ({ ...prev, globalShinyMode: !prev.globalShinyMode }));
  };

  const handleBstPreset = (min: number) => {
    sound.playClick();
    onUpdateFilters((prev) => ({ ...prev, bstMin: min }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md bg-black/80 animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Floating Filter Card Container */}
      <div
        className={`relative z-10 flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(72,160,182,0.25)] ${
          isLight
            ? 'bg-[#FDFBF7] text-[#123244] border-[#DCBD85]'
            : 'bg-[#123244] text-[#B8DAE3] border-[#046683]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-5 py-4 ${
          isLight
            ? 'bg-gradient-to-r from-[#F4EFE6] via-[#EDE6DA] to-[#F4EFE6] border-[#E2D9CC]'
            : 'bg-gradient-to-r from-[#0d2433] via-[#163c50] to-[#0d2433] border-[#046683]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#48A0B6]/15 border border-[#48A0B6]/40 text-[#48A0B6]">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-black tracking-wide ${isLight ? 'text-[#123244]' : 'text-white'}`}>
                  Filtros Avançados <span className="text-[#48A0B6]">Quickdex</span>
                </h3>
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-[#DCBD85] px-2 py-0.5 text-[10px] font-black text-[#123244]">
                    {activeFilterCount} ativos
                  </span>
                )}
              </div>
              <p className={`text-[11px] font-medium ${isLight ? 'text-[#046683]' : 'text-[#B8DAE3]/80'}`}>
                Personalize ordenação, tipos, gerações e grupos especiais
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
              isLight
                ? 'bg-white text-[#123244] border-[#DCBD85] hover:bg-rose-500 hover:text-white'
                : 'bg-[#0d2433] text-[#B8DAE3] border-[#046683] hover:bg-rose-500 hover:text-white'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* SEÇÃO 1: ORDENAR POR */}
          <div className={`rounded-2xl p-4 border ${
            isLight ? 'bg-white border-[#E2D9CC]' : 'bg-[#0d2433] border-[#046683]'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#48A0B6] flex items-center gap-1.5">
                <span>1.</span> Ordenar Por
              </h4>
              <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                isLight ? 'bg-[#F4EFE6] border-[#DCBD85]' : 'bg-[#123244] border-[#046683]'
              }`}>
                <button
                  onClick={() => handleSortDir('asc')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    filters.sortDirection === 'asc'
                      ? 'bg-[#48A0B6] text-[#123244] font-black'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title="Crescente (Menor para Maior ou A-Z)"
                >
                  <ArrowUp size={13} />
                  <span>Crescente</span>
                </button>
                <button
                  onClick={() => handleSortDir('desc')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    filters.sortDirection === 'desc'
                      ? 'bg-[#48A0B6] text-[#123244] font-black'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title="Decrescente (Maior para Menor ou Z-A)"
                >
                  <ArrowDown size={13} />
                  <span>Decrescente</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { field: 'id', label: 'Número (# Pokédex)' },
                { field: 'name', label: 'Nome Alfabético' },
                { field: 'bst', label: 'Status Base Total (BST)' },
                { field: 'hp', label: 'HP (Vida)' },
                { field: 'attack', label: 'Ataque Físico' },
                { field: 'defense', label: 'Defesa Física' },
                { field: 'special-attack', label: 'Ataque Especial (SpA)' },
                { field: 'special-defense', label: 'Defesa Especial (SpD)' },
                { field: 'speed', label: 'Velocidade (Speed)' },
              ].map((item) => (
                <button
                  key={item.field}
                  onClick={() => handleSortField(item.field as SortField)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 font-bold transition-all border ${
                    filters.sortField === item.field
                      ? 'bg-gradient-to-r from-[#EFD7AD] to-[#DCBD85] text-[#123244] border-[#DCBD85] font-extrabold shadow-sm'
                      : isLight
                      ? 'bg-[#F4EFE6] text-[#123244] border-[#E2D9CC] hover:border-[#DCBD85]'
                      : 'bg-[#123244] text-[#B8DAE3] border-[#046683] hover:border-[#48A0B6] hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {filters.sortField === item.field && <Check size={14} className="stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* SEÇÃO 2: FILTRAR POR TIPOS */}
          <div className={`rounded-2xl p-4 border ${
            isLight ? 'bg-white border-[#E2D9CC]' : 'bg-[#0d2433] border-[#046683]'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#48A0B6] flex items-center gap-1.5">
                <span>2.</span> Filtrar por Tipos ({filters.selectedTypes.length} selecionados)
              </h4>

              {/* Type Mode Options */}
              <div className={`flex flex-wrap items-center gap-1 p-1 rounded-xl border text-[11px] font-bold ${
                isLight ? 'bg-[#F4EFE6] border-[#DCBD85]' : 'bg-[#123244] border-[#046683]'
              }`}>
                <button
                  onClick={() => handleTypeMode('any')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    filters.typeMode === 'any' ? 'bg-[#48A0B6] text-[#123244] font-black' : 'opacity-70'
                  }`}
                  title="Qualquer um dos tipos selecionados"
                >
                  Qualquer
                </button>
                <button
                  onClick={() => handleTypeMode('single')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    filters.typeMode === 'single' ? 'bg-[#48A0B6] text-[#123244] font-black' : 'opacity-70'
                  }`}
                  title="Apenas Pokémon com Tipo Único puro"
                >
                  Tipo Único
                </button>
                <button
                  onClick={() => handleTypeMode('dual')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    filters.typeMode === 'dual' ? 'bg-[#48A0B6] text-[#123244] font-black' : 'opacity-70'
                  }`}
                  title="Apenas Pokémon com Tipo Duplo"
                >
                  Tipo Duplo
                </button>
                <button
                  onClick={() => handleTypeMode('exact')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    filters.typeMode === 'exact' ? 'bg-[#DCBD85] text-[#123244] font-black' : 'opacity-70'
                  }`}
                  title="Combinação exata de tipos selecionados"
                >
                  Exato (AND)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ALL_TYPES.map((type) => {
                const isSelected = filters.selectedTypes.includes(type);
                return (
                  <TypeBadge
                    key={type}
                    type={type}
                    size="sm"
                    isActive={isSelected}
                    onClick={() => handleToggleType(type)}
                    className="w-full text-center py-1.5"
                  />
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 3: FILTRAR POR GERAÇÕES */}
          <div className={`rounded-2xl p-4 border ${
            isLight ? 'bg-white border-[#E2D9CC]' : 'bg-[#0d2433] border-[#046683]'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#48A0B6] flex items-center gap-1.5">
                <span>3.</span> Filtrar por Gerações
              </h4>
              <span className="text-[11px] opacity-75">
                {filters.selectedGens.length === 0 ? 'Todas' : `${filters.selectedGens.length} selecionadas`}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 text-xs">
              {GENERATIONS.map((gen) => {
                const isSelected = filters.selectedGens.includes(gen.id);
                return (
                  <button
                    key={gen.id}
                    onClick={() => handleToggleGen(gen.id)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 font-bold transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#EFD7AD] to-[#DCBD85] text-[#123244] border-[#DCBD85] font-extrabold shadow-sm'
                        : isLight
                        ? 'bg-[#F4EFE6] text-[#123244] border-[#E2D9CC] hover:border-[#DCBD85]'
                        : 'bg-[#123244] text-[#B8DAE3] border-[#046683] hover:border-[#48A0B6] hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="block font-black">{gen.name}</span>
                      <span className="text-[10px] opacity-75">{gen.region}</span>
                    </div>
                    {isSelected && <Check size={14} className="stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 4: GRUPOS ESPECIAIS (QUICKDEX) */}
          <div className={`rounded-2xl p-4 border ${
            isLight ? 'bg-white border-[#E2D9CC]' : 'bg-[#0d2433] border-[#046683]'
          }`}>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#48A0B6] mb-3 flex items-center gap-1.5">
              <span>4.</span> Grupos Especiais (Categorias Quickdex)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {Object.values(SPECIAL_GROUPS).map((group) => {
                const isSelected = filters.selectedSpecialGroups.includes(group.key);
                return (
                  <button
                    key={group.key}
                    onClick={() => handleToggleSpecialGroup(group.key)}
                    className={`flex flex-col justify-between rounded-xl p-3 border transition-all text-left ${
                      isSelected
                        ? 'bg-[#DCBD85] text-[#123244] border-[#DCBD85] shadow-sm font-extrabold scale-[1.02]'
                        : isLight
                        ? 'bg-[#F4EFE6] text-[#123244] border-[#E2D9CC] hover:border-[#DCBD85]'
                        : 'bg-[#123244] border-[#046683] text-[#B8DAE3] hover:border-[#48A0B6]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-base">{group.icon}</span>
                      {isSelected && <Check size={14} className="text-[#123244] stroke-[3]" />}
                    </div>
                    <span className={`font-black ${isSelected ? 'text-[#123244]' : isLight ? 'text-[#123244]' : 'text-white'}`}>
                      {group.label}
                    </span>
                    <span className="text-[10px] opacity-75 leading-tight mt-0.5 line-clamp-1">
                      {group.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 5: MARCAS, FAVORITOS E SHINY */}
          <div className={`rounded-2xl p-4 border space-y-4 ${
            isLight ? 'bg-white border-[#E2D9CC]' : 'bg-[#0d2433] border-[#046683]'
          }`}>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#48A0B6] flex items-center gap-1.5">
              <span>5.</span> Marcas, Favoritos & Modo Shiny
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Only Favorites */}
              <button
                onClick={handleToggleFavorites}
                className={`flex items-center justify-between rounded-xl p-3 border transition-all ${
                  filters.onlyFavorites
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-black shadow-sm'
                    : isLight
                    ? 'bg-[#F4EFE6] border-[#E2D9CC] text-[#123244] hover:border-[#DCBD85]'
                    : 'bg-[#123244] border-[#046683] text-[#B8DAE3] hover:border-[#48A0B6]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart size={18} className={filters.onlyFavorites ? 'fill-rose-500 text-rose-500' : 'opacity-40'} />
                  <div>
                    <span className="block font-bold">Apenas Meus Favoritos</span>
                    <span className="text-[10px] opacity-70">Filtrar Pokémon marcados</span>
                  </div>
                </div>
                {filters.onlyFavorites && <Check size={14} className="text-rose-400 stroke-[3]" />}
              </button>

              {/* Global Shiny Mode */}
              <button
                onClick={handleToggleGlobalShiny}
                className={`flex items-center justify-between rounded-xl p-3 border transition-all ${
                  filters.globalShinyMode
                    ? 'bg-[#DCBD85] text-[#123244] border-[#DCBD85] font-black shadow-sm'
                    : isLight
                    ? 'bg-[#F4EFE6] border-[#E2D9CC] text-[#123244] hover:border-[#DCBD85]'
                    : 'bg-[#123244] border-[#046683] text-[#B8DAE3] hover:border-[#48A0B6]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={18} className={filters.globalShinyMode ? 'text-[#123244] animate-spin' : 'opacity-40'} />
                  <div>
                    <span className="block font-bold">Modo Galeria Shiny ✨</span>
                    <span className="text-[10px] opacity-70">Exibir todos como Shiny</span>
                  </div>
                </div>
                {filters.globalShinyMode && <Check size={14} className="text-[#123244] stroke-[3]" />}
              </button>
            </div>

            {/* BST Range Presets */}
            <div className={`pt-2 border-t ${isLight ? 'border-[#E2D9CC]' : 'border-[#046683]/50'}`}>
              <span className="text-[11px] font-bold opacity-75 uppercase block mb-2">
                Piso Mínimo de Status Base Total (BST):
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { label: 'Todos (0+)', val: 0 },
                  { label: 'Iniciais/Intermediários (400+)', val: 400 },
                  { label: 'Competitivo (500+)', val: 500 },
                  { label: 'Lendários/Titãs (600+)', val: 600 },
                ].map((b) => (
                  <button
                    key={b.val}
                    onClick={() => handleBstPreset(b.val)}
                    className={`rounded-xl px-3 py-1.5 font-bold transition-all border ${
                      filters.bstMin === b.val
                        ? 'bg-[#48A0B6] text-[#123244] font-black border-[#48A0B6]'
                        : isLight
                        ? 'bg-[#F4EFE6] text-[#123244] border-[#E2D9CC] hover:bg-white'
                        : 'bg-[#123244] text-[#B8DAE3] border-[#046683] hover:text-white'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className={`flex items-center justify-between border-t p-4 gap-3 ${
          isLight ? 'border-[#E2D9CC] bg-[#F4EFE6]' : 'border-[#046683] bg-[#0d2433]'
        }`}>
          <button
            onClick={() => {
              sound.playClick();
              onResetFilters();
            }}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all active:scale-95 ${
              isLight
                ? 'bg-white text-[#123244] border-[#DCBD85] hover:bg-[#EDE6DA]'
                : 'bg-[#123244] border-[#046683] text-[#B8DAE3] hover:text-white hover:bg-[#163c50]'
            }`}
          >
            <RotateCcw size={14} />
            <span>Redefinir Tudo</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#48A0B6] via-[#046683] to-[#DCBD85] px-5 py-2.5 text-xs font-black uppercase text-[#123244] shadow-lg hover:shadow-[0_0_20px_rgba(72,160,182,0.4)] transition-all active:scale-95"
          >
            <span className="text-white font-extrabold">Ver {totalFilteredCount} Pokémon</span>
            <span className="text-[10px] bg-[#123244] text-[#DCBD85] px-2 py-0.5 rounded-full font-mono">
              Aplicar ➔
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
