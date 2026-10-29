import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-surface-border bg-surface/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cinema-gradient flex items-center justify-center shadow-glow-violet">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wider text-white">
                CINE<span className="text-cinema-violet">VA</span>
              </span>
              <p className="text-xs text-cinema-muted mt-0.5">
                Cinematic discovery powered by TF-IDF Content Embeddings & TMDB
              </p>
            </div>
          </div>

          <div className="text-xs text-cinema-muted flex flex-col md:items-end gap-1 text-center md:text-right">
            <div>
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </div>
            <div className="flex items-center justify-center md:justify-end gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-cinema-magenta fill-cinema-magenta" /> for film lovers
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

