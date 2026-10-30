import {
  MovieCardData,
  MovieDetailsData,
  SearchBundleResponse,
  Genre,
  DiscoverFilters,
  TFIDFRecItem,
} from '../types/movie';

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE = RAW_API_BASE.trim().replace(/\/+$/, '');

const DEFAULT_TIMEOUT_MS = 45000;

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function normalizeMovieCard(value: unknown): MovieCardData | null {
  if (
    !isRecord(value) ||
    typeof value.tmdb_id !== 'number' ||
    typeof value.title !== 'string'
  ) {
    return null;
  }
  return {
    tmdb_id: value.tmdb_id,
    title: value.title,
    poster_url: nullableString(value.poster_url),
    backdrop_url: nullableString(value.backdrop_url),
    release_date: nullableString(value.release_date),
    vote_average: nullableNumber(value.vote_average),
    overview: nullableString(value.overview),
    genre_ids: Array.isArray(value.genre_ids)
      ? value.genre_ids.filter((id): id is number => typeof id === 'number')
      : undefined,
    match_score: nullableNumber(value.match_score) ?? undefined,
  };
}

function parseMovieCards(data: unknown): MovieCardData[] {
  if (!Array.isArray(data)) {
    throw new ApiError('The movie service returned an invalid movie list.', 502);
  }
  return data.flatMap((item) => {
    const movie = normalizeMovieCard(item);
    return movie ? [movie] : [];
  });
}

function normalizeMovieDetails(value: unknown): MovieDetailsData | null {
  if (
    !isRecord(value) ||
    typeof value.tmdb_id !== 'number' ||
    typeof value.title !== 'string'
  ) {
    return null;
  }
  const genres = Array.isArray(value.genres)
    ? value.genres.flatMap((genre) =>
        isRecord(genre) &&
        typeof genre.id === 'number' &&
        typeof genre.name === 'string'
          ? [{ id: genre.id, name: genre.name }]
          : []
      )
    : [];
  const cast = Array.isArray(value.cast)
    ? value.cast.flatMap((member) =>
        isRecord(member) && typeof member.id === 'number'
          ? [{
              id: member.id,
              name: typeof member.name === 'string' ? member.name : '',
              character:
                typeof member.character === 'string' ? member.character : '',
              profile_url: nullableString(member.profile_url),
            }]
          : []
      )
    : [];
  return {
    tmdb_id: value.tmdb_id,
    title: value.title,
    overview: nullableString(value.overview),
    release_date: nullableString(value.release_date),
    poster_url: nullableString(value.poster_url),
    backdrop_url: nullableString(value.backdrop_url),
    genres,
    runtime: nullableNumber(value.runtime),
    vote_average: nullableNumber(value.vote_average),
    vote_count: nullableNumber(value.vote_count),
    tagline: nullableString(value.tagline),
    trailer_url: nullableString(value.trailer_url),
    director: nullableString(value.director),
    cast,
  };
}

function normalizeTFIDFRecItem(value: unknown): TFIDFRecItem | null {
  if (
    !isRecord(value) ||
    typeof value.title !== 'string' ||
    typeof value.score !== 'number'
  ) {
    return null;
  }
  return {
    title: value.title,
    score: value.score,
    tmdb: normalizeMovieCard(value.tmdb),
  };
}

function normalizeSearchBundle(value: unknown): SearchBundleResponse | null {
  if (
    !isRecord(value) ||
    typeof value.query !== 'string' ||
    !Array.isArray(value.tfidf_recommendations) ||
    !Array.isArray(value.genre_recommendations)
  ) {
    return null;
  }
  const movieDetails = normalizeMovieDetails(value.movie_details);
  if (!movieDetails) return null;
  return {
    query: value.query,
    movie_details: movieDetails,
    tfidf_recommendations: value.tfidf_recommendations.flatMap((item) => {
      const recommendation = normalizeTFIDFRecItem(item);
      return recommendation ? [recommendation] : [];
    }),
    genre_recommendations: value.genre_recommendations.flatMap((movie) => {
      const normalized = normalizeMovieCard(movie);
      return normalized ? [normalized] : [];
    }),
  };
}

function responseErrorDetail(body: unknown): string | undefined {
  if (!isRecord(body)) return undefined;
  const detail = body.detail ?? body.message;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const firstMessage = detail.find(
      (item) => isRecord(item) && typeof item.msg === 'string'
    );
    if (isRecord(firstMessage) && typeof firstMessage.msg === 'string') {
      return firstMessage.msg;
    }
  }
  return undefined;
}

