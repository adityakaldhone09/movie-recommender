import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Film, Layers } from 'lucide-react';
import { MovieCardData, SearchBundleResponse, TFIDFRecItem } from '../../types/movie';
import { fetchSearchBundle } from '../../services/api';
import { MovieCard } from '../movie/MovieCard';
import { Button } from '../ui/Button';

interface RecommendationPanelProps {
  onSelectMovie: (movie: MovieCardData) => void;
}

export function RecommendationPanel({ onSelectMovie }: RecommendationPanelProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [bundle, setBundle] = useState<SearchBundleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecommend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetchSearchBundle(query.trim(), 12, 12);
      setBundle(res);
    } catch (err: any) {
      console.error('Recommendation failed:', err);
      setError('Could not find movie recommendations. Please check the spelling or try another title.');
    } finally {
      setLoading(false);
    }
  };

  const sampleMovies = ['Inception', 'Interstellar', 'The Dark Knight', 'Pulp Fiction', 'Spirited Away', 'The Matrix'];

  const tfidfCards: MovieCardData[] = (bundle?.tfidf_recommendations || [])
    .filter((item: TFIDFRecItem) => item.tmdb && item.tmdb.tmdb_id)
    .map((item: TFIDFRecItem) => ({
      ...item.tmdb!,
      match_score: item.score,
    }));

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-surface-elevated/70 border border-surface-border shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cinema-violet/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 max-w-3xl">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cinema-violet/15 text-cinema-violet border border-cinema-violet/30 text-xs font-bold w-fit mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TF-IDF Content Similarity Engine</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Find Movies Similar to What You Love
        </h2>
        <p className="text-sm text-cinema-muted mt-2 leading-relaxed">
          Enter any favorite film to compute deep cosine similarity across 45,000+ local movie metadata vectors, combined with TMDB genre intelligence.
        </p>

        {/* Input Form */}
        <form onSubmit={handleRecommend} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Film className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cinema-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Inception, Blade Runner, Whiplash..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface border border-surface-border text-white placeholder-cinema-muted text-sm sm:text-base outline-none focus:border-cinema-violet focus:ring-2 focus:ring-cinema-violet/30 transition-all shadow-inner"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            disabled={!query.trim()}
            className="shrink-0 gap-2 shadow-glow-violet"
          >
            <span>Analyze & Recommend</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-cinema-muted">
          <span>Try:</span>
          {sampleMovies.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setQuery(sample);
                fetchSearchBundle(sample, 12, 12).then(setBundle).catch(() => {});
              }}
              className="px-2.5 py-1 rounded-lg bg-surface border border-surface-border hover:border-cinema-violet hover:text-white transition-colors"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 animate-spin text-cinema-violet mb-3" />
          <p className="text-sm font-semibold text-cinema-text">
            Computing high-dimensional TF-IDF vectors...
          </p>
          <p className="text-xs text-cinema-muted mt-1">
            Scanning 45,000+ film plots, genres, and credits
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && bundle && (
        <div className="mt-10 pt-8 border-t border-surface-border space-y-8">
          {/* Matched Movie Overview Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-surface-border flex flex-col sm:flex-row gap-4 items-center">
            {bundle.movie_details.poster_url && (
              <img
                src={bundle.movie_details.poster_url}
                alt={bundle.movie_details.title}
                className="w-20 aspect-[2/3] object-cover rounded-xl shrink-0"
              />
            )}
            <div className="flex-1 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cinema-violet">
                Source Reference Movie
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {bundle.movie_details.title}
              </h3>
              <p className="text-xs text-cinema-muted mt-1 line-clamp-2">
                {bundle.movie_details.overview}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onSelectMovie({
                  tmdb_id: bundle.movie_details.tmdb_id,
                  title: bundle.movie_details.title,
                  poster_url: bundle.movie_details.poster_url,
                  backdrop_url: bundle.movie_details.backdrop_url,
                  release_date: bundle.movie_details.release_date,
                  vote_average: bundle.movie_details.vote_average,
                  overview: bundle.movie_details.overview,
                })
              }
            >
              View Reference
            </Button>
          </div>

          {/* TF-IDF Recommendations Shelf */}
          {tfidfCards.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-cinema-violet" />
                <h4 className="text-base sm:text-lg font-bold text-white">
                  Content-Based TF-IDF Matches
                </h4>
                <span className="text-xs text-cinema-muted">
                  (Ranked by cosine similarity)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {tfidfCards.map((movie) => (
                  <MovieCard key={movie.tmdb_id} movie={movie} onSelect={onSelectMovie} />
                ))}
              </div>
            </div>
          )}

          {/* TMDB Genre Discovery Shelf */}
          {bundle.genre_recommendations && bundle.genre_recommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-cinema-magenta" />
                <h4 className="text-base sm:text-lg font-bold text-white">
                  Genre-Aligned Recommendations
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {bundle.genre_recommendations.map((movie) => (
                  <MovieCard key={movie.tmdb_id} movie={movie} onSelect={onSelectMovie} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

