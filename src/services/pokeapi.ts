import {
  AbilityInfo,
  EncounterLocation,
  EvolutionStage,
  MoveDetail,
  PokemonFullDetail,
  PokemonSummary,
  PokemonType,
  PokemonVariety,
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
 * Get the full master list of Pokemon (including special forms, Megas, Gigamax, Regionals, Paradox up to 1302+)
 */
export async function getAllPokemonList(): Promise<{ id: number; name: string }[]> {
  if (allPokemonListCache) {
    return allPokemonListCache;
  }

  try {
    const res = await fetch(`${BASE_URL}/pokemon?limit=1302&offset=0`);
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
  // If it's a form >= 10000, fallback to base cry or id
  const cryId = id > 10000 ? id : id;
  return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${cryId}.ogg`;
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

  // Artwork resolution with robust fallbacks
  const officialArt =
    data.sprites?.other?.['official-artwork']?.front_default ||
    data.sprites?.other?.home?.front_default ||
    data.sprites?.front_default ||
    getOfficialArtworkUrl(id);

  const shinyArt =
    data.sprites?.other?.['official-artwork']?.front_shiny ||
    data.sprites?.other?.home?.front_shiny ||
    data.sprites?.front_shiny ||
    getShinyArtworkUrl(id);

  const summary: PokemonSummary = {
    id,
    name: data.name,
    types,
    sprite: data.sprites?.front_default || getFallbackSpriteUrl(id),
    officialArtwork: officialArt,
    shinyArtwork: shinyArt,
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

  // Fetch uncached in batches of 12 for high performance
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

  // Fetch pokemon basic + species (if form >= 10000, species uses pokemonData.species.url)
  const pokemonRes = await fetch(`${BASE_URL}/pokemon/${id}`);
  if (!pokemonRes.ok) throw new Error(`Falha ao obter detalhes do Pokémon #${id}`);
  const pokemonData = await pokemonRes.json();

  let speciesData: any = null;
  if (pokemonData.species?.url) {
    try {
      const sRes = await fetch(pokemonData.species.url);
      if (sRes.ok) speciesData = await sRes.json();
    } catch {}
  }

  const types: PokemonType[] = pokemonData.types.map((t: { type: { name: string } }) => t.type.name as PokemonType);

  const stats: StatItem[] = pokemonData.stats.map((s: { stat: { name: string }; base_stat: number }) => ({
    name: s.stat.name as StatItem['name'],
    baseStat: s.base_stat,
  }));
  const bst = stats.reduce((acc, curr) => acc + curr.baseStat, 0);

  // Species info extraction
  let genus = 'Pokémon';
  let flavorText = 'Forma especial com características e atributos modificados para combate de elite.';
  let evolutionChainId: number | null = null;
  const eggGroups: string[] = [];
  let captureRate = 45;
  let growthRate = 'medium-slow';
  const varieties: PokemonVariety[] = [];

  if (speciesData) {
    const ptGenus = speciesData.genera?.find((g: { language: { name: string } }) => g.language.name === 'pt' || g.language.name === 'es' || g.language.name === 'en');
    if (ptGenus) genus = ptGenus.genus;

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

    if (speciesData.varieties && Array.isArray(speciesData.varieties)) {
      speciesData.varieties.forEach((v: { is_default: boolean; pokemon: { name: string; url: string } }) => {
        const vId = extractIdFromUrl(v.pokemon.url);
        const vName = v.pokemon.name;
        let formType: PokemonVariety['formType'] = 'normal';
        let ptName = 'Forma Padrão';

        if (vName.includes('-mega-x')) {
          formType = 'mega';
          ptName = 'Mega Charizard X';
        } else if (vName.includes('-mega-y')) {
          formType = 'mega';
          ptName = 'Mega Charizard Y';
        } else if (vName.includes('-mega')) {
          formType = 'mega';
          ptName = 'Megaevolução';
        } else if (vName.includes('-gmax')) {
          formType = 'gmax';
          ptName = 'Gigantamax';
        } else if (vName.includes('-alola')) {
          formType = 'regional';
          ptName = 'Forma de Alola';
        } else if (vName.includes('-galar')) {
          formType = 'regional';
          ptName = 'Forma de Galar';
        } else if (vName.includes('-hisui')) {
          formType = 'regional';
          ptName = 'Forma de Hisui';
        } else if (vName.includes('-paldea')) {
          formType = 'regional';
          ptName = 'Forma de Paldea';
        } else if (v.is_default) {
          ptName = 'Forma Normal';
        } else {
          ptName = vName.replace(/-/g, ' ');
        }

        varieties.push({
          id: vId,
          name: vName,
          ptName,
          isDefault: v.is_default,
          formType,
        });
      });
    }
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

  // Moves
  const moves: MoveDetail[] = pokemonData.moves.map((m: {
    move: { name: string; url: string };
    version_group_details: {
      level_learned_at: number;
      move_learn_method: { name: string };
    }[];
  }) => {
    const latestDetail = m.version_group_details[m.version_group_details.length - 1];
    let method: MoveDetail['learnMethod'] = 'other';
    if (latestDetail) {
      if (latestDetail.move_learn_method.name === 'level-up') method = 'level-up';
      else if (latestDetail.move_learn_method.name === 'machine') method = 'machine';
      else if (latestDetail.move_learn_method.name === 'egg') method = 'egg';
      else if (latestDetail.move_learn_method.name === 'tutor') method = 'tutor';
    }

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

  // High quality official artwork with Mega and Gigantamax fallbacks
  const officialArt =
    pokemonData.sprites?.other?.['official-artwork']?.front_default ||
    pokemonData.sprites?.other?.home?.front_default ||
    pokemonData.sprites?.other?.showdown?.front_default ||
    pokemonData.sprites?.front_default ||
    getOfficialArtworkUrl(id);

  const shinyArt =
    pokemonData.sprites?.other?.['official-artwork']?.front_shiny ||
    pokemonData.sprites?.other?.home?.front_shiny ||
    pokemonData.sprites?.other?.showdown?.front_shiny ||
    pokemonData.sprites?.front_shiny ||
    getShinyArtworkUrl(id);

  const fullDetail: PokemonFullDetail = {
    id,
    name: pokemonData.name,
    types,
    sprite: pokemonData.sprites?.front_default || getFallbackSpriteUrl(id),
    officialArtwork: officialArt,
    shinyArtwork: shinyArt,
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
    varieties,
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

const encountersCache = new Map<number, EncounterLocation[]>();

export function formatVersionName(v: string): { version: string; versionGroup: string } {
  const map: Record<string, { version: string; versionGroup: string }> = {
    'red': { version: 'Red (Vermelho)', versionGroup: 'Kanto (Gen I)' },
    'blue': { version: 'Blue (Azul)', versionGroup: 'Kanto (Gen I)' },
    'yellow': { version: 'Yellow (Amarelo)', versionGroup: 'Kanto (Gen I)' },
    'gold': { version: 'Gold (Ouro)', versionGroup: 'Johto (Gen II)' },
    'silver': { version: 'Silver (Prata)', versionGroup: 'Johto (Gen II)' },
    'crystal': { version: 'Crystal (Cristal)', versionGroup: 'Johto (Gen II)' },
    'ruby': { version: 'Ruby (Rubi)', versionGroup: 'Hoenn (Gen III)' },
    'sapphire': { version: 'Sapphire (Safira)', versionGroup: 'Hoenn (Gen III)' },
    'emerald': { version: 'Emerald (Esmeralda)', versionGroup: 'Hoenn (Gen III)' },
    'firered': { version: 'FireRed (Fogo Vermelho)', versionGroup: 'Kanto (Gen III)' },
    'leafgreen': { version: 'LeafGreen (Verde Folha)', versionGroup: 'Kanto (Gen III)' },
    'diamond': { version: 'Diamond (Diamante)', versionGroup: 'Sinnoh (Gen IV)' },
    'pearl': { version: 'Pearl (Pérola)', versionGroup: 'Sinnoh (Gen IV)' },
    'platinum': { version: 'Platinum (Platina)', versionGroup: 'Sinnoh (Gen IV)' },
    'heartgold': { version: 'HeartGold (Coração de Ouro)', versionGroup: 'Johto (Gen IV)' },
    'soulsilver': { version: 'SoulSilver (Alma de Prata)', versionGroup: 'Johto (Gen IV)' },
    'black': { version: 'Black (Preto)', versionGroup: 'Unova (Gen V)' },
    'white': { version: 'White (Branco)', versionGroup: 'Unova (Gen V)' },
    'black-2': { version: 'Black 2 (Preto 2)', versionGroup: 'Unova (Gen V)' },
    'white-2': { version: 'White 2 (Branco 2)', versionGroup: 'Unova (Gen V)' },
    'x': { version: 'Pokémon X', versionGroup: 'Kalos (Gen VI)' },
    'y': { version: 'Pokémon Y', versionGroup: 'Kalos (Gen VI)' },
    'omega-ruby': { version: 'Omega Ruby (Ômega Rubi)', versionGroup: 'Hoenn (Gen VI)' },
    'alpha-sapphire': { version: 'Alpha Sapphire (Alfa Safira)', versionGroup: 'Hoenn (Gen VI)' },
    'sun': { version: 'Sun (Sol)', versionGroup: 'Alola (Gen VII)' },
    'moon': { version: 'Moon (Lua)', versionGroup: 'Alola (Gen VII)' },
    'ultra-sun': { version: 'Ultra Sun (Ultra Sol)', versionGroup: 'Alola (Gen VII)' },
    'ultra-moon': { version: 'Ultra Moon (Ultra Lua)', versionGroup: 'Alola (Gen VII)' },
    'lets-go-pikachu': { version: "Let's Go Pikachu", versionGroup: 'Kanto (Gen VII)' },
    'lets-go-eevee': { version: "Let's Go Eevee", versionGroup: 'Kanto (Gen VII)' },
    'sword': { version: 'Sword (Espada)', versionGroup: 'Galar (Gen VIII)' },
    'shield': { version: 'Shield (Escudo)', versionGroup: 'Galar (Gen VIII)' },
    'brilliant-diamond': { version: 'Brilliant Diamond', versionGroup: 'Sinnoh (Gen VIII)' },
    'shining-pearl': { version: 'Shining Pearl', versionGroup: 'Sinnoh (Gen VIII)' },
    'legends-arceus': { version: 'Legends: Arceus', versionGroup: 'Hisui (Gen VIII)' },
    'scarlet': { version: 'Scarlet (Escarlate)', versionGroup: 'Paldea (Gen IX)' },
    'violet': { version: 'Violet (Violeta)', versionGroup: 'Paldea (Gen IX)' },
  };

  if (map[v]) return map[v];
  const cap = v.charAt(0).toUpperCase() + v.slice(1).replace(/-/g, ' ');
  return { version: `Pokémon ${cap}`, versionGroup: 'Geral' };
}

export function formatEncounterMethod(m?: string): string {
  if (!m) return 'Encontro Selvagem';
  const methodMap: Record<string, string> = {
    walk: 'Grama Alta / Caminhando',
    surf: 'Surfando na Água',
    'old-rod': 'Pescando (Vara Velha)',
    'good-rod': 'Pescando (Vara Boa)',
    'super-rod': 'Pescando (Super Vara)',
    gift: 'Presente Inicial / NPC',
    'gift-egg': 'Ovo Recebido',
    headbutt: 'Cabeçada em Árvore',
    'rock-smash': 'Quebrando Pedras',
    cave: 'Dentro de Caverna',
    bridge: 'Sombras de Ponte',
    'dark-grass': 'Grama Escura (Dupla)',
    'grass-spots': 'Grama Farfalhante',
    'cave-spots': 'Nuvem de Poeira',
    'bridge-spots': 'Sombra Voadora',
    'water-spots': 'Bolhas na Água',
    seaweed: 'Mergulho em Algas',
    raid: 'Reide Dynamax / Tera Raid',
    only_one: 'Encontro Único Estático',
    roaming: 'Pokémon Errante pelo Mapa',
  };
  return methodMap[m] || m.replace(/-/g, ' ');
}

export function formatLocationAreaName(raw: string, mode: 'pt-en' | 'pt-br' = 'pt-en'): string {
  if (!raw) return 'Área Desconhecida';
  const clean = raw.replace(/-area$/i, '').replace(/-/g, ' ');

  if (mode === 'pt-en') {
    return clean
      .split(' ')
      .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(' ');
  }

  let name = clean
    .replace(/\broute\b/gi, 'Rota')
    .replace(/\bforest\b/gi, 'Floresta')
    .replace(/\bcave\b/gi, 'Caverna')
    .replace(/\bcity\b/gi, 'Cidade')
    .replace(/\btown\b/gi, 'Vila')
    .replace(/\blake\b/gi, 'Lago')
    .replace(/\bmount\b/gi, 'Monte')
    .replace(/\bmt\b/gi, 'Monte')
    .replace(/\bisland\b/gi, 'Ilha')
    .replace(/\bpath\b/gi, 'Caminho')
    .replace(/\bsea\b/gi, 'Mar')
    .replace(/\briver\b/gi, 'Rio')
    .replace(/\bvalley\b/gi, 'Vale')
    .replace(/\bwoods\b/gi, 'Bosque');

  return name
    .split(' ')
    .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/**
 * Fetch encounter locations for a Pokemon
 */
export async function fetchPokemonEncounters(id: number, baseSpeciesId?: number): Promise<EncounterLocation[]> {
  const queryId = id > 10000 && baseSpeciesId ? baseSpeciesId : id;
  if (encountersCache.has(queryId)) {
    return encountersCache.get(queryId)!;
  }

  try {
    const res = await fetch(`${BASE_URL}/pokemon/${queryId}/encounters`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const parsed: EncounterLocation[] = [];

    data.forEach((loc: any) => {
      const rawAreaName = loc.location_area?.name || '';
      const cleanAreaName = formatLocationAreaName(rawAreaName);

      loc.version_details?.forEach((vDetail: any) => {
        const rawVersion = vDetail.version?.name || 'unknown';
        const { version, versionGroup } = formatVersionName(rawVersion);
        const maxChance = vDetail.max_chance || 0;

        let method = 'Grama Alta / Caminho';
        let minLevel = 1;
        let maxLevel = 100;

        if (vDetail.encounter_details && vDetail.encounter_details.length > 0) {
          const first = vDetail.encounter_details[0];
          minLevel = first.min_level || 1;
          maxLevel = first.max_level || minLevel;
          method = formatEncounterMethod(first.method?.name);
        }

        parsed.push({
          version,
          versionGroup,
          areaName: cleanAreaName,
          method,
          chance: maxChance,
          minLevel,
          maxLevel,
        });
      });
    });

    encountersCache.set(queryId, parsed);
    return parsed;
  } catch (err) {
    console.warn(`Erro ao carregar locais para #${queryId}:`, err);
    return [];
  }
}

