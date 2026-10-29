export type NamingMode = 'pt-en' | 'pt-br';

export interface GenerationInfo {
  id: number;
  roman: string;
  name: string;
  region: string;
  startId: number;
  endId: number;
}

export const GENERATIONS: GenerationInfo[] = [
  { id: 1, roman: 'I', name: 'Gen I', region: 'Kanto', startId: 1, endId: 151 },
  { id: 2, roman: 'II', name: 'Gen II', region: 'Johto', startId: 152, endId: 251 },
  { id: 3, roman: 'III', name: 'Gen III', region: 'Hoenn', startId: 252, endId: 386 },
  { id: 4, roman: 'IV', name: 'Gen IV', region: 'Sinnoh', startId: 387, endId: 493 },
  { id: 5, roman: 'V', name: 'Gen V', region: 'Unova', startId: 494, endId: 649 },
  { id: 6, roman: 'VI', name: 'Gen VI', region: 'Kalos', startId: 650, endId: 721 },
  { id: 7, roman: 'VII', name: 'Gen VII', region: 'Alola', startId: 722, endId: 809 },
  { id: 8, roman: 'VIII', name: 'Gen VIII', region: 'Galar / Hisui', startId: 810, endId: 905 },
  { id: 9, roman: 'IX', name: 'Gen IX', region: 'Paldea', startId: 906, endId: 1025 },
];

export const MOVE_LEARN_METHODS_PT: Record<string, string> = {
  'level-up': 'Por Nível',
  machine: 'TM / Disco Técnico',
  egg: 'Movimento de Ovo',
  tutor: 'Tutor de Golpes',
  other: 'Outro',
};

