import { MovieCardData } from '../types/movie';

const WATCHLIST_STORAGE_KEY = 'cineva_watchlist_v1';

export function getStoredWatchlist(): MovieCardData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read watchlist from localStorage:', e);
    return [];
  }
}

export function saveStoredWatchlist(movies: MovieCardData[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(movies));
    return true;
  } catch (e) {
    console.error('Failed to save watchlist to localStorage:', e);
    return false;
  }
}

