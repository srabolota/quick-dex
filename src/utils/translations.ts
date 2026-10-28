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

export const ABILITY_TRANSLATIONS: Record<string, { ptName: string; description: string }> = {
  overgrow: { ptName: 'Espessura (Overgrow)', description: 'Aumenta a potência de golpes do tipo Planta em 50% quando o HP está abaixo de 1/3.' },
  blaze: { ptName: 'Chama (Blaze)', description: 'Aumenta a potência de golpes do tipo Fogo em 50% quando o HP está abaixo de 1/3.' },
  torrent: { ptName: 'Torrente (Torrent)', description: 'Aumenta a potência de golpes do tipo Água em 50% quando o HP está abaixo de 1/3.' },
  shield_dust: { ptName: 'Poeira Protetora (Shield Dust)', description: 'Bloqueia efeitos secundários de ataques causados por oponentes.' },
  compound_eyes: { ptName: 'Olhos Compostos (Compound Eyes)', description: 'Aumenta a precisão de todos os golpes do usuário em 30%.' },
  static: { ptName: 'Estática (Static)', description: 'O contato físico com o Pokémon pode paralisar o atacante (30% de chance).' },
  lightning_rod: { ptName: 'Para-Raios (Lightning Rod)', description: 'Atrai golpes elétricos, anula o dano e aumenta o Ataque Especial do usuário.' },
  levitate: { ptName: 'Levitação (Levitate)', description: 'Concede imunidade completa a golpes e efeitos do tipo Terra (Ground).' },
  synchronize: { ptName: 'Sincronia (Synchronize)', description: 'Transfere queimadura, paralisia ou envenenamento de volta para o atacante.' },
  intimidate: { ptName: 'Intimidação (Intimidate)', description: 'Diminui o Ataque do oponente em 1 estágio ao entrar em combate.' },
  speed_boost: { ptName: 'Impulso de Velocidade (Speed Boost)', description: 'Aumenta a Velocidade em 1 estágio ao final de cada turno.' },
  chlorophyll: { ptName: 'Clorofila (Chlorophyll)', description: 'Dobra a Velocidade do Pokémon durante o clima de sol intenso.' },
  solar_power: { ptName: 'Poder Solar (Solar Power)', description: 'Aumenta o Sp. Atk em 50% no sol intenso, mas consome 1/8 do HP máximo por turno.' },
  rain_dish: { ptName: 'Prato de Chuva (Rain Dish)', description: 'Recupera 1/16 do HP máximo no final de cada turno em que estiver chovendo.' },
  magic_guard: { ptName: 'Guarda Mágica (Magic Guard)', description: 'Impede todo dano indireto (clima, veneno, espinhos, recuo de Life Orb).' },
  multiscale: { ptName: 'Multiescala (Multiscale)', description: 'Reduz o dano sofrido em 50% quando o HP estiver com a barra cheia (100%).' },
  drought: { ptName: 'Seca (Drought)', description: 'Invoca clima de sol intenso ao entrar na arena por 5 turnos.' },
  drizzle: { ptName: 'Garoa (Drizzle)', description: 'Invoca clima de chuva torrencial ao entrar na arena por 5 turnos.' },
  sand_stream: { ptName: 'Corrente de Areia (Sand Stream)', description: 'Invoca tempestade de areia ao entrar na batalha.' },
  snow_warning: { ptName: 'Aviso de Neve (Snow Warning)', description: 'Invoca tempestade de neve/granizo ao entrar na arena.' },
  adaptability: { ptName: 'Adaptabilidade (Adaptability)', description: 'Aumenta o bônus de mesmo tipo de ataque (STAB) de 1.5x para 2.0x.' },
  moxie: { ptName: 'Arrogância (Moxie)', description: 'Aumenta o Ataque em 1 estágio toda vez que derrota um oponente.' },
  prankster: { ptName: 'Travesso (Prankster)', description: 'Concede +1 de prioridade a todos os golpes de categoria Status.' },
  guts: { ptName: 'Bravura (Guts)', description: 'Aumenta o Ataque em 50% caso o Pokémon sofra com uma condição de status (ignora queima).' },
  inner_focus: { ptName: 'Foco Interno (Inner Focus)', description: 'Impede que o Pokémon recue (Flinch) e protege contra Intimidação.' },
  sturdy: { ptName: 'Robustez (Sturdy)', description: 'Sobrevive com 1 HP a qualquer golpe que o nocautearia em um só hit quando estiver com HP cheio.' },
  huge_power: { ptName: 'Poder Imenso (Huge Power)', description: 'Dobra o valor numérico do Ataque físico do Pokémon em combate.' },
  beast_boost: { ptName: 'Impulso Feroz (Beast Boost)', description: 'Aumenta o maior atributo do usuário toda vez que derrota um adversário.' },
};

/**
 * Clean pokemon name for presentation (e.g. "nidoran-f" -> "Nidoran ♀")
 */
export function formatPokemonName(name: string): string {
  if (!name) return '';
  const specialNames: Record<string, string> = {
    'nidoran-f': 'Nidoran ♀',
    'nidoran-m': 'Nidoran ♂',
    'mr-mime': 'Mr. Mime',
    'mime-jr': 'Mime Jr.',
    'deoxys-normal': 'Deoxys',
    'wormadam-plant': 'Wormadam',
    'giratina-altered': 'Giratina',
    'shaymin-land': 'Shaymin',
    'basculin-red-striped': 'Basculin',
    'darmanitan-standard': 'Darmanitan',
    'tornadus-incarnate': 'Tornadus',
    'thundurus-incarnate': 'Thundurus',
    'landorus-incarnate': 'Landorus',
    'keldeo-ordinary': 'Keldeo',
    'meloetta-aria': 'Meloetta',
    'meowstic-male': 'Meowstic ♂',
    'meowstic-female': 'Meowstic ♀',
    'aegislash-shield': 'Aegislash',
    'pumpkaboo-average': 'Pumpkaboo',
    'gourgeist-average': 'Gourgeist',
    'zygarde-50': 'Zygarde',
    'oricorio-baile': 'Oricorio',
    'lycanroc-midday': 'Lycanroc',
    'wishiwashi-solo': 'Wishiwashi',
    'minior-red-meteor': 'Minior',
    'mimikyu-disguised': 'Mimikyu',
    'toxtricity-amped': 'Toxtricity',
    'eiscue-ice': 'Eiscue',
    'indeedee-male': 'Indeedee ♂',
    'indeedee-female': 'Indeedee ♀',
    'morpeko-full-belly': 'Morpeko',
    'urshifu-single-strike': 'Urshifu',
  };

  const clean = name.toLowerCase();
  if (specialNames[clean]) return specialNames[clean];

  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Clean move names to readable title case
 */
export function formatMoveName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format ID with zero-padding (e.g. 1 -> "#001", 25 -> "#025", 1000 -> "#1000")
 */
export function formatPokemonId(id: number): string {
  if (id < 10) return `#00${id}`;
  if (id < 100) return `#0${id}`;
  return `#${id}`;
}
