import React from 'react';
import { Star } from 'lucide-react';

interface RatingSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function RatingSlider({ value, onChange }: RatingSliderProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <label htmlFor="rating-slider" className="font-bold uppercase tracking-wider text-cinema-muted">
          Minimum Rating
        </label>
        <span className="flex items-center gap-1 font-bold text-cinema-gold">
          <Star className="w-3.5 h-3.5 fill-cinema-gold" />
          {value === 0 ? 'Any rating' : `${value.toFixed(1)} / 10`}
        </span>
      </div>

      <div className="relative pt-1">
        <input
          id="rating-slider"
          type="range"
          min="0"
          max="9"
          step="0.5"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full"
          aria-valuemin={0}
          aria-valuemax={9}
          aria-valuenow={value}
          aria-valuetext={value === 0 ? 'Any rating' : `${value.toFixed(1)} out of 10`}
        />
        <div className="flex justify-between text-[10px] text-cinema-muted mt-1">
          <span>All</span>
          <span>6.0+</span>
          <span>7.0+</span>
          <span>8.0+</span>
          <span>9.0</span>
        </div>
      </div>
    </div>
  );
}

