import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { Watchlist } from './pages/Watchlist';
import { MovieDetailsModal } from './components/movie/MovieDetailsModal';
import { MovieCardData } from './types/movie';
import { fetchMovieDetails, getApiErrorMessage } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedMovie, setSelectedMovie] = useState<MovieCardData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deepLinkError, setDeepLinkError] = useState<string | null>(null);
  const [deepLinkRetryCount, setDeepLinkRetryCount] = useState(0);

  // Sync URL query params on initial load (supports ?view=discover / ?view=watchlist / ?id=123)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const idParam = params.get('id');

    if (viewParam && ['home', 'discover', 'watchlist'].includes(viewParam)) {
      setActiveTab(viewParam);
    }

    if (idParam) {
      const tmdbId = parseInt(idParam, 10);
      if (!isNaN(tmdbId)) {
        setDeepLinkError(null);
        fetchMovieDetails(tmdbId)
          .then((data) => {
            setSelectedMovie({
              tmdb_id: data.tmdb_id,
              title: data.title,
              poster_url: data.poster_url,
              backdrop_url: data.backdrop_url,
              release_date: data.release_date,
              vote_average: data.vote_average,
              overview: data.overview,
            });
            setIsModalOpen(true);
          })
          .catch((error: unknown) => {
            console.error('Failed to load movie from shared link:', error);
            setDeepLinkError(
              getApiErrorMessage(error, 'Could not load this movie. Please retry.')
            );
          });
      }
    }

    // Keyboard shortcut '/' to navigate to discover
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setActiveTab('discover');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deepLinkRetryCount]);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setDeepLinkError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update query param
    const url = new URL(window.location.href);
    url.searchParams.set('view', tab);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url.toString());
  };

  const handleSelectMovie = (movie: MovieCardData) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);

    // Update query param
    const url = new URL(window.location.href);
    url.searchParams.set('id', movie.tmdb_id.toString());
    window.history.pushState({}, '', url.toString());
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);

    // Remove id from query param
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url.toString());
  };

  return (
    <ToastProvider>
      <WatchlistProvider>
        <div className="min-h-screen flex flex-col bg-background text-cinema-text selection:bg-cinema-violet selection:text-white">
          {/* Navigation Bar */}
          <Navbar
            activeTab={activeTab}
            onNavigate={handleNavigate}
            onSearchClick={() => handleNavigate('discover')}
          />

          {/* Active View */}
          <main className="flex-1">
            {deepLinkError && (
              <div
                role="alert"
                className="max-w-7xl mx-auto mt-24 px-4 sm:px-6 lg:px-8"
              >
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span>Could not open this movie: {deepLinkError}</span>
                  <button
                    type="button"
                    onClick={() => setDeepLinkRetryCount((count) => count + 1)}
                    className="rounded-lg border border-rose-300/40 px-3 py-1.5 hover:bg-rose-500/20"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'home' && (
              <Home
                onSelectMovie={handleSelectMovie}
                onNavigateToDiscover={() => handleNavigate('discover')}
              />
            )}
            {activeTab === 'discover' && (
              <Discover onSelectMovie={handleSelectMovie} />
            )}
            {activeTab === 'watchlist' && (
              <Watchlist
                onSelectMovie={handleSelectMovie}
                onNavigateToDiscover={() => handleNavigate('discover')}
              />
            )}
          </main>

          {/* Footer */}
          <Footer />

          {/* Cinematic Movie Details Modal */}
          <MovieDetailsModal
            movie={selectedMovie}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSelectMovie={handleSelectMovie}
          />
        </div>
      </WatchlistProvider>
    </ToastProvider>
  );
}

export default App;
