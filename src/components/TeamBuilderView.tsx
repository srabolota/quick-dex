import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import { PokemonSummary, PokemonType } from '../types/pokemon';
import { ALL_TYPES, calculateTypeEffectiveness, TYPE_CONFIG } from '../utils/typeMatrix';
import { formatPokemonId, formatPokemonName } from '../utils/translations';
import { TypeBadge } from './TypeBadge';
import { sound } from '../utils/audio';

interface TeamBuilderViewProps {
  teamIds: number[];
  onAddPokemon: (id: number) => void;
  onRemovePokemon: (index: number) => void;
  onClearTeam: () => void;
  masterList: { id: number; name: string }[];
  loadedSummaries: Map<number, PokemonSummary>;
  onSelectPokemonDetail: (id: number) => void;
  theme?: 'dark' | 'light';
}

export const TeamBuilderView: React.FC<TeamBuilderViewProps> = ({
  teamIds,
  onAddPokemon,
  onRemovePokemon,
  onClearTeam,
  masterList,
  loadedSummaries,
  onSelectPokemonDetail,
  theme = 'dark',
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const isLight = theme === 'light';

  // Get full summaries for team members
  const teamMembers = useMemo(() => {
    return teamIds.map((id) => {
      const summary = loadedSummaries.get(id);
      return (
        summary || {
          id,
          name: masterList.find((p) => p.id === id)?.name || `pokemon-${id}`,
          types: ['normal' as PokemonType],
          sprite: '',
          officialArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          shinyArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`,
          stats: [],
          height: 10,
          weight: 100,
          bst: 450,
        }
      );
    });
  }, [teamIds, loadedSummaries, masterList]);

  // Team defensive coverage analysis across all 18 types
  const teamDefensiveMatrix = useMemo(() => {
    return ALL_TYPES.map((attackType) => {
      let weaknesses = 0;
      let resistances = 0;
      let immunities = 0;

      teamMembers.forEach((member) => {
        const mults = calculateTypeEffectiveness(member.types);
        const mult = mults[attackType] ?? 1;
        if (mult > 1) weaknesses++;
        else if (mult === 0) immunities++;
        else if (mult < 1) resistances++;
      });

      return {
        type: attackType,
        weaknesses,
        resistances,
        immunities,
        balance: resistances + immunities - weaknesses,
      };
    });
  }, [teamMembers]);

  // Candidates for picker
  const pickerCandidates = useMemo(() => {
    if (!pickerSearch.trim()) return masterList.slice(0, 36);
    const q = pickerSearch.toLowerCase().trim();
    return masterList
      .filter((p) => p.name.toLowerCase().includes(q) || p.id.toString() === q)
      .slice(0, 36);
  }, [masterList, pickerSearch]);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* Banner */}
      <div className={`rounded-3xl border p-5 sm:p-6 shadow-lg ${
        isLight
          ? 'bg-gradient-to-r from-[#F4EFE6] via-[#EDE6DA] to-[#F4EFE6] border-[#DCBD85]'
          : 'bg-gradient-to-r from-[#0d2433] via-[#163c50] to-[#0d2433] border-[#046683]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DCBD85]/20 border border-[#DCBD85]/40 text-[#DCBD85]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-[#123244]' : 'text-white'}`}>
                Construtor de Equipe <span className="text-[#48A0B6]">Quickdex</span>
              </h2>
              <p className={`text-xs sm:text-sm ${isLight ? 'text-[#046683]' : 'text-[#B8DAE3]/80'}`}>
                Monte sua equipe de 6 Pokémon e analise a cobertura defensiva de tipos em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {teamIds.length > 0 && (
              <button
                onClick={() => {
                  sound.playClick();
                  onClearTeam();
                }}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                  isLight
                    ? 'bg-white border-[#DCBD85] text-rose-500 hover:bg-rose-50'
                    : 'bg-[#0d2433] border-[#046683] text-[#B8DAE3] hover:text-rose-400 hover:border-rose-500/40'
                }`}
              >
                <Trash2 size={14} />
                <span>Limpar Time</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 6 Team Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const member = teamMembers[index];

          if (member) {
            return (
              <div
                key={`${member.id}-${index}`}
                className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 shadow-md transition-all hover:scale-[1.02] ${
                  isLight
                    ? 'bg-white border-[#DCBD85]'
                    : 'bg-gradient-to-b from-[#163c50] to-[#0d2433] border-[#046683]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-['JetBrains_Mono'] text-[11px] font-bold opacity-75">
                    {formatPokemonId(member.id)}
                  </span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onRemovePokemon(index);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                    title="Remover da Equipe"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div
                  className="flex flex-col items-center py-2 cursor-pointer"
                  onClick={() => {
                    sound.playClick();
                    onSelectPokemonDetail(member.id);
                  }}
                >
                  <img
                    src={member.officialArtwork || member.sprite}
                    alt={member.name}
                    className="h-20 w-20 object-contain drop-shadow transition-transform group-hover:scale-110"
                  />
                  <h4 className={`text-xs font-black text-center mt-2 truncate w-full ${isLight ? 'text-[#123244]' : 'text-white'}`}>
                    {formatPokemonName(member.name)}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1 justify-center">
                    {member.types.map((t) => (
                      <TypeBadge key={t} type={t} size="sm" />
                    ))}
                  </div>
                </div>

                <div className={`mt-2 flex items-center justify-between border-t pt-2 text-[10px] font-mono ${
                  isLight ? 'border-[#E2D9CC]' : 'border-[#046683]/50'
                }`}>
                  <span className="opacity-75">BST:</span>
                  <strong className="text-[#DCBD85]">{member.bst}</strong>
                </div>
              </div>
            );
          }

          return (
            <button
              key={`empty-${index}`}
              onClick={() => {
                sound.playClick();
                setIsPickerOpen(true);
              }}
              className={`flex flex-col items-center justify-center min-h-[170px] rounded-2xl border-2 border-dashed p-4 transition-all duration-200 group active:scale-95 ${
                isLight
                  ? 'border-[#DCBD85]/60 bg-white/60 hover:bg-white hover:border-[#DCBD85]'
                  : 'border-[#046683]/60 bg-[#0d2433]/40 hover:bg-[#163c50]/40 hover:border-[#48A0B6]'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#48A0B6]/15 border border-[#48A0B6]/40 text-[#48A0B6] group-hover:scale-110 transition-transform mb-2">
                <Plus size={20} />
              </div>
              <span className={`text-xs font-extrabold ${isLight ? 'text-[#123244]' : 'text-[#B8DAE3]'}`}>
                Adicionar #{index + 1}
              </span>
              <span className="text-[10px] opacity-60 text-center mt-1">
                Toque para escolher Pokémon
              </span>
            </button>
          );
        })}
      </div>

      {/* Team Defensive Vulnerability & Resistance Matrix */}
      <div className={`rounded-3xl border p-5 sm:p-6 shadow-xl ${
        isLight ? 'bg-white border-[#DCBD85]' : 'bg-[#0d2433] border-[#046683]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className={`text-sm sm:text-base font-black uppercase tracking-wider ${isLight ? 'text-[#123244]' : 'text-white'}`}>
              Análise de Cobertura Defensiva do Time
            </h3>
            <p className={`text-xs ${isLight ? 'text-[#046683]' : 'text-[#B8DAE3]/70'}`}>
              Verifique quantos membros são fracos ou resistentes a cada um dos 18 tipos Pokémon
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1 text-rose-400">
              <AlertTriangle size={14} /> Fraquezas
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 size={14} /> Resistências
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {teamDefensiveMatrix.map((item) => {
            const hasThreat = item.weaknesses >= 3;
            const isProtected = item.resistances + item.immunities >= item.weaknesses;

            return (
              <div
                key={item.type}
                className={`rounded-2xl border p-3 flex flex-col justify-between transition-all ${
                  hasThreat
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : isProtected
                    ? isLight
                      ? 'bg-[#F4EFE6] border-[#DCBD85]'
                      : 'bg-[#123244] border-[#046683]'
                    : isLight
                    ? 'bg-white border-[#E2D9CC]'
                    : 'bg-[#123244]/60 border-[#046683]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <TypeBadge type={item.type} size="sm" />
                  {hasThreat && (
                    <span className="text-[10px] font-black bg-rose-500 text-white px-1.5 rounded" title="Perigo: 3 ou mais membros sofrem dano super efetivo!">
                      Perigo!
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-rose-400">
                    <span>Fraco:</span>
                    <strong>{item.weaknesses}x</strong>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Resist:</span>
                    <strong>{item.resistances + item.immunities}x</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pokémon Picker Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md bg-black/80 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsPickerOpen(false)} />
          <div
            className={`relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-[24px] border shadow-2xl ${
              isLight ? 'bg-[#FDFBF7] border-[#DCBD85] text-[#123244]' : 'bg-[#123244] border-[#046683] text-[#B8DAE3]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between border-b p-4 ${
              isLight ? 'bg-[#F4EFE6] border-[#E2D9CC]' : 'bg-[#0d2433] border-[#046683]'
            }`}>
              <h3 className={`text-base font-black ${isLight ? 'text-[#123244]' : 'text-white'}`}>
                Escolher Pokémon para o Time
              </h3>
              <button
                onClick={() => setIsPickerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/10 hover:bg-rose-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className={`p-3 border-b ${isLight ? 'border-[#E2D9CC]' : 'border-[#046683]/50'}`}>
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#48A0B6]" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Pesquisar por nome ou ID..."
                  className={`w-full rounded-xl border pl-9 pr-4 py-2 text-xs focus:outline-none ${
                    isLight ? 'bg-white border-[#DCBD85] text-[#123244]' : 'bg-[#0d2433] border-[#046683] text-white'
                  }`}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {pickerCandidates.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    sound.playClick();
                    onAddPokemon(p.id);
                    setIsPickerOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all hover:scale-102 ${
                    isLight
                      ? 'bg-white border-[#E2D9CC] hover:border-[#DCBD85] hover:bg-[#F4EFE6]'
                      : 'bg-[#0d2433] border-[#046683] hover:border-[#48A0B6] hover:bg-[#163c50]'
                  }`}
                >
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                    alt={p.name}
                    className="h-10 w-10 object-contain"
                  />
                  <div className="truncate">
                    <span className="font-mono text-[10px] opacity-70 block">
                      {formatPokemonId(p.id)}
                    </span>
                    <span className={`text-xs font-black truncate block ${isLight ? 'text-[#123244]' : 'text-white'}`}>
                      {formatPokemonName(p.name)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
