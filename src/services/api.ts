import {
  MovieCardData,
  MovieDetailsData,
  SearchBundleResponse,
  Genre,
  DiscoverFilters,
} from '../types/movie';

// Reads configured Render backend URL from Vite environment variables (VITE_API_BASE_URL)
// Defaults to empty string for local development proxy or same-origin serving
const RAW_API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';
export const API_BASE = RAW_API_BASE.trim().replace(/\/+$/, '');

// Default timeout (45s) accommodates Render free-tier cold starts
const DEFAULT_TIMEOUT_MS = 45000;

class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Robust JSON fetch wrapper with timeout, CORS header support, and helpful cold-start error messages.
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options?.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorDetail = `HTTP ${res.status}`;
      try {
        const errorJson = await res.json();
        if (errorJson && (errorJson.detail || errorJson.message)) {
          errorDetail = errorJson.detail || errorJson.message;
        }
      } catch {
        // Body was not JSON
      }
      throw new ApiError(`Request failed: ${errorDetail}`, res.status);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new ApiError(
        'Request timed out. The backend server might be starting up (Render cold boot) — please retry in a few seconds.',
        408
      );
    }
    if (err instanceof ApiError) {
      throw err;
    }
    // Network errors (e.g. CORS block, server down, DNS failure)
    throw new ApiError(
      `Unable to connect to API server (${url}). Please verify the backend is running.`,
      0
    );
  }
}

export async function checkBackendHealth(): Promise<{ status: string; models_loaded?: boolean }> {
  try {
    return await apiFetch<{ status: string; models_loaded?: boolean }>('/health');
  } catch (err) {
    console.warn('Backend health check warning:', err);
    return { status: 'unreachable', models_loaded: false };
  }
}

export async function fetchHomeFeed(
  category = 'popular',
  limit = 24
): Promise<MovieCardData[]> {
  return apiFetch<MovieCardData[]>(
    `/home?category=${encodeURIComponent(category)}&limit=${limit}`
  );
}

export async function fetchMovieDetails(tmdbId: number): Promise<MovieDetailsData> {
  return apiFetch<MovieDetailsData>(`/movie/id/${tmdbId}`);
}

export async function fetchGenres(): Promise<Genre[]> {
  try {
    const genres = await apiFetch<Genre[]>('/genres');
    return Array.isArray(genres) ? genres : [];
  } catch (err) {
    console.error('Error fetching genres:', err);
    return [];
  }
}

export async function searchMoviesTmdb(
  query: string,
  page = 1
): Promise<{ results: any[]; total_results?: number }> {
  return apiFetch<{ results: any[]; total_results?: number }>(
    `/tmdb/search?query=${encodeURIComponent(query)}&page=${page}`
  );
}

export async function fetchSearchBundle(
  query: string,
  tfidfTopN = 12,
  genreLimit = 12
): Promise<SearchBundleResponse> {
  return apiFetch<SearchBundleResponse>(
    `/movie/search?query=${encodeURIComponent(query)}&tfidf_top_n=${tfidfTopN}&genre_limit=${genreLimit}`
  );
}

export async function fetchDiscoverMovies(
  filters: Partial<DiscoverFilters>,
  limit = 24,
  page = 1
): Promise<MovieCardData[]> {
  const params = new URLSearchParams();
  if (filters.genres && filters.genres.length > 0) {
    params.set('genres', filters.genres.join(','));
  }
  if (filters.minRating && filters.minRating > 0) {
    params.set('min_rating', filters.minRating.toString());
  }
  if (filters.minYear && filters.minYear > 1900) {
    params.set('min_year', filters.minYear.toString());
  }
  if (filters.maxYear && filters.maxYear < 2030) {
    params.set('max_year', filters.maxYear.toString());
  }
  if (filters.sortBy) {
    params.set('sort_by', filters.sortBy);
  }
  if (filters.mood) {
    params.set('mood', filters.mood);
  }
  params.set('limit', limit.toString());
  params.set('page', page.toString());

  return apiFetch<MovieCardData[]>(`/discover?${params.toString()}`);
}
