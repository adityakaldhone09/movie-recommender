import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Bookmark, Info, Star, ChevronLeft, ChevronRight, Pause, Volume2 } from 'lucide-react';
import { MovieCardData } from '../../types/movie';
import { useWatchlist } from '../../context/WatchlistContext';
import { formatRating, formatYear, truncateText } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface CinematicHeroProps {
  movies: MovieCardData[];
  onSelectMovie: (movie: MovieCardData) => void;
  isLoading?: boolean;
}

export function CinematicHero({
  movies,
  onSelectMovie,
  isLoading = false,
}: CinematicHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const featuredList = movies.slice(0, 5);

  useEffect(() => {
    if (featuredList.length <= 1 || isPaused) return;

    autoplayTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 7000);

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [featuredList.length, isPaused]);

  if (isLoading) {
    return (
      <div className="relative w-full h-[65vh] sm:h-[75vh] min-h-[500px] max-h-[750px] bg-surface flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="w-12 h-12 rounded-full border-4 border-cinema-violet/30 border-t-cinema-violet animate-spin" />
      </div>
    );
  }

  if (featuredList.length === 0) {
    return (
      <div className="relative w-full h-[65vh] sm:h-[75vh] min-h-[500px] max-h-[750px] bg-surface flex items-center justify-center overflow-hidden px-6 text-center">
        <div className="absolute inset-0 bg-hero-gradient" />
        <p className="relative text-cinema-muted">
          Featured movies are unavailable right now.
        </p>
      </div>
    );
  }

  const currentMovie = featuredList[currentIndex];
  const bookmarked = isInWatchlist(currentMovie.tmdb_id);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  };

  return (
    <div
      className="relative w-full h-[70vh] sm:h-[80vh] min-h-[520px] max-h-[800px] overflow-hidden select-none bg-background group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Featured Movies Carousel"
    >
      {/* Backdrop Image with Zoom animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.tmdb_id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full"
        >
          {currentMovie.backdrop_url ? (
            <img
              src={currentMovie.backdrop_url}
              alt={currentMovie.title}
              className="w-full h-full object-cover object-top md:object-center brightness-90 filter"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-surface-elevated to-surface" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Cinematic Gradient Overlays to preserve readability */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent w-full md:w-3/4" />
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />

      {/* Content Container */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.tmdb_id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl space-y-4"
          >
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-cinema-violet/90 text-white backdrop-blur-md shadow-glow-violet uppercase tracking-wider text-[11px]">
                Featured Premiere
              </span>

              {currentMovie.release_date && (
                <span className="text-cinema-muted">
                  {formatYear(currentMovie.release_date)}
                </span>
              )}

              {currentMovie.vote_average && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-cinema-gold border border-cinema-gold/30">
                  <Star className="w-3.5 h-3.5 fill-cinema-gold text-cinema-gold" />
                  {formatRating(currentMovie.vote_average)}
                </span>
              )}
            </div>

            {/* Movie Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] drop-shadow-xl line-clamp-2">
              {currentMovie.title}
            </h1>

            {/* Synopsis */}
            {currentMovie.overview && (
              <p className="text-sm sm:text-base text-white/80 line-clamp-3 leading-relaxed max-w-xl drop-shadow">
                {truncateText(currentMovie.overview, 180)}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onSelectMovie(currentMovie)}
                className="gap-2.5 shadow-glow-violet"
              >
                <Info className="w-5 h-5" />
                <span>Explore Movie</span>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => toggleWatchlist(currentMovie)}
                className={cn(
                  'gap-2.5',
                  bookmarked && 'text-cinema-violet border-cinema-violet bg-cinema-violet/10'
                )}
              >
                <Bookmark className={cn('w-5 h-5', bookmarked && 'fill-current')} />
                <span>{bookmarked ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Pagination Dots & Controls */}
        <div className="absolute bottom-6 right-4 sm:right-8 flex items-center gap-3 z-20">
          <div className="flex items-center gap-1.5">
            {featuredList.map((m, idx) => (
              <button
                key={m.tmdb_id}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  idx === currentIndex
                    ? 'w-6 bg-cinema-violet shadow-glow-violet'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                )}
                aria-label={`Jump to featured movie ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition-all border border-white/10"
              aria-label="Previous featured movie"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition-all border border-white/10"
              aria-label="Next featured movie"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
