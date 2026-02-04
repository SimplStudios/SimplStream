import { useEffect, useState } from 'react';
import { ArrowLeft, Play, Wrench, Beaker, RefreshCw, Database, Settings2, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { StartupAnimation } from './StartupAnimation';

interface DevPlaygroundProps {
  onBack: () => void;
}

export function DevPlayground({ onBack }: DevPlaygroundProps) {
  const { effectiveTheme } = useTheme();
  const textClass = effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900';

  const [showAnim, setShowAnim] = useState(false);
  const [playerUrl, setPlayerUrl] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [storageStatus, setStorageStatus] = useState<string>('Idle');

  useEffect(() => {
    // Cleanup animation overlay if user navigates away
    return () => setShowAnim(false);
  }, []);

  const writeLargeLocalStorage = () => {
    try {
      const oneMB = 'x'.repeat(1024 * 1024);
      localStorage.setItem('devplayground_blob', oneMB);
      setStorageStatus('Wrote ~1MB to localStorage successfully.');
    } catch (e: any) {
      setStorageStatus('Storage write failed: ' + (e?.message || 'unknown'));
    }
  };

  const clearLargeLocalStorage = () => {
    localStorage.removeItem('devplayground_blob');
    setStorageStatus('Cleared test data.');
  };

  return (
    <div className={`min-h-screen ${effectiveTheme === 'dark' ? 'bg-black' : 'bg-gray-50'} ${textClass}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 ${effectiveTheme === 'dark' ? 'glass-header' : 'glass-header-light'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className={`flex items-center gap-2 ${textClass} hover:text-blue-400 transition-colors`}>
            <ArrowLeft size={24} />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Wrench className="text-blue-500" />
            <span className="font-bold">Dev Mode Playground</span>
          </div>
        </div>
      </div>

      <main className="pt-24 px-6 pb-20 max-w-6xl mx-auto space-y-8">
        {/* 1) Startup Animation Replayer */}
        <section className={`${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white border border-gray-200'} rounded-lg p-6 shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="text-blue-500" />
            <h2 className="text-2xl font-bold">Startup Animation</h2>
          </div>
          <p className={effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            Replay the startup animation and sound to validate timing and audio levels.
          </p>
          <div className="mt-4">
            <button onClick={() => setShowAnim(true)} className={`px-4 py-2 rounded-lg font-medium ${effectiveTheme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
              Play animation
            </button>
          </div>
        </section>

        {/* 2) Player Sandbox Tester */}
        <section className={`${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white border border-gray-200'} rounded-lg p-6 shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <Beaker className="text-green-500" />
            <h2 className="text-2xl font-bold">Player Sandbox Tester</h2>
          </div>
          <p className={effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            Paste any embed URL below to test stability on your device.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              className={`${effectiveTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} flex-1 rounded-md px-3 py-2 outline-none`}
              placeholder="https://example.com/embed/..."
              value={playerUrl}
              onChange={(e) => setPlayerUrl(e.target.value)}
            />
            <button onClick={() => setPlayerUrl(playerUrl.trim())} className={`px-4 py-2 rounded-lg font-medium ${effectiveTheme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
              Open
            </button>
          </div>
          {playerUrl && (
            <div className="mt-4 bg-black rounded-lg overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
              <iframe
                key={playerUrl}
                src={playerUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
                allowFullScreen
                referrerPolicy="origin-when-cross-origin"
                title="Sandbox Player"
                loading="eager"
              />
            </div>
          )}
        </section>

        {/* 3) Dialog Stress Test */}
        <section className={`${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white border border-gray-200'} rounded-lg p-6 shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <Settings2 className="text-purple-500" />
            <h2 className="text-2xl font-bold">Dialog Stress Test</h2>
          </div>
          <p className={effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            Opens a long-dialog to confirm overflow, scroll, and close behavior on TVs and mobiles.
          </p>
          <div className="mt-4">
            <button onClick={() => setOpenDialog(true)} className={`px-4 py-2 rounded-lg font-medium ${effectiveTheme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
              Open dialog
            </button>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Overflow Test</DialogTitle>
              </DialogHeader>
              <div className={effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                {Array.from({ length: 40 }).map((_, i) => (
                  <p key={i} className="mb-2">This is line {i + 1} to test vertical overflow and scroll behavior.</p>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* 4) Local Storage Exercise */}
        <section className={`${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-white border border-gray-200'} rounded-lg p-6 shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <Database className="text-orange-500" />
            <h2 className="text-2xl font-bold">Local Storage Exercise</h2>
          </div>
          <p className={effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            Write and clear ~1MB of data to validate storage and performance.
          </p>
          <div className="mt-4 flex gap-2">
            <button onClick={writeLargeLocalStorage} className={`px-4 py-2 rounded-lg font-medium ${effectiveTheme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
              Write 1MB
            </button>
            <button onClick={clearLargeLocalStorage} className={`px-4 py-2 rounded-lg font-medium ${effectiveTheme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
              Clear
            </button>
          </div>
          <p className={`mt-2 text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{storageStatus}</p>
        </section>
      </main>

      {showAnim && <StartupAnimation onComplete={() => setShowAnim(false)} />}
    </div>
  );
}
