import { useState } from 'react';
import { ArrowLeft, Check, Sparkles, Play, Plus, RefreshCw, Search } from 'lucide-react';
import { Profile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { tmdbFetch, getTMDBImageUrl } from '../lib/tmdb';
import { addToWatchlist, isInWatchlist, generateId } from '../lib/storage';

interface SurpriseMeWizardViewProps {
  profile: Profile;
  onBack: () => void;
  onShowDetail: (id: number, type: 'movie' | 'tv') => void;
}

const GENRES = [
  { id: 28, name: 'Action', emoji: '💥' },
  { id: 12, name: 'Adventure', emoji: '🗺️' },
  { id: 16, name: 'Animation', emoji: '🎨' },
  { id: 35, name: 'Comedy', emoji: '😂' },
  { id: 80, name: 'Crime', emoji: '🔫' },
  { id: 99, name: 'Documentary', emoji: '📹' },
  { id: 18, name: 'Drama', emoji: '🎭' },
  { id: 10751, name: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { id: 14, name: 'Fantasy', emoji: '🧙' },
  { id: 36, name: 'History', emoji: '📜' },
  { id: 27, name: 'Horror', emoji: '😱' },
  { id: 10402, name: 'Music', emoji: '🎵' },
  { id: 9648, name: 'Mystery', emoji: '🔍' },
  { id: 10749, name: 'Romance', emoji: '❤️' },
  { id: 878, name: 'Sci-Fi', emoji: '🚀' },
  { id: 10770, name: 'TV Movie', emoji: '📺' },
  { id: 53, name: 'Thriller', emoji: '😨' },
  { id: 10752, name: 'War', emoji: '⚔️' },
  { id: 37, name: 'Western', emoji: '🤠' },
  { id: 10759, name: 'Action & Adventure', emoji: '🎬' }
];

const AGE_RATINGS = [
  { value: 'G', label: 'G', description: 'General Audiences' },
  { value: 'PG', label: 'PG', description: 'Parental Guidance' },
  { value: 'PG-13', label: 'PG-13', description: 'Parents Cautioned' },
  { value: 'R', label: 'R', description: 'Restricted' }
];

export function SurpriseMeWizardView({ profile, onBack, onShowDetail }: SurpriseMeWizardViewProps) {
  const [step, setStep] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'movie' | 'tv' | 'both'>('both');
  const [yearRange, setYearRange] = useState<[number, number]>([1940, new Date().getFullYear()]);
  const [favoriteMovies, setFavoriteMovies] = useState<any[]>([]);
  const [movieInput, setMovieInput] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { effectiveTheme } = useTheme();

  const textClass = effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900';

  function toggleGenre(id: number) {
    setSelectedGenres(prev => {
      if (prev.includes(id)) {
        return prev.filter(g => g !== id);
      } else if (prev.length < 3) {
        return [...prev, id];
      }
      return prev;
    });
  }

  function toggleRating(value: string) {
    setSelectedRatings(prev =>
      prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]
    );
  }

  async function searchMovies() {
    if (!movieInput.trim()) return;
    try {
      const results = await tmdbFetch(`/search/multi?query=${encodeURIComponent(movieInput)}`);
      setSearchResults(results.results?.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 5) || []);
      setShowSearchPopup(true);
    } catch (error) {
      console.error('Error searching:', error);
    }
  }

  function addMovie(movie: any) {
    if (!favoriteMovies.find(m => m.id === movie.id)) {
      setFavoriteMovies([...favoriteMovies, movie]);
      setMovieInput('');
      setShowSearchPopup(false);
      setSearchResults([]);
    }
  }

  function removeMovie(movieId: number) {
    setFavoriteMovies(favoriteMovies.filter(m => m.id !== movieId));
  }

  async function generateRecommendations() {
    setLoading(true);
    try {
      const genreQuery = selectedGenres.join(',');
      const queries: Promise<any>[] = [];

      // Fetch multiple pages for better variety
      if (mediaType === 'movie' || mediaType === 'both') {
        for (let page = 1; page <= 3; page++) {
          queries.push(
            tmdbFetch(`/discover/movie?with_genres=${genreQuery}&primary_release_date.gte=${yearRange[0]}-01-01&primary_release_date.lte=${yearRange[1]}-12-31&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`)
          );
        }
      }
      if (mediaType === 'tv' || mediaType === 'both') {
        for (let page = 1; page <= 3; page++) {
          queries.push(
            tmdbFetch(`/discover/tv?with_genres=${genreQuery}&first_air_date.gte=${yearRange[0]}-01-01&first_air_date.lte=${yearRange[1]}-12-31&sort_by=vote_average.desc&vote_count.gte=50&page=${page}`)
          );
        }
      }

      // Fetch similar movies if user has favorites
      if (favoriteMovies.length > 0) {
        for (const fav of favoriteMovies.slice(0, 2)) {
          queries.push(
            tmdbFetch(`/${fav.media_type}/${fav.id}/recommendations`),
            tmdbFetch(`/${fav.media_type}/${fav.id}/similar`)
          );
        }
      }

      const results = await Promise.all(queries);
      let allResults: any[] = [];

      results.forEach((result, index) => {
        const items = result.results || [];
        const isMovie = mediaType === 'both' ? (index % 2 === 0) : (mediaType === 'movie');
        const type = isMovie ? 'movie' : 'tv';
        
        allResults = allResults.concat(
          items.map((m: any) => ({ 
            ...m, 
            media_type: m.media_type || type,
            score: (m.vote_average || 0) * (m.popularity || 0) / 100
          }))
        );
      });

      // Remove duplicates
      const uniqueResults = allResults.reduce((acc: any[], current) => {
        const exists = acc.find(item => item.id === current.id && item.media_type === current.media_type);
        if (!exists) acc.push(current);
        return acc;
      }, []);

      // Score and sort by relevance
      const scored = uniqueResults
        .map(item => {
          let score = item.score || 0;
          
          // Boost if matches selected genres
          if (item.genre_ids && selectedGenres.length > 0) {
            const matchingGenres = item.genre_ids.filter((g: number) => selectedGenres.includes(g)).length;
            score += matchingGenres * 50;
          }
          
          // Boost if similar to favorites
          if (favoriteMovies.some(fav => fav.genre_ids?.some((g: number) => item.genre_ids?.includes(g)))) {
            score += 30;
          }
          
          return { ...item, finalScore: score };
        })
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, 30);

      if (scored.length === 0) {
        // Show error dialog
        alert("Sorry, we couldn't find any recommendations for you. Try changing some things!");
        setLoading(false);
        return;
      }

      setRecommendations(scored);
      setStep(6);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert("Sorry, we couldn't find any recommendations for you. Try changing some things!");
    } finally {
      setLoading(false);
    }
  }

  function refreshRecommendations() {
    generateRecommendations();
  }

  function handleAddToWatchlist(item: any) {
    const watchlistItem = {
      id: generateId(),
      profile_id: profile.id,
      tmdb_id: item.id,
      media_type: item.media_type,
      title: item.title || item.name,
      poster_path: item.poster_path || undefined,
      created_at: new Date().toISOString()
    };
    addToWatchlist(watchlistItem);
  }

  const getTitle = (item: any) => item.title || item.name;

  return (
    <div className={`min-h-screen ${effectiveTheme === 'dark' ? 'bg-black' : 'bg-gray-50'} ${textClass}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 ${effectiveTheme === 'dark' ? 'glass-header' : 'glass-header-light'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 ${textClass} hover:text-blue-400 transition-colors`}
          >
            <ArrowLeft size={24} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          {step < 6 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      s <= step ? 'bg-blue-600' : effectiveTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Step {step} of 5
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="text-4xl font-bold mb-2">What genres are you feeling? 🎬</h1>
              <p className={`text-lg mb-8 ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Select up to 3 genres
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {GENRES.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`p-4 rounded-lg font-medium transition-all ${
                      selectedGenres.includes(genre.id)
                        ? 'bg-blue-600 text-white scale-105 shadow-lg'
                        : effectiveTheme === 'dark'
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">{genre.emoji}</div>
                    <div className="text-sm">{genre.name}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={selectedGenres.length === 0}
                className="mt-8 w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-4xl font-bold mb-2">Movies, TV shows, or both? 📺</h1>
              <p className={`text-lg mb-8 ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Choose what you want to watch
              </p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'movie', label: 'Movies', emoji: '🎬' },
                  { value: 'tv', label: 'TV Shows', emoji: '📺' },
                  { value: 'both', label: 'Both', emoji: '🍿' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMediaType(option.value as any)}
                    className={`p-6 rounded-lg transition-all ${
                      mediaType === option.value
                        ? 'bg-blue-600 text-white scale-105 shadow-lg'
                        : effectiveTheme === 'dark'
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-4xl mb-2">{option.emoji}</div>
                    <div className="text-base font-medium">{option.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className={`flex-1 px-6 py-4 ${effectiveTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg font-bold text-lg transition-colors`}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-4xl font-bold mb-2">What age ratings? 🎫</h1>
              <p className={`text-lg mb-8 ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Choose all that apply
              </p>

              <div className="grid grid-cols-2 gap-4">
                {AGE_RATINGS.map((rating) => (
                  <button
                    key={rating.value}
                    onClick={() => toggleRating(rating.value)}
                    className={`p-6 rounded-lg transition-all ${
                      selectedRatings.includes(rating.value)
                        ? 'bg-blue-600 text-white scale-105 shadow-lg'
                        : effectiveTheme === 'dark'
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-3xl font-bold mb-2">{rating.label}</div>
                    <div className="text-sm opacity-80">{rating.description}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className={`flex-1 px-6 py-4 ${effectiveTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg font-bold text-lg transition-colors`}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={selectedRatings.length === 0}
                  className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="text-4xl font-bold mb-2">How recent? 📅</h1>
              <p className={`text-lg mb-8 ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Choose your release date range
              </p>

              <div className={`${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-8`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-3xl font-bold">{yearRange[0]}</span>
                  <span className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>to</span>
                  <span className="text-3xl font-bold">{yearRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="1940"
                  max={new Date().getFullYear()}
                  value={yearRange[0]}
                  onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
                  className="w-full mb-4"
                />
                <input
                  type="range"
                  min="1940"
                  max={new Date().getFullYear()}
                  value={yearRange[1]}
                  onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(3)}
                  className={`flex-1 px-6 py-4 ${effectiveTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg font-bold text-lg transition-colors`}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h1 className="text-4xl font-bold mb-2">Favorite movies/shows? 🌟</h1>
              <p className={`text-lg mb-8 ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Add some you love (optional)
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={movieInput}
                  onChange={(e) => setMovieInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchMovies()}
                  placeholder="Search for a movie or show..."
                  className={`flex-1 px-4 py-3 rounded-lg ${
                    effectiveTheme === 'dark'
                      ? 'bg-gray-800 text-white'
                      : 'bg-white border border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  onClick={searchMovies}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Search size={20} />
                  Search
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {favoriteMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className={`px-4 py-2 ${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} rounded-full flex items-center gap-2`}
                  >
                    <span>{movie.title || movie.name}</span>
                    <button
                      onClick={() => removeMovie(movie.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(4)}
                  className={`flex-1 px-6 py-4 ${effectiveTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg font-bold text-lg transition-colors`}
                >
                  Back
                </button>
                <button
                  onClick={generateRecommendations}
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate Recommendations
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Your Custom Picks ✨</h1>
                  <p className={`text-lg ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Based on your preferences
                  </p>
                </div>
                <button
                  onClick={generateRecommendations}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {recommendations.map((item) => (
                  <div key={item.id} className="group">
                    <button
                      onClick={() => onShowDetail(item.id, item.media_type)}
                      className="w-full rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-xl"
                    >
                      <div className="relative">
                        <img
                          src={getTMDBImageUrl(item.poster_path, 'w342')}
                          alt={getTitle(item)}
                          className="w-full aspect-[2/3] object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play size={40} fill="white" className="text-white" />
                        </div>
                      </div>
                    </button>
                    <div className="mt-2 flex items-start gap-2">
                      <p className={`flex-1 text-sm font-medium line-clamp-2 ${textClass}`}>
                        {getTitle(item)}
                      </p>
                      {!isInWatchlist(profile.id, item.id) && (
                        <button
                          onClick={() => handleAddToWatchlist(item)}
                          className="flex-shrink-0 p-1 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                        >
                          <Plus size={16} className="text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setStep(1);
                  setSelectedGenres([]);
                  setSelectedRatings([]);
                  setMediaType('both');
                  setYearRange([1940, new Date().getFullYear()]);
                  setFavoriteMovies([]);
                  setRecommendations([]);
                }}
                className={`mt-8 w-full px-6 py-4 ${effectiveTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg font-bold text-lg transition-colors`}
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Popup */}
      {showSearchPopup && searchResults.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className={`${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${textClass}`}>Select a movie/show</h2>
              <button
                onClick={() => {
                  setShowSearchPopup(false);
                  setSearchResults([]);
                }}
                className={effectiveTheme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addMovie(item)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all hover:scale-105 ${
                    effectiveTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <img
                    src={getTMDBImageUrl(item.poster_path, 'w92')}
                    alt={getTitle(item)}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div className="flex-1 text-left">
                    <p className={`font-bold ${textClass}`}>{getTitle(item)}</p>
                    <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || 'N/A'} • {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                    </p>
                  </div>
                  <Check size={24} className="text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
