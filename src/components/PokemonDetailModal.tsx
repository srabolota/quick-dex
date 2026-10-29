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
  ArrowRight,
  TrendingUp,
  MapPin,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { EncounterLocation, PokemonFullDetail, PokemonSummary } from '../types/pokemon';
import {
  fetchEvolutionChain,
  fetchPokemonEncounters,
  fetchPokemonFullDetail,
  getOfficialArtworkUrl,
  getShinyArtworkUrl,
} from '../services/pokeapi';
import {
  formatMoveName,
  formatPokemonId,
  formatPokemonName,
  formatAbilityName,
  getBulbapediaUrl,
  PARADOX_RELATIONS,
  NamingMode,
} from '../utils/translations';
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
  namingMode?: NamingMode;
}

type TabType = 'stats' | 'effectiveness' | 'evolution' | 'moves' | 'abilities_natures' | 'locations';

interface RelatedFormButton {
  id: number;
  name: string;
  badgeLabel: string;
  icon: string;
  isCurrent: boolean;
  typeColor: string;
}

export const PokemonDetailModal: React.FC<PokemonDetailModalProps> = ({
  pokemonSummary,
  isFavorite,
  onToggleFavorite,
  onClose,
  onNavigate,
  hasPrev,
  hasNext,
  namingMode = 'pt-en',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [isShiny, setIsShiny] = useState<boolean>(false);
  const [showSparkles, setShowSparkles] = useState<boolean>(false);
  const [detail, setDetail] = useState<PokemonFullDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [evolutionTree, setEvolutionTree] = useState<any | null>(null);
  const [selectedNature, setSelectedNature] = useState<string>('Hardy');
  const [moveFilter, setMoveFilter] = useState<'all' | 'level-up' | 'machine' | 'egg'>('level-up');
  const [imgFallbackIndex, setImgFallbackIndex] = useState<number>(0);
  const [, startTransition] = useTransition();

  // Locations state
  const [encounters, setEncounters] = useState<EncounterLocation[] | null>(null);
  const [loadingEncounters, setLoadingEncounters] = useState<boolean>(false);
  const [selectedLocationRegion, setSelectedLocationRegion] = useState<string>('all');

  // Load detailed information when modal opens or pokemon changes
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setIsShiny(false);
    setImgFallbackIndex(0);
    setEncounters(null);

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

  // Load locations on demand or when tab is selected
  useEffect(() => {
    if (activeTab === 'locations' && !encounters && detail) {
      setLoadingEncounters(true);
      const baseId =
        detail.id > 10000 && detail.varieties
          ? detail.varieties.find((v) => v.isDefault)?.id || detail.id
          : detail.id;

      fetchPokemonEncounters(detail.id, baseId)
        .then((data) => {
          setEncounters(data);
          setLoadingEncounters(false);
        })
        .catch(() => {
          setEncounters([]);
          setLoadingEncounters(false);
        });
    }
  }, [activeTab, encounters, detail]);

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
    setImgFallbackIndex(0);
    if (nextState) {
      sound.playShiny();
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1200);
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
    if (bst >= 670) return { label: 'Titã Lendário', color: 'text-[#EFD7AD]', bg: 'bg-[#046683]/40 border-[#DCBD85]/60' };
    if (bst >= 580) return { label: 'Semi-Lendário / Elite', color: 'text-[#48A0B6]', bg: 'bg-[#046683]/30 border-[#48A0B6]/40' };
    if (bst >= 500) return { label: 'Excepcional', color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-500/30' };
    if (bst >= 430) return { label: 'Forte / Competitivo', color: 'text-[#DCBD85]', bg: 'bg-[#DCBD85]/10 border-[#DCBD85]/30' };
    if (bst >= 350) return { label: 'Balanceado', color: 'text-[#B8DAE3]', bg: 'bg-[#123244] border-[#046683]' };
    return { label: 'Estágio Inicial', color: 'text-[#B8DAE3]/60', bg: 'bg-[#123244]/60 border-[#046683]/40' };
  };

  // Artwork resolution chain for high-res official images
  const artworkCandidates = useMemo(() => {
    const id = pokemonSummary.id;
    return [
      isShiny
        ? detail?.shinyArtwork || getShinyArtworkUrl(id)
        : detail?.officialArtwork || getOfficialArtworkUrl(id),
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? 'shiny/' : ''}${id}.png`,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${isShiny ? 'shiny/' : ''}${id}.png`,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${isShiny ? 'shiny/' : ''}${id}.gif`,
      pokemonSummary.sprite,
    ];
  }, [detail, isShiny, pokemonSummary]);

  const currentArtwork = artworkCandidates[Math.min(imgFallbackIndex, artworkCandidates.length - 1)];

  // Bulbapedia Link
  const bulbapediaUrl = useMemo(() => {
    return getBulbapediaUrl(pokemonSummary.name);
  }, [pokemonSummary.name]);

  // Comprehensive Related Forms List: Megas, Gigantamax, Regionals, and Paradox
  const allRelatedForms = useMemo(() => {
    const list: RelatedFormButton[] = [];
    const seenIds = new Set<number>();

    // 1. Check Varieties from species data (Megas, GMax, Regionals, Alola/Galar/Hisui/Paldea)
    if (detail?.varieties && detail.varieties.length > 1) {
      detail.varieties.forEach((v) => {
        if (!seenIds.has(v.id)) {
          seenIds.add(v.id);
          let badgeLabel = v.ptName;
          let icon = '⚡';
          let typeColor = 'border-[#48A0B6]';

          if (v.formType === 'mega') {
            badgeLabel = v.name.includes('-x') ? 'Mega X' : v.name.includes('-y') ? 'Mega Y' : 'Megaevolução';
            icon = '💠';
            typeColor = 'border-purple-400 text-purple-300';
          } else if (v.formType === 'gmax') {
            badgeLabel = 'Gigantamax';
            icon = '🌀';
            typeColor = 'border-rose-400 text-rose-300';
          } else if (v.formType === 'regional') {
            badgeLabel = v.ptName;
            icon = '🗺️';
            typeColor = 'border-amber-400 text-amber-300';
          } else if (v.isDefault) {
            badgeLabel = 'Forma Base';
            icon = '✨';
          }

          list.push({
            id: v.id,
            name: v.name,
            badgeLabel,
            icon,
            isCurrent: v.id === pokemonSummary.id,
            typeColor,
          });
        }
      });
    }

    // 2. Check Paradox relationships
    const currentId = pokemonSummary.id;
    const currentName = pokemonSummary.name.toLowerCase();

    PARADOX_RELATIONS.forEach((rel) => {
      const isBase = currentId === rel.baseSpeciesId || currentName === rel.baseSpeciesName;
      const isPast = rel.paradoxPast && (currentId === rel.paradoxPast.id || currentName === rel.paradoxPast.name);
      const isFuture = rel.paradoxFuture && (currentId === rel.paradoxFuture.id || currentName === rel.paradoxFuture.name);

      if (isBase || isPast || isFuture) {
        // Add Base Species if not already present
        if (!seenIds.has(rel.baseSpeciesId)) {
          seenIds.add(rel.baseSpeciesId);
          list.push({
            id: rel.baseSpeciesId,
            name: rel.baseSpeciesName,
            badgeLabel: `Base: ${formatPokemonName(rel.baseSpeciesName)}`,
            icon: '🌱',
            isCurrent: currentId === rel.baseSpeciesId,
            typeColor: 'border-emerald-400 text-emerald-300',
          });
        }

        // Add Past Paradox
        if (rel.paradoxPast && !seenIds.has(rel.paradoxPast.id)) {
          seenIds.add(rel.paradoxPast.id);
          list.push({
            id: rel.paradoxPast.id,
            name: rel.paradoxPast.name,
            badgeLabel: `Passado: ${rel.paradoxPast.ptName}`,
            icon: '⏳',
            isCurrent: currentId === rel.paradoxPast.id,
            typeColor: 'border-amber-400 text-amber-300',
          });
        }

        // Add Future Paradox
        if (rel.paradoxFuture && !seenIds.has(rel.paradoxFuture.id)) {
          seenIds.add(rel.paradoxFuture.id);
          list.push({
            id: rel.paradoxFuture.id,
            name: rel.paradoxFuture.name,
            badgeLabel: `Futuro: ${rel.paradoxFuture.ptName}`,
            icon: '⚙️',
            isCurrent: currentId === rel.paradoxFuture.id,
            typeColor: 'border-cyan-400 text-cyan-300',
          });
        }
      }
    });

    return list;
  }, [detail, pokemonSummary]);

  // Filter moves
  const filteredMoves = useMemo(() => {
    if (!detail) return [];
    if (moveFilter === 'all') return detail.moves;
    return detail.moves.filter((m) => m.learnMethod === moveFilter);
  }, [detail, moveFilter]);

  // Group locations by Game Version
  const groupedLocations = useMemo(() => {
    if (!encounters || encounters.length === 0) return {};
    const groups: Record<string, EncounterLocation[]> = {};

    encounters.forEach((item) => {
      if (selectedLocationRegion !== 'all' && !item.versionGroup.toLowerCase().includes(selectedLocationRegion.toLowerCase())) {
        return;
      }
      if (!groups[item.version]) {
        groups[item.version] = [];
      }
      groups[item.version].push(item);
    });

    return groups;
  }, [encounters, selectedLocationRegion]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-md bg-[#0d1e29]/85 transition-opacity animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Modal Card Container */}
      <div
        className="relative z-10 flex max-h-[96vh] sm:max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] sm:rounded-[26px] border border-[#046683] bg-[#123244] text-[#B8DAE3] shadow-[0_25px_65px_rgba(0,0,0,0.9),0_0_35px_rgba(72,160,182,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Banner with Petroleum and Gold Palette */}
        <div className="relative shrink-0 overflow-hidden border-b border-[#046683] bg-gradient-to-r from-[#0d2433] via-[#163c50] to-[#0d2433] p-3.5 sm:p-5">
          {/* Decorative Glowing Elements */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#48A0B6]/15 blur-2xl" />
          <div className="pointer-events-none absolute left-1/4 -bottom-10 h-32 w-32 rounded-full bg-[#DCBD85]/15 blur-xl" />

          {/* Action Bar: Prev/Next, ID, Shiny, Cry, Favorite, Bulbapedia, Close */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                disabled={!hasPrev}
                onClick={() => onNavigate(pokemonSummary.id - 1)}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#0d2433] text-[#B8DAE3] transition-all hover:bg-[#48A0B6] hover:text-[#123244] disabled:opacity-30 disabled:hover:bg-[#0d2433] disabled:hover:text-[#B8DAE3] active:scale-95 border border-[#046683]"
                title="Pokémon Anterior (Seta Esquerda)"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={!hasNext}
                onClick={() => onNavigate(pokemonSummary.id + 1)}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#0d2433] text-[#B8DAE3] transition-all hover:bg-[#48A0B6] hover:text-[#123244] disabled:opacity-30 disabled:hover:bg-[#0d2433] disabled:hover:text-[#B8DAE3] active:scale-95 border border-[#046683]"
                title="Próximo Pokémon (Seta Direita)"
              >
                <ChevronRight size={16} />
              </button>

              <span className="font-['JetBrains_Mono',monospace] text-xs sm:text-sm font-bold text-[#DCBD85] bg-[#0d2433]/90 px-2.5 py-1 rounded-lg border border-[#046683]">
                {formatPokemonId(pokemonSummary.id)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Bulbapedia External Link Button */}
              <a
                href={bulbapediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-xl bg-[#0d2433] border border-[#046683] px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-[#B8DAE3] hover:text-white hover:border-[#48A0B6] transition-all active:scale-95"
                title="Consultar artigo oficial na Bulbapedia"
              >
                <span>🔗 Bulbapedia</span>
                <ExternalLink size={12} className="text-[#48A0B6]" />
              </a>

              {/* Shiny Toggle Button with animated indicator */}
              <button
                onClick={handleShinyToggle}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-black tracking-wide transition-all duration-300 active:scale-95 ${
                  isShiny
                    ? 'bg-gradient-to-r from-[#EFD7AD] to-[#DCBD85] text-[#123244] shadow-[0_0_18px_rgba(220,189,133,0.5)] scale-105'
                    : 'bg-[#0d2433] text-[#B8DAE3] hover:text-[#EFD7AD] border border-[#DCBD85]/40 hover:border-[#DCBD85]'
                }`}
                title="Alternar versão Shiny Brilhante ✨"
              >
                <Sparkles size={14} className={isShiny ? 'animate-bounce text-[#123244]' : 'text-[#DCBD85]'} />
                <span>SHINY ✨</span>
              </button>

              {/* Cry sound button */}
              <button
                onClick={handlePlayCry}
                className="flex items-center gap-1 rounded-xl bg-[#0d2433] border border-[#046683] px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-[#48A0B6] transition-all hover:bg-[#48A0B6]/20 hover:text-white active:scale-95"
                title="Ouvir o Grito do Pokémon"
              >
                <Volume2 size={15} />
                <span className="hidden sm:inline">Grito</span>
              </button>

              {/* Favorite button */}
              <button
                onClick={handleFavoriteClick}
                className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-all active:scale-90 ${
                  isFavorite
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-[#0d2433] text-[#B8DAE3]/60 hover:text-rose-400 border border-[#046683]'
                }`}
                title={isFavorite ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
              >
                <Heart size={16} className={isFavorite ? 'fill-rose-500 scale-110' : ''} />
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#0d2433] text-[#B8DAE3] transition-all hover:bg-rose-500 hover:text-white border border-[#046683]"
                title="Fechar (Esc)"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Centerpiece: Pokemon Artwork & Meta Information (Contained to prevent leaking) */}
          <div className="mt-3 flex flex-col-reverse items-center justify-between gap-3 sm:gap-4 md:flex-row md:items-center">
            {/* Pokemon Name, Genus, Badges and Quick Measurements */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  {formatPokemonName(pokemonSummary.name)}
                </h2>
                {isShiny && (
                  <span className="rounded-full bg-[#DCBD85] px-2 py-0.5 text-[10px] font-black text-[#123244]">
                    SHINY
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold text-[#48A0B6] mt-0.5">
                {detail?.genus || 'Pokémon'}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5 justify-center md:justify-start">
                {pokemonSummary.types.map((type) => (
                  <TypeBadge key={type} type={type} size="md" />
                ))}
              </div>

              {/* Physical measurements */}
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 text-xs text-[#B8DAE3]">
                <div className="rounded-xl bg-[#0d2433]/90 px-2.5 py-1 border border-[#046683]">
                  <span className="text-[#B8DAE3]/70 text-[10px] block">Altura</span>
                  <strong className="text-white font-mono">{(pokemonSummary.height / 10).toFixed(1)} m</strong>
                </div>
                <div className="rounded-xl bg-[#0d2433]/90 px-2.5 py-1 border border-[#046683]">
                  <span className="text-[#B8DAE3]/70 text-[10px] block">Peso</span>
                  <strong className="text-white font-mono">{(pokemonSummary.weight / 10).toFixed(1)} kg</strong>
                </div>
                <div className="rounded-xl bg-[#0d2433]/90 px-2.5 py-1 border border-[#046683]">
                  <span className="text-[#B8DAE3]/70 text-[10px] block">Taxa Captura</span>
                  <strong className="text-[#DCBD85] font-mono">{detail?.captureRate ?? 45} / 255</strong>
                </div>
              </div>
            </div>

            {/* Artwork Container: STRICTLY BOUNDED & CONTAINED so it never leaks onto tabs */}
            <div className="relative flex h-32 w-32 sm:h-40 sm:w-40 md:h-44 md:w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#0d2433]/60 border border-[#046683]/50 p-2 shadow-inner">
              {showSparkles && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                  <span className="absolute -top-1 left-2 text-2xl sparkle-fx text-[#EFD7AD]">✨</span>
                  <span className="absolute bottom-1 right-2 text-3xl sparkle-fx text-[#48A0B6]">⭐</span>
                  <span className="absolute top-4 right-1 text-xl sparkle-fx text-white">🌟</span>
                  <span className="absolute bottom-3 left-2 text-xl sparkle-fx text-[#DCBD85]">✨</span>
                  <div className="absolute inset-0 rounded-full border-2 border-[#DCBD85]/60 animate-ping" />
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#046683]/20 via-transparent to-[#DCBD85]/15 blur-lg" />
              <img
                src={currentArtwork}
                alt={pokemonSummary.name}
                onError={() => {
                  if (imgFallbackIndex < artworkCandidates.length - 1) {
                    setImgFallbackIndex((prev) => prev + 1);
                  }
                }}
                className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>

          {/* Seletor Visível de Megas, Gigantamax, Regionais e Paradoxos */}
          {allRelatedForms.length > 1 && (
            <div className="mt-3 pt-2.5 border-t border-[#046683]/50">
              <div className="flex items-center gap-1.5 mb-2 text-[11px] font-black uppercase text-[#DCBD85] tracking-wide">
                <Layers size={13} className="text-[#48A0B6]" />
                <span>Formas Alternativas, Megas, GMax & Paradoxos:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {allRelatedForms.map((item) => (
                  <button
                    key={`${item.id}-${item.name}`}
                    onClick={() => {
                      if (!item.isCurrent) {
                        sound.playClick();
                        onNavigate(item.id);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      item.isCurrent
                        ? 'bg-gradient-to-r from-[#DCBD85] to-[#EFD7AD] text-[#123244] shadow-[0_0_12px_rgba(220,189,133,0.5)] ring-2 ring-[#DCBD85] font-black'
                        : 'bg-[#0d2433] text-[#B8DAE3] hover:text-white border border-[#046683] hover:border-[#48A0B6]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.badgeLabel}</span>
                    {item.isCurrent && (
                      <span className="text-[9px] bg-[#123244]/25 px-1 rounded font-mono">
                        Ativo
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flavor Text / Pokédex Description */}
          {detail?.flavorText && (
            <div className="mt-2.5 rounded-xl bg-[#0d2433]/80 p-2 sm:p-2.5 text-xs italic text-[#B8DAE3] border border-[#046683]/50 leading-relaxed">
              &ldquo;{detail.flavorText}&rdquo;
            </div>
          )}
        </div>

        {/* 6 Tabs Navigation Bar (STRICTLY CONTAINED with z-20 & sticky) */}
        <div className="relative z-20 shrink-0 flex border-b border-[#046683] bg-[#0d2433] overflow-x-auto text-xs sm:text-sm font-bold scrollbar-none">
          <button
            onClick={() => handleTabChange('stats')}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 sm:py-3 transition-colors ${
              activeTab === 'stats'
                ? 'border-[#DCBD85] bg-[#163c50] text-[#EFD7AD]'
                : 'border-transparent text-[#B8DAE3]/70 hover:text-white'
            }`}
          >
            <Activity size={15} />
            <span>1. Status</span>
          </button>

          <button
            onClick={() => handleTabChange('effectiveness')}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 sm:py-3 transition-colors ${
              activeTab === 'effectiveness'
                ? 'border-[#DCBD85] bg-[#163c50] text-[#EFD7AD]'
                : 'border-transparent text-[#B8DAE3]/70 hover:text-white'
            }`}
          >
            <Shield size={15} />
            <span>2. Fraquezas</span>
          </button>

          <button
            onClick={() => handleTabChange('evolution')}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 sm:py-3 transition-colors ${
              activeTab === 'evolution'
                ? 'border-[#DCBD85] bg-[#163c50] text-[#EFD7AD]'
                : 'border-transparent text-[#B8DAE3]/70 hover:text-white'
            }`}
          >
            <Zap size={15} />
            <span>3. Evolução</span>
          </button>

          <button
            onClick={() => handleTabChange('moves')}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 sm:py-3 transition-colors ${
              activeTab === 'moves'
                ? 'border-[#DCBD85] bg-[#163c50] text-[#EFD7AD]'
                : 'border-transparent text-[#B8DAE3]/70 hover:text-white'
            }`}
          >
            <BookOpen size={15} />
            <span>4. Golpes</span>
          </button>

          <button
            onClick={() => handleTabChange('abilities_natures')}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 sm:py-3 transition-colors ${
              activeTab === 'abilities_natures'
                ? 'border-[#DCBD85] bg-[#163c50] text-[#EFD7AD]'
                : 'border-transparent text-[#B8DAE3]/70 hover:text-white'
            }`}
          >
            <Compass size={15} />
            <span>5. Habilidades</span>
          </button>

          <button
            onClick={() => handleTabChange('locations')}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 sm:py-3 transition-colors ${
              activeTab === 'locations'
                ? 'border-[#DCBD85] bg-[#163c50] text-[#EFD7AD]'
                : 'border-transparent text-[#B8DAE3]/70 hover:text-white'
            }`}
          >
            <MapPin size={15} className="text-[#48A0B6]" />
            <span>6. Localizações</span>
          </button>
        </div>

        {/* Tab Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 bg-[#123244] text-[#B8DAE3]">
          {loading && !detail ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#48A0B6] border-t-transparent" />
              <p className="text-xs font-semibold text-[#B8DAE3]/80">Carregando dados completos da PokéAPI...</p>
            </div>
          ) : (
            <>
              {/* ABA 1: STATUS BASE */}
              {activeTab === 'stats' && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0d2433] p-4 border border-[#046683]">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase text-[#B8DAE3]/70 tracking-wider">
                        Base Stat Total (BST)
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[#DCBD85]">
                          {pokemonSummary.bst}
                        </span>
                        <span className="text-xs font-semibold text-[#B8DAE3]/70">pontos</span>
                      </div>
                    </div>
                    <div className={`rounded-xl px-4 py-2 text-right border ${getBstEvaluation(pokemonSummary.bst).bg}`}>
                      <span className="text-[10px] font-bold text-[#B8DAE3]/70 uppercase block">
                        Classificação de Combate
                      </span>
                      <span className={`text-sm font-extrabold ${getBstEvaluation(pokemonSummary.bst).color}`}>
                        {getBstEvaluation(pokemonSummary.bst).label}
                      </span>
                    </div>
                  </div>

                  {/* Stat Bars List */}
                  <div className="rounded-2xl bg-[#0d2433] p-3.5 sm:p-5 border border-[#046683]">
                    <div className="flex items-center justify-between mb-3 border-b border-[#046683]/50 pb-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#B8DAE3]">
                        Atributos Base & Faixa Lv. 100
                      </h4>
                      <span className="text-[11px] text-[#48A0B6] flex items-center gap-1 font-semibold">
                        <TrendingUp size={13} /> Max Base: 255
                      </span>
                    </div>
                    <div className="divide-y divide-[#046683]/30">
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

                  {/* Competitive Bias Note */}
                  <div className="rounded-xl bg-[#0d2433]/80 p-3.5 text-xs text-[#B8DAE3] border border-[#046683] flex items-start gap-3">
                    <span className="text-lg">💡</span>
                    <div>
                      <strong className="text-[#DCBD85] block mb-0.5">Dica de Batalha Quickdex:</strong>
                      As barras coloridas indicam a qualidade do atributo (vermelho: baixo, amarelo: médio, verde: alto, petróleo/ouro: tier lendário). As faixas mostram o potencial no nível 100 com 0 IVs até 31 IVs + 252 EVs.
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: EFETIVIDADE (FRAQUEZAS E RESISTÊNCIAS) */}
              {activeTab === 'effectiveness' && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="rounded-2xl bg-[#0d2433] p-4 border border-[#046683]">
                    <h4 className="text-sm font-extrabold uppercase text-[#48A0B6] mb-1">
                      Calculadora de Fraquezas & Resistências
                    </h4>
                    <p className="text-xs text-[#B8DAE3]/70">
                      Multiplicador defensivo exato considerando os tipos [
                      {pokemonSummary.types.map((t) => formatPokemonName(t)).join(' + ')}].
                    </p>
                  </div>

                  {/* Super Weak (x4) */}
                  {defensiveAnalysis.quadWeakness.length > 0 && (
                    <div className="rounded-2xl bg-rose-950/20 p-4 border border-rose-500/30">
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wide text-rose-400 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                          Dano x4 (Super Fraco - Extremo Cuidado)
                        </span>
                        <span className="text-[11px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded">
                          400% dano
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
                        Dano x2 (Fraquezas)
                      </span>
                      <span className="text-[11px] font-bold text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded">
                        200% dano
                      </span>
                    </div>
                    {defensiveAnalysis.weakness.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {defensiveAnalysis.weakness.map((type) => (
                          <TypeBadge key={type} type={type} size="md" />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-[#B8DAE3]/60">Nenhuma fraqueza simples x2 encontrada.</p>
                    )}
                  </div>

                  {/* Resistance (x0.5) */}
                  <div className="rounded-2xl bg-emerald-950/20 p-4 border border-emerald-500/30">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-400">
                        Dano x1/2 (Resistente)
                      </span>
                      <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                        50% dano
                      </span>
                    </div>
                    {defensiveAnalysis.resistance.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {defensiveAnalysis.resistance.map((type) => (
                          <TypeBadge key={type} type={type} size="md" />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-[#B8DAE3]/60">Nenhuma resistência simples x0.5.</p>
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
                          25% dano
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
                        0% dano
                      </span>
                    </div>
                    {defensiveAnalysis.immunity.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {defensiveAnalysis.immunity.map((type) => (
                          <TypeBadge key={type} type={type} size="md" />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-[#B8DAE3]/60">Nenhuma imunidade direta de tipo.</p>
                    )}
                  </div>

                  {/* Normal Damage (x1) */}
                  <div className="rounded-2xl bg-[#0d2433] p-4 border border-[#046683]">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-[#B8DAE3]">
                        Dano Neutro (x1)
                      </span>
                      <span className="text-[11px] font-bold text-[#B8DAE3]/70 bg-white/5 px-2 py-0.5 rounded">
                        100% dano
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

              {/* ABA 3: LINHA DE EVOLUÇÃO VISUAL */}
              {activeTab === 'evolution' && (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-[#0d2433] p-4 border border-[#046683]">
                    <h4 className="text-sm font-extrabold uppercase text-[#48A0B6] mb-1">
                      Cadeia Evolutiva Interativa
                    </h4>
                    <p className="text-xs text-[#B8DAE3]/70">
                      Toque em qualquer Pokémon para abrir instantaneamente sua ficha técnica detalhada.
                    </p>
                  </div>

                  {evolutionTree ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-4 overflow-x-auto">
                      <EvolutionBranchView
                        node={evolutionTree}
                        currentId={pokemonSummary.id}
                        onSelectPokemon={(id) => onNavigate(id)}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#0d2433] p-8 text-center border border-[#046683]">
                      <p className="text-sm font-bold text-[#DCBD85]">Este Pokémon não possui evoluções registradas ou é uma forma de estágio único.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ABA 4: LISTA DE GOLPES (MOVESET) */}
              {activeTab === 'moves' && (
                <div className="space-y-4">
                  {/* Move Filter Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setMoveFilter('level-up')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        moveFilter === 'level-up'
                          ? 'bg-[#DCBD85] text-[#123244]'
                          : 'bg-[#0d2433] text-[#B8DAE3] border border-[#046683]'
                      }`}
                    >
                      Por Nível
                    </button>
                    <button
                      onClick={() => setMoveFilter('machine')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        moveFilter === 'machine'
                          ? 'bg-[#DCBD85] text-[#123244]'
                          : 'bg-[#0d2433] text-[#B8DAE3] border border-[#046683]'
                      }`}
                    >
                      TM / Disco
                    </button>
                    <button
                      onClick={() => setMoveFilter('egg')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        moveFilter === 'egg'
                          ? 'bg-[#DCBD85] text-[#123244]'
                          : 'bg-[#0d2433] text-[#B8DAE3] border border-[#046683]'
                      }`}
                    >
                      Golpes de Ovo
                    </button>
                    <button
                      onClick={() => setMoveFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        moveFilter === 'all'
                          ? 'bg-[#DCBD85] text-[#123244]'
                          : 'bg-[#0d2433] text-[#B8DAE3] border border-[#046683]'
                      }`}
                    >
                      Todos ({detail?.moves.length || 0})
                    </button>
                  </div>

                  {/* Moves Table */}
                  <div className="overflow-hidden rounded-2xl border border-[#046683] bg-[#0d2433]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#046683] bg-[#163c50] text-[11px] font-extrabold uppercase text-[#DCBD85]">
                          <tr>
                            <th className="p-3">Método / Nv.</th>
                            <th className="p-3">Golpe ({namingMode === 'pt-br' ? 'PT-BR' : 'EN'})</th>
                            <th className="p-3">Categoria</th>
                            <th className="p-3 text-center">Poder</th>
                            <th className="p-3 text-center">Precisão</th>
                            <th className="p-3 text-center">PP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#046683]/30">
                          {filteredMoves.length > 0 ? (
                            filteredMoves.map((m, idx) => (
                              <tr key={`${m.name}-${idx}`} className="hover:bg-[#163c50]/50 transition-colors">
                                <td className="p-3 font-mono font-bold text-[#48A0B6]">
                                  {m.learnMethod === 'level-up' ? `Nv. ${m.levelLearnedAt}` : m.learnMethod.toUpperCase()}
                                </td>
                                <td className="p-3 font-bold text-white">
                                  {formatMoveName(m.name, namingMode)}
                                </td>
                                <td className="p-3 text-slate-400 capitalize">
                                  {m.damageClass === 'physical' ? '⚔️ Físico' : m.damageClass === 'special' ? '🔮 Especial' : '🛡️ Status'}
                                </td>
                                <td className="p-3 text-center font-mono font-bold text-[#DCBD85]">
                                  {m.power ? m.power : '—'}
                                </td>
                                <td className="p-3 text-center font-mono text-[#B8DAE3]">
                                  {m.accuracy ? `${m.accuracy}%` : '—'}
                                </td>
                                <td className="p-3 text-center font-mono text-[#B8DAE3]/80">
                                  {m.pp}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                                Nenhum golpe encontrado nesta categoria.
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
                <div className="space-y-5">
                  {/* Abilities Section */}
                  <div className="rounded-2xl bg-[#0d2433] p-4 sm:p-5 border border-[#046683]">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#48A0B6] mb-3 flex items-center gap-1.5">
                      <span>⚡</span> Habilidades de Batalha
                    </h4>
                    <div className="space-y-3">
                      {detail?.abilities.map((ab) => (
                        <div
                          key={ab.name}
                          className="rounded-xl bg-[#123244] p-3.5 border border-[#046683]"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-sm">
                              {formatAbilityName(ab.name, namingMode)}
                            </span>
                            {ab.isHidden && (
                              <span className="rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                                Habilidade Oculta
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#B8DAE3] leading-relaxed">{ab.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Natures Simulator Section */}
                  <div className="rounded-2xl bg-[#0d2433] p-4 sm:p-5 border border-[#046683]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#48A0B6]">
                        Simulador de Naturezas (+10% / -10%)
                      </h4>
                      <select
                        value={selectedNature}
                        onChange={(e) => {
                          sound.playClick();
                          startTransition(() => {
                            setSelectedNature(e.target.value);
                          });
                        }}
                        className="rounded-xl bg-[#123244] border border-[#046683] px-3 py-2 text-xs font-bold text-[#DCBD85] focus:outline-none focus:ring-2 focus:ring-[#48A0B6]"
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
                        <div className="rounded-xl bg-[#123244] p-3.5 border border-[#046683] mb-4 text-xs">
                          <span className="font-bold text-white block mb-1">
                            Efeito de {cur.ptName}:
                          </span>
                          <span className="text-[#B8DAE3]">{cur.description}</span>
                        </div>
                      );
                    })()}

                    {/* Preview Table of All 25 Natures */}
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-[#046683]">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-[#163c50] text-[10px] font-extrabold uppercase text-[#DCBD85]">
                          <tr>
                            <th className="p-2">Nature</th>
                            <th className="p-2 text-emerald-400">+10% Stat</th>
                            <th className="p-2 text-rose-400">-10% Stat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#046683]/30 text-[11px]">
                          {NATURES_LIST.map((item) => (
                            <tr
                              key={item.name}
                              onClick={() => {
                                sound.playClick();
                                setSelectedNature(item.name);
                              }}
                              className={`cursor-pointer transition-colors ${
                                selectedNature === item.name
                                  ? 'bg-[#48A0B6]/30 font-bold'
                                  : 'hover:bg-[#163c50]/40 text-[#B8DAE3]'
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

              {/* ABA 6: LOCALIZAÇÕES POR JOGO/ÁREA ORGANIZADA */}
              {activeTab === 'locations' && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="rounded-2xl bg-[#0d2433] p-4 border border-[#046683] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-extrabold uppercase text-[#DCBD85] flex items-center gap-2">
                        <MapPin size={16} className="text-[#48A0B6]" />
                        Localizações por Jogo & Região (Quickdex)
                      </h4>
                      <p className="text-xs text-[#B8DAE3]/80 mt-0.5">
                        Rotas, cavernas e áreas onde {formatPokemonName(pokemonSummary.name)} pode ser encontrado nos jogos oficiais.
                      </p>
                    </div>

                    {/* Region Filter */}
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedLocationRegion}
                        onChange={(e) => {
                          sound.playClick();
                          setSelectedLocationRegion(e.target.value);
                        }}
                        className="rounded-xl bg-[#123244] border border-[#046683] px-3 py-1.5 text-xs font-bold text-[#DCBD85] focus:outline-none"
                      >
                        <option value="all">Todas as Regiões</option>
                        <option value="Paldea">Paldea (Gen IX)</option>
                        <option value="Hisui">Hisui (Legends)</option>
                        <option value="Galar">Galar (Gen VIII)</option>
                        <option value="Alola">Alola (Gen VII)</option>
                        <option value="Kalos">Kalos (Gen VI)</option>
                        <option value="Unova">Unova (Gen V)</option>
                        <option value="Sinnoh">Sinnoh (Gen IV)</option>
                        <option value="Hoenn">Hoenn (Gen III)</option>
                        <option value="Johto">Johto (Gen II/IV)</option>
                        <option value="Kanto">Kanto (Gen I/III/VII)</option>
                      </select>
                    </div>
                  </div>

                  {loadingEncounters ? (
                    <div className="flex h-36 flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#48A0B6] border-t-transparent" />
                      <p className="text-xs font-semibold text-[#B8DAE3]/80">Consultando registros geográficos de jogos...</p>
                    </div>
                  ) : Object.keys(groupedLocations).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {Object.entries(groupedLocations).map(([versionName, locList]) => (
                        <div
                          key={versionName}
                          className="rounded-2xl bg-[#0d2433] border border-[#046683] p-4 flex flex-col justify-between shadow-sm"
                        >
                          <div>
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#046683]/50">
                              <span className="text-xs font-black text-white bg-[#163c50] px-2.5 py-1 rounded-lg border border-[#48A0B6]/40">
                                🎮 {versionName}
                              </span>
                              <span className="text-[10px] font-bold text-[#DCBD85]">
                                {locList[0]?.versionGroup}
                              </span>
                            </div>

                            <div className="space-y-2 mt-2">
                              {locList.slice(0, 5).map((loc, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-xl bg-[#123244] p-2.5 border border-[#046683]/40 flex flex-col gap-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-white text-xs">
                                      📍 {loc.areaName}
                                    </span>
                                    {loc.chance > 0 && (
                                      <span className="text-[10px] font-mono font-bold text-[#DCBD85] bg-[#DCBD85]/10 px-1.5 py-0.5 rounded">
                                        {loc.chance}% chance
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-[#B8DAE3]/80">
                                    <span>{loc.method}</span>
                                    <span className="font-mono text-[10px]">
                                      Nv. {loc.minLevel} {loc.maxLevel !== loc.minLevel ? ` - ${loc.maxLevel}` : ''}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {locList.length > 5 && (
                                <p className="text-[10px] text-center text-[#48A0B6] font-semibold pt-1">
                                  + mais {locList.length - 5} outras áreas neste jogo
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Fallback / Special Acquisition Guide */
                    <div className="rounded-2xl bg-[#0d2433] p-6 border border-[#046683] text-center space-y-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#48A0B6]/20 text-[#48A0B6] mb-1">
                        <MapPin size={24} />
                      </div>
                      <h4 className="text-sm font-black text-white">
                        Guia de Obtenção Especial do Quickdex
                      </h4>
                      <p className="text-xs text-[#B8DAE3] max-w-lg mx-auto leading-relaxed">
                        {pokemonSummary.id > 10000
                          ? 'Forma Especial / Megaevolução / Gigantamax: Obtida temporariamente em batalha ao equipar a Megapedra correspondente, através de Reides Dynamax nas Den de Galar, ou consumindo a Sopa Max na Ilha da Armadura.'
                          : 'Este Pokémon é geralmente obtido via evolução direta do seu estágio inicial, como presente especial de início de jornada, através de troca com amigos, ou em eventos especiais e Reides Tera em Paldea.'}
                      </p>
                      <div className="pt-2 flex flex-wrap justify-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-[#123244] border border-[#046683] text-[11px] font-semibold text-[#DCBD85]">
                          🏆 Batalhas & Reides
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-[#123244] border border-[#046683] text-[11px] font-semibold text-[#48A0B6]">
                          🔄 Evoluções & Trocas
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-[#123244] border border-[#046683] text-[11px] font-semibold text-[#EFD7AD]">
                          🎁 Eventos de Treinador
                        </span>
                      </div>
                    </div>
                  )}
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
 * Evolution Branch Component
 */
interface EvolutionBranchProps {
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

const EvolutionBranchView: React.FC<EvolutionBranchProps> = ({ node, currentId, onSelectPokemon }) => {
  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Root Pokémon Stage */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 w-full flex-wrap">
        <EvolutionCard
          id={node.id}
          name={node.name}
          sprite={node.sprite}
          isCurrent={node.id === currentId}
          onSelect={() => onSelectPokemon(node.id)}
        />

        {/* Evolutions (Stage 1) */}
        {node.evolvesTo && node.evolvesTo.length > 0 && (
          <div className="flex flex-col gap-4 w-full md:w-auto items-center">
            {node.evolvesTo.map((child: any) => (
              <div
                key={child.id}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full"
              >
                {/* Evolution Requirement Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d2433] rounded-xl border border-[#046683] text-center shadow-sm">
                  <span className="text-[11px] font-bold text-[#DCBD85]">
                    {child.trigger}
                  </span>
                  <ArrowRight size={14} className="text-[#48A0B6] hidden sm:inline" />
                </div>

                <EvolutionCard
                  id={child.id}
                  name={child.name}
                  sprite={child.sprite}
                  isCurrent={child.id === currentId}
                  onSelect={() => onSelectPokemon(child.id)}
                />

                {/* Sub-evolutions (Stage 2) */}
                {child.evolvesTo && child.evolvesTo.length > 0 && (
                  <div className="flex flex-col gap-3 w-full sm:w-auto items-center">
                    {child.evolvesTo.map((subChild: any) => (
                      <div
                        key={subChild.id}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
                      >
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d2433] rounded-xl border border-[#046683] text-center shadow-sm">
                          <span className="text-[11px] font-bold text-[#DCBD85]">
                            {subChild.trigger}
                          </span>
                          <ArrowRight size={14} className="text-[#48A0B6] hidden sm:inline" />
                        </div>

                        <EvolutionCard
                          id={subChild.id}
                          name={subChild.name}
                          sprite={subChild.sprite}
                          isCurrent={subChild.id === currentId}
                          onSelect={() => onSelectPokemon(subChild.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface EvolutionCardProps {
  id: number;
  name: string;
  sprite: string;
  isCurrent: boolean;
  onSelect: () => void;
}

const EvolutionCard: React.FC<EvolutionCardProps> = ({ id, name, sprite, isCurrent, onSelect }) => {
  return (
    <div
      onClick={() => {
        if (!isCurrent) {
          sound.playClick();
          onSelect();
        }
      }}
      className={`group flex flex-col items-center rounded-2xl p-3 border transition-all duration-200 cursor-pointer w-28 sm:w-32 ${
        isCurrent
          ? 'bg-[#163c50] border-[#DCBD85] shadow-[0_0_20px_rgba(220,189,133,0.35)] scale-105'
          : 'bg-[#0d2433] border-[#046683] hover:border-[#48A0B6] hover:scale-105 hover:bg-[#123244]'
      }`}
    >
      <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#B8DAE3]">
        {formatPokemonId(id)}
      </span>
      <img
        src={sprite}
        alt={name}
        className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow my-1 transition-transform group-hover:scale-110"
      />
      <span className="text-xs font-bold text-white text-center truncate w-full">
        {formatPokemonName(name)}
      </span>
      {isCurrent ? (
        <span className="mt-1 rounded-md bg-[#DCBD85] px-2 py-0.5 text-[9px] font-black text-[#123244]">
          Atual
        </span>
      ) : (
        <span className="mt-1 text-[9px] text-[#B8DAE3]/70 group-hover:text-[#EFD7AD]">
          Ver detalhes ➔
        </span>
      )}
    </div>
  );
};
