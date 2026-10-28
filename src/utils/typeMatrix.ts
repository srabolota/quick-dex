import { PokemonType } from '../types/pokemon';

export interface TypeVisualInfo {
  name: PokemonType;
  ptName: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  gradient: string;
  iconSymbol: string;
}

export const ALL_TYPES: PokemonType[] = [
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'steel',
  'dark',
  'fairy',
];

export const TYPE_CONFIG: Record<PokemonType, TypeVisualInfo> = {
  normal: {
    name: 'normal',
    ptName: 'Normal',
    bgColor: '#9FA19F',
    textColor: '#ffffff',
    borderColor: '#7a7c7a',
    gradient: 'from-[#a8a878] to-[#8a8a59]',
    iconSymbol: '⚪',
  },
  fire: {
    name: 'fire',
    ptName: 'Fogo',
    bgColor: '#E62829',
    textColor: '#ffffff',
    borderColor: '#c01e1f',
    gradient: 'from-[#ff4422] to-[#dd2200]',
    iconSymbol: '🔥',
  },
  water: {
    name: 'water',
    ptName: 'Água',
    bgColor: '#2980EF',
    textColor: '#ffffff',
    borderColor: '#1d60b5',
    gradient: 'from-[#3399ff] to-[#0077ee]',
    iconSymbol: '💧',
  },
  grass: {
    name: 'grass',
    ptName: 'Planta',
    bgColor: '#3FA129',
    textColor: '#ffffff',
    borderColor: '#2b751b',
    gradient: 'from-[#77cc55] to-[#44aa22]',
    iconSymbol: '🍃',
  },
  electric: {
    name: 'electric',
    ptName: 'Elétrico',
    bgColor: '#FAC000',
    textColor: '#1a1a1a',
    borderColor: '#c49600',
    gradient: 'from-[#ffcc00] to-[#e6b800]',
    iconSymbol: '⚡',
  },
  ice: {
    name: 'ice',
    ptName: 'Gelo',
    bgColor: '#3DCEF3',
    textColor: '#0c2738',
    borderColor: '#25a0bf',
    gradient: 'from-[#66ccff] to-[#33bbff]',
    iconSymbol: '❄️',
  },
  fighting: {
    name: 'fighting',
    ptName: 'Lutador',
    bgColor: '#FF8000',
    textColor: '#ffffff',
    borderColor: '#c66300',
    gradient: 'from-[#bb5544] to-[#993322]',
    iconSymbol: '🥊',
  },
  poison: {
    name: 'poison',
    ptName: 'Venenoso',
    bgColor: '#9141CB',
    textColor: '#ffffff',
    borderColor: '#6b2f96',
    gradient: 'from-[#aa5599] to-[#883377]',
    iconSymbol: '☠️',
  },
  ground: {
    name: 'ground',
    ptName: 'Terra',
    bgColor: '#915121',
    textColor: '#ffffff',
    borderColor: '#6e3c17',
    gradient: 'from-[#ddbb55] to-[#bba033]',
    iconSymbol: '🏜️',
  },
  flying: {
    name: 'flying',
    ptName: 'Voador',
    bgColor: '#81B9EF',
    textColor: '#0c2738',
    borderColor: '#5994cc',
    gradient: 'from-[#8899ff] to-[#6677ee]',
    iconSymbol: '🪶',
  },
  psychic: {
    name: 'psychic',
    ptName: 'Psíquico',
    bgColor: '#EF4179',
    textColor: '#ffffff',
    borderColor: '#c4285a',
    gradient: 'from-[#ff5599] to-[#ee2277]',
    iconSymbol: '🔮',
  },
  bug: {
    name: 'bug',
    ptName: 'Inseto',
    bgColor: '#91A119',
    textColor: '#ffffff',
    borderColor: '#6c7711',
    gradient: 'from-[#aabb22] to-[#889911]',
    iconSymbol: '🐛',
  },
  rock: {
    name: 'rock',
    ptName: 'Pedra',
    bgColor: '#AFA981',
    textColor: '#1a1a1a',
    borderColor: '#86815f',
    gradient: 'from-[#bbaa66] to-[#998844]',
    iconSymbol: '🪨',
  },
  ghost: {
    name: 'ghost',
    ptName: 'Fantasma',
    bgColor: '#704170',
    textColor: '#ffffff',
    borderColor: '#4d2b4d',
    gradient: 'from-[#775599] to-[#553377]',
    iconSymbol: '👻',
  },
  dragon: {
    name: 'dragon',
    ptName: 'Dragão',
    bgColor: '#5060E1',
    textColor: '#ffffff',
    borderColor: '#3744ac',
    gradient: 'from-[#7766ee] to-[#5544cc]',
    iconSymbol: '🐉',
  },
  steel: {
    name: 'steel',
    ptName: 'Aço',
    bgColor: '#60A1B8',
    textColor: '#ffffff',
    borderColor: '#437688',
    gradient: 'from-[#aaaabb] to-[#888899]',
    iconSymbol: '🛡️',
  },
  dark: {
    name: 'dark',
    ptName: 'Sombrio',
    bgColor: '#50413F',
    textColor: '#ffffff',
    borderColor: '#342928',
    gradient: 'from-[#775544] to-[#553322]',
    iconSymbol: '🌑',
  },
  fairy: {
    name: 'fairy',
    ptName: 'Fada',
    bgColor: '#EF70EF',
    textColor: '#1a1a1a',
    borderColor: '#c64bc6',
    gradient: 'from-[#ee99ee] to-[#cc66cc]',
    iconSymbol: '✨',
  },
};

