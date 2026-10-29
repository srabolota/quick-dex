import React, { useState, useMemo } from 'react';
import { Search, Swords, ArrowUpDown, RotateCcw } from 'lucide-react';
import { PokemonType } from '../types/pokemon';
import { ALL_TYPES } from '../utils/typeMatrix';
import { TypeBadge } from './TypeBadge';
import { sound } from '../utils/audio';
import { NamingMode } from '../utils/translations';

interface MoveEntry {
  id: number;
  name: string;
  enName: string;
  ptName: string;
  type: PokemonType;
  damageClass: 'physical' | 'special' | 'status';
  power: number | null;
  accuracy: number | null;
  pp: number;
  description: string;
}

const POPULAR_MOVES: MoveEntry[] = [
  { id: 1, name: 'thunderbolt', enName: 'Thunderbolt', ptName: 'Raio', type: 'electric', damageClass: 'special', power: 90, accuracy: 100, pp: 15, description: 'Um forte raio de eletricidade atinge o alvo. Tem 10% de chance de causar paralisia.' },
  { id: 2, name: 'flamethrower', enName: 'Flamethrower', ptName: 'Lança-Chamas', type: 'fire', damageClass: 'special', power: 90, accuracy: 100, pp: 15, description: 'O alvo é chamuscado com um sopro intenso de fogo. Tem 10% de chance de queimar.' },
  { id: 3, name: 'ice-beam', enName: 'Ice Beam', ptName: 'Raio de Gelo', type: 'ice', damageClass: 'special', power: 90, accuracy: 100, pp: 10, description: 'Um raio de energia gelada atinge o alvo. Tem 10% de chance de congelar.' },
  { id: 4, name: 'earthquake', enName: 'Earthquake', ptName: 'Terremoto', type: 'ground', damageClass: 'physical', power: 100, accuracy: 100, pp: 10, description: 'Provoca um terremoto catastrófico que atinge todos os Pokémon adjacentes.' },
  { id: 5, name: 'surf', enName: 'Surf', ptName: 'Surfar', type: 'water', damageClass: 'special', power: 90, accuracy: 100, pp: 15, description: 'O usuário cria uma onda gigantesca que cai sobre o campo de batalha.' },
  { id: 6, name: 'close-combat', enName: 'Close Combat', ptName: 'Combate Próximo', type: 'fighting', damageClass: 'physical', power: 120, accuracy: 100, pp: 5, description: 'Um ataque feroz de curta distância. Reduz a Defesa e a Defesa Especial do usuário.' },
  { id: 7, name: 'shadow-ball', enName: 'Shadow Ball', ptName: 'Bola Sombria', type: 'ghost', damageClass: 'special', power: 80, accuracy: 100, pp: 15, description: 'Dispara uma esfera de trevas. Tem 20% de chance de reduzir a Sp. Def do adversário.' },
  { id: 8, name: 'energy-ball', enName: 'Energy Ball', ptName: 'Esfera de Energia', type: 'grass', damageClass: 'special', power: 90, accuracy: 100, pp: 10, description: 'Atrai energia da natureza e dispara contra o oponente. Pode reduzir Sp. Def.' },
  { id: 9, name: 'moonblast', enName: 'Moonblast', ptName: 'Explosão Lunar', type: 'fairy', damageClass: 'special', power: 95, accuracy: 100, pp: 15, description: 'Usa o poder da lua para atacar o alvo. Tem 30% de chance de reduzir o Sp. Atk.' },
  { id: 10, name: 'draco-meteor', enName: 'Draco Meteor', ptName: 'Meteoro do Dragão', type: 'dragon', damageClass: 'special', power: 130, accuracy: 90, pp: 5, description: 'Invoca cometas do céu sobre o alvo. Reduz drasticamente o Sp. Atk do usuário (-2 estágios).' },
  { id: 11, name: 'swords-dance', enName: 'Swords Dance', ptName: 'Dança das Espadas', type: 'normal', damageClass: 'status', power: null, accuracy: null, pp: 20, description: 'Uma dança frenética que eleva o espírito combativo. Aumenta o Ataque em 2 estágios.' },
  { id: 12, name: 'nasty-plot', enName: 'Nasty Plot', ptName: 'Maquinar', type: 'dark', damageClass: 'status', power: null, accuracy: null, pp: 20, description: 'O usuário pensa pensamentos ruins. Aumenta o Ataque Especial em 2 estágios.' },
  { id: 13, name: 'calm-mind', enName: 'Calm Mind', ptName: 'Paz de Espírito', type: 'psychic', damageClass: 'status', power: null, accuracy: null, pp: 20, description: 'Foca a mente para aumentar simultaneamente o Sp. Atk e a Sp. Def em 1 estágio.' },
  { id: 14, name: 'dragon-dance', enName: 'Dragon Dance', ptName: 'Dança do Dragão', type: 'dragon', damageClass: 'status', power: null, accuracy: null, pp: 20, description: 'Uma dança mística e vigorosa que eleva o Ataque e a Velocidade em 1 estágio.' },
  { id: 15, name: 'stealth-rock', enName: 'Stealth Rock', ptName: 'Pedras Furtivas', type: 'rock', damageClass: 'status', power: null, accuracy: null, pp: 20, description: 'Espalha pedras pontiagudas no campo inimigo que causam dano a cada troca com base em fraquezas.' },
  { id: 16, name: 'toxic', enName: 'Toxic', ptName: 'Tóxico', type: 'poison', damageClass: 'status', power: null, accuracy: 90, pp: 10, description: 'Envenena gravemente o alvo com um veneno que piora a cada turno.' },
  { id: 17, name: 'roost', enName: 'Roost', ptName: 'Pousar', type: 'flying', damageClass: 'status', power: null, accuracy: null, pp: 10, description: 'O usuário pousa no chão e descansa, recuperando até metade do seu HP máximo.' },
  { id: 18, name: 'bullet-punch', enName: 'Bullet Punch', ptName: 'Soco Bala', type: 'steel', damageClass: 'physical', power: 40, accuracy: 100, pp: 30, description: 'Dispara socos tão rápidos quanto tiros de revólver. Tem +1 de prioridade em combate.' },
  { id: 19, name: 'brave-bird', enName: 'Brave Bird', ptName: 'Pássaro Bravo', type: 'flying', damageClass: 'physical', power: 120, accuracy: 100, pp: 15, description: 'Mergulha com as asas recolhidas a velocidade inacreditável. O usuário sofre dano de recuo.' },
  { id: 20, name: 'hydro-pump', enName: 'Hydro Pump', ptName: 'Bomba d’Água', type: 'water', damageClass: 'special', power: 110, accuracy: 80, pp: 5, description: 'Dispara um volume colossal de água sob alta pressão contra o alvo.' },
  { id: 21, name: 'fire-blast', enName: 'Fire Blast', ptName: 'Rajada de Fogo', type: 'fire', damageClass: 'special', power: 110, accuracy: 85, pp: 5, description: 'Um ataque devastador de chamas em forma de kanji. Tem 10% de chance de queimar.' },
  { id: 22, name: 'blizzard', enName: 'Blizzard', ptName: 'Nevasca', type: 'ice', damageClass: 'special', power: 110, accuracy: 70, pp: 5, description: 'Uma tempestade violenta de gelo e granizo. Nunca erra durante clima de neve.' },
  { id: 23, name: 'psychic', enName: 'Psychic', ptName: 'Psíquico', type: 'psychic', damageClass: 'special', power: 90, accuracy: 100, pp: 10, description: 'Uma poderosa força telecinética atinge o alvo. Tem 10% de chance de diminuir a Sp. Def.' },
  { id: 24, name: 'knock-off', enName: 'Knock Off', ptName: 'Derrubar', type: 'dark', damageClass: 'physical', power: 65, accuracy: 100, pp: 20, description: 'Derruba e remove o item segurado pelo alvo. Causa 50% mais dano se o alvo possuir item.' },
  { id: 25, name: 'u-turn', enName: 'U-turn', ptName: 'Meia-Volta', type: 'bug', damageClass: 'physical', power: 70, accuracy: 100, pp: 20, description: 'Após causar dano, o usuário retorna imediatamente para a Pokébola, permitindo troca tática.' },
  { id: 26, name: 'volt-switch', enName: 'Volt Switch', ptName: 'Troca Elétrica', type: 'electric', damageClass: 'special', power: 70, accuracy: 100, pp: 20, description: 'Ataca o oponente com choque e troca instantaneamente para outro membro da equipe.' },
  { id: 27, name: 'stone-edge', enName: 'Stone Edge', ptName: 'Gume de Pedra', type: 'rock', damageClass: 'physical', power: 100, accuracy: 80, pp: 5, description: 'Espeta o alvo com pedras afiadas por baixo. Alta chance de acerto crítico.' },
  { id: 28, name: 'flash-cannon', enName: 'Flash Cannon', ptName: 'Canhão de Luz', type: 'steel', damageClass: 'special', power: 80, accuracy: 100, pp: 10, description: 'Reúne toda a energia luminosa e a dispara num feixe de aço concentrado.' },
  { id: 29, name: 'bug-buzz', enName: 'Bug Buzz', ptName: 'Zumbido de Inseto', type: 'bug', damageClass: 'special', power: 90, accuracy: 100, pp: 10, description: 'Vibra o corpo para gerar ondas sonoras avassaladoras. Ignora efeitos de Substituição.' },
  { id: 30, name: 'play-rough', enName: 'Play Rough', ptName: 'Brincadeira Bruta', type: 'fairy', damageClass: 'physical', power: 90, accuracy: 90, pp: 10, description: 'Brinca violentamente com o alvo. Tem 10% de chance de reduzir o Ataque inimigo.' },
];

