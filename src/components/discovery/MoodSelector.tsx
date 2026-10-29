import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  desc: string;
}

export const MOODS: MoodOption[] = [
  { id: 'mind-bending', label: 'Mind-Bending', emoji: '🌀', desc: 'Sci-Fi & Mystery' },
  { id: 'feel-good', label: 'Feel-Good', emoji: '✨', desc: 'Comedy & Uplifting' },
  { id: 'dark-intense', label: 'Dark & Intense', emoji: '🌑', desc: 'Crime & Psychological' },
  { id: 'romantic', label: 'Romantic', emoji: '❤️', desc: 'Romance & Heartfelt' },
  { id: 'thrilling', label: 'Thrilling', emoji: '⚡', desc: 'Action & Suspense' },
  { id: 'inspirational', label: 'Inspirational', emoji: '🌅', desc: 'Biopic & Triumph' },
  { id: 'family-night', label: 'Family Night', emoji: '🍿', desc: 'Animation & Fun' },
  { id: 'sci-fi-adventure', label: 'Sci-Fi Odyssey', emoji: '🚀', desc: 'Futuristic Worlds' },
];

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (moodId: string | null) => void;
}

export function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-cinema-muted">
          Cinematic Vibe / Mood
        </label>
        {selectedMood && (
          <button
            onClick={() => onSelectMood(null)}
            className="text-xs text-cinema-violet hover:underline"
          >
            Clear mood
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <motion.button
              key={mood.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectMood(isSelected ? null : mood.id)}
              className={cn(
                'flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 outline-none select-none',
                isSelected
                  ? 'bg-cinema-violet/20 border-cinema-violet shadow-glow-violet text-white'
                  : 'bg-surface-elevated/70 border-surface-border text-cinema-muted hover:border-white/20 hover:text-cinema-text hover:bg-surface-elevated'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{mood.emoji}</span>
                <span className="text-xs font-bold text-white">{mood.label}</span>
              </div>
              <span className="text-[10px] text-cinema-muted">
                {mood.desc}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