// Standard Generation 6-9 Type Matchup Chart
// Key: Attacking Type -> Map of Defending Type -> Multiplier
const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal: {
    rock: 0.5,
    ghost: 0,
    steel: 0.5,
  },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: {
    fire: 2,
    water: 0.5,
    grass: 0.5,
    ground: 2,
    rock: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  electric: {
    water: 2,
    grass: 0.5,
    electric: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    fairy: 2,
  },
  ground: {
    fire: 2,
    grass: 0.5,
    electric: 2,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2,
  },
  flying: {
    grass: 2,
    electric: 0.5,
    fighting: 2,
    bug: 2,
    rock: 0.5,
    steel: 0.5,
  },
  psychic: {
    fighting: 2,
    poison: 2,
    psychic: 0.5,
    dark: 0,
    steel: 0.5,
  },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5,
  },
  ghost: {
    normal: 0,
    psychic: 2,
    ghost: 2,
    dark: 0.5,
  },
  dragon: {
    dragon: 2,
    steel: 0.5,
    fairy: 0,
  },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2,
  },
  dark: {
    fighting: 0.5,
    psychic: 2,
    ghost: 2,
    dark: 0.5,
    fairy: 0.5,
  },
  fairy: {
    fire: 0.5,
    fighting: 2,
    poison: 0.5,
    dragon: 2,
    dark: 2,
    steel: 0.5,
  },
};

export interface TypeMatchupSummary {
  multiplier: number;
  attackingType: PokemonType;
}

export interface TypeDefensiveAnalysis {
  quadWeakness: PokemonType[]; // x4
  weakness: PokemonType[];     // x2
  normal: PokemonType[];       // x1
  resistance: PokemonType[];   // x0.5
  quadResistance: PokemonType[]; // x0.25
  immunity: PokemonType[];     // x0
}

/**
 * Calculates incoming damage multiplier for each of the 18 attacking types
 * against a Pokemon with the given defending types.
 */
export function calculateTypeEffectiveness(defenderTypes: PokemonType[]): Record<PokemonType, number> {
  const result = {} as Record<PokemonType, number>;

  for (const atkType of ALL_TYPES) {
    let multiplier = 1;
    for (const defType of defenderTypes) {
      const match = TYPE_CHART[atkType]?.[defType];
      if (match !== undefined) {
        multiplier *= match;
      }
    }
    result[atkType] = multiplier;
  }

  return result;
}

/**
 * Categorizes damage incoming into grouped tiers for high clarity in UI
 */
export function analyzeDefensiveMatchups(defenderTypes: PokemonType[]): TypeDefensiveAnalysis {
  const effectiveness = calculateTypeEffectiveness(defenderTypes);

  const quadWeakness: PokemonType[] = [];
  const weakness: PokemonType[] = [];
  const normal: PokemonType[] = [];
  const resistance: PokemonType[] = [];
  const quadResistance: PokemonType[] = [];
  const immunity: PokemonType[] = [];

  for (const [typeKey, multiplier] of Object.entries(effectiveness)) {
    const type = typeKey as PokemonType;
    if (multiplier === 0) {
      immunity.push(type);
    } else if (multiplier === 4) {
      quadWeakness.push(type);
    } else if (multiplier === 2) {
      weakness.push(type);
    } else if (multiplier === 0.5) {
      resistance.push(type);
    } else if (multiplier === 0.25) {
      quadResistance.push(type);
    } else if (multiplier === 1) {
      normal.push(type);
    }
  }

  return {
    quadWeakness,
    weakness,
    normal,
    resistance,
    quadResistance,
    immunity,
  };
}
