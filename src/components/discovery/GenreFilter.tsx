import React from 'react';
import { motion } from 'framer-motion';
import { Genre } from '../../types/movie';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface GenreFilterProps {
  genres: Genre[];
  selectedGenres: number[];
  onChange: (genreIds: number[]) => void;
}

export function GenreFilter({ genres, selectedGenres, onChange }: GenreFilterProps) {
  const toggleGenre = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      onChange(selectedGenres.filter((id) => id !== genreId));
    } else {
      onChange([...selectedGenres, genreId]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-cinema-muted">
          Genres {selectedGenres.length > 0 && `(${selectedGenres.length})`}
        </label>
        {selectedGenres.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-cinema-violet hover:underline"
          >
            Reset genres
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {genres.map((g) => {
          const isSelected = selectedGenres.includes(g.id);
          return (
            <motion.button
              key={g.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => toggleGenre(g.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 outline-none select-none border',
                isSelected
                  ? 'bg-cinema-gradient text-white border-transparent shadow-glow-violet'
                  : 'bg-surface-elevated text-cinema-muted border-surface-border hover:border-white/20 hover:text-white'
              )}
            >
              {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
              <span>{g.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

