import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Bookmark,
  Play,
  Clock,
  Calendar,
  User,
  Sparkles,
  Share2,
  X,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { MovieCardData, MovieDetailsData, TFIDFRecItem } from '../../types/movie';
import {
  fetchMovieDetails,
  fetchSearchBundle,
  getApiErrorMessage,
} from '../../services/api';
import { useWatchlist } from '../../context/WatchlistContext';
import { useToast } from '../../context/ToastContext';
import { formatRating, formatRuntime, formatYear } from '../../utils/formatters';
import { MovieCard } from './MovieCard';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../utils/cn';

interface MovieDetailsModalProps {
  movie: MovieCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: MovieCardData) => void;
}

export function MovieDetailsModal({
  movie,
  isOpen,
  onClose,
  onSelectMovie,
}: MovieDetailsModalProps) {
  const [details, setDetails] = useState<MovieDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTab, setActiveTab] = useState<'tfidf' | 'genre'>('tfidf');
  const [tfidfRecs, setTfidfRecs] = useState<TFIDFRecItem[]>([]);
  const [genreRecs, setGenreRecs] = useState<MovieCardData[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;
    if (isOpen && movie) {
      setShowTrailer(false);
      setLoading(true);
      setLoadingRecs(true);
      setDetails(null);
      setDetailsError(null);
      setRecommendationsError(null);
      setTfidfRecs([]);
      setGenreRecs([]);

      const loadMovieData = async () => {
        let movieTitle = movie.title;
        try {
          const data = await fetchMovieDetails(movie.tmdb_id);
          if (!active) return;
          setDetails(data);
          movieTitle = data.title || movie.title;
        } catch (error: unknown) {
          if (!active) return;
          console.error('Failed to load movie details:', error);
          setDetailsError(getApiErrorMessage(error, 'Could not load movie details.'));
          setLoading(false);
          setLoadingRecs(false);
          return;
        }

        setLoading(false);
        try {
          const bundle = await fetchSearchBundle(movieTitle, 12, 12);
          if (!active) return;
          setTfidfRecs(bundle.tfidf_recommendations);
          setGenreRecs(bundle.genre_recommendations);
        } catch (error: unknown) {
          if (!active) return;
          console.error('Failed to load movie recommendations:', error);
          setRecommendationsError(
            getApiErrorMessage(error, 'Could not load recommendations.')
          );
        } finally {
          if (active) setLoadingRecs(false);
        }
      };
      void loadMovieData();
    } else {
      setDetails(null);
      setTfidfRecs([]);
      setGenreRecs([]);
      setDetailsError(null);
      setRecommendationsError(null);
      setLoading(false);
      setLoadingRecs(false);
    }
    return () => {
      active = false;
    };
  }, [isOpen, movie, retryCount]);

  if (!movie) return null;

  const bookmarked = isInWatchlist(movie.tmdb_id);

  // Extract YouTube ID if trailer exists
  const trailerId = details?.trailer_url?.match(
    /(?:v=|\/)([0-9A-Za-z_-]{11})/
  )?.[1];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: details?.title || movie.title,
        text: `Check out ${details?.title || movie.title} on Cineva`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Movie link copied to clipboard', 'info');
    }
  };

  const handleSelectRelated = (relatedMovie: MovieCardData) => {
    onSelectMovie(relatedMovie);
  };

  // Map TF-IDF recs to MovieCardData with match_score
  const tfidfCards: MovieCardData[] = tfidfRecs
    .filter((item) => item.tmdb && item.tmdb.tmdb_id)
    .map((item) => ({
      ...item.tmdb!,
      match_score: item.score,
    }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="relative max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Cinematic Backdrop Hero */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-surface">
          {details?.backdrop_url || movie.backdrop_url ? (
            <img
              src={details?.backdrop_url || movie.backdrop_url!}
              alt={details?.title || movie.title}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface-elevated via-surface to-background flex items-center justify-center">
              <span className="text-4xl">🎬</span>
            </div>
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-surface-elevated/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-elevated via-transparent to-transparent hidden md:block" />

          {/* Trailer Player Overlay (if playing) */}
          <AnimatePresence>
            {showTrailer && trailerId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-black flex flex-col"
              >
                <div className="flex items-center justify-between p-3 bg-black/80">
                  <span className="text-xs font-semibold text-cinema-muted">
                    Official Trailer — {details?.title}
                  </span>
                  <button
                    onClick={() => setShowTrailer(false)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 w-full h-full">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&rel=0`}
                    title="Movie Trailer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero Content Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-end gap-6 z-10">
            {/* Movie Poster Thumbnail */}
            <div className="hidden sm:block w-32 md:w-36 aspect-[2/3] shrink-0 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-surface">
              {details?.poster_url || movie.poster_url ? (
                <img
                  src={details?.poster_url || movie.poster_url!}
                  alt={details?.title || movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-cinema-muted">
                  No Poster
                </div>
              )}
            </div>

            {/* Title & Quick Info */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                {details?.title || movie.title}
              </h1>
              {loading && (
                <p className="mt-2 text-xs text-cinema-muted">Loading movie details…</p>
              )}

              {details?.tagline && (
                <p className="text-xs sm:text-sm italic text-cinema-violet/90 mt-1 font-medium drop-shadow">
                  "{details.tagline}"
                </p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-cinema-muted">
                {movie.release_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cinema-violet" />
                    <span>{formatYear(movie.release_date)}</span>
                  </div>
                )}

                {details?.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cinema-violet" />
                    <span>{formatRuntime(details.runtime)}</span>
                  </div>
                )}

                {(details?.vote_average || movie.vote_average) && (
                  <div className="flex items-center gap-1 font-semibold text-cinema-gold">
                    <Star className="w-3.5 h-3.5 fill-cinema-gold" />
                    <span>
                      {formatRating(details?.vote_average || movie.vote_average)}
                    </span>
                    {details?.vote_count && (
                      <span className="text-[10px] text-cinema-muted font-normal">
                        ({details.vote_count.toLocaleString()})
                      </span>
                    )}
                  </div>
                )}

                {details?.director && (
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-cinema-violet" />
                    <span>Dir. {details.director}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {detailsError && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <span>Movie details could not be loaded: {detailsError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRetryCount((count) => count + 1)}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Retry
              </Button>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-surface-border">
            <div className="flex flex-wrap items-center gap-3">
              {trailerId && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowTrailer(true)}
                  className="gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Watch Trailer</span>
                </Button>
              )}

              <Button
                variant={bookmarked ? 'secondary' : 'outline'}
                size="md"
                onClick={() => toggleWatchlist(movie)}
                className={cn('gap-2', bookmarked && 'text-cinema-violet border-cinema-violet')}
              >
                <Bookmark className={cn('w-4 h-4', bookmarked && 'fill-current')} />
                <span>{bookmarked ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              title="Share movie"
              aria-label="Share movie"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Overview */}
          <div>
            <h3 className="text-sm font-semibold text-cinema-muted uppercase tracking-wider mb-2">
              Synopsis
            </h3>
            <p className="text-sm sm:text-base text-cinema-text/90 leading-relaxed">
              {details?.overview || movie.overview || 'No synopsis provided.'}
            </p>
          </div>

          {/* Genres Chips */}
          {details?.genres && details.genres.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-cinema-muted uppercase tracking-wider mb-2.5">
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {details.genres.map((g) => (
                  <span
                    key={g.id}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-surface hover:bg-surface-border text-cinema-text border border-surface-border transition-colors"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cast Chips with Avatars */}
          {details?.cast && details.cast.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-cinema-muted uppercase tracking-wider mb-3">
                Key Cast
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {details.cast.map((actor) => (
                  <div
                    key={actor.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-surface border border-surface-border shrink-0 max-w-[200px]"
                  >
                    {actor.profile_url ? (
                      <img
                        src={actor.profile_url}
                        alt={actor.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-xs text-cinema-muted shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-white truncate">
                        {actor.name}
                      </div>
                      <div className="text-[11px] text-cinema-muted truncate">
                        {actor.character}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations Tabs (TF-IDF machine learning vs TMDB genre) */}
          <div className="pt-6 border-t border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('tfidf')}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all',
                    activeTab === 'tfidf'
                      ? 'bg-cinema-violet text-white shadow-glow-violet'
                      : 'text-cinema-muted hover:text-white bg-surface'
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI TF-IDF Similar</span>
                </button>

                <button
                  onClick={() => setActiveTab('genre')}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all',
                    activeTab === 'genre'
                      ? 'bg-cinema-violet text-white shadow-glow-violet'
                      : 'text-cinema-muted hover:text-white bg-surface'
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Genre Discoveries</span>
                </button>
              </div>

              <span className="text-[11px] text-cinema-muted hidden sm:inline">
                {activeTab === 'tfidf'
                  ? 'Calculated from 45,000+ local movie metadata vectors'
                  : 'Curated by movie genre'}
              </span>
            </div>

            {recommendationsError ? (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <span>Recommendations could not be loaded: {recommendationsError}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRetryCount((count) => count + 1)}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Retry
                </Button>
              </div>
            ) : loadingRecs ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
                ))}
              </div>
            ) : activeTab === 'tfidf' ? (
              tfidfCards.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {tfidfCards.slice(0, 8).map((recMovie) => (
                    <MovieCard
                      key={recMovie.tmdb_id}
                      movie={recMovie}
                      onSelect={handleSelectRelated}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-cinema-muted py-4 text-center">
                  No local TF-IDF recommendations found for this title.
                </p>
              )
            ) : genreRecs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {genreRecs.slice(0, 8).map((recMovie) => (
                  <MovieCard
                    key={recMovie.tmdb_id}
                    movie={recMovie}
                    onSelect={handleSelectRelated}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-cinema-muted py-4 text-center">
                No genre-matched movies available.
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
