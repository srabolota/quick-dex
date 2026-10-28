import {
  AbilityInfo,
  EvolutionStage,
  MoveDetail,
  PokemonFullDetail,
  PokemonSummary,
  PokemonType,
  StatItem,
} from '../types/pokemon';
import { ABILITY_TRANSLATIONS } from '../utils/translations';

const BASE_URL = 'https://pokeapi.co/api/v2';

// In-memory cache to guarantee ultra-fast responses
const summaryCache = new Map<number, PokemonSummary>();
const fullDetailCache = new Map<number, PokemonFullDetail>();
const evolutionCache = new Map<number, EvolutionStage>();
let allPokemonListCache: { id: number; name: string }[] | null = null;

export interface RawPokemonListResponse {
  results: { name: string; url: string }[];
}

/**
 * Extracts Pokemon ID from its PokeAPI URL
 */
export function extractIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
}

/**
 * Get the full master list of Pokemon (up to Gen 9 - 1025)
 */
export async function getAllPokemonList(): Promise<{ id: number; name: string }[]> {
  if (allPokemonListCache) {
    return allPokemonListCache;
  }

  try {
    const res = await fetch(`${BASE_URL}/pokemon?limit=1025&offset=0`);
    if (!res.ok) throw new Error('Falha ao buscar lista geral da PokéAPI');
    const data: RawPokemonListResponse = await res.json();
    allPokemonListCache = data.results.map((p) => ({
      name: p.name,
      id: extractIdFromUrl(p.url),
    }));
    return allPokemonListCache;
  } catch (error) {
    console.error('Erro na PokéAPI:', error);
    // Fallback minimal list if offline or network error
    return Array.from({ length: 151 }, (_, i) => ({
      id: i + 1,
      name: `pokemon-${i + 1}`,
    }));
  }
}

/**
 * Build sprite URLs reliably
 */
export function getOfficialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getShinyArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
}

export function getFallbackSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function getPokemonCryUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
}

/**
 * Fetch a single Pokemon summary (for cards)
 */
export async function fetchPokemonSummary(idOrName: number | string): Promise<PokemonSummary> {
  const numericId = typeof idOrName === 'number' ? idOrName : null;
  if (numericId && summaryCache.has(numericId)) {
    return summaryCache.get(numericId)!;
  }

  const res = await fetch(`${BASE_URL}/pokemon/${idOrName}`);
  if (!res.ok) throw new Error(`Pokémon ${idOrName} não encontrado.`);
  const data = await res.json();

  const id = data.id;
  const types: PokemonType[] = data.types.map((t: { type: { name: string } }) => t.type.name as PokemonType);

  const stats: StatItem[] = data.stats.map((s: { stat: { name: string }; base_stat: number }) => ({
    name: s.stat.name as StatItem['name'],
    baseStat: s.base_stat,
  }));

  const bst = stats.reduce((acc, curr) => acc + curr.baseStat, 0);

  const summary: PokemonSummary = {
    id,
    name: data.name,
    types,
    sprite: data.sprites?.front_default || getFallbackSpriteUrl(id),
    officialArtwork: data.sprites?.other?.['official-artwork']?.front_default || getOfficialArtworkUrl(id),
    shinyArtwork: data.sprites?.other?.['official-artwork']?.front_shiny || getShinyArtworkUrl(id),
    stats,
    height: data.height,
    weight: data.weight,
    bst,
  };

  summaryCache.set(id, summary);
  return summary;
}

/**
 * Batch fetch summaries for multiple Pokémon IDs with concurrency limit
 */
