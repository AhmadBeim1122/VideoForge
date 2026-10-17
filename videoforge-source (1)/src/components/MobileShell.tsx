import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileShellProps {
  deviceMode: 'iphone' | 'pixel' | 'fullscreen';
  orientation: 'portrait' | 'landscape';
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({
  deviceMode,
  orientation,
  children,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (deviceMode === 'fullscreen') {
    return (
      <div className="w-full h-screen flex flex-col bg-neutral-950 text-white overflow-hidden">
        {children}
      </div>
    );
  }

  // Mobile Device Frame Container (iPhone 16 Pro / Pixel 9 Pro)
  const isLandscape = orientation === 'landscape';
  const isIphone = deviceMode === 'iphone';

  return (
    <div className="w-full h-screen bg-neutral-900/90 flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      {/* Outer Phone Bezel */}
      <div
        className={`relative flex flex-col bg-neutral-950 border-[6px] sm:border-[8px] ${
          isIphone ? 'border-neutral-700/80 rounded-[48px]' : 'border-neutral-800 rounded-[40px]'
        } shadow-2xl shadow-black overflow-hidden transition-all duration-300 ${
          isLandscape
            ? 'w-[95vw] max-w-[920px] h-[88vh] max-h-[580px]'
            : 'w-full max-w-[430px] h-[96vh] max-h-[890px]'
        }`}
      >
        {/* Mobile Status Bar */}
        <div className="shrink-0 h-10 px-6 flex items-center justify-between text-neutral-300 text-xs font-semibold z-50 bg-neutral-950/90 backdrop-blur-md select-none">
          {/* Time */}
          <span className="font-mono text-xs text-white">{timeStr}</span>

          {/* Dynamic Island (iPhone) or Punch Hole (Pixel) */}
          {isIphone ? (
            <div className="w-24 h-5 rounded-full bg-black flex items-center justify-end pr-2 gap-1.5 border border-neutral-800">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700" />
            </div>
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-700 mx-auto" />
          )}

          {/* Icons: Signal, Wifi, Battery */}
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 fill-current text-white" />
          </div>
        </div>

        {/* Screen Viewport */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-neutral-950 text-white relative">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="shrink-0 h-4 bg-neutral-950 flex items-center justify-center pb-1">
          <div className="w-32 h-1 rounded-full bg-neutral-600/70" />
        </div>
      </div>
    </div>
  );
};
