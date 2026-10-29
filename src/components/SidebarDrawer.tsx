import React from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Swords,
  Compass,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon,
  Languages,
} from 'lucide-react';
import { QuickBallIcon } from './QuickBallIcon';
import { sound } from '../utils/audio';
import { NamingMode } from '../utils/translations';

export type AppNavView = 'pokedex' | 'shiny' | 'moves' | 'natures' | 'teambuilder';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppNavView;
  onSelectView: (view: AppNavView) => void;
  favoritesCount: number;
  teamCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  namingMode: NamingMode;
  onSelectNamingMode: (mode: NamingMode) => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onSelectView,
  favoritesCount,
  teamCount,
  theme,
  onToggleTheme,
  namingMode,
  onSelectNamingMode,
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  const navItems = [
    {
      id: 'pokedex' as AppNavView,
      label: 'Pokédex Nacional',
      subtitle: 'Todos os 1302+ Pokémon & Formas',
      icon: <BookOpen size={20} className="text-[#48A0B6]" />,
      badge: 'Gen 1-9',
      badgeColor: 'bg-[#48A0B6]/20 text-[#B8DAE3] border-[#48A0B6]/40',
    },
    {
      id: 'shiny' as AppNavView,
      label: 'Dex de Brilhantes',
      subtitle: 'Galeria com todas as formas Shiny',
      icon: <Sparkles size={20} className="text-[#DCBD85]" />,
      badge: 'Shiny ✨',
      badgeColor: 'bg-[#DCBD85]/20 text-[#DCBD85] border-[#DCBD85]/40',
    },
    {
      id: 'moves' as AppNavView,
      label: 'Dex de Movimentos',
      subtitle: 'Guia completo de ataques, poder e PP',
      icon: <Swords size={20} className="text-orange-400" />,
      badge: 'Golpes',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    },
    {
      id: 'natures' as AppNavView,
      label: 'Dex de Naturezas',
      subtitle: 'Todas as 25 Natures (+10% / -10%)',
      icon: <Compass size={20} className="text-emerald-400" />,
      badge: '25 Natures',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'teambuilder' as AppNavView,
      label: 'Construtor de Equipe',
      subtitle: 'Monte seu time de 6 e analise fraquezas',
      icon: <ShieldCheck size={20} className="text-[#EFD7AD]" />,
      badge: `${teamCount}/6 time`,
      badgeColor: teamCount > 0 ? 'bg-[#DCBD85] text-[#123244] font-extrabold' : 'bg-[#046683]/30 text-[#B8DAE3] border-[#046683]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Dark backdrop blur */}
      <div
        className="fixed inset-0 bg-[#0d1e29]/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          sound.playClick();
          onClose();
        }}
      />

      {/* Retractable Sidebar Panel */}
      <div
        className={`relative z-10 flex h-full w-full max-w-xs sm:max-w-sm flex-col shadow-[10px_0_40px_rgba(0,0,0,0.85)] animate-in slide-in-from-left duration-300 border-r ${
          isLight
            ? 'bg-[#FDFBF7] text-[#123244] border-[#E2D9CC]'
            : 'bg-[#123244] text-[#B8DAE3] border-[#046683]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between border-b p-4 sm:p-5 ${
          isLight
            ? 'border-[#E2D9CC] bg-gradient-to-r from-[#F4EFE6] to-[#EDE6DA]'
            : 'border-[#046683] bg-gradient-to-r from-[#0d2433] to-[#163c50]'
        }`}>
          <div className="flex items-center gap-2.5">
            <QuickBallIcon size={34} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-base sm:text-lg font-black tracking-wide ${isLight ? 'text-[#123244]' : 'text-white'}`}>
                  QUICK<span className="text-[#48A0B6]">DEX</span>
                </span>
                <span className="rounded bg-gradient-to-r from-[#48A0B6] to-[#DCBD85] px-1.5 py-0.2 text-[9px] font-black uppercase text-[#123244]">
                  PRO
                </span>
              </div>
              <p className={`text-[10px] sm:text-[11px] font-medium ${isLight ? 'text-[#046683]' : 'text-[#B8DAE3]/70'}`}>
                Menu de Navegação Principal
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
              isLight
                ? 'bg-[#FFFFFF] text-[#123244] border-[#DCBD85] hover:bg-rose-500 hover:text-white'
                : 'bg-[#0d2433] text-[#B8DAE3] border-[#046683] hover:bg-rose-500 hover:text-white'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 block ${isLight ? 'text-[#046683]' : 'text-[#B8DAE3]/50'}`}>
              Módulos da Pokédex
            </span>

            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playTab();
                    onSelectView(item.id);
                    onClose();
                  }}
                  className={`group flex w-full items-center justify-between rounded-2xl p-3 transition-all duration-200 border text-left ${
                    isActive
                      ? isLight
                        ? 'bg-[#F4EFE6] border-[#DCBD85] shadow-sm font-bold'
                        : 'bg-gradient-to-r from-[#163c50] to-[#0d2433] border-[#DCBD85] shadow-[0_0_20px_rgba(220,189,133,0.3)]'
                      : isLight
                      ? 'bg-white border-[#E2D9CC] hover:border-[#DCBD85] hover:bg-[#F4EFE6]'
                      : 'bg-[#0d2433] border-[#046683]/50 hover:border-[#48A0B6] hover:bg-[#163c50]/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'bg-[#DCBD85]/20 border-[#DCBD85]'
                          : isLight
                          ? 'bg-[#F4EFE6] border-[#E2D9CC]'
                          : 'bg-[#123244] border-[#046683]'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <span
                        className={`block text-xs font-black transition-colors ${
                          isActive
                            ? isLight ? 'text-[#123244]' : 'text-[#EFD7AD]'
                            : isLight ? 'text-[#123244] group-hover:text-[#046683]' : 'text-white group-hover:text-[#DCBD85]'
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className={`text-[10px] sm:text-[11px] line-clamp-1 ${isLight ? 'text-[#556976]' : 'text-[#B8DAE3]/70'}`}>
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                    <ChevronRight
                      size={15}
                      className={`transition-transform group-hover:translate-x-0.5 ${
                        isActive ? 'text-[#DCBD85]' : 'opacity-40'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Configurações: Tema & Idioma */}
          <div className={`pt-3 border-t space-y-3 ${isLight ? 'border-[#E2D9CC]' : 'border-[#046683]/50'}`}>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 block ${isLight ? 'text-[#046683]' : 'text-[#B8DAE3]/50'}`}>
              Configurações & Visual
            </span>

            {/* Alternador de Tema */}
            <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
              isLight ? 'bg-white border-[#E2D9CC]' : 'bg-[#0d2433] border-[#046683]'
            }`}>
              <div className="flex items-center gap-2">
                {isLight ? <Sun size={16} className="text-amber-600" /> : <Moon size={16} className="text-[#DCBD85]" />}
                <div>
                  <span className="text-xs font-bold block">Modo de Exibição</span>
                  <span className="text-[10px] opacity-70">{isLight ? 'Modo Claro Clean' : 'Modo Escuro Petróleo'}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleTheme();
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#DCBD85] text-[#123244] transition-all hover:scale-105 active:scale-95"
              >
                {isLight ? 'Ativar Escuro' : 'Ativar Claro'}
              </button>
            </div>

            {/* Seletor de Idioma / Nomes */}
            <div className={`p-2.5 rounded-xl border space-y-2 ${
              isLight ? 'bg-white border-[#E2D9CC]' : 'bg-[#0d2433] border-[#046683]'
            }`}>
              <div className="flex items-center gap-1.5">
                <Languages size={15} className="text-[#48A0B6]" />
                <span className="text-xs font-bold">Nomes de Golpes & Habilidades</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectNamingMode('pt-en');
                  }}
                  className={`p-2 rounded-lg text-left transition-all border ${
                    namingMode === 'pt-en'
                      ? 'bg-[#DCBD85] text-[#123244] border-[#DCBD85] font-black'
                      : isLight
                      ? 'bg-[#F4EFE6] text-[#123244] border-[#E2D9CC]'
                      : 'bg-[#123244] text-[#B8DAE3] border-[#046683]'
                  }`}
                >
                  <span className="block font-bold">Português + Inglês (Padrão)</span>
                  <span className="text-[10px] opacity-80">Golpes originais em inglês (Flamethrower, etc.)</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectNamingMode('pt-br');
                  }}
                  className={`p-2 rounded-lg text-left transition-all border ${
                    namingMode === 'pt-br'
                      ? 'bg-[#DCBD85] text-[#123244] border-[#DCBD85] font-black'
                      : isLight
                      ? 'bg-[#F4EFE6] text-[#123244] border-[#E2D9CC]'
                      : 'bg-[#123244] text-[#B8DAE3] border-[#046683]'
                  }`}
                >
                  <span className="block font-bold">Totalmente em Português</span>
                  <span className="text-[10px] opacity-80">Tradução de golpes (Lança-Chamas, etc.)</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className={`rounded-xl p-2.5 border ${
                isLight ? 'bg-white border-[#E2D9CC]' : 'bg-[#0d2433] border-[#046683]'
              }`}>
                <span className="text-[10px] font-semibold opacity-70 block">Favoritos</span>
                <strong className="text-rose-500 text-base font-black">{favoritesCount}</strong>
              </div>
              <div className={`rounded-xl p-2.5 border ${
                isLight ? 'bg-white border-[#E2D9CC]' : 'bg-[#0d2433] border-[#046683]'
              }`}>
                <span className="text-[10px] font-semibold opacity-70 block">Equipe</span>
                <strong className="text-[#DCBD85] text-base font-black">{teamCount}/6</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className={`border-t p-3.5 text-[11px] flex flex-col gap-1.5 ${
          isLight ? 'border-[#E2D9CC] bg-[#F4EFE6] text-[#556976]' : 'border-[#046683] bg-[#0d2433] text-[#B8DAE3]/80'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span className={isLight ? 'text-[#123244]' : 'text-white'}>Quickdex v3.5</span>
            <span className="text-[#48A0B6]">PokéAPI v2</span>
          </div>
          <p className="text-[10px] opacity-70 leading-tight">
            Design Quick Ball com Dark & Light Mode, 1302+ Pokémon, Megas, GMax e Paradoxos.
          </p>
        </div>
      </div>
    </div>
  );
};
