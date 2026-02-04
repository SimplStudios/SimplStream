import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Sparkles, Snowflake, Heart, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { tmdbFetch, getTMDBImageUrl } from '../lib/tmdb';

interface SeasonalTestViewProps {
  onBack: () => void;
  onShowDetail: (id: number, type: 'movie' | 'tv') => void;
}

export function SeasonalTestView({ onBack, onShowDetail }: SeasonalTestViewProps) {
  const { effectiveTheme } = useTheme();
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  const textClass = effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900';

  const seasons = {
    halloween: {
      title: '🎃 Halloween Special',
      description: "It's the Halloween season, and you know what's SPOOKY? Not having something to watch! We got you covered with a few picks from our SimplStream Team.",
      items: [
        { id: 14836, title: 'Coraline', year: '2009', poster: '/4jeFXQYytChdZYE9JYO7Un87IlW.jpg' },
        { id: 620, title: 'Ghostbusters', year: '1984', poster: '/3FS3oBdrgfBXNNEMWB3m6CmMFyQ.jpg' },
        { id: 9479, title: 'The Nightmare Before Christmas', year: '1993', poster: '/aEUMAoGvZHt16fF7Uh8ULxWzPLv.jpg' }
      ],
      gradient: 'from-orange-600 via-purple-600 to-black',
      icon: <Sparkles className="w-8 h-8" />
    },
    christmas: {
      title: '🎄 Christmas Magic',
      description: 'Ahh, tis the season. The smell of hot cocoa and Christmas trees. Why not lay down and watch some of our festive movie lineup from our SimplStream Team?',
      items: [
        { id: 771, title: 'Home Alone', year: '1990', poster: '/onTSipZ8R3bliBdKfPtsDuHTdlL.jpg' },
        { id: 8871, title: 'How the Grinch Stole Christmas', year: '2000', poster: '/1TiO4N6OhFfYJGJXy25EwYMC6O7.jpg' },
        { id: 5255, title: 'The Polar Express', year: '2004', poster: '/aqjKHvM8zpHtSJhfx81JHfPD8U5.jpg' },
        { id: 508965, title: 'Klaus', year: '2019', poster: '/q125RHUDgR4gjwh1QkfYuJLYkL3.jpg' }
      ],
      gradient: 'from-red-600 via-green-600 to-emerald-700',
      icon: <Snowflake className="w-8 h-8" />
    },
    valentines: {
      title: '💕 Valentine\'s Romance',
      description: 'Love is in the air, and you know what that brings? Movie nights with your loved ones! We got you covered with our lineup of romantic picks from our SimplStream Team.',
      items: [
        { id: 4523, title: 'Enchanted', year: '2007', poster: '/fXFJSRbjKhKHQwwNhZXjqfNpJtd.jpg' },
        { id: 10681, title: 'WALL-E', year: '2008', poster: '/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg' },
        { id: 2493, title: 'The Princess Bride', year: '1987', poster: '/gpxjoE0yvRwIhFEJgNArtKtaN7S.jpg' }
      ],
      gradient: 'from-pink-500 via-rose-500 to-red-600',
      icon: <Heart className="w-8 h-8" />
    },
    summer: {
      title: '☀️ Summer Vibes',
      description: "It's summer! No more school, lots of sun, and most importantly... Lots to watch! Here are some peak recommendations for the summer from our SimplStream Team.",
      items: [
        { id: 12, title: 'Finding Nemo', year: '2003', poster: '/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg' },
        { id: 277834, title: 'Moana', year: '2016', poster: '/4JeejGugONWpJkbnvL12hVoYEDa.jpg' },
        { id: 862, title: 'Toy Story', year: '1995', poster: '/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg' }
      ],
      gradient: 'from-sky-500 via-amber-400 to-emerald-500',
      icon: <Sun className="w-8 h-8" />
    }
  };

  // Ensure poster paths are fresh when a season is opened
  const [postersById, setPostersById] = useState<Record<number, string>>({});
  useEffect(() => {
    if (!selectedSeason) return;
    const items = seasons[selectedSeason as keyof typeof seasons].items;
    (async () => {
      try {
        const details = await Promise.all(items.map((it) => tmdbFetch(`/movie/${it.id}`)));
        const next: Record<number, string> = { ...postersById };
        details.forEach((d, idx) => {
          const posterPath = (d as any)?.poster_path;
          if (posterPath) next[items[idx].id] = posterPath;
        });
        setPostersById(next);
      } catch (e) {
        // ignore
      }
    })();
  }, [selectedSeason]);

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
        <div className="max-w-6xl mx-auto">
          <h1 className={`text-5xl font-bold text-center mb-4 ${textClass}`}>🎭 Seasonal Pop-ups Test</h1>
          <p className={`text-xl text-center mb-12 ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Preview all seasonal pop-ups here
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(seasons).map(([key, season]) => (
              <button
                key={key}
                onClick={() => setSelectedSeason(key)}
                className={`p-[2px] rounded-2xl bg-gradient-to-r ${season.gradient} hover:scale-105 transition-transform`}
              >
                <div className={`${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-[1rem] p-6`}>
                  <div className="flex items-center gap-3 mb-3">
                    {season.icon}
                    <h2 className="text-2xl font-bold">{season.title}</h2>
                  </div>
                  <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {season.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Season Modal */}
      {selectedSeason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className={`p-[3px] rounded-2xl bg-gradient-to-r ${seasons[selectedSeason as keyof typeof seasons].gradient} max-w-3xl w-full`}>
            <div className={`${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-[1rem] p-8 max-h-[80vh] overflow-y-auto`}>
              <div className="flex items-center gap-3 mb-3">
                {seasons[selectedSeason as keyof typeof seasons].icon}
                <h2 className="text-3xl font-bold">{seasons[selectedSeason as keyof typeof seasons].title}</h2>
              </div>
              <p className={`text-lg mb-6 ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {seasons[selectedSeason as keyof typeof seasons].description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {seasons[selectedSeason as keyof typeof seasons].items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedSeason(null);
                      onShowDetail(item.id, 'movie');
                    }}
                    className={`${effectiveTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-xl group`}
                  >
                    <div className="relative">
                      <img
                        src={getTMDBImageUrl(postersById[item.id] || item.poster, 'w342')}
                        alt={item.title}
                        className="w-full aspect-[2/3] object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" fill="white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-sm line-clamp-2">{item.title}</p>
                      <p className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.year}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className={`text-center text-sm mb-4 ${effectiveTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                <span className="text-blue-500 font-bold">Simpl</span>Stream
              </div>

              <button
                onClick={() => setSelectedSeason(null)}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
