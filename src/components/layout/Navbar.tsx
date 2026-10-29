import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Compass, Bookmark, Search, Menu, Sparkles } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';
import { MobileMenu } from './MobileMenu';
import { cn } from '../../utils/cn';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onSearchClick?: () => void;
}

export function Navbar({ activeTab, onNavigate, onSearchClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { count: watchlistCount } = useWatchlist();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Film },
    { id: 'discover', label: 'AI Discover', icon: Compass },
    {
      id: 'watchlist',
      label: 'Watchlist',
      icon: Bookmark,
      badge: watchlistCount > 0 ? watchlistCount : undefined,
    },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'glass-nav py-3 shadow-2xl'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cinema-violet rounded-lg"
          >
            <div className="relative w-9 h-9 rounded-xl bg-cinema-gradient flex items-center justify-center shadow-glow-violet transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-white">
                CINE<span className="text-cinema-violet">VA</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] tracking-widest uppercase font-semibold text-cinema-muted px-1.5 py-0.5 rounded bg-surface-elevated border border-surface-border">
                AI Discovery
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-surface/60 backdrop-blur-md p-1.5 rounded-full border border-white/5 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors select-none outline-none focus-visible:ring-2 focus-visible:ring-cinema-violet',
                    isActive
                      ? 'text-white'
                      : 'text-cinema-muted hover:text-cinema-text hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute inset-0 rounded-full bg-cinema-gradient shadow-glow-violet -z-10"
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span
                      className={cn(
                        'px-1.5 py-0.2 text-[11px] font-bold rounded-full transition-colors',
                        isActive
                          ? 'bg-white text-surface'
                          : 'bg-cinema-violet text-white'
                      )}
                    >
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Search Trigger & Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (onSearchClick) onSearchClick();
                else onNavigate('discover');
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface-elevated/80 hover:bg-surface-elevated border border-surface-border text-cinema-muted hover:text-white transition-all text-xs sm:text-sm group focus-visible:ring-2 focus-visible:ring-cinema-violet"
              title="Search movies"
              aria-label="Search movies"
            >
              <Search className="w-4 h-4 text-cinema-violet group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Search movies...</span>
              <kbd className="hidden lg:inline-block text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-cinema-muted border border-white/5 font-mono">
                /
              </kbd>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl bg-surface-elevated border border-surface-border text-cinema-muted hover:text-white"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        onNavigate={onNavigate}
        watchlistCount={watchlistCount}
      />
    </>
  );
}