function statusMessage(status: number, detail?: string): string {
  const suffix = detail ? ` ${detail}` : '';
  if (status === 404) return `Movie or endpoint not found.${suffix}`;
  if (status === 422) return `The request was not accepted. Check the title or filters.${suffix}`;
  if (status >= 500) return `The movie service encountered an error (HTTP ${status}). Please retry.${suffix}`;
  return `The movie service returned HTTP ${status}.${suffix}`;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (!API_BASE && import.meta.env.PROD) {
    throw new ApiError(
      'VITE_API_BASE_URL is not configured. Set it to the Render API URL in the Vercel project settings.',
      0
    );
  }

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

    const bodyText = await res.text();
    if (!res.ok) {
      let body: unknown;
      try {
        body = JSON.parse(bodyText);
      } catch {
        body = undefined;
      }
      throw new ApiError(
        statusMessage(res.status, responseErrorDetail(body)),
        res.status
      );
    }

    try {
      return JSON.parse(bodyText) as T;
    } catch {
      throw new ApiError('The movie service returned invalid JSON. Please retry.', 502);
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'The request timed out. The Render service may be waking up; please retry in a few seconds.',
        408
      );
    }
    if (error instanceof TypeError) {
      throw new ApiError(
        'Unable to reach the movie service. Check the connection and backend CORS settings, then retry.',
        0
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkBackendHealth(): Promise<{
  status: string;
  models_loaded?: boolean;
}> {
  return apiFetch<{ status: string; models_loaded?: boolean }>('/health');
}

export async function fetchHomeFeed(
  category = 'popular',
  limit = 24
): Promise<MovieCardData[]> {
  const data = await apiFetch<unknown>(
    `/home?category=${encodeURIComponent(category)}&limit=${limit}`
  );
  return parseMovieCards(data);
}

export async function fetchMovieDetails(tmdbId: number): Promise<MovieDetailsData> {
  const data = await apiFetch<unknown>(`/movie/id/${tmdbId}`);
  const details = normalizeMovieDetails(data);
  if (!details) {
    throw new ApiError('The movie service returned invalid movie details.', 502);
  }
  return details;
}

export async function fetchGenres(): Promise<Genre[]> {
  const data = await apiFetch<unknown>('/genres');
  if (!Array.isArray(data)) {
    throw new ApiError('The movie service returned an invalid genre list.', 502);
  }
  return data.filter(
    (genre): genre is Genre =>
      isRecord(genre) &&
      typeof genre.id === 'number' &&
      typeof genre.name === 'string'
  );
}

export async function searchMoviesTmdb(
  query: string,
  page = 1
): Promise<{ results: MovieCardData[]; total_results?: number }> {
  const data = await apiFetch<unknown>(
    `/tmdb/search?query=${encodeURIComponent(query)}&page=${page}`
  );
  if (!isRecord(data) || !Array.isArray(data.results)) {
    throw new ApiError('The movie service returned an invalid search response.', 502);
  }

  const results = data.results.flatMap((item): MovieCardData[] => {
    if (!isRecord(item) || typeof item.id !== 'number') return [];
    const posterPath =
      typeof item.poster_path === 'string' ? item.poster_path : null;
    const backdropPath =
      typeof item.backdrop_path === 'string' ? item.backdrop_path : null;
    return [{
      tmdb_id: item.id,
      title:
        (typeof item.title === 'string' && item.title) ||
        (typeof item.name === 'string' && item.name) ||
        'Untitled',
      poster_url: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null,
      backdrop_url: backdropPath
        ? `https://image.tmdb.org/t/p/w500${backdropPath}`
        : null,
      release_date:
        typeof item.release_date === 'string' ? item.release_date : null,
      vote_average:
        typeof item.vote_average === 'number' ? item.vote_average : null,
      overview: typeof item.overview === 'string' ? item.overview : null,
    }];
  });

  return {
    results,
    total_results:
      typeof data.total_results === 'number' ? data.total_results : undefined,
  };
}

export async function fetchSearchBundle(
  query: string,
  tfidfTopN = 12,
  genreLimit = 12
): Promise<SearchBundleResponse> {
  const data = await apiFetch<unknown>(
    `/movie/search?query=${encodeURIComponent(query)}&tfidf_top_n=${tfidfTopN}&genre_limit=${genreLimit}`
  );
  const bundle = normalizeSearchBundle(data);
  if (!bundle) {
    throw new ApiError('The movie service returned an invalid recommendations response.', 502);
  }
  return bundle;
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

  const data = await apiFetch<unknown>(`/discover?${params.toString()}`);
  return parseMovieCards(data);
}
