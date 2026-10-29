import React from 'react';
import { motion } from 'framer-motion';
import { MovieCardData } from '../../types/movie';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from '../ui/Skeleton';
import { Film } from 'lucide-react';

interface MovieGridProps {
  movies: MovieCardData[];
  isLoading?: boolean;
  onSelectMovie: (movie: MovieCardData) => void;
  emptyMessage?: string;
}

export function MovieGrid({
  movies,
  isLoading = false,
  onSelectMovie,
  emptyMessage = 'No movies found.',
}: MovieGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 rounded-3xl border border-dashed border-surface-border bg-surface/40">
        <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center text-cinema-muted mb-4 border border-surface-border">
          <Film className="w-8 h-8 opacity-40 text-cinema-violet" />
        </div>
        <h3 className="text-lg font-semibold text-cinema-text">{emptyMessage}</h3>
        <p className="text-sm text-cinema-muted mt-1 max-w-md">
          Try adjusting your search criteria, clearing some filters, or exploring other moods.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
    >
      {movies.map((movie, index) => (
        <motion.div
          key={`${movie.tmdb_id}-${index}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
        >
          <MovieCard movie={movie} onSelect={onSelectMovie} />
        </motion.div>
      ))}
    </motion.div>
  );
}

