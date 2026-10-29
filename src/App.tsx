import { useState, useEffect, useMemo, useCallback } from 'react';
import { PokemonSummary, PokemonType } from './types/pokemon';
import {
  fetchPokemonSummariesBatch,
  getAllPokemonList,
} from './services/pokeapi';
import { GENERATIONS, NamingMode } from './utils/translations';
import { checkPokemonInSpecialGroup, SPECIAL_GROUPS, SpecialGroupKey } from './utils/specialGroups';
import { sound } from './utils/audio';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { PokemonCard } from './components/PokemonCard';
import { PokemonDetailModal } from './components/PokemonDetailModal';
import { QuickBallIcon } from './components/QuickBallIcon';
import {
  AdvancedFilterDrawer,
  AdvancedFilterState,
  SortField,
  SortDirection,
} from './components/AdvancedFilterDrawer';
import { SidebarDrawer, AppNavView } from './components/SidebarDrawer';
import { MoveDexView } from './components/MoveDexView';
import { NatureDexView } from './components/NatureDexView';
import { TeamBuilderView } from './components/TeamBuilderView';
import { Heart, Loader2, SlidersHorizontal, Sparkles } from 'lucide-react';

const PAGE_SIZE = 24;

const INITIAL_FILTERS: AdvancedFilterState = {
  sortField: 'id',
  sortDirection: 'asc',
  selectedTypes: [],
  typeMode: 'any',
  selectedGens: [],
  selectedSpecialGroups: [],
  onlyFavorites: false,
  globalShinyMode: false,
  bstMin: 0,
};

