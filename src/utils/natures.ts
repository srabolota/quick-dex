import { NatureInfo } from '../types/pokemon';

export const NATURES_LIST: NatureInfo[] = [
  {
    name: 'Hardy',
    ptName: 'Hardy (Firme/Resistente)',
    increasedStat: null,
    decreasedStat: null,
    description: 'Natureza neutra. Não altera nenhum atributo.',
  },
  {
    name: 'Lonely',
    ptName: 'Lonely (Solitária)',
    increasedStat: 'attack',
    decreasedStat: 'defense',
    description: '+10% Ataque, -10% Defesa.',
  },
  {
    name: 'Brave',
    ptName: 'Brave (Brava)',
    increasedStat: 'attack',
    decreasedStat: 'speed',
    description: '+10% Ataque, -10% Velocidade.',
  },
  {
    name: 'Adamant',
    ptName: 'Adamant (Inflexível)',
    increasedStat: 'attack',
    decreasedStat: 'special-attack',
    description: '+10% Ataque, -10% Sp. Atk. Muito popular no competitivo!',
  },
  {
    name: 'Naughty',
    ptName: 'Naughty (Travessa)',
    increasedStat: 'attack',
    decreasedStat: 'special-defense',
    description: '+10% Ataque, -10% Sp. Def.',
  },
  {
    name: 'Bold',
    ptName: 'Bold (Ousada)',
    increasedStat: 'defense',
    decreasedStat: 'attack',
    description: '+10% Defesa, -10% Ataque. Excelente para tanques físicos.',
  },
  {
    name: 'Docile',
    ptName: 'Docile (Dócil)',
    increasedStat: null,
    decreasedStat: null,
    description: 'Natureza neutra. Não altera nenhum atributo.',
  },
  {
    name: 'Relaxed',
    ptName: 'Relaxed (Relaxada)',
    increasedStat: 'defense',
    decreasedStat: 'speed',
    description: '+10% Defesa, -10% Velocidade.',
  },
  {
    name: 'Impish',
    ptName: 'Impish (Maliciosa)',
    increasedStat: 'defense',
    decreasedStat: 'special-attack',
    description: '+10% Defesa, -10% Sp. Atk. Perfeita para suportes físicos.',
  },
  {
    name: 'Lax',
    ptName: 'Lax (Frouxa)',
    increasedStat: 'defense',
    decreasedStat: 'special-defense',
    description: '+10% Defesa, -10% Sp. Def.',
  },
  {
    name: 'Timid',
    ptName: 'Timid (Tímida)',
    increasedStat: 'speed',
    decreasedStat: 'attack',
    description: '+10% Velocidade, -10% Ataque. Padrão de ouro para atacantes especiais rápidos!',
  },
  {
    name: 'Hasty',
    ptName: 'Hasty (Apressada)',
    increasedStat: 'speed',
    decreasedStat: 'defense',
    description: '+10% Velocidade, -10% Defesa.',
  },
  {
    name: 'Serious',
    ptName: 'Serious (Séria)',
    increasedStat: null,
    decreasedStat: null,
    description: 'Natureza neutra. Não altera nenhum atributo.',
  },
  {
    name: 'Jolly',
    ptName: 'Jolly (Alegre)',
    increasedStat: 'speed',
    decreasedStat: 'special-attack',
    description: '+10% Velocidade, -10% Sp. Atk. Escolha número 1 de atacantes físicos rápidos!',
  },
  {
    name: 'Naive',
    ptName: 'Naive (Ingênua)',
    increasedStat: 'speed',
    decreasedStat: 'special-defense',
    description: '+10% Velocidade, -10% Sp. Def.',
  },
  {
    name: 'Modest',
    ptName: 'Modest (Modesta)',
    increasedStat: 'special-attack',
    decreasedStat: 'attack',
    description: '+10% Sp. Atk, -10% Ataque. Maximiza o dano de magos e atacantes especiais!',
  },
  {
    name: 'Mild',
    ptName: 'Mild (Suave)',
    increasedStat: 'special-attack',
    decreasedStat: 'defense',
    description: '+10% Sp. Atk, -10% Defesa.',
  },
  {
    name: 'Quiet',
    ptName: 'Quiet (Quieta)',
    increasedStat: 'special-attack',
    decreasedStat: 'speed',
    description: '+10% Sp. Atk, -10% Velocidade. Ideal para times de Trick Room.',
  },
  {
    name: 'Bashful',
    ptName: 'Bashful (Vergonhosa)',
    increasedStat: null,
    decreasedStat: null,
    description: 'Natureza neutra. Não altera nenhum atributo.',
  },
  {
    name: 'Rash',
    ptName: 'Rash (Precipitada)',
    increasedStat: 'special-attack',
    decreasedStat: 'special-defense',
    description: '+10% Sp. Atk, -10% Sp. Def.',
  },
  {
    name: 'Calm',
    ptName: 'Calm (Calma)',
    increasedStat: 'special-defense',
    decreasedStat: 'attack',
    description: '+10% Sp. Def, -10% Ataque. Excelente para barreiras especiais.',
  },
  {
    name: 'Gentle',
    ptName: 'Gentle (Gentil)',
    increasedStat: 'special-defense',
    decreasedStat: 'defense',
    description: '+10% Sp. Def, -10% Defesa.',
  },
  {
    name: 'Sassy',
    ptName: 'Sassy (Atrevida)',
    increasedStat: 'special-defense',
    decreasedStat: 'speed',
    description: '+10% Sp. Def, -10% Velocidade.',
  },
  {
    name: 'Careful',
    ptName: 'Careful (Cuidadosa)',
    increasedStat: 'special-defense',
    decreasedStat: 'special-attack',
    description: '+10% Sp. Def, -10% Sp. Atk. Ótima para tanques físicos/especiais.',
  },
  {
    name: 'Quirky',
    ptName: 'Quirky (Excêntrica)',
    increasedStat: null,
    decreasedStat: null,
    description: 'Natureza neutra. Não altera nenhum atributo.',
  },
];

export const STAT_NAMES_PT: Record<string, string> = {
  hp: 'HP (Vida)',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Ataque Especial (Sp. Atk)',
  'special-defense': 'Defesa Especial (Sp. Def)',
  speed: 'Velocidade (Speed)',
};

export const STAT_SHORT_PT: Record<string, string> = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Vel',
};

/**
 * Returns nature multiplier for a given stat name
 */
export function getNatureMultiplier(natureName: string, statName: string): number {
  const nature = NATURES_LIST.find((n) => n.name.toLowerCase() === natureName.toLowerCase());
  if (!nature) return 1.0;
  if (nature.increasedStat === statName) return 1.1;
  if (nature.decreasedStat === statName) return 0.9;
  return 1.0;
}
