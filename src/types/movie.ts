export interface MovieCardData {
  tmdb_id: number;
  title: string;
  poster_url: string | null;
  backdrop_url?: string | null;
  release_date?: string | null;
  vote_average?: number | null;
  overview?: string | null;
  genre_ids?: number[];
  // Match score if returned from TF-IDF
  match_score?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_url: string | null;
}

export interface MovieDetailsData {
  tmdb_id: number;
  title: string;
  overview: string | null;
  release_date: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  genres: Array<{ id: number; name: string }>;
  runtime: number | null;
  vote_average: number | null;
  vote_count: number | null;
  tagline: string | null;
  trailer_url: string | null;
  director: string | null;
  cast: CastMember[];
}

export interface TFIDFRecItem {
  title: string;
  score: number;
  tmdb?: MovieCardData | null;
}

export interface SearchBundleResponse {
  query: string;
  movie_details: MovieDetailsData;
  tfidf_recommendations: TFIDFRecItem[];
  genre_recommendations: MovieCardData[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface DiscoverFilters {
  query?: string;
  genres: number[];
  minRating: number;
  minYear: number;
  maxYear: number;
  mood: string | null;
  sortBy: string;
}

