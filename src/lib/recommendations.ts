import { Profile } from '../types';
import { getWatchlist, getWatchHistory, getRatings } from './storage';
import { tmdbFetch } from './tmdb';

export async function generateRecommendations(profile: Profile): Promise<any[]> {
  const watchlist = getWatchlist(profile.id);
  const watchHistory = getWatchHistory(profile.id);
  const ratings = getRatings(profile.id);

  const genreMap = new Map<number, number>();
  const seenIds = new Set<number>();

  watchlist.forEach(item => {
    if (item.tmdb_id) seenIds.add(item.tmdb_id);
  });

  watchHistory.forEach(item => {
    if (item.tmdb_id) seenIds.add(item.tmdb_id);
  });

  ratings.forEach(rating => {
    if (rating.genres && Array.isArray(rating.genres)) {
      rating.genres.forEach((genre: any) => {
        genreMap.set(genre.id, (genreMap.get(genre.id) || 0) + rating.rating);
      });
    }
  });

  const topGenres = Array.from(genreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genreId]) => genreId);

  try {

    const [trendingMovies, trendingShows, popularMovies, popularShows] = await Promise.all([
      tmdbFetch('/trending/movie/week'),
      tmdbFetch('/trending/tv/week'),
      tmdbFetch('/movie/popular'),
      tmdbFetch('/tv/popular')
    ]);

    const allContent = [
      ...(trendingMovies.results || []).map((item: any) => ({ ...item, media_type: 'movie' })),
      ...(trendingShows.results || []).map((item: any) => ({ ...item, media_type: 'tv' })),
      ...(popularMovies.results || []).map((item: any) => ({ ...item, media_type: 'movie' })),
      ...(popularShows.results || []).map((item: any) => ({ ...item, media_type: 'tv' }))
    ];

    const scored = allContent
      .filter(item => !seenIds.has(item.id))
      .map(item => {
        let score = 0;

        if (item.genre_ids && Array.isArray(item.genre_ids)) {
          item.genre_ids.forEach((genreId: number) => {
            if (topGenres.includes(genreId)) {
              score += 10;
            }
          });
        }

        score += (item.vote_average || 0) * 2;
        score += (item.popularity || 0) / 100;

        return { ...item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return scored;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}