export default function App() {
  // Theme state ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('quickdex_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Language / Naming Mode state ('pt-en' | 'pt-br')
  const [namingMode, setNamingMode] = useState<NamingMode>(() => {
    try {
      const saved = localStorage.getItem('quickdex_naming_mode');
      return saved === 'pt-br' ? 'pt-br' : 'pt-en';
    } catch {
      return 'pt-en';
    }
  });

  // Sync theme to document element
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    try {
      localStorage.setItem('quickdex_theme', theme);
    } catch {}
  }, [theme]);

  // Sync naming mode
  useEffect(() => {
    try {
      localStorage.setItem('quickdex_naming_mode', namingMode);
    } catch {}
  }, [namingMode]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleToggleNamingMode = () => {
    setNamingMode((prev) => (prev === 'pt-br' ? 'pt-en' : 'pt-br'));
  };

  // Navigation View State ('pokedex' | 'shiny' | 'moves' | 'natures' | 'teambuilder')
  const [currentNavView, setCurrentNavView] = useState<AppNavView>('pokedex');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Master ID list (All 1302+ including base, megas, gmax, regionals, and paradox)
  const [masterList, setMasterList] = useState<{ id: number; name: string }[]>([]);
  const [loadedSummaries, setLoadedSummaries] = useState<Map<number, PokemonSummary>>(new Map());
  const [loadingBatch, setLoadingBatch] = useState<boolean>(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Advanced Filters State
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>(INITIAL_FILTERS);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Favorites in localStorage
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('quickdex_favorites');
      return saved ? JSON.parse(saved) : [25, 6, 94]; // Pikachu, Charizard, Gengar
    } catch {
      return [25, 6, 94];
    }
  });

  // Team in localStorage (up to 6 Pokémon)
  const [teamIds, setTeamIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('quickdex_team');
      return saved ? JSON.parse(saved) : [6, 94, 25]; // Sample team
    } catch {
      return [6, 94, 25];
    }
  });

  // Sound state
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());

  // Modal detail state
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);

  // Pagination count for currently displayed items
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // 1. Initial Load of Master List
  useEffect(() => {
    let isCurrent = true;
    getAllPokemonList().then((list) => {
      if (!isCurrent) return;
      setMasterList(list);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  // Sync favorites & team to localStorage
  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('quickdex_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const handleAddTeamPokemon = (id: number) => {
    if (teamIds.length >= 6) {
      sound.playClick();
      return;
    }
    setTeamIds((prev) => {
      const next = [...prev, id];
      try {
        localStorage.setItem('quickdex_team', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleRemoveTeamPokemon = (index: number) => {
    setTeamIds((prev) => {
      const next = prev.filter((_, i) => i !== index);
      try {
        localStorage.setItem('quickdex_team', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleClearTeam = () => {
    setTeamIds([]);
    try {
      localStorage.setItem('quickdex_team', JSON.stringify([]));
    } catch {}
  };

  const toggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  // Count active advanced filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.sortField !== 'id' || advancedFilters.sortDirection !== 'asc') count++;
    if (advancedFilters.selectedTypes.length > 0) count += advancedFilters.selectedTypes.length;
    if (advancedFilters.typeMode !== 'any') count++;
    if (advancedFilters.selectedGens.length > 0) count += advancedFilters.selectedGens.length;
    if (advancedFilters.selectedSpecialGroups.length > 0) count += advancedFilters.selectedSpecialGroups.length;
    if (advancedFilters.onlyFavorites) count++;
    if (advancedFilters.globalShinyMode) count++;
    if (advancedFilters.bstMin > 0) count++;
    return count;
  }, [advancedFilters]);

  // Master Filter & Sort pipeline
  const filteredList = useMemo(() => {
    if (masterList.length === 0) return [];

    let list = masterList;

    // A. View-specific constraints
    if (currentNavView === 'shiny') {
      // Shiny gallery view shows all Pokémon in shiny mode
    }

    // B. Search term filter
    if (searchTerm.trim()) {
      const cleanSearch = searchTerm.toLowerCase().trim();
      const isNumSearch = cleanSearch.startsWith('#')
        ? parseInt(cleanSearch.replace('#', ''), 10)
        : parseInt(cleanSearch, 10);

      list = list.filter((p) => {
        if (!isNaN(isNumSearch) && p.id === isNumSearch) return true;
        if (p.name.toLowerCase().includes(cleanSearch)) return true;
        if (cleanSearch.includes('mega') && p.name.includes('-mega')) return true;
        if (cleanSearch.includes('gmax') && p.name.includes('-gmax')) return true;
        if (cleanSearch.includes('paradox') && (p.name.includes('iron-') || p.name.includes('great-tusk') || p.name.includes('scream-tail') || p.name.includes('flutter-mane') || p.name.includes('slither-wing') || p.name.includes('sandy-shocks') || p.name.includes('brute-bonnet') || p.name.includes('roaring-moon') || p.name.includes('walking-wake') || p.name.includes('gouging-fire') || p.name.includes('raging-bolt'))) return true;
        return false;
      });
    }

    // C. Generation Filter
    if (advancedFilters.selectedGens.length > 0) {
      list = list.filter((p) => {
        return advancedFilters.selectedGens.some((genId) => {
          const gen = GENERATIONS.find((g) => g.id === genId);
          if (!gen) return false;
          return p.id >= gen.startId && p.id <= gen.endId;
        });
      });
    }

    // D. Special Groups Filter (Megas, GMax, Paradox, Regionals, etc.)
    if (advancedFilters.selectedSpecialGroups.length > 0) {
      list = list.filter((p) => {
        return advancedFilters.selectedSpecialGroups.every((grpKey) => {
          return checkPokemonInSpecialGroup(p.id, p.name, grpKey);
        });
      });
    }

    // E. Favorites Only Filter
    if (advancedFilters.onlyFavorites) {
      list = list.filter((p) => favorites.includes(p.id));
    }

    // F. Type & BST Filters (applied when summary is loaded)
    if (advancedFilters.selectedTypes.length > 0 || advancedFilters.bstMin > 0) {
      list = list.filter((p) => {
        const summary = loadedSummaries.get(p.id);
        if (!summary) return true;

        if (advancedFilters.bstMin > 0 && summary.bst < advancedFilters.bstMin) {
          return false;
        }

        if (advancedFilters.selectedTypes.length > 0) {
          const { selectedTypes, typeMode } = advancedFilters;
          const pTypes = summary.types;

          if (typeMode === 'single') {
            if (pTypes.length !== 1) return false;
            return selectedTypes.includes(pTypes[0]);
          } else if (typeMode === 'dual') {
            if (pTypes.length !== 2) return false;
            return selectedTypes.some((t) => pTypes.includes(t));
          } else if (typeMode === 'exact') {
            if (selectedTypes.length !== pTypes.length) return false;
            return selectedTypes.every((t) => pTypes.includes(t));
          } else {
            return selectedTypes.some((t) => pTypes.includes(t));
          }
        }

        return true;
      });
    }

    // G. Sorting
    const { sortField, sortDirection } = advancedFilters;
    return [...list].sort((a, b) => {
      let comp = 0;
      if (sortField === 'id') {
        comp = a.id - b.id;
      } else if (sortField === 'name') {
        comp = a.name.localeCompare(b.name);
      } else {
        const sumA = loadedSummaries.get(a.id);
        const sumB = loadedSummaries.get(b.id);
        if (sumA && sumB) {
          if (sortField === 'bst') {
            comp = sumA.bst - sumB.bst;
          } else {
            const statA = sumA.stats.find((s) => s.name === sortField)?.baseStat || 0;
            const statB = sumB.stats.find((s) => s.name === sortField)?.baseStat || 0;
            comp = statA - statB;
          }
        } else {
          comp = a.id - b.id;
        }
      }
      return sortDirection === 'desc' ? -comp : comp;
    });
  }, [masterList, currentNavView, searchTerm, advancedFilters, favorites, loadedSummaries]);

  // Current page items to display
  const paginatedList = useMemo(() => {
    return filteredList.slice(0, visibleCount);
  }, [filteredList, visibleCount]);

  // Fetch summaries for currently visible items
  useEffect(() => {
    if (paginatedList.length === 0) {
      setLoadingBatch(false);
      return;
    }

    const idsToFetch = paginatedList.map((p) => p.id).filter((id) => !loadedSummaries.has(id));

    if (idsToFetch.length === 0) {
      setLoadingBatch(false);
      return;
    }

    let isCurrent = true;
    setLoadingBatch(true);

    fetchPokemonSummariesBatch(idsToFetch).then((summaries) => {
      if (!isCurrent) return;
      setLoadedSummaries((prev) => {
        const next = new Map(prev);
        summaries.forEach((s) => next.set(s.id, s));
        return next;
      });
      setLoadingBatch(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [paginatedList, loadedSummaries]);

  // Reset pagination when search or filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, advancedFilters, currentNavView]);

  const handleLoadMore = () => {
    sound.playClick();
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const handleResetFilters = () => {
    sound.playClick();
    setAdvancedFilters(INITIAL_FILTERS);
    setSearchTerm('');
  };

  const handleRandomPokemon = () => {
    if (masterList.length === 0) return;
    const randomIndex = Math.floor(Math.random() * masterList.length);
    const randomPkmn = masterList[randomIndex];
    setSelectedPokemonId(randomPkmn.id);
  };

  // Determine active modal Pokémon
  const activeModalPokemon = useMemo(() => {
    if (!selectedPokemonId) return null;
    const cached = loadedSummaries.get(selectedPokemonId);
    if (cached) return cached;

    const basic = masterList.find((p) => p.id === selectedPokemonId);
    return {
      id: selectedPokemonId,
      name: basic ? basic.name : `pokemon-${selectedPokemonId}`,
      types: ['normal' as PokemonType],
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemonId}.png`,
      officialArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemonId}.png`,
      shinyArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${selectedPokemonId}.png`,
      stats: [],
      height: 10,
      weight: 100,
      bst: 400,
    };
  }, [selectedPokemonId, loadedSummaries, masterList]);

  // View titles
  const viewTitles: Record<AppNavView, string> = {
    pokedex: 'Pokédex Nacional Completa (Gen 1-9)',
    shiny: 'Galeria de Formas Brilhantes (Shiny ✨)',
    moves: 'Dex de Movimentos & Golpes',
    natures: 'Dex de Naturezas & Modificadores',
    teambuilder: 'Construtor de Equipes (6 Pokémon)',
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isLight ? 'bg-[#FDFBF7] text-[#123244]' : 'bg-[#123244] text-[#B8DAE3]'
    }`}>
      {/* Header */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        favoritesCount={favorites.length}
        showOnlyFavorites={advancedFilters.onlyFavorites}
        onToggleShowFavorites={() => {
          setAdvancedFilters((prev) => ({ ...prev, onlyFavorites: !prev.onlyFavorites }));
        }}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onRandomPokemon={handleRandomPokemon}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        currentViewTitle={viewTitles[currentNavView]}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        namingMode={namingMode}
        onToggleNamingMode={handleToggleNamingMode}
      />

      {/* Render Active View */}
      {currentNavView === 'moves' && <MoveDexView namingMode={namingMode} theme={theme} />}
      {currentNavView === 'natures' && <NatureDexView theme={theme} />}
      {currentNavView === 'teambuilder' && (
        <TeamBuilderView
          teamIds={teamIds}
          onAddPokemon={handleAddTeamPokemon}
          onRemovePokemon={handleRemoveTeamPokemon}
          onClearTeam={handleClearTeam}
          masterList={masterList}
          loadedSummaries={loadedSummaries}
          onSelectPokemonDetail={(id) => setSelectedPokemonId(id)}
          theme={theme}
        />
      )}

      {(currentNavView === 'pokedex' || currentNavView === 'shiny') && (
        <>
          {/* Quick Filter Bar */}
          <FilterBar
            selectedGen={advancedFilters.selectedGens.length === 1 ? advancedFilters.selectedGens[0] : null}
            onSelectGen={(gen) => {
              setAdvancedFilters((prev) => ({
                ...prev,
                selectedGens: gen === null ? [] : [gen],
              }));
            }}
            selectedType={advancedFilters.selectedTypes.length === 1 ? advancedFilters.selectedTypes[0] : null}
            onSelectType={(type) => {
              setAdvancedFilters((prev) => ({
                ...prev,
                selectedTypes: type === null ? [] : [type],
              }));
            }}
            sortBy={
              advancedFilters.sortField === 'id' && advancedFilters.sortDirection === 'asc'
                ? 'id-asc'
                : advancedFilters.sortField === 'id' && advancedFilters.sortDirection === 'desc'
                ? 'id-desc'
                : advancedFilters.sortField === 'name' && advancedFilters.sortDirection === 'asc'
                ? 'name-asc'
                : advancedFilters.sortField === 'name' && advancedFilters.sortDirection === 'desc'
                ? 'name-desc'
                : advancedFilters.sortField === 'bst' && advancedFilters.sortDirection === 'desc'
                ? 'bst-desc'
                : 'id-asc'
            }
            onSortChange={(opt) => {
              const [field, dir] = opt.split('-') as [SortField, SortDirection];
              setAdvancedFilters((prev) => ({
                ...prev,
                sortField: field,
                sortDirection: dir,
              }));
            }}
            totalFiltered={filteredList.length}
            onResetFilters={handleResetFilters}
            hasActiveFilters={activeFilterCount > 0 || searchTerm.length > 0}
            onOpenAdvancedFilters={() => {
              sound.playModalOpen();
              setIsFilterDrawerOpen(true);
            }}
            activeFilterCount={activeFilterCount}
            theme={theme}
          />

          {/* Active Filter Badges */}
          {activeFilterCount > 0 && (
            <div className="mx-auto max-w-7xl px-3 sm:px-6 py-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] font-bold opacity-75">Filtros ativos:</span>
              {advancedFilters.selectedGens.map((g) => (
                <span
                  key={g}
                  className="rounded-lg bg-[#DCBD85]/20 text-[#DCBD85] border border-[#DCBD85]/40 px-2 py-0.5 font-bold flex items-center gap-1"
                >
                  Gen {g}
                </span>
              ))}
              {advancedFilters.selectedSpecialGroups.map((grpKey) => (
                <span
                  key={grpKey}
                  className="rounded-lg bg-[#48A0B6]/20 text-[#48A0B6] border border-[#48A0B6]/40 px-2 py-0.5 font-bold flex items-center gap-1"
                >
                  {SPECIAL_GROUPS[grpKey]?.icon} {SPECIAL_GROUPS[grpKey]?.label}
                </span>
              ))}
              {advancedFilters.onlyFavorites && (
                <span className="rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 font-bold flex items-center gap-1">
                  <Heart size={12} className="fill-current" /> Favoritos
                </span>
              )}
              {advancedFilters.globalShinyMode && (
                <span className="rounded-lg bg-[#DCBD85]/20 text-[#DCBD85] border border-[#DCBD85]/40 px-2 py-0.5 font-bold flex items-center gap-1">
                  <Sparkles size={12} /> Shiny ✨
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-[11px] underline opacity-75 hover:opacity-100 ml-1"
              >
                Limpar
              </button>
            </div>
          )}

          {/* Main Content Area */}
          <main className="mx-auto max-w-7xl flex-1 px-3 sm:px-6 py-4 w-full">
            {/* Pokemon Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {paginatedList.map((item) => {
                const summary = loadedSummaries.get(item.id) || {
                  id: item.id,
                  name: item.name,
                  types: ['normal' as PokemonType],
                  sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`,
                  officialArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`,
                  shinyArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${item.id}.png`,
                  stats: [],
                  height: 10,
                  weight: 100,
                  bst: 300,
                };

                return (
                  <PokemonCard
                    key={item.id}
                    pokemon={summary}
                    isFavorite={favorites.includes(item.id)}
                    isShiny={currentNavView === 'shiny' || advancedFilters.globalShinyMode}
                    onToggleFavorite={toggleFavorite}
                    onSelect={(p) => setSelectedPokemonId(p.id)}
                    theme={theme}
                  />
                );
              })}
            </div>

            {/* Empty State */}
            {filteredList.length === 0 && (
              <div className={`mt-12 flex flex-col items-center justify-center rounded-3xl border p-8 sm:p-12 text-center ${
                isLight ? 'bg-white border-[#DCBD85]' : 'bg-[#0d2433] border-[#046683]'
              }`}>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#48A0B6]/20 text-[#48A0B6] mb-3">
                  <QuickBallIcon size={36} />
                </div>
                <h3 className={`text-lg font-black ${isLight ? 'text-[#123244]' : 'text-white'}`}>
                  Nenhum Pokémon encontrado
                </h3>
                <p className={`mt-1 max-w-md text-xs sm:text-sm ${isLight ? 'text-[#556976]' : 'text-[#B8DAE3]/70'}`}>
                  Tente alterar seus termos de pesquisa, tipos ou redefinir os filtros avançados.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 rounded-xl bg-gradient-to-r from-[#48A0B6] to-[#DCBD85] px-4 py-2 text-xs font-black uppercase text-[#123244] shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  Restaurar Todos os Filtros
                </button>
              </div>
            )}

            {/* Load More Button */}
            {visibleCount < filteredList.length && (
              <div className="mt-8 flex flex-col items-center justify-center gap-2">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingBatch}
                  className={`group flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-black tracking-wide shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                    isLight
                      ? 'bg-white border-[#DCBD85] text-[#123244] hover:bg-[#F4EFE6]'
                      : 'bg-gradient-to-r from-[#0d2433] to-[#163c50] border-[#046683] text-[#B8DAE3] hover:border-[#DCBD85] hover:text-[#DCBD85]'
                  }`}
                >
                  {loadingBatch ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-[#48A0B6]" />
                      <span>Carregando dados...</span>
                    </>
                  ) : (
                    <>
                      <QuickBallIcon size={20} className="transition-transform group-hover:rotate-45" />
                      <span>Carregar Mais Pokémon ({filteredList.length - visibleCount} restantes)</span>
                    </>
                  )}
                </button>
                <span className="text-[11px] opacity-60">
                  Exibindo {Math.min(visibleCount, filteredList.length)} de {filteredList.length} Pokémon
                </span>
              </div>
            )}
          </main>

          {/* Floating Action Button for Advanced Filters */}
          <button
            onClick={() => {
              sound.playModalOpen();
              setIsFilterDrawerOpen(true);
            }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#48A0B6] to-[#DCBD85] p-3.5 sm:px-5 sm:py-3.5 text-[#123244] font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_8px_25px_rgba(72,160,182,0.45)] transition-all duration-200 hover:scale-105 active:scale-95 group"
            title="Abrir Filtros Avançados"
          >
            <SlidersHorizontal size={18} className="transition-transform group-hover:rotate-90" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#123244] text-[#DCBD85] text-[10px] font-black">
                {activeFilterCount}
              </span>
            )}
          </button>
        </>
      )}

      {/* Footer */}
      <footer className={`mt-auto border-t py-5 text-center text-xs transition-colors ${
        isLight ? 'border-[#E2D9CC] bg-[#F4EFE6] text-[#556976]' : 'border-[#046683] bg-[#0d2433] text-[#B8DAE3]/70'
      }`}>
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-6">
          <div className="flex items-center gap-2">
            <QuickBallIcon size={20} />
            <span className={`font-extrabold ${isLight ? 'text-[#123244]' : 'text-white'}`}>
              Quickdex • Pokédex Web Quick Ball
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] flex-wrap justify-center">
            <span>Menu Lateral & 5 Módulos</span>
            <span>•</span>
            <span className="text-[#48A0B6]">Localizações por Jogo</span>
            <span>•</span>
            <span className="text-[#DCBD85]">1302+ Espécies, Megas & Paradoxos</span>
          </div>
        </div>
      </footer>

      {/* Retractable Sidebar Drawer Component */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentNavView}
        onSelectView={(view) => setCurrentNavView(view)}
        favoritesCount={favorites.length}
        teamCount={teamIds.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        namingMode={namingMode}
        onSelectNamingMode={setNamingMode}
      />

      {/* Advanced Filter Drawer Component */}
      <AdvancedFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={advancedFilters}
        onUpdateFilters={setAdvancedFilters}
        onResetFilters={handleResetFilters}
        totalFilteredCount={filteredList.length}
        activeFilterCount={activeFilterCount}
        theme={theme}
      />

      {/* Pokemon Detail Modal */}
      {selectedPokemonId && activeModalPokemon && (
        <PokemonDetailModal
          pokemonSummary={activeModalPokemon}
          isFavorite={favorites.includes(selectedPokemonId)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedPokemonId(null)}
          onNavigate={(newId) => setSelectedPokemonId(newId)}
          hasPrev={selectedPokemonId > 1}
          hasNext={selectedPokemonId < 100000}
          namingMode={namingMode}
        />
      )}
    </div>
  );
}
