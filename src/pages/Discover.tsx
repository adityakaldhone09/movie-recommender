import React, { useState, useEffect, useCallback } from 'react';
import { MovieCardData, Genre } from '../types/movie';
import { fetchGenres, fetchDiscoverMovies, searchMoviesTmdb } from '../services/api';
import { SearchBar } from '../components/discovery/SearchBar';
import { MoodSelector } from '../components/discovery/MoodSelector';
import { GenreFilter } from '../components/discovery/GenreFilter';
import { RatingSlider } from '../components/discovery/RatingSlider';
import { YearRangeSlider } from '../components/discovery/YearRangeSlider';
import { RecommendationPanel } from '../components/discovery/RecommendationPanel';
import { MovieGrid } from '../components/movie/MovieGrid';
import { Button } from '../components/ui/Button';
import { Filter, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';

interface DiscoverProps {
  onSelectMovie: (movie: MovieCardData) => void;
}

export function Discover({ onSelectMovie }: DiscoverProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [minYear, setMinYear] = useState<number>(1970);
  const [maxYear, setMaxYear] = useState<number>(new Date().getFullYear());
  const [sortBy, setSortBy] = useState<string>('popularity.desc');

  const [movies, setMovies] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Load genres once
  useEffect(() => {
    fetchGenres().then(setGenres).catch(console.error);
  }, []);

  // Fetch filtered movies
  const loadFilteredMovies = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const results = await fetchDiscoverMovies(
        {
          genres: selectedGenres,
          minRating,
          minYear,
          maxYear,
          sortBy,
          mood: selectedMood,
        },
        24,
        1
      );
      setMovies(results);
    } catch (err: any) {
      console.error('Failed to discover movies:', err);
      setErrorMessage(
        err.message || 'Failed to load movies. If the backend is waking up, please retry shortly.'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedGenres, minRating, minYear, maxYear, sortBy, selectedMood]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFilteredMovies();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadFilteredMovies]);

  const handleResetFilters = () => {
    setSelectedGenres([]);
    setSelectedMood(null);
    setMinRating(0);
    setMinYear(1970);
    setMaxYear(new Date().getFullYear());
    setSortBy('popularity.desc');
  };

  const hasActiveFilters =
    selectedGenres.length > 0 ||
    selectedMood !== null ||
    minRating > 0 ||
    minYear > 1970;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cinema-violet/15 text-cinema-violet border border-cinema-violet/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Movie Discovery Suite</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Discover Your Next Favorite Film
          </h1>
          <p className="text-sm sm:text-base text-cinema-muted leading-relaxed">
            Filter by vibe, genre combinations, ratings, and era, or use our machine learning similarity engine.
          </p>

          {/* Instant Search Bar */}
          <div className="pt-4 max-w-xl mx-auto">
            <SearchBar onSelectMovie={onSelectMovie} />
          </div>
        </div>

        {/* Dedicated TF-IDF Recommendation Engine Section */}
        <RecommendationPanel onSelectMovie={onSelectMovie} />

        {/* Faceted Discovery Section */}
        <div className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-surface-border">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-cinema-violet" />
                <span>Interactive Discovery Filter</span>
              </h2>
              <p className="text-xs sm:text-sm text-cinema-muted mt-0.5">
                Refine movies dynamically with multi-criteria parameters
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Sort By Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-surface-elevated border border-surface-border text-cinema-text text-xs sm:text-sm outline-none focus:border-cinema-violet cursor-pointer"
                aria-label="Sort movies by"
              >
                <option value="popularity.desc">Most Popular</option>
                <option value="vote_average.desc">Highest Rated</option>
                <option value="primary_release_date.desc">Release Date (Newest)</option>
              </select>

              {/* Reset button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-1.5 text-xs text-cinema-muted hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </Button>
              )}

              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFiltersMobile((prev) => !prev)}
                className="md:hidden gap-1.5 text-xs"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{showFiltersMobile ? 'Hide Filters' : 'Filters'}</span>
              </Button>
            </div>
          </div>

          {/* Filter Controls Grid */}
          <div
            className={`mt-6 p-6 rounded-2xl bg-surface-elevated/50 border border-surface-border backdrop-blur-md space-y-6 ${
              showFiltersMobile ? 'block' : 'hidden md:block'
            }`}
          >
            {/* 1. Mood Selector */}
            <MoodSelector
              selectedMood={selectedMood}
              onSelectMood={setSelectedMood}
            />

            {/* 2. Genre Chips */}
            <GenreFilter
              genres={genres}
              selectedGenres={selectedGenres}
              onChange={setSelectedGenres}
            />

            {/* 3. Range Sliders: Rating & Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <RatingSlider value={minRating} onChange={setMinRating} />
              <YearRangeSlider
                minYear={minYear}
                maxYear={maxYear}
                onChange={(min, max) => {
                  setMinYear(min);
                  setMaxYear(max);
                }}
              />
            </div>
          </div>

          {/* Results Grid Header */}
          <div className="flex items-center justify-between mt-8 mb-4">
            <span className="text-xs sm:text-sm font-semibold text-cinema-muted">
              Showing {movies.length} {movies.length === 1 ? 'film' : 'films'}
            </span>
            {hasActiveFilters && (
              <span className="text-xs text-cinema-violet font-medium">
                Active filters applied
              </span>
            )}
          </div>

          {/* Error / Cold start notice */}
          {errorMessage && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="font-semibold">Backend Connection Notice: </span>
                {errorMessage}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadFilteredMovies}
                className="shrink-0 border-amber-500/40 text-amber-200 hover:bg-amber-500/20"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Results Movie Grid */}
          <MovieGrid
            movies={movies}
            isLoading={loading}
            onSelectMovie={onSelectMovie}
            emptyMessage="No movies match your selected criteria."
          />
        </div>
      </div>
    </div>
  );
}

