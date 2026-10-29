import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { PokemonSummary } from '../types/pokemon';
import { formatPokemonId, formatPokemonName } from '../utils/translations';
import { TypeBadge } from './TypeBadge';
import { sound } from '../utils/audio';

interface PokemonCardProps {
  pokemon: PokemonSummary;
  isFavorite: boolean;
  isShiny?: boolean;
  onToggleFavorite: (id: number) => void;
  onSelect: (pokemon: PokemonSummary) => void;
  theme?: 'dark' | 'light';
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isFavorite,
  isShiny = false,
  onToggleFavorite,
  onSelect,
  theme = 'dark',
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [, setImageError] = useState(false);

  const isLight = theme === 'light';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playFavorite(!isFavorite);
    onToggleFavorite(pokemon.id);
  };

  const handleCardClick = () => {
    sound.playModalOpen();
    onSelect(pokemon);
  };

  const [imgFallbackIndex, setImgFallbackIndex] = useState(0);

  const imageCandidates = [
    isShiny ? pokemon.shinyArtwork : pokemon.officialArtwork,
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? 'shiny/' : ''}${pokemon.id}.png`,
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${isShiny ? 'shiny/' : ''}${pokemon.id}.png`,
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${isShiny ? 'shiny/' : ''}${pokemon.id}.gif`,
    pokemon.sprite,
  ];

  const currentImgSrc = imageCandidates[Math.min(imgFallbackIndex, imageCandidates.length - 1)];

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[16px] border p-3 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
        isLight
          ? isShiny
            ? 'bg-white border-[#DCBD85] shadow-[0_4px_16px_rgba(220,189,133,0.3)] hover:border-amber-400'
            : 'bg-white border-[#E2D9CC] hover:border-[#DCBD85]'
          : isShiny
          ? 'bg-gradient-to-b from-[#163c50] to-[#0d2433] border-[#DCBD85]/60 hover:border-[#EFD7AD] shadow-[0_0_15px_rgba(220,189,133,0.2)]'
          : 'bg-gradient-to-b from-[#163c50] to-[#0d2433] border-[#046683] hover:border-[#48A0B6]'
      }`}
    >
      {/* Background Decorative Accents */}
      <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full transition-transform duration-500 group-hover:scale-125 ${
        isLight ? 'bg-[#DCBD85]/10' : 'bg-[#48A0B6]/10'
      }`} />
      <div className={`absolute -left-6 -bottom-6 h-20 w-20 rounded-full transition-transform duration-500 group-hover:scale-110 ${
        isLight ? 'bg-[#046683]/5' : 'bg-[#DCBD85]/10'
      }`} />

      {/* Top Header: ID & Controls */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`font-['JetBrains_Mono',monospace] text-[11px] sm:text-xs font-bold tracking-wider px-2 py-0.5 rounded-md border ${
            isLight
              ? 'bg-[#F4EFE6] text-[#046683] border-[#DCBD85]'
              : 'bg-[#123244]/80 text-[#B8DAE3] border-[#046683]'
          }`}>
            {formatPokemonId(pokemon.id)}
          </span>
          {isShiny && (
            <span className="flex items-center gap-0.5 text-[9px] font-black text-[#123244] bg-[#DCBD85] px-1.5 py-0.5 rounded font-mono shadow-sm">
              <Sparkles size={10} /> SHINY
            </span>
          )}
        </div>

        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={`relative rounded-full p-1.5 sm:p-2 transition-all duration-200 active:scale-90 hover:scale-110 ${
            isFavorite
              ? 'text-rose-500 bg-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
              : isLight
              ? 'text-slate-400 hover:text-rose-500 bg-[#F4EFE6] hover:bg-rose-50'
              : 'text-[#B8DAE3]/60 hover:text-rose-400 bg-[#123244]/40 hover:bg-rose-500/10'
          }`}
        >
          <Heart
            size={16}
            className={`transition-transform duration-200 ${isFavorite ? 'fill-rose-500 scale-110' : ''}`}
          />
        </button>
      </div>

      {/* Pokemon Visual Artwork */}
      <div className="relative z-10 my-1 sm:my-2 flex h-28 sm:h-34 w-full items-center justify-center">
        {!imageLoaded && (
          <div className={`absolute h-24 w-24 sm:h-28 sm:w-28 animate-pulse rounded-full ${
            isLight ? 'bg-[#F4EFE6]' : 'bg-[#046683]/30'
          }`} />
        )}
        <img
          src={currentImgSrc}
          alt={pokemon.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            if (imgFallbackIndex < imageCandidates.length - 1) {
              setImgFallbackIndex((prev) => prev + 1);
            } else {
              setImageError(true);
              setImageLoaded(true);
            }
          }}
          className={`h-24 w-24 sm:h-30 sm:w-30 object-contain transition-all duration-300 group-hover:scale-110 drop-shadow-[0_6px_12px_rgba(0,0,0,0.25)] ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Pokemon Name & Info */}
      <div className="relative z-10 flex flex-col gap-1 pt-1 text-center">
        <h3 className={`truncate text-xs sm:text-base font-bold transition-colors duration-200 ${
          isLight ? 'text-[#123244] group-hover:text-[#046683]' : 'text-white group-hover:text-[#EFD7AD]'
        }`}>
          {formatPokemonName(pokemon.name)}
        </h3>

        {/* Type Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} size="xs" />
          ))}
        </div>

        {/* BST Pill */}
        <div className={`mt-1 flex items-center justify-between border-t pt-1.5 text-[10px] sm:text-[11px] ${
          isLight ? 'border-[#E2D9CC] text-[#556976]' : 'border-[#046683]/50 text-[#B8DAE3]'
        }`}>
          <span className="font-semibold opacity-75">BST:</span>
          <span className="font-extrabold text-[#DCBD85]">{pokemon.bst} pts</span>
        </div>
      </div>
    </div>
  );
};
