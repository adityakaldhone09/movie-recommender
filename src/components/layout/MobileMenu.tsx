import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Compass, Bookmark, X, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  watchlistCount: number;
}

export function MobileMenu({
  isOpen,
  onClose,
  activeTab,
  onNavigate,
  watchlistCount,
}: MobileMenuProps) {
  const navItems = [
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed inset-y-0 right-0 w-3/4 max-w-sm bg-surface-elevated border-l border-surface-border p-6 flex flex-col justify-between shadow-2xl z-10"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cinema-gradient flex items-center justify-center shadow-glow-violet">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold text-lg tracking-wider text-white">
                    CINE<span className="text-cinema-violet">VA</span>
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-cinema-muted hover:text-white rounded-lg hover:bg-white/5"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-8 flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl text-left font-medium transition-all text-base',
                        isActive
                          ? 'bg-cinema-violet/15 text-cinema-violet border border-cinema-violet/30'
                          : 'text-cinema-muted hover:text-white hover:bg-white/5'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cinema-violet text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-surface-border text-xs text-cinema-muted">
              Powered by TMDB and Local TF-IDF Vector Space Machine Learning Engine.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

