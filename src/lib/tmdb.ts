const TMDB_KEY = '335a2d8a6455213ca6201aba18056860';
const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function tmdbFetch(path: string, params?: Record<string, string | number>) {
  let url = `${TMDB_BASE}${path}${path.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}&language=en-US`;
  
  // Append additional query parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url += `&${key}=${encodeURIComponent(String(value))}`;
    });
  }
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('TMDB error ' + res.status);
  return res.json();
}

export function getTMDBImageUrl(path: string | null, size: string = 'w780'): string {
  if (!path) return '/placeholder.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export const EMBED_PROVIDERS = {
  vidsrc: (type: string, tmdbId: number, season?: number, episode?: number) => {
    if (type === 'movie') return `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`;
    if (type === 'tv') return `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
    return '';
  },
  vidlink: (type: string, tmdbId: number, season?: number, episode?: number) => {
    if (type === 'movie') return `https://vidlink.pro/movie/${tmdbId}`;
    if (type === 'tv') return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
    return '';
  },
  '111movies': (type: string, tmdbId: number, season?: number, episode?: number) => {
    if (type === 'movie') return `https://111movies.com/movie/${tmdbId}`;
    if (type === 'tv') return `https://111movies.com/tv/${tmdbId}/${season}/${episode}`;
    return '';
  },
  videasy: (type: string, tmdbId: number, season?: number, episode?: number) => {
    if (type === 'movie') return `https://player.videasy.net/movie/${tmdbId}?color=3B82F6`;
    if (type === 'tv') return `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}?color=3B82F6`;
    return '';
  },
  vidfast: (type: string, tmdbId: number, season?: number, episode?: number) => {
    if (type === 'movie') return `https://vidfast.pro/movie/${tmdbId}?theme=2980B9&autoPlay=true`;
    if (type === 'tv') return `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}?theme=2980B9&autoPlay=true&nextButton=true`;
    return '';
  }
};

// GoDrivePlayer API implementation
export async function getGoDrivePlayerUrl(type: 'movie' | 'tv', tmdbId: number, season?: number, episode?: number): Promise<string> {
  console.log('[GoDrivePlayer] Generating URL for:', { type, tmdbId, season, episode });
  
  if (type === 'tv') {
    // For TV shows: https://godriveplayer.com/player.php?type=series&tmdb={id}&season={season}&episode={episode}
    const url = `https://godriveplayer.com/player.php?type=series&tmdb=${tmdbId}&season=${season}&episode=${episode}`;
    console.log('[GoDrivePlayer] TV URL:', url);
    return url;
  }
  
  // For movies: https://godriveplayer.com/player.php?imdb={id}
  // Need to fetch IMDB ID from TMDB
  try {
    console.log('[GoDrivePlayer] Fetching IMDB ID for movie TMDB:', tmdbId);
    const details = await tmdbFetch(`/movie/${tmdbId}`);
    const imdbId = details.imdb_id;
    
    if (!imdbId) {
      console.error('[GoDrivePlayer] No IMDB ID found');
      throw new Error('IMDB ID not available');
    }
    
    const url = `https://godriveplayer.com/player.php?imdb=${imdbId}`;
    console.log('[GoDrivePlayer] Movie URL:', url);
    return url;
  } catch (error) {
    console.error('[GoDrivePlayer] Error:', error);
    throw new Error('GoDrivePlayer unavailable for this content');
  }
}
