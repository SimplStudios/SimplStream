import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Play, Plus, X, Clock } from 'lucide-react';
import { Profile, TMDBMovie, TMDBShow } from '../types';
import { tmdbFetch, getTMDBImageUrl } from '../lib/tmdb';
import { useTheme } from '../context/ThemeContext';
import { isInWatchlist, addToWatchlist, removeFromWatchlist, generateId, addSearchHistory, getSearchHistory, getSearchHistoryEnabled } from '../lib/storage';

interface SearchViewProps {
  profile: Profile;
  onBack: () => void;
  onShowDetail: (id: number, type: 'movie' | 'tv') => void;
}

export function SearchView({ profile, onBack, onShowDetail }: SearchViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(TMDBMovie | TMDBShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { effectiveTheme } = useTheme();

  const textClass = effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900';
  const searchHistoryEnabled = getSearchHistoryEnabled(profile.id);
  const searchHistory = searchHistoryEnabled ? getSearchHistory(profile.id) : [];

  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => searchContent(), 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  async function searchContent() {
    setLoading(true);
    setShowHistory(false);
    try {
      const results = await tmdbFetch(`/search/multi?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(results.results?.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv') || []);
      
      // Save to search history if enabled
      if (searchHistoryEnabled && searchQuery.trim()) {
        addSearchHistory(profile.id, searchQuery.trim());
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToWatchlist(item: TMDBMovie | TMDBShow, type: 'movie' | 'tv') {
    const watchlistItem = {
      id: generateId(),
      profile_id: profile.id,
      tmdb_id: item.id,
      media_type: type,
      title: 'title' in item ? item.title : item.name,
      poster_path: item.poster_path || undefined,
      created_at: new Date().toISOString()
    };
    addToWatchlist(watchlistItem);
  }

  function handleRemoveFromWatchlist(tmdbId: number) {
    removeFromWatchlist(profile.id, tmdbId);
  }

  const getTitle = (item: any) => item.title || item.name;
  const getYear = (item: any) => (item.release_date || item.first_air_date)?.slice(0, 4) || '';

  return (
    <div className={`min-h-screen ${effectiveTheme === 'dark' ? 'bg-black' : 'bg-gray-50'} ${textClass}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 ${effectiveTheme === 'dark' ? 'glass-header' : 'glass-header-light'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`flex items-center gap-2 ${textClass} hover:text-blue-400 transition-colors`}
            >
              <ArrowLeft size={24} />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowHistory(true)}
                placeholder="Search movies and TV shows..."
                className={`w-full pl-12 pr-4 py-3 rounded-lg ${
                  effectiveTheme === 'dark' ? 'bg-gray-800/90 text-white' : 'bg-gray-100/90 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                autoFocus
              />
              {showHistory && searchHistory.length > 0 && !searchQuery && (
                <div className={`absolute top-full left-0 right-0 mt-2 ${effectiveTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl border ${effectiveTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'} max-h-60 overflow-y-auto z-10`}>
                  {searchHistory.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => { setSearchQuery(query); setShowHistory(false); }}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 ${effectiveTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    >
                      <Clock size={16} className="text-gray-400" />
                      <span className="flex-1">{query}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-32 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

      {/* Results */}
      {!loading && searchQuery && searchResults.length === 0 && (
        <div className="text-center py-12">
          <p className={`text-xl mb-4 ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No results found for "{searchQuery}"
          </p>
          <p className={`text-sm mb-4 ${effectiveTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Want to try our <span className="text-blue-500 font-semibold">Smart Search</span> feature?
          </p>
          <button
            onClick={() => (window as any).navigateToSmartSearch?.()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Smart Search
          </button>
        </div>
      )}

          {!loading && !searchQuery && (
            <div className="text-center py-12">
              <Search size={64} className={`mx-auto mb-4 ${effectiveTheme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={`text-xl ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Start typing to search for movies and TV shows
              </p>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>
                Search Results ({searchResults.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.map((item: any) => {
                  const mediaType = item.media_type === 'movie' ? 'movie' : 'tv';
                  const inList = isInWatchlist(profile.id, item.id);

                  return (
                    <div key={item.id} className="group relative">
                      <button
                        onClick={() => onShowDetail(item.id, mediaType)}
                        className={`w-full ${
                          effectiveTheme === 'dark' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50 border border-gray-200'
                        } rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-xl`}
                      >
                        <div className="relative aspect-[2/3]">
                          <img
                            src={getTMDBImageUrl(item.poster_path, 'w342')}
                            alt={getTitle(item)}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play size={48} className="text-white" fill="white" />
                          </div>
                        </div>
                        <div className="p-3">
                          <p className={`font-bold text-sm line-clamp-2 ${textClass}`}>{getTitle(item)}</p>
                          <p className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {getYear(item)} • {mediaType === 'movie' ? 'Movie' : 'TV'}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (inList) {
                            handleRemoveFromWatchlist(item.id);
                          } else {
                            handleAddToWatchlist(item, mediaType);
                          }
                        }}
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full ${
                          inList ? 'bg-blue-600' : 'bg-black/50'
                        } text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110`}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