interface MoveDexViewProps {
  namingMode?: NamingMode;
  theme?: 'dark' | 'light';
}

export const MoveDexView: React.FC<MoveDexViewProps> = ({ namingMode = 'pt-en', theme = 'dark' }) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<PokemonType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'physical' | 'special' | 'status'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'power-desc' | 'power-asc' | 'pp-desc'>('power-desc');

  const isLight = theme === 'light';

  const filteredMoves = useMemo(() => {
    return POPULAR_MOVES.filter((m) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesName = m.name.includes(q) || m.ptName.toLowerCase().includes(q) || m.enName.toLowerCase().includes(q);
        if (!matchesName) return false;
      }
      if (selectedType && m.type !== selectedType) return false;
      if (selectedCategory !== 'all' && m.damageClass !== selectedCategory) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'power-desc') return (b.power || 0) - (a.power || 0);
      if (sortBy === 'power-asc') return (a.power || 0) - (b.power || 0);
      if (sortBy === 'pp-desc') return b.pp - a.pp;
      return a.enName.localeCompare(b.enName);
    });
  }, [search, selectedType, selectedCategory, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* Header Banner */}
      <div className={`rounded-3xl border p-5 sm:p-6 shadow-lg ${
        isLight
          ? 'bg-gradient-to-r from-[#F4EFE6] via-[#EDE6DA] to-[#F4EFE6] border-[#DCBD85]'
          : 'bg-gradient-to-r from-[#0d2433] via-[#163c50] to-[#0d2433] border-[#046683]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
              <Swords size={24} />
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-[#123244]' : 'text-white'}`}>
                Dex de Movimentos <span className="text-[#48A0B6]">Quickdex</span>
              </h2>
              <p className={`text-xs sm:text-sm ${isLight ? 'text-[#046683]' : 'text-[#B8DAE3]/80'}`}>
                Enciclopédia de golpes, poderes, precisão, efeitos e classes de combate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold opacity-75">
              {filteredMoves.length} de {POPULAR_MOVES.length} golpes
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#48A0B6]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar golpe por nome..."
              className={`w-full rounded-xl border pl-9 pr-4 py-2 text-xs focus:outline-none ${
                isLight
                  ? 'bg-white border-[#DCBD85] text-[#123244] placeholder-slate-400'
                  : 'bg-[#0d2433] border-[#046683] text-white placeholder-[#B8DAE3]/50'
              }`}
            />
          </div>

          {/* Category filter */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs font-bold ${
            isLight ? 'bg-white border-[#DCBD85]' : 'bg-[#123244] border-[#046683]'
          }`}>
            <button
              onClick={() => {
                sound.playClick();
                setSelectedCategory('all');
              }}
              className={`flex-1 py-1 rounded-lg transition-all ${
                selectedCategory === 'all' ? 'bg-[#48A0B6] text-[#123244] font-black' : 'opacity-70'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setSelectedCategory('physical');
              }}
              className={`flex-1 py-1 rounded-lg transition-all ${
                selectedCategory === 'physical' ? 'bg-orange-500 text-white font-black' : 'opacity-70'
              }`}
            >
              Físico
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setSelectedCategory('special');
              }}
              className={`flex-1 py-1 rounded-lg transition-all ${
                selectedCategory === 'special' ? 'bg-[#48A0B6] text-white font-black' : 'opacity-70'
              }`}
            >
              Especial
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setSelectedCategory('status');
              }}
              className={`flex-1 py-1 rounded-lg transition-all ${
                selectedCategory === 'status' ? 'bg-[#DCBD85] text-[#123244] font-black' : 'opacity-70'
              }`}
            >
              Status
            </button>
          </div>

          {/* Sort selector */}
          <div className="relative flex items-center">
            <ArrowUpDown size={14} className="pointer-events-none absolute left-3 text-[#48A0B6]" />
            <select
              value={sortBy}
              onChange={(e) => {
                sound.playClick();
                setSortBy(e.target.value as any);
              }}
              className={`w-full rounded-xl border pl-8 pr-4 py-2 text-xs font-bold focus:outline-none ${
                isLight
                  ? 'bg-white border-[#DCBD85] text-[#123244]'
                  : 'bg-[#123244] border-[#046683] text-[#B8DAE3]'
              }`}
            >
              <option value="power-desc">Poder (Maior ➔ Menor)</option>
              <option value="power-asc">Poder (Menor ➔ Maior)</option>
              <option value="name">Nome Alfabético (A-Z)</option>
              <option value="pp-desc">PP (Mais usos)</option>
            </select>
          </div>
        </div>

        {/* Types Pill Filter Bar */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
          {ALL_TYPES.map((type) => {
            const isSelected = selectedType === type;
            return (
              <div key={type} className="shrink-0">
                <TypeBadge
                  type={type}
                  size="sm"
                  isActive={isSelected}
                  onClick={() => {
                    sound.playClick();
                    setSelectedType(isSelected ? null : type);
                  }}
                />
              </div>
            );
          })}
          {selectedType && (
            <button
              onClick={() => {
                sound.playClick();
                setSelectedType(null);
              }}
              className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30"
            >
              <RotateCcw size={12} />
              <span>Limpar Tipo</span>
            </button>
          )}
        </div>
      </div>

      {/* Moves Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredMoves.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col justify-between rounded-2xl border p-4 shadow-sm transition-all hover:scale-[1.01] ${
              isLight
                ? 'bg-white border-[#E2D9CC] hover:border-[#DCBD85]'
                : 'bg-[#0d2433] border-[#046683] hover:border-[#48A0B6]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <h3 className={`text-sm font-black ${isLight ? 'text-[#123244]' : 'text-white'}`}>
                    {namingMode === 'pt-br' ? m.ptName : m.enName}
                  </h3>
                  {namingMode === 'pt-br' && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({m.enName})
                    </span>
                  )}
                </div>
                <TypeBadge type={m.type} size="sm" />
              </div>

              <p className={`text-xs leading-relaxed mb-3 ${isLight ? 'text-[#445663]' : 'text-[#B8DAE3]/80'}`}>
                {m.description}
              </p>
            </div>

            <div className={`flex items-center justify-between pt-2.5 border-t text-xs font-mono ${
              isLight ? 'border-[#E2D9CC]' : 'border-[#046683]/40'
            }`}>
              <div className="flex items-center gap-2">
                <span className="font-bold">
                  {m.damageClass === 'physical' ? '⚔️ Físico' : m.damageClass === 'special' ? '🔮 Especial' : '🛡️ Status'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span>Poder: <strong className="text-[#DCBD85]">{m.power ?? '—'}</strong></span>
                <span>Prec: <strong className="text-[#48A0B6]">{m.accuracy ? `${m.accuracy}%` : '—'}</strong></span>
                <span>PP: <strong>{m.pp}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
