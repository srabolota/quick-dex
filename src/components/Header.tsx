import React from 'react';
import { Search, Volume2, VolumeX, Heart, Shuffle } from 'lucide-react';
import { QuickBallIcon } from './QuickBallIcon';
import { sound } from '../utils/audio';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  favoritesCount: number;
  showOnlyFavorites: boolean;
  onToggleShowFavorites: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onRandomPokemon: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  favoritesCount,
  showOnlyFavorites,
  onToggleShowFavorites,
  isMuted,
  onToggleMute,
  onRandomPokemon,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#00d2ff]/20 bg-[#0d1520]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Logo & Quick Ball Brand Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer select-none group" onClick={() => onSearchChange('')}>
              <div className="transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110">
                <QuickBallIcon size={40} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white">
                    QUICK<span className="text-[#00d2ff]">DEX</span>
                  </h1>
                  <span className="rounded-md bg-gradient-to-r from-[#00d2ff] to-[#ffe600] px-1.5 py-0.5 text-[10px] font-black uppercase text-[#0d1520]">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-400">
                  Pokédex Quick Ball • <span className="text-[#ffe600]">Gen I a IX</span>
                </p>
              </div>
            </div>

            {/* Mobile Action Buttons (Sound & Favorites) */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => {
                  sound.playClick();
                  onRandomPokemon();
                }}
                className="flex items-center justify-center rounded-xl bg-[#142030] p-2 text-slate-300 hover:text-[#00d2ff] border border-white/10"
                title="Pokémon Aleatório"
              >
                <Shuffle size={18} />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onToggleShowFavorites();
                }}
                className={`relative flex items-center justify-center rounded-xl p-2 transition-all ${
                  showOnlyFavorites
                    ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                    : 'bg-[#142030] text-slate-300 border border-white/10'
                }`}
                title="Meus Favoritos"
              >
                <Heart size={18} className={showOnlyFavorites ? 'fill-current' : ''} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ffe600] text-[9px] font-black text-black">
                    {favoritesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onToggleMute();
                }}
                className="flex items-center justify-center rounded-xl bg-[#142030] p-2 text-slate-300 hover:text-[#00d2ff] border border-white/10"
                title={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar'}
              >
                {isMuted ? <VolumeX size={18} className="text-slate-500" /> : <Volume2 size={18} className="text-[#00d2ff]" />}
              </button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative flex-1 max-w-md mx-auto md:mx-4 w-full">
            <div className="relative flex items-center">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 text-[#00d2ff]"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por Nome ou Número (ex: Pikachu, #025)..."
                className="w-full rounded-2xl border border-[#00d2ff]/30 bg-[#121c29] py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-400 shadow-inner transition-all focus:border-[#00d2ff] focus:bg-[#152335] focus:outline-none focus:ring-2 focus:ring-[#00d2ff]/30"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onSearchChange('');
                  }}
                  className="absolute right-3 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop Right Action Bar */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={() => {
                sound.playClick();
                onRandomPokemon();
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#142030] border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition-all hover:border-[#00d2ff] hover:text-[#00d2ff] active:scale-95"
              title="Sortear um Pokémon Aleatório"
            >
              <Shuffle size={15} />
              <span>Surpresa</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onToggleShowFavorites();
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                showOnlyFavorites
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                  : 'bg-[#142030] text-slate-300 border border-white/10 hover:border-rose-500/50 hover:text-rose-400'
              }`}
            >
              <Heart size={15} className={showOnlyFavorites ? 'fill-current' : ''} />
              <span>Favoritos</span>
              {favoritesCount > 0 && (
                <span className="ml-1 rounded-full bg-[#ffe600] px-1.5 py-0.2 text-[10px] font-black text-black">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={onToggleMute}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
                isMuted
                  ? 'border-slate-700 bg-[#121c2a] text-slate-500'
                  : 'border-[#00d2ff]/40 bg-[#142336] text-[#00d2ff] shadow-[0_0_10px_rgba(0,210,255,0.2)]'
              }`}
              title={isMuted ? 'Ligar Sons da Web Audio API' : 'Silenciar'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isMuted ? 'Mudo' : 'SFX'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
