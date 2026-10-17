import React, { useState } from 'react';
import { Download, Monitor, Smartphone, CheckCircle2, X, ExternalLink, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, install } = usePWAInstall();
  const [platformTab, setPlatformTab] = useState<'desktop' | 'android' | 'ios'>('desktop');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700/80 shadow-2xl p-5 text-white flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFC800] flex items-center justify-center text-neutral-950 font-black text-sm shadow-md shadow-[#FFC800]/20">
              VF
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Install VideoForge in Chrome
              </h3>
              <p className="text-xs text-neutral-400">
                Install as a standalone PWA app on Desktop or Android
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick 1-Click Install Trigger if Chrome event detected */}
        {isInstallable && (
          <div className="p-3.5 rounded-xl bg-[#FFC800]/10 border border-[#FFC800]/30 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#FFC800] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Chrome Install Prompt Ready</span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                Click below to instantly install VideoForge via Google Chrome.
              </p>
            </div>
            <button
              onClick={async () => {
                await install();
                onClose();
              }}
              className="px-3.5 py-2 rounded-lg bg-[#FFC800] text-neutral-950 hover:bg-[#FFD733] font-bold text-xs shadow-md shadow-[#FFC800]/20 shrink-0 flex items-center gap-1.5 active:scale-95 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Now</span>
            </button>
          </div>
        )}

        {/* Browser / Platform Tabs */}
        <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800 text-xs">
          <button
            onClick={() => setPlatformTab('desktop')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
              platformTab === 'desktop'
                ? 'bg-neutral-800 text-[#FFC800]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Chrome (PC / Mac)</span>
          </button>
          <button
            onClick={() => setPlatformTab('android')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
              platformTab === 'android'
                ? 'bg-neutral-800 text-[#FFC800]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Chrome (Android)</span>
          </button>
          <button
            onClick={() => setPlatformTab('ios')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
              platformTab === 'ios'
                ? 'bg-neutral-800 text-[#FFC800]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Safari (iPhone)</span>
          </button>
        </div>

        {/* Instructions body */}
        <div className="flex flex-col gap-3 text-xs">
          {platformTab === 'desktop' && (
            <div className="flex flex-col gap-2.5 bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800/80">
              <span className="font-bold text-neutral-200 text-xs">
                How to Install in Google Chrome on Windows / Mac / Linux:
              </span>
              <ol className="list-decimal list-inside space-y-2 text-neutral-300 leading-relaxed text-[12px]">
                <li>
                  Look at the <strong>Chrome Address Bar</strong> (URL bar at the top right).
                </li>
                <li>
                  Click the <strong>Install icon</strong> (an icon showing a computer screen with a downward arrow <span className="inline-block px-1.5 py-0.5 rounded bg-neutral-800 text-[#FFC800] font-mono text-[11px]">⊕ / ⤓</span>).
                </li>
                <li>
                  Alternatively, click Chrome's <strong>three dots (⋮)</strong> at top-right &rarr; <strong>Cast, save, and share</strong> (or &quot;Install VideoForge&quot;) &rarr; click <strong>Install</strong>.
                </li>
                <li>
                  VideoForge will now run in its own dedicated, borderless desktop window with full offline caching and hardware acceleration!
                </li>
              </ol>
            </div>
          )}

          {platformTab === 'android' && (
            <div className="flex flex-col gap-2.5 bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800/80">
              <span className="font-bold text-neutral-200 text-xs">
                How to Install in Chrome on Android Phone or Tablet:
              </span>
              <ol className="list-decimal list-inside space-y-2 text-neutral-300 leading-relaxed text-[12px]">
                <li>
                  Open this link in the <strong>Google Chrome</strong> app on your Android device.
                </li>
                <li>
                  Tap the <strong>three vertical dots (⋮)</strong> in the top-right corner of Chrome.
                </li>
                <li>
                  Tap <strong>&quot;Add to Home screen&quot;</strong> or <strong>&quot;Install app&quot;</strong>.
                </li>
                <li>
                  Tap <strong>&quot;Install&quot;</strong> in the confirmation popup.
                </li>
                <li>
                  The <strong>VideoForge</strong> app icon will appear directly on your phone's home screen and app launcher just like a native APK app!
                </li>
              </ol>
            </div>
          )}

          {platformTab === 'ios' && (
            <div className="flex flex-col gap-2.5 bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800/80">
              <span className="font-bold text-neutral-200 text-xs">
                How to Install on iPhone / iPad (Safari):
              </span>
              <ol className="list-decimal list-inside space-y-2 text-neutral-300 leading-relaxed text-[12px]">
                <li>Open this link in <strong>Safari</strong> on your iPhone or iPad.</li>
                <li>Tap the <strong>Share</strong> button (box with an arrow pointing up) in the bottom toolbar.</li>
                <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                <li>Tap <strong>&quot;Add&quot;</strong> in the top-right corner.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Benefits badge */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 border-t border-neutral-800 pt-3">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Runs 100% offline via Service Worker</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Full-screen app view without browser tabs</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition"
        >
          Got It
        </button>
      </div>
    </div>
  );
};

export const PWAInstallButton: React.FC<{
  variant?: 'compact' | 'full';
  className?: string;
}> = ({ variant = 'compact', className = '' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already installed in standalone mode, show a small badge or hide
  if (isInstalled) {
    return (
      <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/60 border border-emerald-800/60 text-[10px] text-emerald-400 font-mono">
        <CheckCircle2 className="w-3 h-3" />
        <span>Installed PWA</span>
      </span>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 rounded-lg font-bold text-xs transition shadow-sm active:scale-95 ${
          variant === 'full'
            ? 'px-3.5 py-2 bg-[#FFC800] text-neutral-950 hover:bg-[#FFD733] shadow-[#FFC800]/20'
            : 'px-2.5 py-1.5 bg-neutral-800/90 hover:bg-neutral-700 text-white border border-neutral-700/80 hover:border-neutral-600'
        } ${className}`}
        title="Install VideoForge in Chrome as a Desktop/Mobile App"
      >
        <Download className="w-3.5 h-3.5 text-[#FFC800]" />
        <span>Install App</span>
      </button>

      <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
