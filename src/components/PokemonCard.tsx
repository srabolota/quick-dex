import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { PokemonSummary } from '../types/pokemon';
import { formatPokemonId, formatPokemonName } from '../utils/translations';
import { TypeBadge } from './TypeBadge';
import { sound } from '../utils/audio';

interface PokemonCardProps {
  pokemon: PokemonSummary;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onSelect: (pokemon: PokemonSummary) => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playFavorite(!isFavorite);
    onToggleFavorite(pokemon.id);
  };

  const handleCardClick = () => {
    sound.playModalOpen();
    onSelect(pokemon);
  };

  const imgSrc = imageError ? pokemon.sprite : pokemon.officialArtwork;

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[16px] border border-[#00d2ff]/20 bg-gradient-to-b from-[#182538] to-[#121c29] p-4 shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00d2ff]/70 hover:shadow-[0_12px_30px_rgba(0,210,255,0.25)] cursor-pointer"
    >
      {/* Background Quick Ball Decorative Pattern */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#00d2ff]/5 transition-transform duration-500 group-hover:scale-125" />
      <div className="absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-[#ffe600]/5 transition-transform duration-500 group-hover:scale-110" />

      {/* Top Header: ID & Favorite Button */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="font-['JetBrains_Mono',monospace] text-xs font-bold tracking-wider text-[#00d2ff]/90 bg-[#0d1520]/60 px-2 py-0.5 rounded-md border border-[#00d2ff]/20">
          {formatPokemonId(pokemon.id)}
        </span>

        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={`relative rounded-full p-2 transition-all duration-200 active:scale-90 hover:scale-110 ${
            isFavorite
              ? 'text-rose-500 bg-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
              : 'text-slate-400 hover:text-rose-400 bg-black/20 hover:bg-rose-500/10'
          }`}
        >
          <Heart
            size={18}
            className={`transition-transform duration-200 ${isFavorite ? 'fill-rose-500 scale-110' : ''}`}
          />
        </button>
      </div>

      {/* Pokemon Visual Artwork */}
      <div className="relative z-10 my-2 flex h-36 w-full items-center justify-center">
        {!imageLoaded && (
          <div className="absolute h-28 w-28 animate-pulse rounded-full bg-slate-800/80" />
        )}
        <img
          src={imgSrc}
          alt={pokemon.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`h-32 w-32 object-contain transition-all duration-300 group-hover:scale-110 drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)] ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Pokemon Name & Info */}
      <div className="relative z-10 flex flex-col gap-2 pt-1 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="truncate text-base font-bold text-white transition-colors duration-200 group-hover:text-[#00d2ff]">
            {formatPokemonName(pokemon.name)}
          </h3>
        </div>

        {/* Type Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} size="xs" />
          ))}
        </div>

        {/* BST Pill */}
        <div className="mt-1 flex items-center justify-between border-t border-slate-700/50 pt-2 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-400">Total Status:</span>
          <span className="font-extrabold text-[#ffe600]">{pokemon.bst} BST</span>
        </div>
      </div>
    </div>
  );
};
