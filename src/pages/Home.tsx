import React, { useState, useEffect } from 'react';
import { MovieCardData } from '../types/movie';
import { fetchHomeFeed, getApiErrorMessage } from '../services/api';
import { CinematicHero } from '../components/hero/CinematicHero';
import { MovieCarousel } from '../components/movie/MovieCarousel';
import { MovieShelfSkeleton } from '../components/ui/Skeleton';
import { Sparkles, Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface HomeProps {
  onSelectMovie: (movie: MovieCardData) => void;
  onNavigateToDiscover: () => void;
}

export function Home({ onSelectMovie, onNavigateToDiscover }: HomeProps) {
  const [trending, setTrending] = useState<MovieCardData[]>([]);
  const [popular, setPopular] = useState<MovieCardData[]>([]);
  const [topRated, setTopRated] = useState<MovieCardData[]>([]);
  const [upcoming, setUpcoming] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFeeds = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const categories = ['trending', 'popular', 'top_rated', 'upcoming'] as const;
      const results = await Promise.allSettled(
        categories.map((category) => fetchHomeFeed(category, 20))
      );
      const feeds = results.map((result) =>
        result.status === 'fulfilled' ? result.value : []
      );
      setTrending(feeds[0]);
      setPopular(feeds[1]);
      setTopRated(feeds[2]);
      setUpcoming(feeds[3]);

      const failedCategories = results.flatMap((result, index) =>
        result.status === 'rejected' ? [categories[index]] : []
      );
      if (failedCategories.length > 0) {
        const firstError = results.find(
          (result): result is PromiseRejectedResult => result.status === 'rejected'
        )?.reason;
        const detail = getApiErrorMessage(
          firstError,
          'Some movie feeds could not be loaded.'
        );
        setErrorMessage(
          `${failedCategories.join(', ')} feed${failedCategories.length > 1 ? 's' : ''}: ${detail}`
        );
      }
    } catch (error: unknown) {
      console.error('Failed to load home feeds:', error);
      setErrorMessage(
        getApiErrorMessage(error, 'Could not load movie feeds. Please retry.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeds();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Cinematic Hero */}
      <CinematicHero
        movies={trending.length > 0 ? trending : popular}
        onSelectMovie={onSelectMovie}
        isLoading={loading}
      />

      {/* Main Content Shelves */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-4">
        {/* Banner CTA to AI Discovery Engine */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-cinema-violet/20 via-surface-elevated to-surface-elevated border border-cinema-violet/30 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-cinema-gradient flex items-center justify-center shrink-0 shadow-glow-violet">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Looking for something specific?
              </h3>
              <p className="text-xs sm:text-sm text-cinema-muted">
                Explore our AI recommendation engine with mood vibes, genre blending, and TF-IDF similarity.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={onNavigateToDiscover}
            className="shrink-0 gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Launch AI Discover</span>
          </Button>
        </div>

        {/* Backend Cold-start / Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-semibold">Backend Connection Notice: </span>
              {errorMessage}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadFeeds}
              className="shrink-0 border-amber-500/40 text-amber-200 hover:bg-amber-500/20"
            >
              Retry Connection
            </Button>
          </div>
        )}

        {/* Shelves */}
        {loading ? (
          <div className="space-y-8 py-6">
            <MovieShelfSkeleton count={6} />
            <MovieShelfSkeleton count={6} />
            <MovieShelfSkeleton count={6} />
          </div>
        ) : (
          <>
            <MovieCarousel
              title="Trending Today"
              subtitle="The most watched and trending films across the globe right now"
              movies={trending}
              onSelectMovie={onSelectMovie}
              badge="Hot"
            />

            <MovieCarousel
              title="Critically Acclaimed & Top Rated"
              subtitle="All-time cinema masterpieces rated highest by audiences"
              movies={topRated}
              onSelectMovie={onSelectMovie}
              badge="Masterpieces"
            />

            <MovieCarousel
              title="Popular Releases"
              subtitle="Films capturing global attention and buzz"
              movies={popular}
              onSelectMovie={onSelectMovie}
            />

            <MovieCarousel
              title="Coming Soon to Theaters"
              subtitle="Upcoming highly anticipated cinematic releases"
              movies={upcoming}
              onSelectMovie={onSelectMovie}
              badge="Upcoming"
            />
          </>
        )}
      </div>
    </div>
  );
}
