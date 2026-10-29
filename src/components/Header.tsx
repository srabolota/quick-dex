import React from 'react';
import { Search, Volume2, VolumeX, Heart, Shuffle, Download, Menu, Sun, Moon, Languages } from 'lucide-react';
import { QuickBallIcon } from './QuickBallIcon';
import { sound } from '../utils/audio';
import { NamingMode } from '../utils/translations';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  favoritesCount: number;
  showOnlyFavorites: boolean;
  onToggleShowFavorites: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onRandomPokemon: () => void;
  onOpenSidebar: () => void;
  currentViewTitle: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  namingMode: NamingMode;
  onToggleNamingMode: () => void;
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
  onOpenSidebar,
  currentViewTitle,
  theme,
  onToggleTheme,
  namingMode,
  onToggleNamingMode,
}) => {
  const handleDownloadSingleHtml = () => {
    sound.playClick();
    fetch('/pokedex_quickball.html')
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pokedex_quickball.html';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((err) => {
        console.error('Erro ao baixar arquivo HTML único:', err);
      });
  };

  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
      isLight
        ? 'border-[#E2D9CC] bg-[#FDFBF7]/95 text-[#123244]'
        : 'border-[#046683] bg-[#123244]/95 text-[#B8DAE3]'
    }`}>
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {/* Logo & Sidebar Trigger */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Menu Hamburger Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenSidebar();
                }}
                className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-sm ${
                  isLight
                    ? 'bg-[#F4EFE6] text-[#046683] border-[#DCBD85] hover:bg-[#EDE6DA]'
                    : 'bg-[#0d2433] text-[#48A0B6] hover:text-[#DCBD85] border-[#046683]'
                }`}
                title="Abrir Menu Lateral Quickdex"
              >
                <Menu size={18} />
              </button>

              <div
                className="flex items-center gap-2 cursor-pointer select-none group"
                onClick={() => onSearchChange('')}
              >
                <div className="transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110">
                  <QuickBallIcon size={34} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className={`text-base sm:text-xl font-black tracking-wider ${isLight ? 'text-[#123244]' : 'text-white'}`}>
                      QUICK<span className="text-[#48A0B6]">DEX</span>
                    </h1>
                    <span className="rounded-md bg-gradient-to-r from-[#48A0B6] to-[#DCBD85] px-1.5 py-0.2 text-[9px] font-black uppercase text-[#123244]">
                      GEN 1-9
                    </span>
                  </div>
                  <p className={`text-[10px] sm:text-[11px] font-bold ${isLight ? 'text-[#046683]' : 'text-[#B8DAE3]/80'}`}>
                    {currentViewTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons Bar */}
            <div className="flex items-center gap-1 md:hidden">
              {/* Theme Toggle Mobile */}
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleTheme();
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
                  isLight
                    ? 'bg-[#F4EFE6] text-amber-600 border-[#DCBD85]'
                    : 'bg-[#0d2433] text-[#DCBD85] border-[#046683]'
                }`}
                title={isLight ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
              >
                {isLight ? <Moon size={15} /> : <Sun size={15} />}
              </button>

              {/* Naming Mode Toggle Mobile */}
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleNamingMode();
                }}
                className={`flex h-8 px-2 items-center justify-center rounded-xl border text-[10px] font-black transition-all ${
                  isLight
                    ? 'bg-[#F4EFE6] text-[#046683] border-[#DCBD85]'
                    : 'bg-[#0d2433] text-[#48A0B6] border-[#046683]'
                }`}
                title={namingMode === 'pt-br' ? 'Nomes: Totalmente em Português' : 'Nomes: PT + Inglês (Padrão dos Jogos)'}
              >
                {namingMode === 'pt-br' ? 'PT-BR' : 'PT+EN'}
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onToggleShowFavorites();
                }}
                className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  showOnlyFavorites
                    ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                    : isLight
                    ? 'bg-[#F4EFE6] text-[#123244] border border-[#DCBD85]'
                    : 'bg-[#0d2433] text-[#B8DAE3] border border-[#046683]'
                }`}
                title="Meus Favoritos"
              >
                <Heart size={15} className={showOnlyFavorites ? 'fill-current' : ''} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DCBD85] text-[9px] font-black text-[#123244]">
                    {favoritesCount}
                  </span>
                )}
              </button>

              <button
                onClick={onToggleMute}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                  isLight
                    ? 'bg-[#F4EFE6] text-[#046683] border-[#DCBD85]'
                    : 'bg-[#0d2433] text-[#B8DAE3] border-[#046683]'
                }`}
                title={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar'}
              >
                {isMuted ? <VolumeX size={15} className="opacity-40" /> : <Volume2 size={15} className="text-[#48A0B6]" />}
              </button>
            </div>
          </div>

          {/* Search Input Bar (Touch-friendly & responsive) */}
          <div className="relative flex-1 max-w-md mx-auto md:mx-4 w-full">
            <div className="relative flex items-center">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 text-[#48A0B6]"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por Nome ou Número (ex: Lucario, #10059, Mega, Paradox)..."
                className={`w-full rounded-2xl border py-2 pl-9 pr-9 text-xs sm:text-sm shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-[#48A0B6]/40 ${
                  isLight
                    ? 'bg-[#FFFFFF] border-[#DCBD85] text-[#123244] placeholder-slate-400 focus:bg-[#FFFFFF]'
                    : 'bg-[#0d2433] border-[#046683] text-white placeholder-[#B8DAE3]/50 focus:bg-[#123244]'
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onSearchChange('');
                  }}
                  className={`absolute right-3 text-xs ${isLight ? 'text-slate-400 hover:text-black' : 'text-[#B8DAE3]/60 hover:text-white'}`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop Right Action Bar */}
          <div className="hidden md:flex items-center gap-2">
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                onToggleTheme();
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                isLight
                  ? 'bg-[#F4EFE6] border-[#DCBD85] text-[#123244] hover:bg-[#EDE6DA]'
                  : 'bg-[#0d2433] border-[#046683] text-[#DCBD85] hover:bg-[#163c50]'
              }`}
              title={isLight ? 'Modo Claro Ativo (Clique para Modo Escuro)' : 'Modo Escuro Ativo (Clique para Modo Claro)'}
            >
              {isLight ? <Moon size={14} className="text-amber-700" /> : <Sun size={14} className="text-[#DCBD85]" />}
              <span>{isLight ? 'Claro' : 'Escuro'}</span>
            </button>

            {/* Language / Naming Mode Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                onToggleNamingMode();
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                isLight
                  ? 'bg-[#F4EFE6] border-[#DCBD85] text-[#046683]'
                  : 'bg-[#0d2433] border-[#046683] text-[#48A0B6]'
              }`}
              title="Alternar Nomes de Golpes e Habilidades (PT-BR ou Padrão dos Jogos PT+EN)"
            >
              <Languages size={14} />
              <span>{namingMode === 'pt-br' ? 'PT-BR' : 'PT+EN'}</span>
            </button>

            <button
              onClick={handleDownloadSingleHtml}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 shadow-sm ${
                isLight
                  ? 'bg-[#F4EFE6] border-[#DCBD85] text-[#9A7332] hover:bg-[#EDE6DA]'
                  : 'bg-[#0d2433] border-[#DCBD85]/40 text-[#DCBD85] hover:bg-[#DCBD85]/10'
              }`}
              title="Baixar Pokédex em arquivo HTML único autônomo"
            >
              <Download size={14} />
              <span>Baixar HTML</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onRandomPokemon();
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                isLight
                  ? 'bg-[#F4EFE6] border-[#DCBD85] text-[#046683] hover:bg-[#EDE6DA]'
                  : 'bg-[#0d2433] border-[#046683] text-[#B8DAE3] hover:text-[#48A0B6]'
              }`}
              title="Sortear um Pokémon Aleatório"
            >
              <Shuffle size={14} />
              <span>Surpresa</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onToggleShowFavorites();
              }}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                showOnlyFavorites
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                  : isLight
                  ? 'bg-[#F4EFE6] text-[#123244] border border-[#DCBD85] hover:border-rose-500/50 hover:text-rose-500'
                  : 'bg-[#0d2433] text-[#B8DAE3] border border-[#046683] hover:border-rose-500/50 hover:text-rose-400'
              }`}
            >
              <Heart size={14} className={showOnlyFavorites ? 'fill-current' : ''} />
              <span>Favoritos</span>
              {favoritesCount > 0 && (
                <span className="ml-0.5 rounded-full bg-[#DCBD85] px-1.5 py-0.2 text-[10px] font-black text-[#123244]">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={onToggleMute}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                isMuted
                  ? 'border-[#046683] bg-[#0d2433] text-[#B8DAE3]/40'
                  : 'border-[#48A0B6]/40 bg-[#0d2433] text-[#48A0B6]'
              }`}
              title={isMuted ? 'Ligar Sons da Web Audio API' : 'Silenciar'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isMuted ? 'Mudo' : 'SFX'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
