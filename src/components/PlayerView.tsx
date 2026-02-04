import { ArrowLeft, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Profile, WatchHistory } from '../types';
import { EMBED_PROVIDERS, tmdbFetch } from '../lib/tmdb';
import { LIVE_CHANNELS } from '../lib/liveChannels';
import { saveHistory, generateId, getPreferredServer, setPreferredServer } from '../lib/storage';

interface PlayerViewProps {
  profile: Profile;
  tmdbId: number;
  mediaType: 'movie' | 'tv' | 'live';
  season?: number;
  episode?: number;
  embedUrl?: string;
  channelName?: string;
  onBack: () => void;
  onPlay: (tmdbId: number, mediaType: 'movie' | 'tv' | 'live', season?: number, episode?: number, embedUrl?: string, channelName?: string) => void;
  onGoHome: () => void;
}

export function PlayerView({ profile, tmdbId, mediaType, season = 1, episode = 1, embedUrl, channelName, onBack, onPlay, onGoHome }: PlayerViewProps) {
  const { effectiveTheme } = useTheme();
  const textClass = effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900';
  const providerOptions = [
    { key: 'vidsrc', label: 'VidSRC', tag: 'Ads', icon: '📺' },
    { key: 'vidlink', label: 'VidLink Pro', tag: 'Ad-Free', icon: '✨' },
    { key: '111movies', label: '111Movies', tag: 'Ad-Free & Fast', icon: '⚡' },
    { key: 'vidfast', label: 'Vidfast', tag: 'Fast & HD', icon: '🚀' },
    { key: 'videasy', label: 'Videasy', tag: 'Ad-Free & Great UI', icon: '🎨' },
  ] as const;

  const [serverKey, setServerKey] = useState<string>(getPreferredServer() || 'vidfast');
  const [playerUrl, setPlayerUrl] = useState<string>('');
  const [playerError, setPlayerError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Update player URL when server or media changes
  useEffect(() => {
    async function updatePlayerUrl() {
      setIsLoading(true);
      setPlayerError('');
      
      try {
        if (mediaType === 'live') {
          setPlayerUrl(embedUrl || '');
        } else {
          const url = EMBED_PROVIDERS[serverKey](mediaType, tmdbId, season, episode);
          setPlayerUrl(url);
        }
      } catch (error) {
        console.error('[PlayerView] Error loading player:', error);
        setPlayerError('Failed to load player. Try another server.');
        setPlayerUrl('');
      } finally {
        setIsLoading(false);
      }
    }
    updatePlayerUrl();
  }, [serverKey, mediaType, tmdbId, season, episode, embedUrl]);

  // Save to watch history when player opens (movies/TV)
  useEffect(() => {
    if (mediaType === 'movie' || mediaType === 'tv') {
      const save = async () => {
        try {
          const detail = await tmdbFetch(`/${mediaType}/${tmdbId}`);
          const history: WatchHistory = {
            id: generateId(),
            profile_id: profile.id,
            tmdb_id: tmdbId,
            media_type: mediaType,
            title: detail.title || detail.name,
            poster_path: detail.poster_path || undefined,
            season: mediaType === 'tv' ? season : undefined,
            episode: mediaType === 'tv' ? episode : undefined,
            position: 0,
            duration: 0,
            last_watched: new Date().toISOString(),
            created_at: new Date().toISOString(),
          };
          saveHistory(history);
        } catch (e) {
          console.error('Failed to save history', e);
        }
      };
      save();
    }
  }, [mediaType, tmdbId, season, episode, profile.id]);

  function handlePreviousEpisode() {
    if (mediaType === 'tv') {
      const prevEpisode = episode - 1;
      if (prevEpisode >= 1) {
        onPlay(tmdbId, mediaType, season, prevEpisode);
      } else if (season > 1) {
        // Go to last episode of previous season (assuming 20 episodes per season as default)
        onPlay(tmdbId, mediaType, season - 1, 20);
      }
    }
  }

  function handleNextEpisode() {
    if (mediaType === 'tv') {
      onPlay(tmdbId, mediaType, season, episode + 1);
    }
  }

  function handlePreviousChannel() {
    if (mediaType === 'live') {
      const currentChannelIndex = LIVE_CHANNELS.findIndex(ch => ch.embed === embedUrl);
      if (currentChannelIndex > 0) {
        const prevChannel = LIVE_CHANNELS[currentChannelIndex - 1];
        onPlay(0, 'live', undefined, undefined, prevChannel.embed, prevChannel.name);
      }
    }
  }

  function handleNextChannel() {
    if (mediaType === 'live') {
      const currentChannelIndex = LIVE_CHANNELS.findIndex(ch => ch.embed === embedUrl);
      if (currentChannelIndex < LIVE_CHANNELS.length - 1) {
        const nextChannel = LIVE_CHANNELS[currentChannelIndex + 1];
        onPlay(0, 'live', undefined, undefined, nextChannel.embed, nextChannel.name);
      }
    }
  }

  return (
    <div className={`min-h-screen ${effectiveTheme === 'dark' ? 'bg-black' : 'bg-gray-50'} ${textClass}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 ${effectiveTheme === 'dark' ? 'glass-header' : 'glass-header-light'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 2k:px-8 4k:px-12 py-2 sm:py-3 2k:py-4 4k:py-6 flex items-center justify-between">
          <button onClick={onBack} className={`flex items-center gap-2 4k:gap-4 ${textClass} hover:text-blue-400 transition-all hover:scale-105`}>
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 2k:w-8 2k:h-8 4k:w-12 4k:h-12" />
            <span className="font-medium text-sm sm:text-base 2k:text-lg 4k:text-4xl">Back</span>
          </button>
          <button onClick={onGoHome} className="flex items-center gap-2 4k:gap-4 text-base sm:text-xl 2k:text-2xl 4k:text-5xl font-bold hover:opacity-80 transition-opacity">
            <Home className="w-5 h-5 sm:w-6 sm:h-6 2k:w-8 2k:h-8 4k:w-12 4k:h-12" />
            <span><span className="text-blue-500">Simpl</span>Stream</span>
          </button>
        </div>
      </div>

      <div className="pt-20 sm:pt-24 2k:pt-28 4k:pt-40 px-2 sm:px-4 lg:px-6 2k:px-8 4k:px-12 pb-8 sm:pb-12">
        <div className="max-w-4xl lg:max-w-5xl 2k:max-w-6xl 4k:max-w-none mx-auto">
          <div className={`bg-black rounded-lg overflow-hidden shadow-2xl mb-6 4k:mb-12 ${effectiveTheme === 'dark' ? 'ring-2 ring-blue-500/50 shadow-blue-500/20' : ''} w-full`} style={{ aspectRatio: '16/9' }}>
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-white text-lg 4k:text-4xl">Loading player...</div>
              </div>
            ) : playerError ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-8">
                <div className="text-red-500 text-lg 4k:text-4xl mb-4">⚠️ {playerError}</div>
                <div className="text-gray-400 text-sm 4k:text-2xl">Select a different server below</div>
              </div>
            ) : (
              <iframe
                key={playerUrl}
                src={playerUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
                allowFullScreen
                referrerPolicy="origin-when-cross-origin"
                title={channelName || 'Video Player'}
                loading="eager"
              />
            )}
          </div>

          {/* Server Selection */}
          {mediaType !== 'live' && (
            <div className="mb-4 4k:mb-8 flex items-center gap-3 4k:gap-6">
              <span className={`text-sm 2k:text-base 4k:text-3xl ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Server:
              </span>
              <select
                value={serverKey}
                onChange={(e) => { setServerKey(e.target.value); setPreferredServer(e.target.value); }}
                className={`px-4 py-2 2k:px-6 2k:py-3 4k:px-12 4k:py-6 text-sm 2k:text-base 4k:text-3xl rounded-lg ${
                  effectiveTheme === 'dark' 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {providerOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.icon} {opt.label} ({opt.tag})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation Controls */}
          {mediaType === 'tv' && (
            <div className="flex items-center justify-center gap-4 4k:gap-8">
              <button
                onClick={handlePreviousEpisode}
                disabled={episode === 1 && season === 1}
                className={`flex items-center gap-2 4k:gap-4 px-6 py-3 4k:px-12 4k:py-6 rounded-lg 4k:rounded-2xl font-medium transition-all ${
                  episode === 1 && season === 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : effectiveTheme === 'dark' 
                      ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-black'
                } text-sm sm:text-base 4k:text-3xl`}
              >
                <ChevronLeft className="w-5 h-5 4k:w-10 4k:h-10" />
                Previous Episode
              </button>
              <button
                onClick={handleNextEpisode}
                className={`flex items-center gap-2 4k:gap-4 px-6 py-3 4k:px-12 4k:py-6 rounded-lg 4k:rounded-2xl font-medium transition-all ${
                  effectiveTheme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } text-sm sm:text-base 4k:text-3xl`}
              >
                Next Episode
                <ChevronRight className="w-5 h-5 4k:w-10 4k:h-10" />
              </button>
            </div>
          )}

          {mediaType === 'live' && (
            <div className="flex items-center justify-center gap-4 4k:gap-8">
              <button
                onClick={handlePreviousChannel}
                className={`flex items-center gap-2 4k:gap-4 px-6 py-3 4k:px-12 4k:py-6 rounded-lg 4k:rounded-2xl font-medium transition-all ${
                  effectiveTheme === 'dark' 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-black'
                } text-sm sm:text-base 4k:text-3xl`}
              >
                <ChevronLeft className="w-5 h-5 4k:w-10 4k:h-10" />
                Previous Channel
              </button>
              <div className={`px-6 py-3 4k:px-12 4k:py-6 ${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white border border-gray-300'} rounded-lg 4k:rounded-2xl text-center text-sm sm:text-base 4k:text-3xl font-bold`}>
                {channelName}
              </div>
              <button
                onClick={handleNextChannel}
                className={`flex items-center gap-2 4k:gap-4 px-6 py-3 4k:px-12 4k:py-6 rounded-lg 4k:rounded-2xl font-medium transition-all ${
                  effectiveTheme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } text-sm sm:text-base 4k:text-3xl`}
              >
                Next Channel
                <ChevronRight className="w-5 h-5 4k:w-10 4k:h-10" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
