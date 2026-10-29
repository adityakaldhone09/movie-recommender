import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Film } from 'lucide-react';
import { searchMoviesTmdb } from '../../services/api';
import { MovieCardData } from '../../types/movie';
import { formatYear } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface SearchBarProps {
  onSelectMovie: (movie: MovieCardData) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  onSelectMovie,
  placeholder = 'Search by movie title, character, or director...',
  className,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchMoviesTmdb(query.trim(), 1);
        const results = data.results || [];
        setSuggestions(results.slice(0, 8));
        setIsOpen(true);
      } catch (err) {
        console.error('Search suggestion error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (raw: any) => {
    const movieCard: MovieCardData = {
      tmdb_id: raw.id,
      title: raw.title || raw.name || '',
      poster_url: raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null,
      backdrop_url: raw.backdrop_path ? `https://image.tmdb.org/t/p/w500${raw.backdrop_path}` : null,
      release_date: raw.release_date || null,
      vote_average: raw.vote_average || null,
      overview: raw.overview || null,
    };
    onSelectMovie(movieCard);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-cinema-muted">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-cinema-violet" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-surface-elevated/90 border border-surface-border text-white placeholder-cinema-muted text-sm sm:text-base outline-none transition-all focus:border-cinema-violet focus:ring-2 focus:ring-cinema-violet/30 shadow-inner"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 p-1 rounded-full text-cinema-muted hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-surface-elevated border border-surface-border shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-2 divide-y divide-surface-border">
            {suggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-left hover:bg-surface-hover transition-colors group cursor-pointer"
              >
                <div className="w-10 h-14 rounded-lg bg-surface shrink-0 overflow-hidden border border-white/5">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cinema-muted">
                      <Film className="w-4 h-4 opacity-40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-semibold text-white group-hover:text-cinema-violet transition-colors truncate">
                    {item.title || item.name}
                  </div>
                  <div className="text-xs text-cinema-muted mt-0.5 flex items-center gap-2">
                    <span>{formatYear(item.release_date)}</span>
                    {item.vote_average ? (
                      <span className="text-cinema-gold font-medium">
                        ★ {item.vote_average.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

