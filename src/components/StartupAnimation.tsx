import { useEffect, useState } from 'react';

export function StartupAnimation({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const [showSimpl, setShowSimpl] = useState(false);
  const [showStream, setShowStream] = useState(false);
  const [showSlogan, setShowSlogan] = useState(false);

  useEffect(() => {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioCtx();
    if (audioContext.state === 'suspended' && audioContext.resume) {
      audioContext.resume().catch(() => {});
    }

    const playBeep = (frequency: number, delay: number, duration: number, volume: number = 0.15) => {
      setTimeout(() => {
        try {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';
          const now = audioContext.currentTime;
          gainNode.gain.setValueAtTime(volume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
          oscillator.start(now);
          oscillator.stop(now + duration);
        } catch (e) {
          console.log('Audio playback skipped');
        }
      }, delay);
    };

    // Removed harmony to keep the tone soft and simple
    // (playBeep handles single tones only)


    // Startup sound: low, mid, rest, high (long) - synced with animation (~1.4s total)
    playBeep(300, 0, 0.12, 0.08);             // Low (0ms) - synced with "Simpl"
    playBeep(450, 300, 0.12, 0.08);           // Mid (300ms)
    // Rest (500ms - 900ms)
    playBeep(700, 900, 0.5, 0.08);            // High (long) (900ms) - synced with "Stream"


    const t1 = setTimeout(() => setShowSimpl(true), 0);       // 0.0s
    const t2 = setTimeout(() => setShowStream(true), 900);    // 0.9s
    const t3 = setTimeout(() => setShowSlogan(true), 1500);   // 1.5s
    const fadeTimer = setTimeout(() => setVisible(false), 3300); // 3.3s
    const completeTimer = setTimeout(onComplete, 4000);          // 4.0s

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>

      <div className="relative z-10 text-center">
        <h1 className="text-6xl sm:text-8xl 4k:text-[12rem] font-bold mb-4 4k:mb-8">
          {showSimpl && <span className="text-blue-500 inline-block animate-fade-in">Simpl</span>}
          {showStream && <span className="text-white inline-block animate-fade-in">Stream</span>}
        </h1>
        {showSlogan && (
          <p className="text-gray-300 text-base sm:text-xl 4k:text-4xl animate-fade-in">
            It's not just streaming - It's SimplStream.
          </p>
        )}
      </div>
    </div>
  );
}
