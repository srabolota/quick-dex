import React, { useState, useEffect, useMemo, useTransition } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  Shield,
  Activity,
  Zap,
  BookOpen,
  Compass,
} from 'lucide-react';
import { PokemonFullDetail, PokemonSummary } from '../types/pokemon';
import {
  fetchEvolutionChain,
  fetchPokemonFullDetail,
  getOfficialArtworkUrl,
  getShinyArtworkUrl,
} from '../services/pokeapi';
import { formatMoveName, formatPokemonId, formatPokemonName } from '../utils/translations';
import { TypeBadge } from './TypeBadge';
import { StatBar } from './StatBar';
import { analyzeDefensiveMatchups } from '../utils/typeMatrix';
import { NATURES_LIST, getNatureMultiplier } from '../utils/natures';
import { sound } from '../utils/audio';

interface PokemonDetailModalProps {
  pokemonSummary: PokemonSummary;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onClose: () => void;
  onNavigate: (newId: number) => void;
  hasPrev: boolean;
  hasNext: boolean;
}

type TabType = 'stats' | 'effectiveness' | 'evolution' | 'moves' | 'abilities_natures';

export const PokemonDetailModal: React.FC<PokemonDetailModalProps> = ({
  pokemonSummary,
  isFavorite,
  onToggleFavorite,
  onClose,
  onNavigate,
  hasPrev,
  hasNext,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [isShiny, setIsShiny] = useState<boolean>(false);
  const [showSparkles, setShowSparkles] = useState<boolean>(false);
  const [detail, setDetail] = useState<PokemonFullDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [evolutionTree, setEvolutionTree] = useState<unknown | null>(null);
  const [selectedNature, setSelectedNature] = useState<string>('Hardy');
  const [moveFilter, setMoveFilter] = useState<'all' | 'level-up' | 'machine' | 'egg'>('level-up');
  const [, startTransition] = useTransition();

  // Load detailed information when modal opens or pokemon changes
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setIsShiny(false);

    fetchPokemonFullDetail(pokemonSummary.id)
      .then(async (data) => {
        if (!isCurrent) return;
        setDetail(data);
        setLoading(false);

        if (data.evolutionChainId) {
          const evo = await fetchEvolutionChain(data.evolutionChainId);
          if (isCurrent) setEvolutionTree(evo);
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar detalhes:', err);
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [pokemonSummary.id]);

  // Handle keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev) {
        sound.playClick();
        onNavigate(pokemonSummary.id - 1);
      } else if (e.key === 'ArrowRight' && hasNext) {
        sound.playClick();
        onNavigate(pokemonSummary.id + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrev, hasNext, onClose, onNavigate, pokemonSummary.id]);

  const handleTabChange = (tab: TabType) => {
    sound.playTab();
    setActiveTab(tab);
  };

  const handleShinyToggle = () => {
    const nextState = !isShiny;
    setIsShiny(nextState);
    if (nextState) {
      sound.playShiny();
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 900);
    } else {
      sound.playClick();
    }
  };

  const handlePlayCry = () => {
    sound.playCry(detail?.cries || null);
  };

  const handleFavoriteClick = () => {
    sound.playFavorite(!isFavorite);
    onToggleFavorite(pokemonSummary.id);
  };

  // Calculate defensive matchups
  const defensiveAnalysis = useMemo(() => {
    return analyzeDefensiveMatchups(pokemonSummary.types);
  }, [pokemonSummary.types]);

  // Calculate BST Rating
  const getBstEvaluation = (bst: number) => {
    if (bst >= 670) return { label: 'Titã Lendário', color: 'text-amber-300' };
    if (bst >= 580) return { label: 'Semi-Lendário / Elite', color: 'text-[#00d2ff]' };
    if (bst >= 500) return { label: 'Excepcional', color: 'text-emerald-400' };
    if (bst >= 430) return { label: 'Forte / Competitivo', color: 'text-[#ffe600]' };
    if (bst >= 350) return { label: 'Balanceado', color: 'text-slate-300' };
    return { label: 'Estágio Inicial', color: 'text-slate-400' };
  };

  const currentArtwork = isShiny
    ? detail?.shinyArtwork || getShinyArtworkUrl(pokemonSummary.id)
    : detail?.officialArtwork || getOfficialArtworkUrl(pokemonSummary.id);

  // Filter moves
  const filteredMoves = useMemo(() => {
    if (!detail) return [];
    if (moveFilter === 'all') return detail.moves;
    return detail.moves.filter((m) => m.learnMethod === moveFilter);
  }, [detail, moveFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 backdrop-blur-md bg-black/75 transition-opacity">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Modal Card Container */}
      <div
        className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[20px] border border-[#00d2ff]/30 bg-[#0d1520] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,210,255,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Banner with Quick Ball Theme Accents */}
        <div className="relative overflow-hidden border-b border-[#00d2ff]/20 bg-gradient-to-r from-[#0a1c2e] via-[#102a45] to-[#0a1c2e] p-4 sm:p-6">
          {/* Decorative Quick Ball Yellow Wings */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#00d2ff]/10 blur-xl" />
          <div className="pointer-events-none absolute left-1/4 -bottom-10 h-28 w-28 rounded-full bg-[#ffe600]/10 blur-lg" />

          {/* Action Bar: Prev/Next, Shiny, Cry, Favorite, Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                disabled={!hasPrev}
                onClick={() => onNavigate(pokemonSummary.id - 1)}
                className="flex items-center justify-center rounded-xl bg-[#131d2a] p-2 text-slate-300 transition-all hover:bg-[#00d2ff] hover:text-black disabled:opacity-30 disabled:hover:bg-[#131d2a] disabled:hover:text-slate-300 active:scale-95 border border-[#00d2ff]/20"
                title="Pokémon Anterior (Seta Esquerda)"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={!hasNext}
                onClick={() => onNavigate(pokemonSummary.id + 1)}
                className="flex items-center justify-center rounded-xl bg-[#131d2a] p-2 text-slate-300 transition-all hover:bg-[#00d2ff] hover:text-black disabled:opacity-30 disabled:hover:bg-[#131d2a] disabled:hover:text-slate-300 active:scale-95 border border-[#00d2ff]/20"
                title="Próximo Pokémon (Seta Direita)"
              >
                <ChevronRight size={20} />
              </button>

              <span className="ml-1 font-['JetBrains_Mono',monospace] text-sm font-bold text-[#00d2ff]">
                {formatPokemonId(pokemonSummary.id)}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Shiny Toggle Button */}
              <button
                onClick={handleShinyToggle}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                  isShiny
                    ? 'bg-gradient-to-r from-[#ffe600] to-amber-500 text-black shadow-[0_0_15px_rgba(255,230,0,0.5)]'
                    : 'bg-[#131d2a] text-slate-300 hover:text-[#ffe600] border border-[#ffe600]/30 hover:border-[#ffe600]'
                }`}
                title="Alternar versão Shiny Brilhante"
              >
                <Sparkles size={16} className={isShiny ? 'animate-spin' : ''} />
                <span>SHINY ✨</span>
              </button>

              {/* Cry sound button */}
              <button
                onClick={handlePlayCry}
                className="flex items-center gap-1.5 rounded-xl bg-[#131d2a] border border-[#00d2ff]/30 px-3 py-1.5 text-xs font-bold text-[#00d2ff] transition-all hover:bg-[#00d2ff]/10 active:scale-95"
                title="Ouvir o Grito do Pokémon"
              >
                <Volume2 size={16} />
                <span className="hidden sm:inline">Grito</span>
              </button>

              {/* Favorite button */}
              <button
                onClick={handleFavoriteClick}
                className={`rounded-xl p-2 transition-all active:scale-90 ${
                  isFavorite
                    ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                    : 'bg-[#131d2a] text-slate-400 hover:text-rose-400 border border-slate-700'
                }`}
                title={isFavorite ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
              >
                <Heart size={18} className={isFavorite ? 'fill-rose-500' : ''} />
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="rounded-xl bg-[#131d2a] p-2 text-slate-400 transition-all hover:bg-rose-500 hover:text-white border border-slate-700"
                title="Fechar (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Centerpiece: Pokemon Artwork & Quick Meta Information */}
          <div className="mt-4 flex flex-col items-center justify-between gap-4 md:flex-row md:items-center">
            {/* Pokemon Name, Genus, Badges and Quick Measurements */}
            <div className="flex flex-col items-center md:items-start">
              <h2 className="text-2xl font-black text-white sm:text-3xl md:text-4xl tracking-tight">
                {formatPokemonName(pokemonSummary.name)}
              </h2>

              <p className="mt-0.5 text-xs font-medium text-[#00d2ff]/90 sm:text-sm">
                {detail?.genus || 'Pokémon'}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {pokemonSummary.types.map((type) => (
                  <TypeBadge key={type} type={type} size="md" />
                ))}
              </div>

              {/* Physical measurements */}
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
                <div className="rounded-lg bg-[#0d1520]/60 px-2.5 py-1 border border-white/5">
                  <span className="text-slate-400">Altura:</span>{' '}
                  <strong className="text-white">{(pokemonSummary.height / 10).toFixed(1)} m</strong>
                </div>
                <div className="rounded-lg bg-[#0d1520]/60 px-2.5 py-1 border border-white/5">
                  <span className="text-slate-400">Peso:</span>{' '}
                  <strong className="text-white">{(pokemonSummary.weight / 10).toFixed(1)} kg</strong>
                </div>
                <div className="rounded-lg bg-[#0d1520]/60 px-2.5 py-1 border border-white/5 hidden sm:inline-block">
                  <span className="text-slate-400">Captura:</span>{' '}
                  <strong className="text-[#ffe600]">{detail?.captureRate ?? 45} / 255</strong>
                </div>
              </div>
            </div>

            {/* Artwork with Shiny Sparkle Layer */}
            <div className="relative flex h-40 w-40 sm:h-48 sm:w-48 items-center justify-center">
              {showSparkles && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                  <span className="absolute -top-2 left-6 text-2xl sparkle-fx">✨</span>
                  <span className="absolute bottom-2 right-4 text-3xl sparkle-fx">⭐</span>
                  <span className="absolute top-8 right-2 text-xl sparkle-fx">🌟</span>
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00d2ff]/10 to-[#ffe600]/10 blur-xl animate-pulse-subtle" />
              <img
                src={currentArtwork}
                alt={pokemonSummary.name}
                className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>

          {/* Flavor Text / Pokédex Description */}
          {detail?.flavorText && (
            <div className="mt-3 rounded-xl bg-[#08101a]/70 p-3 text-xs italic text-slate-300 border border-white/5 leading-relaxed">
              &ldquo;{detail.flavorText}&rdquo;
            </div>
          )}
        </div>

        {/* 5 Tabs Navigation Bar */}
        <div className="flex border-b border-[#00d2ff]/20 bg-[#101a28] overflow-x-auto text-xs sm:text-sm font-bold scrollbar-none">
          <button
            onClick={() => handleTabChange('stats')}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
              activeTab === 'stats'
                ? 'border-[#00d2ff] bg-[#142336] text-[#00d2ff]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Activity size={16} />
            <span>1. Status Base</span>
          </button>

          <button
            onClick={() => handleTabChange('effectiveness')}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
              activeTab === 'effectiveness'
                ? 'border-[#00d2ff] bg-[#142336] text-[#00d2ff]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Shield size={16} />
            <span>2. Efetividade</span>
          </button>

          <button
            onClick={() => handleTabChange('evolution')}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
              activeTab === 'evolution'
                ? 'border-[#00d2ff] bg-[#142336] text-[#00d2ff]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Zap size={16} />
            <span>3. Evoluções</span>
          </button>

          <button
            onClick={() => handleTabChange('moves')}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
              activeTab === 'moves'
                ? 'border-[#00d2ff] bg-[#142336] text-[#00d2ff]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={16} />
            <span>4. Golpes (Moveset)</span>
          </button>

          <button
            onClick={() => handleTabChange('abilities_natures')}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
              activeTab === 'abilities_natures'
                ? 'border-[#00d2ff] bg-[#142336] text-[#00d2ff]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Compass size={16} />
            <span>5. Habilidades & Natures</span>
          </button>
        </div>

        {/* Tab Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0d1520] text-slate-200">
          {loading && !detail ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00d2ff] border-t-transparent" />
              <p className="text-xs font-semibold text-slate-400">Carregando dados da PokéAPI...</p>
            </div>
          ) : (
            <>
              {/* ABA 1: STATUS BASE */}
              {activeTab === 'stats' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#142030] p-4 border border-[#00d2ff]/20">
                    <div>
                      <span className="text-xs font-semibold uppercase text-slate-400">
                        Base Stat Total (BST)
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[#ffe600]">
                          {pokemonSummary.bst}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">pontos</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#0d1520] px-4 py-2 text-right border border-white/5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase block">
                        Classificação de Combate
                      </span>
                      <span className={`text-sm font-extrabold ${getBstEvaluation(pokemonSummary.bst).color}`}>
                        {getBstEvaluation(pokemonSummary.bst).label}
                      </span>
                    </div>
                  </div>

                  {/* Stat Bars List */}
                  <div className="rounded-2xl bg-[#121c2a] p-4 border border-white/5">
                    <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Valores de Atributo & Projeção Nível 100
                    </h4>
                    <div className="divide-y divide-slate-800/60">
                      {pokemonSummary.stats.map((stat) => (
                        <StatBar
                          key={stat.name}
                          statName={stat.name}
                          value={stat.baseStat}
                          natureMultiplier={getNatureMultiplier(selectedNature, stat.name)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stat Analysis Tip */}
                  <div className="rounded-xl bg-[#142336]/60 p-3.5 text-xs text-slate-300 border border-[#00d2ff]/20 flex items-start gap-3">
                    <span className="text-lg">💡</span>
                    <div>
                      <strong className="text-[#00d2ff] block mb-0.5">Dica Tática QuickDex:</strong>
                      As projeções de Nível 100 consideram a faixa de 0 IVs (mínimo neutro) até 31 IVs com 252 EVs aplicados. Para testar o impacto das 25 Natures (+10% / -10%), acesse a <strong>Aba 5 (Habilidades & Natures)</strong>.
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: EFETIVIDADE (FRAQUEZAS E RESISTÊNCIAS) */}
              {activeTab === 'effectiveness' && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-[#142030] p-4 border border-[#00d2ff]/20">
                    <h4 className="text-sm font-extrabold uppercase text-[#00d2ff] mb-1">
                      Matriz de Efetividade Defensiva
                    </h4>
                    <p className="text-xs text-slate-400">
                      Multiplicador automático calculado com base na combinação dos tipos [
                      {pokemonSummary.types.map((t) => formatPokemonName(t)).join(' + ')}].
                    </p>
                  </div>

                  {/* Super Weak (x4) */}
                  {defensiveAnalysis.quadWeakness.length > 0 && (
                    <div className="rounded-2xl bg-rose-950/20 p-4 border border-rose-500/30">
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wide text-rose-400 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                          Dano x4 (Super Fraco - Perigo Extremo)
                        </span>
                        <span className="text-[11px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">
                          400% de dano
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {defensiveAnalysis.quadWeakness.map((type) => (
                          <TypeBadge key={type} type={type} size="md" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weakness (x2) */}
                  <div className="rounded-2xl bg-orange-950/20 p-4 border border-orange-500/30">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-orange-400">
                        Dano x2 (Fraco - Fraquezas Comuns)
                      </span>
                      <span className="text-[11px] font-bold text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded">
                        200% de dano
                      </span>
                    </div>
                    {defensiveAnalysis.weakness.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {defensiveAnalysis.weakness.map((type) => (
                          <TypeBadge key={type} type={type} size="md" />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-500">Nenhuma fraqueza direta x2 encontrada.</p>
                    )}
                  </div>

                  {/* Resistance (x0.5) */}
                  <div className="rounded-2xl bg-emerald-950/20 p-4 border border-emerald-500/30">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-400">
                        Dano x1/2 (Resistente)
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                        50% de dano
                      </span>
                    </div>
                    {defensiveAnalysis.resistance.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {defensiveAnalysis.resistance.map((type) => (
                          <TypeBadge key={type} type={type} size="md" />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-500">Nenhuma resistência simples x0.5.</p>
                    )}
                  </div>

                  {/* Quad Resistance (x0.25) */}
                  {defensiveAnalysis.quadResistance.length > 0 && (
                    <div className="rounded-2xl bg-teal-950/20 p-4 border border-teal-500/30">
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wide text-teal-300">
                          Dano x1/4 (Super Resistente)
                        </span>
                        <span className="text-[11px] font-bold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded">
                          25% de dano
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {defensiveAnalysis.quadResistance.map((type) => (
                          <TypeBadge key={type} type={type} size="md" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Immunity (x0) */}
                  <div className="rounded-2xl bg-indigo-950/20 p-4 border border-indigo-500/30">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-indigo-300">
                        Imune x0 (Sem Dano)
                      </span>
                      <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
                        0% de dano
                      </span>
                    </div>
                    {defensiveAnalysis.immunity.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {defensiveAnalysis.immunity.map((type) => (
                          <TypeBadge key={type} type={type} size="md" />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-500">Nenhuma imunidade natural direta por tipo.</p>
                    )}
                  </div>

                  {/* Normal Damage (x1) */}
                  <div className="rounded-2xl bg-[#121c2a] p-4 border border-white/5">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                        Dano x1 (Neutro)
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                        100% de dano
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {defensiveAnalysis.normal.map((type) => (
                        <TypeBadge key={type} type={type} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 3: EVOLUÇÕES */}
              {activeTab === 'evolution' && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-[#142030] p-4 border border-[#00d2ff]/20">
                    <h4 className="text-sm font-extrabold uppercase text-[#00d2ff] mb-1">
                      Linha Evolutiva Completa
                    </h4>
                    <p className="text-xs text-slate-400">
                      Clique em qualquer estágio abaixo para carregar os detalhes do respectivo Pokémon.
                    </p>
                  </div>

                  {evolutionTree ? (
                    <div className="flex flex-col items-center justify-center gap-6 py-6 md:flex-row md:gap-4 overflow-x-auto">
                      <EvolutionNodeView
                        node={evolutionTree as any}
                        currentId={pokemonSummary.id}
                        onSelectPokemon={(id) => onNavigate(id)}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#121c2a] p-8 text-center text-slate-400 border border-white/5">
                      <p className="text-sm font-semibold">Este Pokémon não possui estágios evolutivos conhecidos.</p>
                      <p className="text-xs text-slate-500 mt-1">Exemplo: Lendários, Míticos ou formas isoladas.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ABA 4: LISTA DE GOLPES (MOVESET) */}
              {activeTab === 'moves' && (
                <div className="space-y-4">
                  {/* Moves Sub-filters */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#142030] p-3 border border-[#00d2ff]/20">
                    <span className="text-xs font-bold uppercase text-slate-400">Filtrar Origem:</span>
                    <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                      <button
                        onClick={() => {
                          sound.playClick();
                          setMoveFilter('level-up');
                        }}
                        className={`rounded-lg px-3 py-1.5 transition-all ${
                          moveFilter === 'level-up'
                            ? 'bg-[#00d2ff] text-black font-extrabold shadow-sm'
                            : 'bg-[#0d1520] text-slate-300 hover:text-white'
                        }`}
                      >
                        Por Nível
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          setMoveFilter('machine');
                        }}
                        className={`rounded-lg px-3 py-1.5 transition-all ${
                          moveFilter === 'machine'
                            ? 'bg-[#00d2ff] text-black font-extrabold shadow-sm'
                            : 'bg-[#0d1520] text-slate-300 hover:text-white'
                        }`}
                      >
                        TMs / Discos
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          setMoveFilter('egg');
                        }}
                        className={`rounded-lg px-3 py-1.5 transition-all ${
                          moveFilter === 'egg'
                            ? 'bg-[#00d2ff] text-black font-extrabold shadow-sm'
                            : 'bg-[#0d1520] text-slate-300 hover:text-white'
                        }`}
                      >
                        Egg Moves
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          setMoveFilter('all');
                        }}
                        className={`rounded-lg px-3 py-1.5 transition-all ${
                          moveFilter === 'all'
                            ? 'bg-[#ffe600] text-black font-extrabold shadow-sm'
                            : 'bg-[#0d1520] text-slate-300 hover:text-white'
                        }`}
                      >
                        Todos ({detail?.moves.length || 0})
                      </button>
                    </div>
                  </div>

                  {/* Moves Table */}
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121c2a]">
                    <div className="max-h-[380px] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-[#182538] text-[11px] font-extrabold uppercase tracking-wider text-slate-300 border-b border-white/10 z-10">
                          <tr>
                            <th className="px-3 py-2.5">
                              {moveFilter === 'level-up' ? 'Nível' : 'Método'}
                            </th>
                            <th className="px-3 py-2.5">Golpe</th>
                            <th className="px-3 py-2.5">Tipo</th>
                            <th className="px-3 py-2.5">Classe</th>
                            <th className="px-3 py-2.5 text-right">Poder</th>
                            <th className="px-3 py-2.5 text-right">Precisão</th>
                            <th className="px-3 py-2.5 text-right">PP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {filteredMoves.length > 0 ? (
                            filteredMoves.map((m, idx) => (
                              <tr key={`${m.name}-${idx}`} className="hover:bg-white/5 transition-colors">
                                <td className="px-3 py-2 font-mono font-bold text-[#00d2ff]">
                                  {m.learnMethod === 'level-up'
                                    ? m.levelLearnedAt === 0
                                      ? 'Evolução'
                                      : `Lv. ${m.levelLearnedAt}`
                                    : m.learnMethod === 'machine'
                                    ? 'TM'
                                    : m.learnMethod === 'egg'
                                    ? 'Ovo'
                                    : 'Tutor'}
                                </td>
                                <td className="px-3 py-2 font-bold text-white">
                                  {formatMoveName(m.name)}
                                </td>
                                <td className="px-3 py-2">
                                  <TypeBadge type={m.type} size="xs" />
                                </td>
                                <td className="px-3 py-2">
                                  <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-300 border border-white/5">
                                    {m.damageClass === 'physical' ? 'Físico 💥' : m.damageClass === 'special' ? 'Especial 🌀' : 'Status 🛡️'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right font-mono font-bold text-[#ffe600]">
                                  {m.power ? m.power : '-'}
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-slate-300">
                                  {m.accuracy ? `${m.accuracy}%` : '-'}
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-slate-400">
                                  {m.pp}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                                Nenhum golpe cadastrado nesta categoria de aprendizado.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 5: HABILIDADES & NATURES */}
              {activeTab === 'abilities_natures' && (
                <div className="space-y-6">
                  {/* Abilities Section */}
                  <div>
                    <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#00d2ff]">
                      Habilidades de Combate
                    </h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {detail?.abilities.map((ab) => (
                        <div
                          key={ab.name}
                          className={`rounded-2xl p-4 border transition-all ${
                            ab.isHidden
                              ? 'bg-gradient-to-br from-amber-950/30 to-[#142030] border-[#ffe600]/40'
                              : 'bg-[#121c2a] border-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-extrabold text-white text-sm">
                              {ab.ptName}
                            </span>
                            {ab.isHidden ? (
                              <span className="rounded-lg bg-[#ffe600]/20 border border-[#ffe600]/40 px-2 py-0.5 text-[10px] font-extrabold text-[#ffe600]">
                                ✨ Habilidade Oculta
                              </span>
                            ) : (
                              <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                                Padrão
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {ab.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nature Calculator & Reference Section */}
                  <div className="rounded-2xl bg-[#121c2a] p-4 sm:p-5 border border-[#00d2ff]/20">
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-[#00d2ff] uppercase">
                          Calculadora de Natures (+10% / -10%)
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Selecione uma das 25 Natures para testar modificadores diretos de status.
                        </p>
                      </div>

                      {/* Nature Selector Dropdown */}
                      <select
                        value={selectedNature}
                        onChange={(e) => {
                          sound.playClick();
                          startTransition(() => {
                            setSelectedNature(e.target.value);
                          });
                        }}
                        className="rounded-xl bg-[#0d1520] border border-[#00d2ff]/40 px-3 py-2 text-xs font-bold text-[#ffe600] focus:outline-none focus:ring-2 focus:ring-[#00d2ff]"
                      >
                        {NATURES_LIST.map((n) => (
                          <option key={n.name} value={n.name}>
                            {n.ptName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Active Nature Summary */}
                    {(() => {
                      const cur = NATURES_LIST.find((n) => n.name === selectedNature);
                      if (!cur) return null;
                      return (
                        <div className="rounded-xl bg-[#0d1520]/80 p-3.5 border border-white/5 mb-4 text-xs">
                          <span className="font-bold text-white block mb-1">
                            Efeito de {cur.ptName}:
                          </span>
                          <span className="text-slate-300">{cur.description}</span>
                        </div>
                      );
                    })()}

                    {/* Preview Table of All 25 Natures */}
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-[#182538] text-[10px] font-extrabold uppercase text-slate-300">
                          <tr>
                            <th className="p-2">Nature</th>
                            <th className="p-2 text-emerald-400">+10% Stat</th>
                            <th className="p-2 text-rose-400">-10% Stat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-[11px]">
                          {NATURES_LIST.map((item) => (
                            <tr
                              key={item.name}
                              onClick={() => {
                                sound.playClick();
                                setSelectedNature(item.name);
                              }}
                              className={`cursor-pointer transition-colors ${
                                selectedNature === item.name
                                  ? 'bg-[#00d2ff]/20 font-bold'
                                  : 'hover:bg-white/5 text-slate-300'
                              }`}
                            >
                              <td className="p-2 text-white">{item.name}</td>
                              <td className="p-2 text-emerald-400">
                                {item.increasedStat ? item.increasedStat.toUpperCase() : 'Nenhum'}
                              </td>
                              <td className="p-2 text-rose-400">
                                {item.decreasedStat ? item.decreasedStat.toUpperCase() : 'Nenhum'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Helper to render evolution stages recursively with arrows and conditions
 */
interface EvolutionNodeProps {
  node: {
    id: number;
    name: string;
    types: any[];
    sprite: string;
    trigger: string;
    evolvesTo: any[];
  };
  currentId: number;
  onSelectPokemon: (id: number) => void;
}

const EvolutionNodeView: React.FC<EvolutionNodeProps> = ({ node, currentId, onSelectPokemon }) => {
  const isCurrent = node.id === currentId;

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      {/* Node Card */}
      <div
        onClick={() => {
          if (!isCurrent) {
            sound.playClick();
            onSelectPokemon(node.id);
          }
        }}
        className={`flex flex-col items-center rounded-2xl p-3 border transition-all cursor-pointer ${
          isCurrent
            ? 'bg-[#182a40] border-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.4)] scale-105'
            : 'bg-[#121c2a] border-white/10 hover:border-[#ffe600] hover:scale-105'
        }`}
      >
        <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-slate-400">
          {formatPokemonId(node.id)}
        </span>
        <img
          src={node.sprite}
          alt={node.name}
          className="h-20 w-20 object-contain drop-shadow my-1"
        />
        <span className="text-xs font-bold text-white text-center">
          {formatPokemonName(node.name)}
        </span>
        {isCurrent && (
          <span className="mt-1 rounded bg-[#00d2ff] px-2 py-0.5 text-[9px] font-extrabold text-black">
            Atual
          </span>
        )}
      </div>

      {/* Children branches */}
      {node.evolvesTo && node.evolvesTo.length > 0 && (
        <div className="flex flex-col gap-4">
          {node.evolvesTo.map((child: any) => (
            <div key={child.id} className="flex flex-col md:flex-row items-center gap-4">
              {/* Evolution requirement arrow */}
              <div className="flex flex-col items-center justify-center text-center px-2 py-1 bg-[#101a28] rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-[#ffe600]">
                  {child.trigger}
                </span>
                <span className="text-slate-400 text-xs">➔</span>
              </div>
              <EvolutionNodeView
                node={child}
                currentId={currentId}
                onSelectPokemon={onSelectPokemon}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
