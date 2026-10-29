import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MovieCardData } from '../types/movie';
import { getStoredWatchlist, saveStoredWatchlist } from '../utils/storage';
import { useToast } from './ToastContext';

interface WatchlistContextValue {
  watchlist: MovieCardData[];
  addToWatchlist: (movie: MovieCardData) => void;
  removeFromWatchlist: (tmdbId: number) => void;
  toggleWatchlist: (movie: MovieCardData) => void;
  isInWatchlist: (tmdbId: number) => boolean;
  count: number;
}

const WatchlistContext = createContext<WatchlistContextValue | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<MovieCardData[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const saved = getStoredWatchlist();
    setWatchlist(saved);
  }, []);

  const addToWatchlist = (movie: MovieCardData) => {
    setWatchlist((prev) => {
      if (prev.some((m) => m.tmdb_id === movie.tmdb_id)) return prev;
      const next = [movie, ...prev];
      saveStoredWatchlist(next);
      return next;
    });
    showToast(`"${movie.title}" added to your watchlist`, 'success');
  };

  const removeFromWatchlist = (tmdbId: number) => {
    let removedTitle = '';
    setWatchlist((prev) => {
      const target = prev.find((m) => m.tmdb_id === tmdbId);
      if (target) removedTitle = target.title;
      const next = prev.filter((m) => m.tmdb_id !== tmdbId);
      saveStoredWatchlist(next);
      return next;
    });
    if (removedTitle) {
      showToast(`"${removedTitle}" removed from watchlist`, 'info');
    }
  };

  const isInWatchlist = (tmdbId: number) => {
    return watchlist.some((m) => m.tmdb_id === tmdbId);
  };

  const toggleWatchlist = (movie: MovieCardData) => {
    if (isInWatchlist(movie.tmdb_id)) {
      removeFromWatchlist(movie.tmdb_id);
    } else {
      addToWatchlist(movie);
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        count: watchlist.length,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}

