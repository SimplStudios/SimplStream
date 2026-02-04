export interface Profile {
  id: string;
  name: string;
  avatar_color: string;
  pin: string | null;
  security_word: string | null;
  ads_removed: boolean;
  created_at: string;
  first_login?: boolean;
  seasonal_shown?: string;
}

export interface WatchHistory {
  id: string;
  profile_id: string;
  tmdb_id?: number;
  media_type: 'movie' | 'tv' | 'live';
  title: string;
  poster_path?: string;
  season?: number;
  episode?: number;
  position: number;
  duration: number;
  last_watched: string;
  created_at: string;
}

export interface Rating {
  id: string;
  profile_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  rating: number;
  genres: Genre[];
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  profile_id: string;
  tmdb_id?: number;
  media_type: 'movie' | 'tv' | 'live';
  title: string;
  poster_path?: string;
  embed_url?: string;
  created_at: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  genres?: Genre[];
  popularity: number;
}

export interface TMDBShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  genres?: Genre[];
  popularity: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface TMDBDetail extends TMDBMovie, TMDBShow {
  runtime?: number;
  videos?: {
    results: TMDBVideo[];
  };
  credits?: {
    cast: CastMember[];
  };
  external_ids?: {
    imdb_id?: string;
  };
  content_ratings?: {
    results: Array<{ iso_3166_1: string; rating: string }>;
  };
}

export interface TMDBVideo {
  key: string;
  site: string;
  type: string;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  vote_average: number;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  episodes?: Episode[];
}

export interface LiveChannel {
  name: string;
  embed: string;
  category: string;
  channelNumber: number;
}

export type ViewType = 'profiles' | 'home' | 'detail' | 'player';
