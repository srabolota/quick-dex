import React, { useState } from 'react';
import { Compass, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { NATURES_LIST } from '../utils/natures';
import { sound } from '../utils/audio';

const STAT_BERRY_TASTE: Record<string, string> = {
  attack: 'Picante (Spicy)',
  defense: 'Azedo (Sour)',
  speed: 'Doce (Sweet)',
  'special-attack': 'Seco (Dry)',
  'special-defense': 'Amargo (Bitter)',
};

interface NatureDexViewProps {
  theme?: 'dark' | 'light';
}

export const NatureDexView: React.FC<NatureDexViewProps> = ({ theme = 'dark' }) => {
  const [selectedNature, setSelectedNature] = useState<string>('Adamant');
  const [testStatVal, setTestStatVal] = useState<number>(100);

  const isLight = theme === 'light';
  const active = NATURES_LIST.find((n) => n.name === selectedNature) || NATURES_LIST[0];

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* Banner */}
      <div className={`rounded-3xl border p-5 sm:p-6 shadow-lg ${
        isLight
          ? 'bg-gradient-to-r from-[#F4EFE6] via-[#EDE6DA] to-[#F4EFE6] border-[#DCBD85]'
          : 'bg-gradient-to-r from-[#0d2433] via-[#163c50] to-[#0d2433] border-[#046683]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Compass size={24} />
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-[#123244]' : 'text-white'}`}>
                Dex de Naturezas <span className="text-[#48A0B6]">Quickdex</span>
              </h2>
              <p className={`text-xs sm:text-sm ${isLight ? 'text-[#046683]' : 'text-[#B8DAE3]/80'}`}>
                Guia e calculadora das 25 Natures, modificadores competitivos (+10% / -10%) e sabores de Berries
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Calculator Spotlight */}
      <div className={`rounded-3xl border p-5 sm:p-6 shadow-xl ${
        isLight
          ? 'bg-white border-[#DCBD85]'
          : 'bg-[#0d2433] border-[#046683]'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex-1 space-y-2">
            <span className="text-xs font-black uppercase text-[#48A0B6] tracking-wider">
              Natureza Selecionada
            </span>
            <h3 className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-[#123244]' : 'text-white'}`}>
              {active.ptName}
            </h3>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-[#445663]' : 'text-[#B8DAE3]'}`}>
              {active.description}
            </p>

            <div className="pt-1.5 flex flex-wrap gap-2 text-xs">
              {active.increasedStat ? (
                <span className="flex items-center gap-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 font-bold text-emerald-400">
                  <TrendingUp size={14} /> +10% em {active.increasedStat.toUpperCase()} (Gosta de {STAT_BERRY_TASTE[active.increasedStat]})
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-xl bg-slate-500/20 border border-slate-500/40 px-3 py-1 font-bold text-slate-400">
                  <Minus size={14} /> Natureza Neutra (Sem bônus/penalidades)
                </span>
              )}

              {active.decreasedStat && (
                <span className="flex items-center gap-1 rounded-xl bg-rose-500/20 border border-rose-500/40 px-3 py-1 font-bold text-rose-400">
                  <TrendingDown size={14} /> -10% em {active.decreasedStat.toUpperCase()} (Não gosta de {STAT_BERRY_TASTE[active.decreasedStat]})
                </span>
              )}
            </div>
          </div>

          {/* Quick interactive math tester */}
          <div className={`w-full md:w-72 rounded-2xl p-4 border space-y-2.5 ${
            isLight ? 'bg-[#F4EFE6] border-[#DCBD85]' : 'bg-[#123244] border-[#046683]'
          }`}>
            <span className="text-xs font-bold block">
              Simular em Atributo Base:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={255}
                value={testStatVal}
                onChange={(e) => setTestStatVal(Math.max(1, parseInt(e.target.value) || 0))}
                className={`w-20 rounded-xl border px-3 py-1.5 text-center font-mono font-bold text-sm focus:outline-none ${
                  isLight ? 'bg-white border-[#DCBD85] text-[#123244]' : 'bg-[#0d2433] border-[#046683] text-white'
                }`}
              />
              <span className="text-xs opacity-75">pts base ➔</span>
              <strong className="text-emerald-500 text-sm font-mono font-black">
                {active.increasedStat ? Math.round(testStatVal * 1.1) : testStatVal} (+10%)
              </strong>
            </div>
            <p className="text-[10px] opacity-70">
              Modificador de naturezas é calculado sobre os pontos totais na fórmula de combate oficial.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of all 25 natures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {NATURES_LIST.map((n) => {
          const isSelected = selectedNature === n.name;
          return (
            <div
              key={n.name}
              onClick={() => {
                sound.playClick();
                setSelectedNature(n.name);
              }}
              className={`rounded-2xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-[#163c50] to-[#0d2433] border-[#DCBD85] shadow-lg ring-2 ring-[#DCBD85] scale-102'
                  : isLight
                  ? 'bg-white border-[#E2D9CC] hover:border-[#DCBD85]'
                  : 'bg-[#0d2433] border-[#046683] hover:border-[#48A0B6]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm font-black ${isSelected ? 'text-[#DCBD85]' : isLight ? 'text-[#123244]' : 'text-white'}`}>
                    {n.ptName}
                  </h4>
                  {isSelected && (
                    <span className="text-[9px] font-black bg-[#DCBD85] text-[#123244] px-1.5 py-0.2 rounded">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-[11px] opacity-70 mb-2">
                  {n.description}
                </p>
              </div>

              <div className="space-y-1 text-[11px] font-mono pt-1.5 border-t border-current/10">
                <div className="flex items-center justify-between text-emerald-400">
                  <span>+10%:</span>
                  <strong>{n.increasedStat ? n.increasedStat.toUpperCase() : 'Nenhum'}</strong>
                </div>
                <div className="flex items-center justify-between text-rose-400">
                  <span>-10%:</span>
                  <strong>{n.decreasedStat ? n.decreasedStat.toUpperCase() : 'Nenhum'}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