export const DAMAGE_CLASS_PT: Record<string, { label: string; color: string; icon: string }> = {
  physical: { label: 'Físico', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40', icon: '💥' },
  special: { label: 'Especial', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40', icon: '🌀' },
  status: { label: 'Status', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40', icon: '🛡️' },
};

/**
 * Portuguese & English Ability Translations
 */
export const ABILITY_TRANSLATIONS: Record<string, { enName: string; ptName: string; description: string }> = {
  overgrow: { enName: 'Overgrow', ptName: 'Espessura', description: 'Aumenta a potência de golpes do tipo Planta em 50% quando o HP está abaixo de 1/3.' },
  blaze: { enName: 'Blaze', ptName: 'Chama', description: 'Aumenta a potência de golpes do tipo Fogo em 50% quando o HP está abaixo de 1/3.' },
  torrent: { enName: 'Torrent', ptName: 'Torrente', description: 'Aumenta a potência de golpes do tipo Água em 50% quando o HP está abaixo de 1/3.' },
  shield_dust: { enName: 'Shield Dust', ptName: 'Poeira Protetora', description: 'Bloqueia efeitos secundários de ataques causados por oponentes.' },
  compound_eyes: { enName: 'Compound Eyes', ptName: 'Olhos Compostos', description: 'Aumenta a precisão de todos os golpes do usuário em 30%.' },
  static: { enName: 'Static', ptName: 'Estática', description: 'O contato físico com o Pokémon pode paralisar o atacante (30% de chance).' },
  lightning_rod: { enName: 'Lightning Rod', ptName: 'Para-Raios', description: 'Atrai golpes elétricos, anula o dano e aumenta o Ataque Especial do usuário.' },
  levitate: { enName: 'Levitate', ptName: 'Levitação', description: 'Concede imunidade completa a golpes e efeitos do tipo Terra (Ground).' },
  synchronize: { enName: 'Synchronize', ptName: 'Sincronia', description: 'Transfere queimadura, paralisia ou envenenamento de volta para o atacante.' },
  intimidate: { enName: 'Intimidate', ptName: 'Intimidação', description: 'Diminui o Ataque do oponente em 1 estágio ao entrar em combate.' },
  speed_boost: { enName: 'Speed Boost', ptName: 'Impulso de Velocidade', description: 'Aumenta a Velocidade em 1 estágio ao final de cada turno.' },
  chlorophyll: { enName: 'Chlorophyll', ptName: 'Clorofila', description: 'Dobra a Velocidade do Pokémon durante o clima de sol intenso.' },
  solar_power: { enName: 'Solar Power', ptName: 'Poder Solar', description: 'Aumenta o Sp. Atk em 50% no sol intenso, mas consome 1/8 do HP máximo por turno.' },
  rain_dish: { enName: 'Rain Dish', ptName: 'Prato de Chuva', description: 'Recupera 1/16 do HP máximo no final de cada turno em que estiver chovendo.' },
  magic_guard: { enName: 'Magic Guard', ptName: 'Guarda Mágica', description: 'Impede todo dano indireto (clima, veneno, espinhos, recuo de Life Orb).' },
  multiscale: { enName: 'Multiscale', ptName: 'Multiescala', description: 'Reduz o dano sofrido em 50% quando o HP estiver com a barra cheia (100%).' },
  drought: { enName: 'Drought', ptName: 'Seca', description: 'Invoca clima de sol intenso ao entrar na arena por 5 turnos.' },
  drizzle: { enName: 'Drizzle', ptName: 'Garoa', description: 'Invoca clima de chuva torrencial ao entrar na arena por 5 turnos.' },
  sand_stream: { enName: 'Sand Stream', ptName: 'Corrente de Areia', description: 'Invoca tempestade de areia ao entrar na batalha.' },
  snow_warning: { enName: 'Snow Warning', ptName: 'Aviso de Neve', description: 'Invoca tempestade de neve/granizo ao entrar na arena.' },
  adaptability: { enName: 'Adaptability', ptName: 'Adaptabilidade', description: 'Aumenta o bônus de mesmo tipo de ataque (STAB) de 1.5x para 2.0x.' },
  moxie: { enName: 'Moxie', ptName: 'Arrogância', description: 'Aumenta o Ataque em 1 estágio toda vez que derrota um oponente.' },
  prankster: { enName: 'Prankster', ptName: 'Travesso', description: 'Concede +1 de prioridade a todos os golpes de categoria Status.' },
  guts: { enName: 'Guts', ptName: 'Bravura', description: 'Aumenta o Ataque em 50% caso o Pokémon sofra com uma condição de status (ignora queima).' },
  inner_focus: { enName: 'Inner Focus', ptName: 'Foco Interno', description: 'Impede que o Pokémon recue (Flinch) e protege contra Intimidação.' },
  sturdy: { enName: 'Sturdy', ptName: 'Robustez', description: 'Sobrevive com 1 HP a qualquer golpe que o nocautearia em um só hit quando estiver com HP cheio.' },
  huge_power: { enName: 'Huge Power', ptName: 'Poder Imenso', description: 'Dobra o valor numérico do Ataque físico do Pokémon em combate.' },
  beast_boost: { enName: 'Beast Boost', ptName: 'Impulso Feroz', description: 'Aumenta o maior atributo do usuário toda vez que derrota um adversário.' },
  protosynthesis: { enName: 'Protosynthesis', ptName: 'Protossíntese', description: 'Aumenta o maior atributo do Pokémon sob Sol Intenso ou com Booster Energy (Paradoxo Passado).' },
  quark_drive: { enName: 'Quark Drive', ptName: 'Propulsão de Quarks', description: 'Aumenta o maior atributo sob Campo Elétrico ou com Booster Energy (Paradoxo Futuro).' },
};

/**
 * Portuguese popular moves mapping
 */
export const MOVE_TRANSLATIONS_PT: Record<string, string> = {
  'thunderbolt': 'Raio',
  'flamethrower': 'Lança-Chamas',
  'ice-beam': 'Raio de Gelo',
  'earthquake': 'Terremoto',
  'surf': 'Surfar',
  'close-combat': 'Combate Próximo',
  'shadow-ball': 'Bola Sombria',
  'energy-ball': 'Esfera de Energia',
  'moonblast': 'Explosão Lunar',
  'draco-meteor': 'Meteoro do Dragão',
  'swords-dance': 'Dança das Espadas',
  'nasty-plot': 'Maquinar',
  'calm-mind': 'Paz de Espírito',
  'dragon-dance': 'Dança do Dragão',
  'stealth-rock': 'Pedras Furtivas',
  'toxic': 'Tóxico',
  'roost': 'Pousar',
  'bullet-punch': 'Soco Bala',
  'brave-bird': 'Pássaro Bravo',
  'hydro-pump': 'Bomba d’Água',
  'fire-blast': 'Rajada de Fogo',
  'blizzard': 'Nevasca',
  'psychic': 'Psíquico',
  'knock-off': 'Derrubar',
  'u-turn': 'Meia-Volta',
  'volt-switch': 'Troca Elétrica',
  'stone-edge': 'Gume de Pedra',
  'flash-cannon': 'Canhão de Luz',
  'bug-buzz': 'Zumbido de Inseto',
  'play-rough': 'Brincadeira Bruta',
  'tackle': 'Investida',
  'growl': 'Rosnado',
  'scratch': 'Arranhão',
  'quick-attack': 'Ataque Rápido',
  'iron-head': 'Cabeça de Ferro',
  'dark-pulse': 'Pulso Sombrio',
  'sludge-bomb': 'Bomba de Lodo',
  'focus-blast': 'Explosão Focal',
  'hyper-beam': 'Hiper Raio',
  'gigaimpact': 'Giga Impacto',
};

/**
 * Paradox Pokemon Relationships Map (Base species <-> Paradox forms)
 */
export interface ParadoxRelation {
  baseSpeciesId: number;
  baseSpeciesName: string;
  paradoxPast?: { id: number; name: string; ptName: string };
  paradoxFuture?: { id: number; name: string; ptName: string };
}

export const PARADOX_RELATIONS: ParadoxRelation[] = [
  {
    baseSpeciesId: 232,
    baseSpeciesName: 'donphan',
    paradoxPast: { id: 984, name: 'great-tusk', ptName: 'Great Tusk (Presa Furiosa)' },
    paradoxFuture: { id: 990, name: 'iron-treads', ptName: 'Iron Treads (Trilho Férreo)' },
  },
  {
    baseSpeciesId: 39,
    baseSpeciesName: 'jigglypuff',
    paradoxPast: { id: 985, name: 'scream-tail', ptName: 'Scream Tail (Cauda Brado)' },
  },
  {
    baseSpeciesId: 591,
    baseSpeciesName: 'amoonguss',
    paradoxPast: { id: 986, name: 'brute-bonnet', ptName: 'Brute Bonnet (Capuz Bruto)' },
  },
  {
    baseSpeciesId: 200,
    baseSpeciesName: 'misdreavus',
    paradoxPast: { id: 987, name: 'flutter-mane', ptName: 'Flutter Mane (Juba Esbelta)' },
  },
  {
    baseSpeciesId: 82,
    baseSpeciesName: 'magneton',
    paradoxPast: { id: 989, name: 'sandy-shocks', ptName: 'Sandy Shocks (Choque Areia)' },
  },
  {
    baseSpeciesId: 637,
    baseSpeciesName: 'volcarona',
    paradoxPast: { id: 988, name: 'slither-wing', ptName: 'Slither Wing (Asa Rastejante)' },
    paradoxFuture: { id: 994, name: 'iron-moth', ptName: 'Iron Moth (Mariposa Férrea)' },
  },
  {
    baseSpeciesId: 225,
    baseSpeciesName: 'delibird',
    paradoxFuture: { id: 991, name: 'iron-bundle', ptName: 'Iron Bundle (Pacote Férreo)' },
  },
  {
    baseSpeciesId: 297,
    baseSpeciesName: 'hariyama',
    paradoxFuture: { id: 992, name: 'iron-hands', ptName: 'Iron Hands (Mãos Férreas)' },
  },
  {
    baseSpeciesId: 635,
    baseSpeciesName: 'hydreigon',
    paradoxFuture: { id: 993, name: 'iron-jugulis', ptName: 'Iron Jugulis (Pescoço Férreo)' },
  },
  {
    baseSpeciesId: 248,
    baseSpeciesName: 'tyranitar',
    paradoxFuture: { id: 995, name: 'iron-thorns', ptName: 'Iron Thorns (Espinhos Férreos)' },
  },
  {
    baseSpeciesId: 373,
    baseSpeciesName: 'salamence',
    paradoxPast: { id: 1005, name: 'roaring-moon', ptName: 'Roaring Moon (Lua Estrondosa)' },
  },
  {
    baseSpeciesId: 282,
    baseSpeciesName: 'gardevoir',
    paradoxFuture: { id: 1006, name: 'iron-valiant', ptName: 'Iron Valiant (Valente Férreo)' },
  },
  {
    baseSpeciesId: 475,
    baseSpeciesName: 'gallade',
    paradoxFuture: { id: 1006, name: 'iron-valiant', ptName: 'Iron Valiant (Valente Férreo)' },
  },
  {
    baseSpeciesId: 245,
    baseSpeciesName: 'suicune',
    paradoxPast: { id: 1009, name: 'walking-wake', ptName: 'Walking Wake (Onda Serpenteante)' },
  },
  {
    baseSpeciesId: 640,
    baseSpeciesName: 'virizion',
    paradoxFuture: { id: 1010, name: 'iron-leaves', ptName: 'Iron Leaves (Folhas Férreas)' },
  },
  {
    baseSpeciesId: 244,
    baseSpeciesName: 'entei',
    paradoxPast: { id: 1020, name: 'gouging-fire', ptName: 'Gouging Fire (Fogo Perfurante)' },
  },
  {
    baseSpeciesId: 243,
    baseSpeciesName: 'raikou',
    paradoxPast: { id: 1021, name: 'raging-bolt', ptName: 'Raging Bolt (Raio Feroz)' },
  },
  {
    baseSpeciesId: 639,
    baseSpeciesName: 'terrakion',
    paradoxFuture: { id: 1022, name: 'iron-boulder', ptName: 'Iron Boulder (Rocha Férrea)' },
  },
  {
    baseSpeciesId: 638,
    baseSpeciesName: 'cobalion',
    paradoxFuture: { id: 1023, name: 'iron-crown', ptName: 'Iron Crown (Coroa Férrea)' },
  },
];

/**
 * Format Move Name according to NamingMode
 */
export function formatMoveName(name: string, mode: NamingMode = 'pt-en'): string {
  if (!name) return '';
  const clean = name.toLowerCase().trim();
  const englishFormatted = clean
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (mode === 'pt-br') {
    const pt = MOVE_TRANSLATIONS_PT[clean];
    if (pt) return pt;
  }

  return englishFormatted;
}

/**
 * Format Ability Name according to NamingMode
 */
export function formatAbilityName(name: string, mode: NamingMode = 'pt-en'): string {
  if (!name) return '';
  const key = name.toLowerCase().replace(/-/g, '_');
  const entry = ABILITY_TRANSLATIONS[key];

  if (mode === 'pt-br' && entry?.ptName) {
    return entry.ptName;
  }

  if (entry?.enName) {
    return entry.enName;
  }

  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Clean pokemon name for presentation including Megas, G-Max, Regional, and Paradox
 */
export function formatPokemonName(name: string): string {
  if (!name) return '';
  const specialNames: Record<string, string> = {
    'nidoran-f': 'Nidoran ♀',
    'nidoran-m': 'Nidoran ♂',
    'mr-mime': 'Mr. Mime',
    'mime-jr': 'Mime Jr.',
    'great-tusk': 'Great Tusk (Presa Furiosa)',
    'scream-tail': 'Scream Tail (Cauda Brado)',
    'brute-bonnet': 'Brute Bonnet (Capuz Bruto)',
    'flutter-mane': 'Flutter Mane (Juba Esbelta)',
    'slither-wing': 'Slither Wing (Asa Rastejante)',
    'sandy-shocks': 'Sandy Shocks (Choque Areia)',
    'iron-treads': 'Iron Treads (Trilho Férreo)',
    'iron-bundle': 'Iron Bundle (Pacote Férreo)',
    'iron-hands': 'Iron Hands (Mãos Férreas)',
    'iron-jugulis': 'Iron Jugulis (Pescoço Férreo)',
    'iron-moth': 'Iron Moth (Mariposa Férrea)',
    'iron-thorns': 'Iron Thorns (Espinhos Férreos)',
    'roaring-moon': 'Roaring Moon (Lua Estrondosa)',
    'iron-valiant': 'Iron Valiant (Valente Férreo)',
    'walking-wake': 'Walking Wake (Onda Serpenteante)',
    'iron-leaves': 'Iron Leaves (Folhas Férreas)',
    'gouging-fire': 'Gouging Fire (Fogo Perfurante)',
    'raging-bolt': 'Raging Bolt (Raio Feroz)',
    'iron-boulder': 'Iron Boulder (Rocha Férrea)',
    'iron-crown': 'Iron Crown (Coroa Férrea)',
    'type-null': 'Type: Null',
    'ho-oh': 'Ho-Oh',
    'porygon-z': 'Porygon-Z',
    'jangmo-o': 'Jangmo-o',
    'hakamo-o': 'Hakamo-o',
    'kommo-o': 'Kommo-o',
    'ting-lu': 'Ting-Lu',
    'chien-pao': 'Chien-Pao',
    'wo-chien': 'Wo-Chien',
    'chi-yu': 'Chi-Yu',
  };

  const clean = name.toLowerCase();
  if (specialNames[clean]) return specialNames[clean];

  // Formatting Megas
  if (clean.includes('-mega-x')) {
    const base = clean.replace('-mega-x', '');
    return `Mega ${formatPokemonName(base)} X`;
  }
  if (clean.includes('-mega-y')) {
    const base = clean.replace('-mega-y', '');
    return `Mega ${formatPokemonName(base)} Y`;
  }
  if (clean.includes('-mega')) {
    const base = clean.replace('-mega', '');
    return `Mega ${formatPokemonName(base)}`;
  }

  // Formatting Primal
  if (clean.includes('-primal')) {
    const base = clean.replace('-primal', '');
    return `Primal ${formatPokemonName(base)}`;
  }

  // Formatting Gigantamax
  if (clean.includes('-gmax')) {
    const base = clean.replace('-gmax', '');
    return `${formatPokemonName(base)} Gigamax`;
  }

  // Formatting Regionals
  if (clean.includes('-alola')) {
    const base = clean.replace('-alola', '');
    return `${formatPokemonName(base)} de Alola`;
  }
  if (clean.includes('-galar')) {
    const base = clean.replace('-galar', '');
    return `${formatPokemonName(base)} de Galar`;
  }
  if (clean.includes('-hisui')) {
    const base = clean.replace('-hisui', '');
    return `${formatPokemonName(base)} de Hisui`;
  }
  if (clean.includes('-paldea')) {
    const base = clean.replace('-paldea', '');
    return `${formatPokemonName(base)} de Paldea`;
  }

  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format ID with zero-padding (e.g. 1 -> "#001", 25 -> "#025", 10001 -> "#10001")
 */
export function formatPokemonId(id: number): string {
  if (id < 10) return `#00${id}`;
  if (id < 100) return `#0${id}`;
  if (id < 1000) return `#${id}`;
  return `#${id}`;
}

/**
 * Get clean species name for Bulbapedia URL
 */
export function getBulbapediaUrl(rawName: string): string {
  if (!rawName) return 'https://bulbapedia.bulbagarden.net/';
  // Remove mega, gmax, regional suffixes for main article
  const baseName = rawName
    .replace(/-mega(-[xy])?/i, '')
    .replace(/-gmax/i, '')
    .replace(/-alola/i, '')
    .replace(/-galar/i, '')
    .replace(/-hisui/i, '')
    .replace(/-paldea/i, '')
    .replace(/-primal/i, '');

  const capitalized = baseName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('_');

  return `https://bulbapedia.bulbagarden.net/wiki/${encodeURIComponent(capitalized)}_(Pok%C3%A9mon)`;
}
