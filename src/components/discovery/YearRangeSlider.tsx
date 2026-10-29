import React from 'react';
import { Calendar } from 'lucide-react';

interface YearRangeSliderProps {
  minYear: number;
  maxYear: number;
  onChange: (minYear: number, maxYear: number) => void;
}

export function YearRangeSlider({ minYear, maxYear, onChange }: YearRangeSliderProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <label htmlFor="year-slider" className="font-bold uppercase tracking-wider text-cinema-muted flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-cinema-violet" />
          <span>Release Era</span>
        </label>
        <span className="font-bold text-cinema-violet">
          {minYear <= 1970 ? 'All eras' : `${minYear} – ${maxYear}`}
        </span>
      </div>

      <div className="relative pt-1">
        <input
          id="year-slider"
          type="range"
          min="1970"
          max={currentYear}
          step="5"
          value={minYear}
          onChange={(e) => onChange(parseInt(e.target.value, 10), maxYear)}
          className="w-full"
          aria-valuemin={1970}
          aria-valuemax={currentYear}
          aria-valuenow={minYear}
          aria-valuetext={minYear <= 1970 ? 'All eras' : `From ${minYear} to ${maxYear}`}
        />
        <div className="flex justify-between text-[10px] text-cinema-muted mt-1">
          <span>Classic (1970)</span>
          <span>1990s</span>
          <span>2010s</span>
          <span>Modern ({currentYear})</span>
        </div>
      </div>
    </div>
  );
}

