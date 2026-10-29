export type SpecialGroupKey =
  | 'starters'
  | 'legendary'
  | 'mythical'
  | 'mega'
  | 'gigantamax'
  | 'regional'
  | 'paradox';

export interface SpecialGroupInfo {
  key: SpecialGroupKey;
  label: string;
  icon: string;
  color: string;
  bgActive: string;
  description: string;
  ids: Set<number>;
  matchesName?: (name: string) => boolean;
}

// 1. Iniciais (Starters e suas evoluções)
const STARTER_IDS = new Set<number>([
  1, 2, 3, 4, 5, 6, 7, 8, 9, // Gen 1
  25, 26, 133, // Pikachu & Eevee
  152, 153, 154, 155, 156, 157, 158, 159, 160, // Gen 2
  252, 253, 254, 255, 256, 257, 258, 259, 260, // Gen 3
  387, 388, 389, 390, 391, 392, 393, 394, 395, // Gen 4
  495, 496, 497, 498, 499, 500, 501, 502, 503, // Gen 5
  650, 651, 652, 653, 654, 655, 656, 657, 658, // Gen 6
  722, 723, 724, 725, 726, 727, 728, 729, 730, // Gen 7
  810, 811, 812, 813, 814, 815, 816, 817, 818, // Gen 8
  906, 907, 908, 909, 910, 911, 912, 913, 914, // Gen 9
]);

// 2. Lendários (Legendary)
const LEGENDARY_IDS = new Set<number>([
  144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384,
  480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645,
  646, 716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795,
  796, 797, 798, 799, 800, 803, 804, 805, 806, 888, 889, 890, 891, 892, 894, 895, 896,
  897, 898, 905, 1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024,
]);

// 3. Míticos (Mythical)
const MYTHICAL_IDS = new Set<number>([
  151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801,
  802, 807, 808, 809, 893, 1025,
]);

// 4. Paradoxos (Paradox Pokémon)
const PARADOX_IDS = new Set<number>([
  984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1005, 1006, 1009, 1010,
  1020, 1021, 1022, 1023,
]);

// 5. Megaevolução (Capazes de Megaevoluir e formas mega)
const MEGA_IDS = new Set<number>([
  3, 6, 9, 15, 18, 65, 80, 94, 115, 127, 130, 142, 150, 181, 208, 212, 214, 229, 248,
  254, 257, 260, 282, 302, 303, 306, 308, 310, 319, 323, 334, 354, 359, 362, 373, 376,
  380, 381, 384, 428, 445, 448, 460, 475, 531, 719,
]);

// 6. Gigamax (Capazes de Gigamax e formas gmax)
const GIGANTAMAX_IDS = new Set<number>([
  3, 6, 9, 12, 25, 52, 68, 94, 99, 131, 133, 143, 569, 809, 812, 815, 818, 823, 826,
  834, 839, 841, 842, 844, 849, 851, 858, 861, 869, 879, 884, 892,
]);

// 7. Formas Regionais
const REGIONAL_IDS = new Set<number>([
  19, 20, 26, 27, 28, 37, 38, 50, 51, 52, 53, 58, 59, 74, 75, 76, 77, 78, 79, 80, 83,
  88, 89, 100, 101, 103, 105, 110, 122, 128, 144, 145, 146, 157, 194, 199, 211, 215,
  222, 263, 264, 503, 549, 550, 554, 555, 562, 570, 571, 618, 628, 705, 706, 713, 724,
]);

export const SPECIAL_GROUPS: Record<SpecialGroupKey, SpecialGroupInfo> = {
  starters: {
    key: 'starters',
    label: 'Iniciais',
    icon: '🌱🔥💧',
    color: '#00d2ff',
    bgActive: 'bg-[#00d2ff]/20 border-[#00d2ff]',
    description: 'Pokémon iniciais de todas as 9 gerações e suas linhas evolutivas.',
    ids: STARTER_IDS,
  },
  legendary: {
    key: 'legendary',
    label: 'Lendários',
    icon: '👑',
    color: '#ffe600',
    bgActive: 'bg-[#ffe600]/20 border-[#ffe600]',
    description: 'Pokémon lendários com estatísticas de elite e história mítica.',
    ids: LEGENDARY_IDS,
    matchesName: (name) =>
      name.includes('-origin') ||
      name.includes('-therian') ||
      name.includes('-crowned') ||
      name.includes('calyrex-') ||
      name.includes('urshifu-') ||
      name.includes('zacian-') ||
      name.includes('zamazenta-'),
  },
  mythical: {
    key: 'mythical',
    label: 'Míticos',
    icon: '✨',
    color: '#c084fc',
    bgActive: 'bg-purple-500/20 border-purple-400',
    description: 'Pokémon míticos ultra-raros distribuídos em eventos especiais.',
    ids: MYTHICAL_IDS,
  },
  paradox: {
    key: 'paradox',
    label: 'Paradoxos',
    icon: '⏳',
    color: '#f43f5e',
    bgActive: 'bg-rose-500/20 border-rose-400',
    description: 'Formas do passado ancestral e do futuro tecnológico de Paldea.',
    ids: PARADOX_IDS,
    matchesName: (name) =>
      name.startsWith('iron-') ||
      name === 'great-tusk' ||
      name === 'scream-tail' ||
      name === 'brute-bonnet' ||
      name === 'flutter-mane' ||
      name === 'slither-wing' ||
      name === 'sandy-shocks' ||
      name === 'roaring-moon' ||
      name === 'walking-wake' ||
      name === 'gouging-fire' ||
      name === 'raging-bolt',
  },
  mega: {
    key: 'mega',
    label: 'Megaevolução',
    icon: '🧬',
    color: '#38bdf8',
    bgActive: 'bg-sky-500/20 border-sky-400',
    description: 'Espécies que possuem o poder de quebrar limites através de Megapedras.',
    ids: MEGA_IDS,
    matchesName: (name) => name.includes('-mega') || name.includes('-primal'),
  },
  gigantamax: {
    key: 'gigantamax',
    label: 'Gigamax',
    icon: '☁️',
    color: '#fb923c',
    bgActive: 'bg-orange-500/20 border-orange-400',
    description: 'Formas com capacidade de gigamaximizar na região de Galar.',
    ids: GIGANTAMAX_IDS,
    matchesName: (name) => name.includes('-gmax'),
  },
  regional: {
    key: 'regional',
    label: 'Regionais',
    icon: '🗺️',
    color: '#4ade80',
    bgActive: 'bg-emerald-500/20 border-emerald-400',
    description: 'Espécies com adaptações regionais em Alola, Galar, Hisui ou Paldea.',
    ids: REGIONAL_IDS,
    matchesName: (name) =>
      name.includes('-alola') ||
      name.includes('-galar') ||
      name.includes('-hisui') ||
      name.includes('-paldea'),
  },
};

/**
 * Check if a Pokemon belongs to a given special group
 */
export function checkPokemonInSpecialGroup(id: number, name: string, groupKey: SpecialGroupKey): boolean {
  const group = SPECIAL_GROUPS[groupKey];
  if (!group) return false;
  if (group.ids.has(id)) return true;
  if (group.matchesName && group.matchesName(name.toLowerCase())) return true;
  return false;
}
