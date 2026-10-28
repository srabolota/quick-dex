import { useState, useEffect, useMemo, useCallback } from 'react';
import { PokemonSummary, PokemonType } from './types/pokemon';
import {
  fetchPokemonSummariesBatch,
  getAllPokemonList,
} from './services/pokeapi';
import { GENERATIONS } from './utils/translations';
import { sound } from './utils/audio';
import { Header } from './components/Header';
import { FilterBar, SortOption } from './components/FilterBar';
import { PokemonCard } from './components/PokemonCard';
import { PokemonDetailModal } from './components/PokemonDetailModal';
import { QuickBallIcon } from './components/QuickBallIcon';
import { Heart, Loader2 } from 'lucide-react';

const PAGE_SIZE = 24;

export default function App() {
  // Master ID list
  const [masterList, setMasterList] = useState<{ id: number; name: string }[]>([]);
  const [loadedSummaries, setLoadedSummaries] = useState<Map<number, PokemonSummary>>(new Map());
  const [loadingBatch, setLoadingBatch] = useState<boolean>(true);

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGen, setSelectedGen] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<PokemonType | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('id-asc');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  // Favorites in localStorage
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('quickdex_favorites');
      return saved ? JSON.parse(saved) : [25, 6, 94]; // Pikachu, Charizard, Gengar as initial welcome favorites
    } catch {
      return [25, 6, 94];
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

  // Sync favorites to localStorage
  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((fId) => fId !== id) : [...prev, id];
      localStorage.setItem('quickdex_favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Filter the master list
  const filteredList = useMemo(() => {
    let items = masterList;

    // Generation filter
    if (selectedGen !== null) {
      const genConfig = GENERATIONS.find((g) => g.id === selectedGen);
      if (genConfig) {
        items = items.filter((p) => p.id >= genConfig.startId && p.id <= genConfig.endId);
      }
    }

    // Search filter
    if (searchTerm.trim()) {
      const cleanSearch = searchTerm.trim().toLowerCase().replace('#', '');
      const numSearch = parseInt(cleanSearch, 10);

      items = items.filter((p) => {
        if (!isNaN(numSearch) && p.id === numSearch) return true;
        return p.name.toLowerCase().includes(cleanSearch);
      });
    }

    // Favorites only filter
    if (showOnlyFavorites) {
      items = items.filter((p) => favorites.includes(p.id));
    }

    // Type filter
    if (selectedType) {
      items = items.filter((p) => {
        const cached = loadedSummaries.get(p.id);
        // If not cached yet, allow it to pass temporarily so batch loader can fetch it,
        // or check if loaded summary matches type
        return cached ? cached.types.includes(selectedType) : true;
      });
    }

    // Sorting
    return [...items].sort((a, b) => {
      if (sortBy === 'id-asc') return a.id - b.id;
      if (sortBy === 'id-desc') return b.id - a.id;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'bst-desc' || sortBy === 'bst-asc') {
        const bstA = loadedSummaries.get(a.id)?.bst ?? 0;
        const bstB = loadedSummaries.get(b.id)?.bst ?? 0;
        return sortBy === 'bst-desc' ? bstB - bstA : bstA - bstB;
      }
      return a.id - b.id;
    });
  }, [masterList, selectedGen, searchTerm, showOnlyFavorites, favorites, selectedType, sortBy, loadedSummaries]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedGen, selectedType, showOnlyFavorites, sortBy]);

  // Items currently visible on page
  const visibleItems = useMemo(() => {
    return filteredList.slice(0, visibleCount);
  }, [filteredList, visibleCount]);

  // Fetch summaries for visible items
  useEffect(() => {
    if (visibleItems.length === 0) {
      setLoadingBatch(false);
      return;
    }

    const missingIds = visibleItems
      .map((item) => item.id)
      .filter((id) => !loadedSummaries.has(id));

    if (missingIds.length === 0) {
      setLoadingBatch(false);
      return;
    }

    setLoadingBatch(true);
    let isCurrent = true;

    fetchPokemonSummariesBatch(missingIds)
      .then((summaries) => {
        if (!isCurrent) return;
        setLoadedSummaries((prev) => {
          const next = new Map(prev);
          summaries.forEach((s) => next.set(s.id, s));
          return next;
        });
        setLoadingBatch(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar lote de resumos:', err);
        if (isCurrent) setLoadingBatch(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [visibleItems, loadedSummaries]);

  // Handlers
  const handleLoadMore = () => {
    sound.playClick();
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGen(null);
    setSelectedType(null);
    setShowOnlyFavorites(false);
    setSortBy('id-asc');
  };

  const handleRandomPokemon = () => {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    setSelectedPokemonId(randomId);
    sound.playModalOpen();
  };

  // Find summary for modal
  const activeModalPokemon = useMemo(() => {
    if (!selectedPokemonId) return null;
    return (
      loadedSummaries.get(selectedPokemonId) || {
        id: selectedPokemonId,
        name: masterList.find((p) => p.id === selectedPokemonId)?.name || `pokemon-${selectedPokemonId}`,
        types: ['normal' as PokemonType],
        sprite: '',
        officialArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemonId}.png`,
        shinyArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${selectedPokemonId}.png`,
        stats: [],
        height: 10,
        weight: 100,
        bst: 0,
      }
    );
  }, [selectedPokemonId, loadedSummaries, masterList]);

  const hasActiveFilters =
    Boolean(searchTerm) || selectedGen !== null || selectedType !== null || showOnlyFavorites;

  return (
    <div className="min-h-screen bg-[#0d1520] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        favoritesCount={favorites.length}
        showOnlyFavorites={showOnlyFavorites}
        onToggleShowFavorites={() => setShowOnlyFavorites((prev) => !prev)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onRandomPokemon={handleRandomPokemon}
      />

      {/* Filter and Sort Navigation */}
      <FilterBar
        selectedGen={selectedGen}
        onSelectGen={setSelectedGen}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalFiltered={filteredList.length}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6">
        {/* Active Filter Banner if Favorites or Type is selected */}
        {showOnlyFavorites && (
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#182538] to-rose-950/40 p-4 border border-rose-500/30">
            <div className="flex items-center gap-2">
              <Heart size={20} className="fill-rose-500 text-rose-500" />
              <span className="text-sm font-bold text-white">
                Exibindo sua lista de Favoritos ({favorites.length} Pokémon)
              </span>
            </div>
            <button
              onClick={() => setShowOnlyFavorites(false)}
              className="text-xs font-semibold text-rose-400 hover:text-white underline"
            >
              Ver todos os Pokémon
            </button>
          </div>
        )}

        {/* Pokemon Cards Grid */}
        {visibleItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
            {visibleItems.map((item) => {
              const summary = loadedSummaries.get(item.id);

              if (!summary) {
                // Skeleton Card while loading
                return (
                  <div
                    key={item.id}
                    className="flex h-56 flex-col justify-between rounded-[16px] border border-white/5 bg-[#142030]/60 p-4 animate-pulse"
                  >
                    <div className="flex justify-between">
                      <div className="h-4 w-12 rounded bg-slate-800" />
                      <div className="h-4 w-4 rounded-full bg-slate-800" />
                    </div>
                    <div className="mx-auto h-24 w-24 rounded-full bg-slate-800/80" />
                    <div className="space-y-2">
                      <div className="mx-auto h-4 w-20 rounded bg-slate-800" />
                      <div className="mx-auto h-3 w-14 rounded bg-slate-800/60" />
                    </div>
                  </div>
                );
              }

              return (
                <PokemonCard
                  key={summary.id}
                  pokemon={summary}
                  isFavorite={favorites.includes(summary.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelect={(p) => setSelectedPokemonId(p.id)}
                />
              );
            })}
          </div>
        ) : (
          /* Empty Search or Filter Result State */
          <div className="my-12 flex flex-col items-center justify-center rounded-3xl border border-[#00d2ff]/20 bg-[#121c29]/70 p-8 text-center backdrop-blur">
            <div className="relative mb-4">
              <div className="absolute -inset-2 rounded-full bg-[#00d2ff]/20 blur-md" />
              <QuickBallIcon size={64} className="relative opacity-80" />
            </div>
            <h3 className="text-lg font-bold text-white">Nenhum Pokémon Encontrado</h3>
            <p className="mt-1 max-w-md text-xs sm:text-sm text-slate-400">
              {showOnlyFavorites
                ? 'Você ainda não favoritou nenhum Pokémon. Toque no ícone de coração nos cards para salvá-los aqui!'
                : 'Não encontramos nenhum resultado para os filtros atuais. Tente buscar por outro nome ou número.'}
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#ffe600] px-4 py-2 text-xs font-black uppercase text-black shadow-lg transition-transform hover:scale-105 active:scale-95"
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
              className="group flex items-center gap-2 rounded-2xl border border-[#00d2ff]/40 bg-gradient-to-r from-[#142336] to-[#182a40] px-6 py-3 text-sm font-black tracking-wide text-[#00d2ff] shadow-lg transition-all hover:border-[#ffe600] hover:text-[#ffe600] hover:shadow-[0_0_20px_rgba(0,210,255,0.25)] active:scale-95 disabled:opacity-50"
            >
              {loadingBatch ? (
                <>
                  <Loader2 size={18} className="animate-spin text-[#00d2ff]" />
                  <span>Carregando dados...</span>
                </>
              ) : (
                <>
                  <QuickBallIcon size={20} className="transition-transform group-hover:rotate-45" />
                  <span>Carregar Mais Pokémon ({filteredList.length - visibleCount} restantes)</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-500">
              Exibindo {Math.min(visibleCount, filteredList.length)} de {filteredList.length} Pokémon
            </span>
          </div>
        )}
      </main>

      {/* Footer with Quick Ball Design Details */}
      <footer className="mt-auto border-t border-white/5 bg-[#0a121c] py-6 text-center text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <QuickBallIcon size={22} />
            <span className="font-extrabold text-white">
              QuickDex • Pokédex Web Quick Ball
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Dados em tempo real via PokéAPI v2</span>
            <span>•</span>
            <span className="text-[#00d2ff]">Efeitos Sonoros Web Audio API</span>
            <span>•</span>
            <span className="text-[#ffe600]">PT-BR 100%</span>
          </div>
        </div>
      </footer>

      {/* Pokemon Detail Modal */}
      {selectedPokemonId && activeModalPokemon && (
        <PokemonDetailModal
          pokemonSummary={activeModalPokemon}
          isFavorite={favorites.includes(selectedPokemonId)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedPokemonId(null)}
          onNavigate={(newId) => setSelectedPokemonId(newId)}
          hasPrev={selectedPokemonId > 1}
          hasNext={selectedPokemonId < 1025}
        />
      )}
    </div>
  );
}
