import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Bookmark, Info, Film } from 'lucide-react';
import { MovieCardData } from '../../types/movie';
import { useWatchlist } from '../../context/WatchlistContext';
import { formatYear, formatRating, formatMatchPercentage, truncateText } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface MovieCardProps {
  movie: MovieCardData;
  onSelect: (movie: MovieCardData) => void;
  priority?: boolean;
}

export function MovieCard({ movie, onSelect, priority = false }: MovieCardProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const bookmarked = isInWatchlist(movie.tmdb_id);
  const [posterFailed, setPosterFailed] = useState(false);

  useEffect(() => {
    setPosterFailed(false);
  }, [movie.poster_url]);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={() => onSelect(movie)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(movie);
        }
      }}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-surface-elevated border border-surface-border hover:border-cinema-violet/50 shadow-cinema-card hover:shadow-glow-violet transition-all duration-300 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-cinema-violet"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface">
        {movie.poster_url && !posterFailed ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            loading={priority ? 'eager' : 'lazy'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setPosterFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-surface-elevated text-cinema-muted">
            <Film className="w-10 h-10 mb-2 opacity-30 text-cinema-violet" />
            <span className="text-xs font-medium text-cinema-muted line-clamp-2">
              {movie.title}
            </span>
          </div>
        )}

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090D] via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5" />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 pointer-events-none">
          {/* Match Score Badge (TF-IDF recommendation) */}
          {movie.match_score !== undefined ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cinema-violet/90 text-white backdrop-blur-md shadow-md">
              {formatMatchPercentage(movie.match_score)}
            </span>
          ) : (
            <span />
          )}

          {/* Rating Badge */}
          {movie.vote_average ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/75 text-cinema-gold backdrop-blur-md border border-cinema-gold/20 shadow-md">
              <Star className="w-3 h-3 fill-cinema-gold text-cinema-gold" />
              <span>{formatRating(movie.vote_average)}</span>
            </div>
          ) : null}
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleBookmarkClick}
            className={cn(
              'p-2.5 rounded-full backdrop-blur-md border transition-all transform scale-90 group-hover:scale-100 shadow-xl',
              bookmarked
                ? 'bg-cinema-violet text-white border-cinema-violet'
                : 'bg-black/70 text-white border-white/20 hover:bg-cinema-violet hover:border-cinema-violet'
            )}
            title={bookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
            aria-label={bookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Bookmark className={cn('w-4 h-4', bookmarked && 'fill-current')} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(movie);
            }}
            className="p-2.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/30 transition-all transform scale-90 group-hover:scale-100 shadow-xl"
            title="View Details"
            aria-label="View Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Hover Snippet (bottom) */}
        {movie.overview && (
          <div className="absolute bottom-2.5 inset-x-2.5 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-[11px] text-white/90 line-clamp-2 leading-snug drop-shadow-md">
              {truncateText(movie.overview, 90)}
            </p>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-3 flex flex-col gap-1">
        <h3
          className="text-sm font-semibold text-cinema-text group-hover:text-cinema-violet transition-colors truncate"
          title={movie.title}
        >
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-cinema-muted">
          <span>{formatYear(movie.release_date) || '—'}</span>
          {movie.vote_average && (
            <span className="flex items-center gap-0.5 text-cinema-gold font-medium">
              ★ {formatRating(movie.vote_average)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
