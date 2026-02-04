import { useState } from 'react';
import { ArrowLeft, Tv, Search, Pin, Dice5 } from 'lucide-react';
import { Profile, LiveChannel } from '../types';
import { LIVE_CHANNELS } from '../lib/liveChannels';
import { useTheme } from '../context/ThemeContext';
import { getPinnedChannels, togglePinnedChannel } from '../lib/storage';
import { Input } from './ui/input';

interface LiveTVViewProps {
  profile: Profile;
  onBack: () => void;
  onPlay: (tmdbId: number, mediaType: 'movie' | 'tv' | 'live', season?: number, episode?: number, embedUrl?: string, channelName?: string) => void;
  onGoHome: () => void;
}

export function LiveTVView({ profile, onBack, onPlay, onGoHome }: LiveTVViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const { effectiveTheme } = useTheme();
  const pinnedChannelNames = getPinnedChannels(profile.id);

  const categories = ['All', ...Array.from(new Set(LIVE_CHANNELS.map(c => c.category)))];
  
  const filteredChannels = LIVE_CHANNELS.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.channelNumber.toString().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const pinnedChannels = LIVE_CHANNELS.filter(c => pinnedChannelNames.includes(c.name));
  const textClass = effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900';

  function handleTogglePin(channelName: string) {
    togglePinnedChannel(profile.id, channelName);
    setRefreshKey(prev => prev + 1); // Force re-render instead of page reload
  }

  function handlePickForMe() {
    const randomIndex = Math.floor(Math.random() * LIVE_CHANNELS.length);
    const randomChannel = LIVE_CHANNELS[randomIndex];
    onPlay(0, 'live', undefined, undefined, randomChannel.embed, randomChannel.name);
  }

  return (
    <div className={`min-h-screen ${effectiveTheme === 'dark' ? 'bg-black' : 'bg-gray-50'} ${textClass}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 ${effectiveTheme === 'dark' ? 'glass-header' : 'glass-header-light'}`}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 2k:px-8 4k:px-12 py-2 sm:py-3 2k:py-4 4k:py-6 flex items-center justify-between">
          <button onClick={onBack} className={`flex items-center gap-2 4k:gap-4 ${textClass} hover:text-blue-400 transition-all hover:scale-105`}>
            <ArrowLeft size={20} className="sm:w-6 sm:h-6 2k:w-8 2k:h-8 4k:w-12 4k:h-12" />
            <span className="font-medium text-sm sm:text-base 2k:text-lg 4k:text-4xl">Back</span>
          </button>
          <button onClick={onGoHome} className="text-base sm:text-xl 2k:text-2xl 4k:text-5xl font-bold hover:opacity-80 transition-opacity">
            <span className="text-blue-500">Simpl</span>Stream
          </button>
        </div>
      </div>

      <div className="pt-20 sm:pt-24 2k:pt-28 4k:pt-40 px-4 sm:px-6 2k:px-8 4k:px-12 pb-16 sm:pb-20 2k:pb-24 4k:pb-40">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex items-center justify-between mb-6 4k:mb-12">
            <h1 className={`text-3xl sm:text-4xl 4k:text-8xl font-bold ${textClass}`}>Live TV Channels</h1>
            <button
              onClick={handlePickForMe}
              className={`flex items-center gap-2 4k:gap-4 px-4 py-2 4k:px-8 4k:py-4 rounded-lg 4k:rounded-2xl font-medium transition-all ${
                effectiveTheme === 'dark' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              } text-sm sm:text-base 4k:text-3xl hover:scale-105`}
            >
              <Dice5 className="w-5 h-5 4k:w-10 4k:h-10" />
              Pick For Me
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mb-6 4k:mb-12">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search channels by name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 4k:py-6 4k:text-2xl"
              />
            </div>
          </div>

          {/* Pinned Channels */}
          {pinnedChannels.length > 0 && (
            <div className="mb-8 4k:mb-16">
              <h2 className={`text-xl sm:text-2xl 4k:text-6xl font-bold mb-4 4k:mb-8 ${textClass} flex items-center gap-2`}>
                <Pin size={24} className="4k:w-16 4k:h-16" />
                Pinned Channels
              </h2>
              <div className="4k:hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {pinnedChannels.map((channel: LiveChannel) => (
                  <div key={`pinned-${channel.channelNumber}`} className="relative">
                    <button
                      onClick={() => onPlay(0, 'live', undefined, undefined, channel.embed, channel.name)}
                      className={`w-full group ${effectiveTheme === 'dark' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-lg p-4 sm:p-6 transition-all hover-lift hover:ring-2 hover:ring-blue-500`}
                    >
                      <div className="mb-3">
                        <span className="inline-block bg-blue-600 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 sm:py-2 rounded">
                          CH {channel.channelNumber}
                        </span>
                      </div>
                      <div className={`aspect-video ${effectiveTheme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 to-gray-200'} rounded flex items-center justify-center p-4 mb-3 group-hover:scale-105 transition-transform`}>
                        <Tv size={32} className={textClass} />
                      </div>
                      <p className={`text-sm sm:text-base font-bold text-center mb-1 ${textClass} line-clamp-2`}>{channel.name}</p>
                      <p className={`text-xs sm:text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center`}>{channel.category}</p>
                    </button>
                    <button
                      onClick={() => handleTogglePin(channel.name)}
                      className="absolute top-2 right-2 p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                    >
                      <Pin size={16} className="text-white fill-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex gap-2 4k:gap-4 mb-8 4k:mb-16 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-6 4k:px-12 py-2 4k:py-6 4k:text-3xl rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : effectiveTheme === 'dark' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* All Channels Grid */}
          <h2 className={`text-xl sm:text-2xl 4k:text-6xl font-bold mb-4 4k:mb-8 ${textClass}`}>
            All Channels
          </h2>
          
          {/* Grid view for smaller screens */}
          <div className="4k:hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredChannels.map((channel: LiveChannel) => {
              const isPinned = pinnedChannelNames.includes(channel.name);
              return (
                <div key={channel.channelNumber} className="relative">
                  <button
                    onClick={() => onPlay(0, 'live', undefined, undefined, channel.embed, channel.name)}
                    className={`w-full group ${effectiveTheme === 'dark' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-lg p-4 sm:p-6 transition-all hover-lift hover:ring-2 hover:ring-blue-500`}
                  >
                    <div className="mb-3">
                      <span className="inline-block bg-blue-600 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 sm:py-2 rounded">
                        CH {channel.channelNumber}
                      </span>
                    </div>
                    <div className={`aspect-video ${effectiveTheme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 to-gray-200'} rounded flex items-center justify-center p-4 mb-3 group-hover:scale-105 transition-transform`}>
                      <Tv size={32} className={textClass} />
                    </div>
                    <p className={`text-sm sm:text-base font-bold text-center mb-1 ${textClass} line-clamp-2`}>{channel.name}</p>
                    <p className={`text-xs sm:text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center`}>{channel.category}</p>
                  </button>
                  <button
                    onClick={() => handleTogglePin(channel.name)}
                    className={`absolute top-2 right-2 p-2 ${isPinned ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} rounded-full transition-colors`}
                  >
                    <Pin size={16} className={`text-white ${isPinned ? 'fill-white' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* List view for 4K screens */}
          <div className="hidden 4k:block space-y-4">
            {filteredChannels.map((channel: LiveChannel) => {
              const isPinned = pinnedChannelNames.includes(channel.name);
              return (
                <div key={channel.channelNumber} className="relative">
                  <button
                    onClick={() => onPlay(0, 'live', undefined, undefined, channel.embed, channel.name)}
                    className={`w-full ${effectiveTheme === 'dark' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-2xl p-8 transition-all hover-lift hover:ring-2 hover:ring-blue-500 flex items-center gap-8`}
                  >
                    <div className="flex-shrink-0">
                      <span className="inline-block bg-blue-600 text-white text-3xl font-bold px-8 py-4 rounded-xl">
                        CH {channel.channelNumber}
                      </span>
                    </div>
                    <div className={`flex-shrink-0 w-64 h-36 ${effectiveTheme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 to-gray-200'} rounded-xl flex items-center justify-center`}>
                      <Tv size={96} className={textClass} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-5xl font-bold mb-2 ${textClass}`}>{channel.name}</p>
                      <p className={`text-4xl ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{channel.category}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleTogglePin(channel.name)}
                    className={`absolute top-8 right-8 p-4 ${isPinned ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} rounded-full transition-colors`}
                  >
                    <Pin size={32} className={`text-white ${isPinned ? 'fill-white' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
