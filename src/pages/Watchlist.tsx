import React, { useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { MovieCardData } from '../types/movie';
import { MovieCard } from '../components/movie/MovieCard';
import { Button } from '../components/ui/Button';
import { Bookmark, Compass, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface WatchlistProps {
  onSelectMovie: (movie: MovieCardData) => void;
  onNavigateToDiscover: () => void;
}

export function Watchlist({ onSelectMovie, onNavigateToDiscover }: WatchlistProps) {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [filterGenre, setFilterGenre] = useState<string | null>(null);

  // Extract unique genres across watchlist movies (if available)
  const filteredList = watchlist;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cinema-gradient flex items-center justify-center shadow-glow-violet">
                <Bookmark className="w-5 h-5 text-white fill-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                My Cinema Watchlist
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-cinema-muted mt-1.5 ml-11">
              Your personalized queue of movies to watch next
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cinema-violet/15 text-cinema-violet border border-cinema-violet/30">
              {watchlist.length} {watchlist.length === 1 ? 'Movie' : 'Movies'} Saved
            </span>
          </div>
        </div>

        {/* Watchlist Content */}
        {watchlist.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center px-4 rounded-3xl border border-dashed border-surface-border bg-surface/30">
            <div className="w-20 h-20 rounded-3xl bg-surface-elevated flex items-center justify-center text-cinema-muted mb-5 border border-surface-border shadow-xl">
              <Bookmark className="w-10 h-10 text-cinema-violet opacity-60" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Your watchlist is currently empty
            </h2>
            <p className="text-sm text-cinema-muted mt-2 max-w-md leading-relaxed">
              Explore trending films, dive into AI recommendations, or search by title. Click the bookmark icon on any card to save it here!
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={onNavigateToDiscover}
              className="mt-6 gap-2 shadow-glow-violet"
            >
              <Compass className="w-5 h-5" />
              <span>Explore & Discover Films</span>
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
          >
            {filteredList.map((movie) => (
              <div key={movie.tmdb_id} className="relative group">
                <MovieCard movie={movie} onSelect={onSelectMovie} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(movie.tmdb_id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg border border-white/10"
                  title="Remove from watchlist"
                  aria-label={`Remove ${movie.title} from watchlist`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

