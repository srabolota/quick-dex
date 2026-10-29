export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'steel'
  | 'dark'
  | 'fairy';

export interface StatItem {
  name: 'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed';
  baseStat: number;
}

export interface PokemonSummary {
  id: number;
  name: string;
  types: PokemonType[];
  sprite: string;
  officialArtwork: string;
  shinyArtwork: string;
  stats: StatItem[];
  height: number; // in decimeters
  weight: number; // in hectograms
  bst: number;
}

export interface MoveDetail {
  name: string;
  ptName?: string;
  type: PokemonType;
  damageClass: 'physical' | 'special' | 'status';
  power: number | null;
  accuracy: number | null;
  pp: number;
  learnMethod: 'level-up' | 'machine' | 'egg' | 'tutor' | 'other';
  levelLearnedAt: number;
  description?: string;
}

export interface EvolutionStage {
  id: number;
  name: string;
  types: PokemonType[];
  sprite: string;
  trigger: string;
  minLevel?: number | null;
  item?: string | null;
  heldItem?: string | null;
  condition?: string | null;
  evolvesTo: EvolutionStage[];
}

export interface AbilityInfo {
  name: string;
  ptName: string;
  isHidden: boolean;
  description: string;
}

export interface PokemonVariety {
  id: number;
  name: string;
  ptName: string;
  isDefault: boolean;
  formType: 'mega' | 'gmax' | 'regional' | 'normal';
}

export interface EncounterLocation {
  version: string;
  versionGroup: string;
  areaName: string;
  method: string;
  chance: number;
  minLevel: number;
  maxLevel: number;
}

export interface PokemonFullDetail extends PokemonSummary {
  genus: string;
  flavorText: string;
  abilities: AbilityInfo[];
  cries: string | null;
  evolutionChainId: number | null;
  moves: MoveDetail[];
  eggGroups: string[];
  captureRate: number;
  growthRate: string;
  varieties: PokemonVariety[];
  encounters?: EncounterLocation[];
}

export interface NatureInfo {
  name: string;
  ptName: string;
  increasedStat: string | null;
  decreasedStat: string | null;
  description: string;
}

