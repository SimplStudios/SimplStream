import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Plus, Star, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Profile, TMDBDetail } from '../types';
import { tmdbFetch, getTMDBImageUrl } from '../lib/tmdb';
import { getRating, saveRating, isInWatchlist, addToWatchlist, removeFromWatchlist, generateId } from '../lib/storage';
import { formatDuration } from '../lib/formatDuration';

interface DetailViewProps {
  profile: Profile;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  onBack: () => void;
  onPlay: (tmdbId: number, mediaType: 'movie' | 'tv', season?: number, episode?: number) => void;
  onShowCast: (castId: number) => void;
  onGoHome: () => void;
  onShowDetail?: (id: number, type: 'movie' | 'tv') => void;
}

export function DetailView({ profile, tmdbId, mediaType, onBack, onPlay, onShowCast, onGoHome, onShowDetail }: DetailViewProps) {
  const [detail, setDetail] = useState<TMDBDetail | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [similar, setSimilar] = useState<any[]>([]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState<any>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const { effectiveTheme } = useTheme();

  useEffect(() => {
    loadDetail();
    loadUserRating();
    loadSimilar();
    checkWatchlist();
  }, [tmdbId, mediaType]);

  useEffect(() => {
    if (mediaType === 'tv' && detail) {
      loadSeasonDetails();
    }
  }, [selectedSeason, detail]);

  async function loadDetail() {
    try {
      const data = await tmdbFetch(`/${mediaType}/${tmdbId}?append_to_response=videos,credits`);
      setDetail(data);
    } catch (error) {
      console.error('Error loading detail:', error);
    }
  }

  function loadUserRating() {
    try {
      const rating = getRating(profile.id, tmdbId, mediaType);
      if (rating) {
        setUserRating(rating.rating);
      }
    } catch (error) {
      console.error('Error loading rating:', error);
    }
  }

  async function loadSimilar() {
    try {
      const data = await tmdbFetch(`/${mediaType}/${tmdbId}/similar`);
      setSimilar(data.results?.slice(0, 10) || []);
    } catch (error) {
      console.error('Error loading similar:', error);
    }
  }

  async function loadSeasonDetails() {
    try {
      const data = await tmdbFetch(`/tv/${tmdbId}/season/${selectedSeason}`);
      setSeasonDetails(data);
    } catch (error) {
      console.error('Error loading season details:', error);
    }
  }

  function checkWatchlist() {
    try {
      setInWatchlist(isInWatchlist(profile.id, tmdbId));
    } catch (error) {
      console.error('Error checking watchlist:', error);
    }
  }

  function handleRating(rating: number) {
    try {
      saveRating({
        id: generateId(),
        profile_id: profile.id,
        tmdb_id: tmdbId,
        media_type: mediaType,
        rating,
        genres: detail?.genres || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setUserRating(rating);
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  }

  function toggleWatchlist() {
    try {
      if (inWatchlist) {
        removeFromWatchlist(profile.id, tmdbId);
        setInWatchlist(false);
      } else {
        addToWatchlist({
          id: generateId(),
          profile_id: profile.id,
          tmdb_id: tmdbId,
          media_type: mediaType,
          title: detail?.title || detail?.name || '',
          poster_path: detail?.poster_path || undefined,
          created_at: new Date().toISOString()
        });
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const title = detail.title || detail.name;
  const releaseDate = detail.release_date || detail.first_air_date;
  const trailer = detail.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const bgClass = effectiveTheme === 'dark' ? 'bg-black' : 'bg-gray-50';
  const textClass = effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      {/* Header - positioned relatively on mobile for scrolling */}
      <div className={`sticky top-0 left-0 right-0 z-50 ${effectiveTheme === 'dark' ? 'glass-header' : 'glass-header-light'}`}>
        <div className="w-full px-4 sm:px-6 2k:px-8 4k:px-12 py-2 sm:py-3 2k:py-4 4k:py-6 flex items-center justify-between">
          <button onClick={onBack} className={`flex items-center gap-2 4k:gap-4 ${textClass} hover:text-blue-400 transition-all hover:scale-105`}>
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 2k:w-8 2k:h-8 4k:w-12 4k:h-12" />
            <span className="font-medium text-sm sm:text-base 2k:text-lg 4k:text-4xl">Back</span>
          </button>
          <button onClick={onGoHome} className="logo-text text-base sm:text-xl 2k:text-2xl 4k:text-5xl hover:opacity-80 transition-opacity">
            <span className="text-blue-500">Simpl</span><span className={textClass}>Stream</span>
          </button>
        </div>
      </div>

      <div className="">
        {/* Hero Section - Mobile optimized height */}
        <div className="relative w-full aspect-[16/10] sm:aspect-video max-h-[70vh] sm:max-h-[85vh] overflow-visible">
          <div className="absolute inset-0">
            <img 
              src={getTMDBImageUrl(detail.backdrop_path, 'original')} 
              alt={title}
              className="w-full h-full object-cover object-center sm:object-top"
            />
            <div className={`absolute inset-0 ${effectiveTheme === 'dark' ? 'hero-gradient-dark' : 'hero-gradient-light'}`}></div>
          </div>
          
          {/* Mobile: Content positioned outside hero for scrolling */}
          <div className="relative z-10 h-full hidden sm:flex items-end pb-16 sm:pb-20 w-full px-6 sm:px-10 lg:px-16">
            <div className="flex flex-col md:flex-row gap-8 items-end md:items-end w-full animate-slide-up">
              {/* Poster */}
              <div className="hidden lg:block flex-shrink-0">
                <div className="w-48 xl:w-56 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                  <img 
                    src={getTMDBImageUrl(detail.poster_path, 'w500')} 
                    alt={title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1 max-w-4xl">
                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {detail.genres?.slice(0, 4).map((genre: any) => (
                    <span key={genre.id} className={`px-3 py-1 text-xs font-semibold rounded-full ${effectiveTheme === 'dark' ? 'bg-white/10 text-white/90' : 'bg-black/10 text-black/90'} backdrop-blur-sm`}>
                      {genre.name}
                    </span>
                  ))}
                </div>
                
                <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-none ${textClass}`}>{title}</h1>
                
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 mb-5 text-sm sm:text-base">
                  {releaseDate && (
                    <span className={`${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                      {releaseDate.slice(0, 4)}
                    </span>
                  )}
                  {detail.vote_average > 0 && (
                    <div className="flex items-center gap-1.5 bg-yellow-500/20 px-3 py-1 rounded-full">
                      <Star size={16} fill="#FFD700" className="text-yellow-500" />
                      <span className="font-bold text-yellow-500">{detail.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                  {detail.runtime && (
                    <span className={`${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatDuration(detail.runtime)}
                    </span>
                  )}
                  {mediaType === 'tv' && detail.number_of_seasons && (
                    <span className={`${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {detail.number_of_seasons} Season{detail.number_of_seasons > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                <p className={`text-base sm:text-lg mb-6 line-clamp-3 leading-relaxed ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {detail.overview}
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button 
                    onClick={() => onPlay(tmdbId, mediaType, selectedSeason, selectedEpisode)} 
                    className="btn-primary flex items-center gap-2 text-sm sm:text-base"
                  >
                    <Play size={20} fill="currentColor" /> Start Watching
                  </button>
                  {trailer && (
                    <button 
                      onClick={() => setShowTrailer(true)} 
                      className="btn-secondary flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Play size={20} /> Watch Trailer
                    </button>
                  )}
                  <button 
                    onClick={toggleWatchlist} 
                    className="btn-secondary flex items-center gap-2 text-sm sm:text-base"
                  >
                    {inWatchlist ? <X size={20} /> : <Plus size={20} />}
                    {inWatchlist ? 'Remove' : 'My List'}
                  </button>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Rate this:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        onClick={() => handleRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star 
                          size={24} 
                          fill={star <= userRating ? '#FFD700' : 'none'} 
                          className={star <= userRating ? 'text-yellow-500' : 'text-gray-500'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom fade */}
          <div className={`absolute bottom-0 left-0 right-0 h-32 ${effectiveTheme === 'dark' ? 'bg-gradient-to-t from-black to-transparent' : 'bg-gradient-to-t from-gray-50 to-transparent'}`}></div>
        </div>

        {/* Mobile Content Section - Outside hero for proper scrolling */}
        <div className="sm:hidden px-4 py-6 -mt-16 relative z-20">
          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-3">
            {detail.genres?.slice(0, 3).map((genre: any) => (
              <span key={genre.id} className={`px-3 py-1 text-xs font-semibold rounded-full ${effectiveTheme === 'dark' ? 'bg-white/10 text-white/90' : 'bg-black/10 text-black/90'}`}>
                {genre.name}
              </span>
            ))}
          </div>
          
          <h1 className={`text-2xl font-black mb-3 tracking-tight leading-tight ${textClass}`}>{title}</h1>
          
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            {releaseDate && (
              <span className={`${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                {releaseDate.slice(0, 4)}
              </span>
            )}
            {detail.vote_average > 0 && (
              <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                <Star size={14} fill="#FFD700" className="text-yellow-500" />
                <span className="font-bold text-yellow-500 text-sm">{detail.vote_average.toFixed(1)}</span>
              </div>
            )}
            {detail.runtime && (
              <span className={`${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {formatDuration(detail.runtime)}
              </span>
            )}
            {mediaType === 'tv' && detail.number_of_seasons && (
              <span className={`${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {detail.number_of_seasons} Season{detail.number_of_seasons > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <p className={`text-sm mb-5 leading-relaxed ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {detail.overview}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mb-5">
            <button 
              onClick={() => onPlay(tmdbId, mediaType, selectedSeason, selectedEpisode)} 
              className="btn-primary flex items-center justify-center gap-2 text-base w-full py-3"
            >
              <Play size={20} fill="currentColor" /> Start Watching
            </button>
            <div className="flex gap-2">
              {trailer && (
                <button 
                  onClick={() => setShowTrailer(true)} 
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2.5"
                >
                  <Play size={18} /> Trailer
                </button>
              )}
              <button 
                onClick={toggleWatchlist} 
                className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2.5"
              >
                {inWatchlist ? <X size={18} /> : <Plus size={18} />}
                {inWatchlist ? 'Remove' : 'My List'}
              </button>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Rate:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => handleRating(star)}
                  className="p-0.5"
                >
                  <Star 
                    size={22} 
                    fill={star <= userRating ? '#FFD700' : 'none'} 
                    className={star <= userRating ? 'text-yellow-500' : 'text-gray-500'} 
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 sm:-mt-8 relative z-10">
          {mediaType === 'tv' && detail.number_of_seasons && (
            <div className="mb-14">
              <h2 className="section-title text-xl sm:text-2xl 4k:text-5xl">Episodes</h2>
              <div className="mb-6">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4">
                  {Array.from({ length: detail.number_of_seasons || 1 }, (_, i) => i + 1).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSeason(s)}
                      className={`px-5 sm:px-6 4k:px-12 py-2.5 sm:py-3 4k:py-6 rounded-full font-semibold whitespace-nowrap text-sm sm:text-base 4k:text-3xl transition-all ${
                        selectedSeason === s
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : effectiveTheme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'
                      }`}
                    >
                      Season {s}
                    </button>
                  ))}
                </div>
              </div>
              {seasonDetails && seasonDetails.episodes && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 4k:gap-10">
                  {seasonDetails.episodes.map((episode: any) => (
                    <button
                      key={episode.episode_number}
                      onClick={() => {
                        setSelectedEpisode(episode.episode_number);
                        onPlay(tmdbId, mediaType, selectedSeason, episode.episode_number);
                      }}
                      className={`${effectiveTheme === 'dark' ? 'glass-card hover:bg-white/10' : 'glass-card-light hover:bg-black/5'} overflow-hidden transition-all hover:scale-[1.02] text-left group`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5 4k:p-10">
                        <div className="flex-shrink-0 w-full sm:w-44 4k:w-80 aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 relative">
                          {episode.still_path ? (
                            <img 
                              src={getTMDBImageUrl(episode.still_path, 'w300')} 
                              alt={episode.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play size={32} className="4k:w-24 4k:h-24 text-white/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                              <Play size={24} className="text-white ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2 4k:mb-4">
                            <h3 className={`font-bold text-base sm:text-lg 4k:text-4xl ${textClass} line-clamp-1`}>
                              {episode.episode_number}. {episode.name}
                            </h3>
                            {episode.vote_average > 0 && (
                              <div className="flex items-center gap-1 flex-shrink-0 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                                <Star size={14} className="4k:w-6 4k:h-6 text-yellow-500" fill="#FFD700" />
                                <span className={`text-xs 4k:text-2xl font-bold text-yellow-500`}>{episode.vote_average.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          <p className={`text-sm 4k:text-2xl ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} line-clamp-2 sm:line-clamp-3 leading-relaxed`}>
                            {episode.overview || 'No description available.'}
                          </p>
                          {episode.runtime && (
                            <p className={`text-xs 4k:text-xl ${effectiveTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-3 4k:mt-4 font-medium`}>
                              {episode.runtime} min
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {detail.credits && detail.credits.cast && detail.credits.cast.length > 0 && (
            <div className="mb-14">
              <h2 className="section-title text-xl sm:text-2xl">Cast</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-5">
                {detail.credits.cast.slice(0, 12).map((cast: any) => (
                  <button 
                    key={cast.id} 
                    onClick={() => onShowCast(cast.id)}
                    className="text-center group cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 ring-2 ring-transparent group-hover:ring-blue-500 transition-all shadow-lg">
                      <img 
                        src={getTMDBImageUrl(cast.profile_path, 'w185')} 
                        alt={cast.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <p className={`font-semibold text-sm ${textClass} group-hover:text-blue-500 transition-colors line-clamp-1`}>{cast.name}</p>
                    <p className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'} line-clamp-1`}>{cast.character}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {similar.length > 0 && (
            <div>
              <h2 className="section-title text-xl sm:text-2xl">More Like This</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                {similar.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const itemMediaType = item.media_type || mediaType;
                      if (onShowDetail) {
                        onShowDetail(item.id, itemMediaType);
                      }
                    }}
                    className="poster-card group"
                  >
                    <img 
                      src={getTMDBImageUrl(item.poster_path, 'w342')} 
                      alt={item.title || item.name} 
                      className="w-full aspect-[2/3] object-cover" 
                    />
                    <span className="poster-card-title text-white">{item.title || item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowTrailer(false)}>
          <div className="relative w-full max-w-5xl max-h-[90dvh] bg-black rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <X size={28} />
            </button>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
