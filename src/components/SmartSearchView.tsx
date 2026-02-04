import { useState } from 'react';
import { ArrowLeft, Home, Info, X, Plus } from 'lucide-react';
import { Profile } from '../types';
import { tmdbFetch, getTMDBImageUrl, EMBED_PROVIDERS } from '../lib/tmdb';
import { addToWatchlist, isInWatchlist, removeFromWatchlist } from '../lib/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';

interface SmartSearchViewProps {
  profile: Profile;
  onBack: () => void;
  onGoHome: () => void;
  onShowDetail: (tmdbId: number, mediaType: 'movie' | 'tv') => void;
  cloakModeEnabled: boolean;
}

export function SmartSearchView({ profile, onBack, onGoHome, onShowDetail, cloakModeEnabled }: SmartSearchViewProps) {
  const [idInput, setIdInput] = useState('');
  const [selectedServer, setSelectedServer] = useState('vidsrc');
  const [mediaInfo, setMediaInfo] = useState<any>(null);
  const [playerUrl, setPlayerUrl] = useState('');
  const [showTutorial, setShowTutorial] = useState(true);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!idInput.trim()) {
      toast({ title: 'Please enter an ID', variant: 'destructive' });
      return;
    }

    try {
      const input = idInput.trim();
      let tmdbId: number | null = null;
      let imdbId: string | null = null;
      let mediaType: 'movie' | 'tv' = 'movie';
      let season = 1;
      let episode = 1;

      // Parse input: can be IMDB (tt1234567) or TMDB (1234567) or with season/episode
      if (input.startsWith('tt')) {
        // IMDB ID
        const parts = input.split('-');
        imdbId = parts[0];
        
        // Check if TV show with season/episode
        if (parts.length === 3) {
          mediaType = 'tv';
          season = parseInt(parts[1]) || 1;
          episode = parseInt(parts[2]) || 1;
        }

        // Find TMDB ID from IMDB
        const findResult = await tmdbFetch(`/find/${imdbId}?external_source=imdb_id`);
        if (findResult.movie_results?.length > 0) {
          tmdbId = findResult.movie_results[0].id;
          mediaType = 'movie';
        } else if (findResult.tv_results?.length > 0) {
          tmdbId = findResult.tv_results[0].id;
          mediaType = 'tv';
        }
      } else {
        // TMDB ID
        const parts = input.split('-');
        tmdbId = parseInt(parts[0]);
        
        if (parts.length === 3) {
          mediaType = 'tv';
          season = parseInt(parts[1]) || 1;
          episode = parseInt(parts[2]) || 1;
        }
      }

      if (!tmdbId) {
        toast({ title: 'Could not find content', description: 'Please check your ID', variant: 'destructive' });
        return;
      }

      // Fetch media details
      const details = await tmdbFetch(`/${mediaType}/${tmdbId}`);
      setMediaInfo({ ...details, media_type: mediaType, season, episode, imdbId });

      // Generate player URL
      let url = '';
      if (selectedServer === 'godriveplayer' && imdbId && mediaType === 'movie') {
        url = `https://godriveplayer.com/player.php?imdb=${imdbId}`;
      } else if (selectedServer === 'godriveplayer' && mediaType === 'tv') {
        url = `https://godriveplayer.com/player.php?type=series&tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      } else {
        const provider = EMBED_PROVIDERS[selectedServer as keyof typeof EMBED_PROVIDERS];
        if (provider) {
          url = provider(mediaType, tmdbId, season, episode);
        }
      }

      setPlayerUrl(url);
      setShowTutorial(false);
    } catch (error) {
      console.error('Smart search error:', error);
      toast({ title: 'Search failed', description: 'Please try again', variant: 'destructive' });
    }
  };

  const handleAddToWatchlist = () => {
    if (!mediaInfo) return;

    const item = {
      id: `${Date.now()}`,
      profile_id: profile.id,
      tmdb_id: mediaInfo.id,
      media_type: mediaInfo.media_type,
      title: mediaInfo.title || mediaInfo.name,
      poster_path: mediaInfo.poster_path,
      created_at: new Date().toISOString(),
    };

    if (isInWatchlist(profile.id, mediaInfo.id)) {
      removeFromWatchlist(profile.id, mediaInfo.id);
      toast({ title: 'Removed from watchlist' });
    } else {
      addToWatchlist(item);
      toast({ title: 'Added to watchlist' });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 glass-header">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:text-blue-400">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onGoHome} className="text-white hover:text-blue-400">
              <Home className="w-5 h-5" />
            </Button>
          </div>
          <h1 className={`text-lg font-semibold text-white ${cloakModeEnabled ? 'opacity-0' : ''}`}>
            Smart Search by <span className="text-blue-500">Simpl</span>Stream <span className="text-xs text-gray-400">BETA</span>
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="pt-20 px-4 pb-8">
        {/* Description */}
        <div className="max-w-4xl mx-auto mb-6">
          <p className="text-sm text-gray-400 text-center">
            Enter an IMDB or TMDB ID to watch any movie or TV show directly. No more searching!
          </p>
        </div>

        {/* Tutorial */}
        {showTutorial && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-gray-900 border border-blue-500/30 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2 text-white">
                <Info className="w-4 h-4 text-blue-500" />
                How to use Smart Search
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowTutorial(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ol className="space-y-2 text-sm text-gray-300">
              <li><strong className="text-blue-400">For Movies:</strong> Go to imdb.com → Search movie → Copy ID from URL (e.g., tt0816692)</li>
              <li><strong className="text-blue-400">For TV Shows:</strong> Copy ID and add season/episode (e.g., tt0816692-1-5 for S1E5)</li>
              <li><strong className="text-blue-400">Using TMDB:</strong> Go to themoviedb.org → Copy ID from URL (e.g., 1184918)</li>
              <li><strong className="text-blue-400">TV with TMDB:</strong> Add season/episode (e.g., 1184918-1-5)</li>
            </ol>
          </div>
        )}

        {/* Search Input */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter IMDB (tt1234567) or TMDB (1234567) ID..."
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-gray-900 border-blue-500/30 text-white placeholder:text-gray-500"
            />
            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-blue-500/30 rounded-md text-sm text-white"
            >
              <option value="vidsrc">Vidsrc</option>
              <option value="vidlink">VidLink</option>
              <option value="111movies">111Movies</option>
              <option value="videasy">Videasy</option>
              <option value="vidfast">VidFast</option>
              <option value="godriveplayer">GoDrivePlayer</option>
            </select>
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">Search</Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            {/* Player - centered and smaller */}
            <div className="w-full max-w-4xl">
              {playerUrl ? (
                <div className="relative w-full rounded-lg overflow-hidden shadow-xl" style={{ paddingTop: '42%' }}>
                  <iframe
                    src={playerUrl}
                    className="absolute top-0 left-0 w-full h-full border-2 border-blue-500/30"
                    allowFullScreen
                    allow="autoplay; fullscreen; picture-in-picture"
                  />
                </div>
              ) : (
                <div className="w-full rounded-lg border-2 border-blue-500/30 bg-gray-900 flex items-center justify-center" style={{ paddingTop: '42%', position: 'relative' }}>
                  <p className="text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">Enter an ID to start watching</p>
                </div>
              )}
            </div>

            {/* Media Info */}
            {mediaInfo && (
              <div className="w-full max-w-2xl bg-gray-900 border border-blue-500/30 rounded-lg p-6">
                <div className="flex gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={getTMDBImageUrl(mediaInfo.poster_path, 'w342')}
                      alt={mediaInfo.title || mediaInfo.name}
                      className="w-32 rounded-lg"
                    />
                    <button
                      onClick={() => setMediaInfo(null)}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2 text-white">{mediaInfo.title || mediaInfo.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded font-semibold">
                        {mediaInfo.media_type === 'movie' ? 'Movie' : `TV ${mediaInfo.season && mediaInfo.episode ? `S${mediaInfo.season}E${mediaInfo.episode}` : ''}`}
                      </span>
                      {mediaInfo.vote_average && (
                        <span className="text-sm text-yellow-400 font-semibold">
                          ⭐ {mediaInfo.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                      {mediaInfo.overview}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddToWatchlist}
                        className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {isInWatchlist(profile.id, mediaInfo.id) ? 'Remove' : 'Watchlist'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onShowDetail(mediaInfo.id, mediaInfo.media_type)}
                        className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10"
                      >
                        <Info className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
