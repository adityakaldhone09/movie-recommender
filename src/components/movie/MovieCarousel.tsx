import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCardData } from '../../types/movie';
import { MovieCard } from './MovieCard';
import { MovieShelfSkeleton } from '../ui/Skeleton';

interface MovieCarouselProps {
  title: string;
  subtitle?: string;
  movies: MovieCardData[];
  isLoading?: boolean;
  onSelectMovie: (movie: MovieCardData) => void;
  badge?: string;
}

export function MovieCarousel({
  title,
  subtitle,
  movies,
  isLoading = false,
  onSelectMovie,
  badge,
}: MovieCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return <MovieShelfSkeleton count={6} />;
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="my-8 relative group/carousel">
      {/* Shelf Header */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-cinema-gradient inline-block" />
              {title}
            </h2>
            {badge && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cinema-violet/20 text-cinema-violet border border-cinema-violet/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-cinema-muted mt-1 ml-3.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Carousel Chevrons */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-surface-border text-cinema-muted hover:text-white transition-all shadow-sm active:scale-95"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-surface-border text-cinema-muted hover:text-white transition-all shadow-sm active:scale-95"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 px-1"
        style={{ scrollSnapType: 'x proximity' }}
      >
        {movies.map((movie) => (
          <div
            key={movie.tmdb_id}
            className="w-[150px] sm:w-[175px] md:w-[195px] shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <MovieCard movie={movie} onSelect={onSelectMovie} />
          </div>
        ))}
      </div>
    </section>
  );
}