export async function fetchPokemonSummariesBatch(ids: number[]): Promise<PokemonSummary[]> {
  const results: PokemonSummary[] = [];
  const uncachedIds = ids.filter((id) => !summaryCache.has(id));

  // Use already cached items directly
  ids.forEach((id) => {
    if (summaryCache.has(id)) {
      results.push(summaryCache.get(id)!);
    }
  });

  if (uncachedIds.length === 0) {
    return ids.map((id) => summaryCache.get(id)!).filter(Boolean);
  }

  // Fetch uncached in batches of 12 for high performance without choking browser
  const chunkSize = 12;
  for (let i = 0; i < uncachedIds.length; i += chunkSize) {
    const chunk = uncachedIds.slice(i, i + chunkSize);
    const chunkPromises = chunk.map((id) =>
      fetchPokemonSummary(id).catch((err) => {
        console.warn(`Erro ao carregar Pokémon #${id}:`, err);
        return null;
      })
    );
    const loaded = await Promise.all(chunkPromises);
    loaded.forEach((item) => {
      if (item) results.push(item);
    });
  }

  // Return in original requested order
  return ids.map((id) => summaryCache.get(id) || results.find((r) => r.id === id)).filter(Boolean) as PokemonSummary[];
}

/**
 * Fetch Full Pokemon Detail including species flavor text, abilities, moves, and evolution chain
 */
export async function fetchPokemonFullDetail(id: number): Promise<PokemonFullDetail> {
  if (fullDetailCache.has(id)) {
    return fullDetailCache.get(id)!;
  }

  // Fetch pokemon basic + species concurrently
  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`${BASE_URL}/pokemon/${id}`),
    fetch(`${BASE_URL}/pokemon-species/${id}`).catch(() => null),
  ]);

  if (!pokemonRes.ok) throw new Error(`Falha ao obter detalhes do Pokémon #${id}`);
  const pokemonData = await pokemonRes.json();
  const speciesData = speciesRes && speciesRes.ok ? await speciesRes.json() : null;

  const types: PokemonType[] = pokemonData.types.map((t: { type: { name: string } }) => t.type.name as PokemonType);

  const stats: StatItem[] = pokemonData.stats.map((s: { stat: { name: string }; base_stat: number }) => ({
    name: s.stat.name as StatItem['name'],
    baseStat: s.base_stat,
  }));
  const bst = stats.reduce((acc, curr) => acc + curr.baseStat, 0);

  // Species info extraction
  let genus = 'Pokémon Desconhecido';
  let flavorText = 'Sem descrição disponível nos arquivos.';
  let evolutionChainId: number | null = null;
  const eggGroups: string[] = [];
  let captureRate = 45;
  let growthRate = 'medium-slow';

  if (speciesData) {
    // Genus in PT or English
    const ptGenus = speciesData.genera?.find((g: { language: { name: string } }) => g.language.name === 'pt' || g.language.name === 'es' || g.language.name === 'en');
    if (ptGenus) genus = ptGenus.genus;

    // Flavor text in PT / ES / EN
    const ptEntry = speciesData.flavor_text_entries?.find(
      (entry: { language: { name: string } }) => entry.language.name === 'en'
    );
    if (ptEntry) {
      flavorText = ptEntry.flavor_text.replace(/[\n\f]/g, ' ');
    }

    if (speciesData.evolution_chain?.url) {
      evolutionChainId = extractIdFromUrl(speciesData.evolution_chain.url);
    }

    if (speciesData.egg_groups) {
      speciesData.egg_groups.forEach((eg: { name: string }) => eggGroups.push(eg.name));
    }

    captureRate = speciesData.capture_rate ?? 45;
    growthRate = speciesData.growth_rate?.name ?? 'medium';
  }

  // Abilities
  const abilities: AbilityInfo[] = pokemonData.abilities.map((ab: { ability: { name: string }; is_hidden: boolean }) => {
    const rawName = ab.ability.name;
    const mapped = ABILITY_TRANSLATIONS[rawName.replace(/-/g, '_')] || {
      ptName: rawName.replace(/-/g, ' ').toUpperCase(),
      description: 'Habilidade de combate Pokémon com efeitos estratégicos.',
    };
    return {
      name: rawName,
      ptName: mapped.ptName,
      isHidden: ab.is_hidden,
      description: mapped.description,
    };
  });

  // Moves (parsed from pokemonData.moves with details)
  const moves: MoveDetail[] = pokemonData.moves.map((m: {
    move: { name: string; url: string };
    version_group_details: {
      level_learned_at: number;
      move_learn_method: { name: string };
    }[];
  }) => {
    // Get latest version group detail
    const latestDetail = m.version_group_details[m.version_group_details.length - 1];
    let method: MoveDetail['learnMethod'] = 'other';
    if (latestDetail) {
      if (latestDetail.move_learn_method.name === 'level-up') method = 'level-up';
      else if (latestDetail.move_learn_method.name === 'machine') method = 'machine';
      else if (latestDetail.move_learn_method.name === 'egg') method = 'egg';
      else if (latestDetail.move_learn_method.name === 'tutor') method = 'tutor';
    }

    // Default placeholder for move type & power until enriched
    return {
      name: m.move.name,
      type: 'normal' as PokemonType,
      damageClass: 'physical',
      power: null,
      accuracy: null,
      pp: 15,
      learnMethod: method,
      levelLearnedAt: latestDetail ? latestDetail.level_learned_at : 0,
    };
  });

  const fullDetail: PokemonFullDetail = {
    id,
    name: pokemonData.name,
    types,
    sprite: pokemonData.sprites?.front_default || getFallbackSpriteUrl(id),
    officialArtwork: pokemonData.sprites?.other?.['official-artwork']?.front_default || getOfficialArtworkUrl(id),
    shinyArtwork: pokemonData.sprites?.other?.['official-artwork']?.front_shiny || getShinyArtworkUrl(id),
    stats,
    height: pokemonData.height,
    weight: pokemonData.weight,
    bst,
    genus,
    flavorText,
    abilities,
    cries: pokemonData.cries?.latest || getPokemonCryUrl(id),
    evolutionChainId,
    moves,
    eggGroups,
    captureRate,
    growthRate,
  };

  fullDetailCache.set(id, fullDetail);
  return fullDetail;
}

/**
 * Fetch and parse evolution chain into structured stages
 */
export async function fetchEvolutionChain(chainId: number): Promise<EvolutionStage | null> {
  if (evolutionCache.has(chainId)) {
    return evolutionCache.get(chainId)!;
  }

  try {
    const res = await fetch(`${BASE_URL}/evolution-chain/${chainId}`);
    if (!res.ok) return null;
    const data = await res.json();

    // Recursive parser
    const parseNode = (node: {
      species: { name: string; url: string };
      evolution_details: {
        trigger: { name: string };
        min_level?: number | null;
        item?: { name: string } | null;
        held_item?: { name: string } | null;
        time_of_day?: string;
        min_happiness?: number | null;
        known_move_type?: { name: string } | null;
      }[];
      evolves_to: unknown[];
    }): EvolutionStage => {
      const id = extractIdFromUrl(node.species.url);
      const details = node.evolution_details?.[0];

      let trigger = 'Inicial';
      let minLevel: number | null = null;
      let item: string | null = null;
      let heldItem: string | null = null;
      let condition: string | null = null;

      if (details) {
        if (details.min_level) {
          trigger = `Nível ${details.min_level}`;
          minLevel = details.min_level;
        } else if (details.item) {
          const itemName = details.item.name.replace(/-/g, ' ');
          trigger = `Usar ${itemName}`;
          item = itemName;
        } else if (details.trigger?.name === 'trade') {
          trigger = details.held_item ? `Troca segurando ${details.held_item.name}` : 'Troca';
          if (details.held_item) heldItem = details.held_item.name;
        } else if (details.min_happiness) {
          trigger = `Felicidade Alta (${details.time_of_day ? details.time_of_day : 'Geral'})`;
          condition = 'Felicidade';
        } else {
          trigger = details.trigger?.name?.replace(/-/g, ' ') || 'Evolução Especial';
        }
      }

      // Check if we have cached summary types or default to empty
      const cached = summaryCache.get(id);
      const types = cached ? cached.types : [];

      const evolvesTo = (node.evolves_to as typeof node[]).map(parseNode);

      return {
        id,
        name: node.species.name,
        types,
        sprite: getOfficialArtworkUrl(id),
        trigger,
        minLevel,
        item,
        heldItem,
        condition,
        evolvesTo,
      };
    };

    const parsedChain = parseNode(data.chain);
    evolutionCache.set(chainId, parsedChain);
    return parsedChain;
  } catch (err) {
    console.error('Erro ao buscar cadeia de evolução:', err);
    return null;
  }
}
