import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  Check,
  X,
  ExternalLink,
  PlusSquare,
  Sparkles,
  Layers,
  Terminal,
  HelpCircle,
  Trash2,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'install' | 'apk' | 'download'>('install');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPwaUrl, setCopiedPwaUrl] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [installTip, setInstallTip] = useState<string | null>(null);

  const cleanAppUrl = typeof window !== 'undefined' ? (window.location.origin || window.location.href.split('?')[0]) : '';

  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback
    }
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setInstallTip('App successfully installed!');
      }
    } else {
      setInstallTip('Chrome me top-right (⋮) menu dabayein aur "Install app" chunein. Safari par Share (⎋) $\\to$ "Add to Home Screen".');
      setTimeout(() => setInstallTip(null), 6000);
    }
  };

  const handleCopyAppUrl = async () => {
    const success = await copyTextToClipboard(cleanAppUrl);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyPwaUrl = async () => {
    const success = await copyTextToClipboard(cleanAppUrl);
    if (success) {
      setCopiedPwaUrl(true);
      setTimeout(() => setCopiedPwaUrl(false), 2500);
    }
  };

  const handleCopyManifest = async () => {
    const manifestData = {
      id: '/',
      name: 'VideoForge - Mobile Video Editor',
      short_name: 'VideoForge',
      description: 'Mobile multi-track timeline video editor for creators with Whisper speech-to-text, TTS voice-overs, and FFmpeg rendering.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      theme_color: '#0a0a0c',
      background_color: '#0a0a0c',
      lang: 'en',
      dir: 'ltr',
      categories: ['video', 'multimedia', 'productivity', 'utilities'],
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    };

    const success = await copyTextToClipboard(JSON.stringify(manifestData, null, 2));
    if (success) {
      setCopiedManifest(true);
      setTimeout(() => setCopiedManifest(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 select-none animate-fadeIn">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC800] text-neutral-950 font-black text-base flex items-center justify-center shadow-lg shadow-[#FFC800]/25">
              VF
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>VideoForge Mobile App</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFC800]/10 text-[#FFC800] border border-[#FFC800]/20 font-bold">
                  v1.0
                </span>
              </h3>
              <p className="text-xs text-neutral-400">Install on Phone • Build APK • Download Files</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inline Tip Banner */}
        {installTip && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2">
            <span>{installTip}</span>
            <button onClick={() => setInstallTip(null)} className="text-amber-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('install')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'install'
                ? 'bg-[#FFC800] text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone Install</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-[#FFC800] text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Make .APK</span>
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'download'
                ? 'bg-[#FFC800] text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Files (.ZIP)</span>
          </button>
        </div>

        {/* Tab 1: Phone Install (PWA / WebAPK) */}
        {activeTab === 'install' && (
          <div className="flex flex-col gap-3.5 text-xs">
            {isInstalled ? (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold">Already Installed!</span>
                  <p className="text-[11px] text-emerald-400/80">
                    VideoForge is running as a full native standalone app on this device.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 rounded-2xl bg-[#FFC800] text-neutral-950 font-black text-sm hover:bg-[#FFD733] shadow-lg shadow-[#FFC800]/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Install VideoForge on Phone (1-Tap)</span>
                </button>
                <p className="text-[11px] text-center text-neutral-400">
                  Runs full screen without browser URL bars, completely offline with yellow icon!
                </p>
              </div>
            )}

            {/* Step-by-Step Instructions */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-3">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FFC800]" />
                <span>Phone me Install aur Uninstall kaise karein:</span>
              </span>

              {/* Android Guide */}
              <div className="flex flex-col gap-1.5 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/60">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <span>🤖 Android Phone (Google Chrome / Edge):</span>
                </div>
                <div className="text-[11px] text-neutral-300 space-y-1 pl-1">
                  <p>1. Chrome browser me ye app link open karein.</p>
                  <p>2. Upar corner me <strong>3 dots (⋮)</strong> par tap karein.</p>
                  <p>3. <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> par click karein.</p>
                  <p>4. Aapke mobile ki home screen par VideoForge app ka icon ban jayega!</p>
                  <div className="mt-1 pt-1 border-t border-neutral-800 text-[10px] text-amber-400/90 flex items-center gap-1">
                    <Trash2 className="w-3 h-3 shrink-0" />
                    <span><strong>Uninstall karna:</strong> App icon par 1 second finger daba kar rakhein $\to$ "Uninstall" select karein.</span>
                  </div>
                </div>
              </div>

              {/* iPhone Guide */}
              <div className="flex flex-col gap-1.5 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/60">
                <div className="flex items-center gap-2 text-pink-400 font-bold">
                  <span>🍏 iPhone / iPad (Safari Browser):</span>
                </div>
                <div className="text-[11px] text-neutral-300 space-y-1 pl-1">
                  <p>1. Safari me ye page open karein.</p>
                  <p>2. Niche centre me <strong>Share button (⎋)</strong> tap karein.</p>
                  <p>3. Thora neeche scroll karke <strong>"Add to Home Screen"</strong> par tap karein.</p>
                  <p>4. Upar "Add" dabayein. App iPhone screen par aa jayegi!</p>
                  <div className="mt-1 pt-1 border-t border-neutral-800 text-[10px] text-amber-400/90 flex items-center gap-1">
                    <Trash2 className="w-3 h-3 shrink-0" />
                    <span><strong>Uninstall karna:</strong> Icon ko daba kar rakhein $\to$ "Delete Bookmark / Remove App" chunein.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy Link Button */}
            <button
              onClick={handleCopyAppUrl}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <ExternalLink className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied! Phone me paste karein' : 'Copy App Link to Open on Phone'}</span>
            </button>
          </div>
        )}

        {/* Tab 2: Build Real .APK File */}
        {activeTab === 'apk' && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-sky-200 text-xs">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Apne Phone ke liye .APK file bananey ke 2 aasan tareeqay:</span>
              </span>
            </div>

            {/* Method A: Free PWABuilder (Online, No Code, 2 Minutes) */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#FFC800] text-xs">Tareeqa 1: PWABuilder (Online Free APK Generator)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Sabse Aasan (No Code)
                </span>
              </div>

              {/* Live URL Display & Copy Box */}
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-neutral-300">Iss App ka Link (PWABuilder me paste karein):</span>
                  <span className="text-[10px] text-amber-400 font-medium">Live URL</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={cleanAppUrl}
                    className="flex-1 bg-black/60 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-[#FFC800] select-all outline-none"
                  />
                  <button
                    onClick={handleCopyPwaUrl}
                    className="px-3 py-1.5 rounded-lg bg-[#FFC800] hover:bg-[#FFD733] text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 active:scale-95"
                  >
                    {copiedPwaUrl ? <Check className="w-3.5 h-3.5 text-neutral-950" /> : <ExternalLink className="w-3.5 h-3.5" />}
                    <span>{copiedPwaUrl ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Step by Step Guide */}
              <div className="space-y-1.5 text-[11px] text-neutral-300 leading-relaxed">
                <p className="flex items-start gap-1.5">
                  <strong className="text-white shrink-0">Step 1:</strong>
                  <span>Upar diya gaya <strong>"Copy Link"</strong> button dabayein.</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <strong className="text-white shrink-0">Step 2:</strong>
                  <span>
                    Browser me{' '}
                    <a
                      href="https://www.pwabuilder.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 underline font-semibold hover:text-sky-300 inline-flex items-center gap-0.5"
                    >
                      pwabuilder.com <ExternalLink className="w-3 h-3 inline" />
                    </a>{' '}
                    kholein aur input box me ye link paste karke <strong>"Start"</strong> dabayein.
                  </span>
                </p>
                <p className="flex items-start gap-1.5">
                  <strong className="text-white shrink-0">Step 3:</strong>
                  <span>Jab test complete ho jaye to <strong>"Package for Android"</strong> par click karein.</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <strong className="text-white shrink-0">Step 4:</strong>
                  <span><strong>"Generate Package"</strong> dabayein. 1 minute me aapko <code className="text-[#FFC800] bg-neutral-900 px-1 py-0.5 rounded font-mono">videoforge.apk</code> download ho jayegi!</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <strong className="text-white shrink-0">Step 5 (Phone me Install):</strong>
                  <span>APK file apne phone me open karein $\to$ <strong>"Install"</strong> dabayein (agar "Unknown sources" pucha jaye to allow karein).</span>
                </p>
                <div className="mt-2 pt-2 border-t border-neutral-800 text-[10px] text-amber-400/90 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span><strong>Uninstall karna:</strong> Phone ki Settings $\to$ Apps $\to$ VideoForge $\to$ <strong>"Uninstall"</strong> dabayein.</span>
                </div>
              </div>

              {/* PWABuilder Report Card Helper (Fix Missing Name / Missing Description) */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col gap-2 text-[11px]">
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>PWABuilder "Missing Name" Error aa raha hai?</span>
                  </span>
                  <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-bold">
                    Quick Fix
                  </span>
                </div>
                <p className="text-neutral-300 text-[10.5px] leading-relaxed">
                  PWABuilder ke Report Card page par upar <strong>"Manifest"</strong> tab (ya pencil icon) par click karein aur ye likh kar Save karein:
                </p>
                <div className="bg-black/50 p-2 rounded-lg font-mono text-[10px] space-y-1 text-neutral-300 border border-neutral-800">
                  <p><strong className="text-amber-400">Name:</strong> VideoForge</p>
                  <p><strong className="text-amber-400">Short Name:</strong> VideoForge</p>
                  <p><strong className="text-amber-400">Description:</strong> Mobile multi-track timeline video editor</p>
                </div>
                <p className="text-neutral-300 text-[10.5px]">
                  Ya pura Manifest JSON yahan se copy karke PWABuilder me paste karein:
                </p>
                <button
                  onClick={handleCopyManifest}
                  className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition-colors active:scale-98"
                >
                  {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5" />}
                  <span>{copiedManifest ? 'Manifest JSON Copied!' : 'Copy Complete Manifest JSON'}</span>
                </button>
                <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10.5px] text-emerald-300">
                  <strong>💡 Sabse Aasan Alternative:</strong> Kisi tool ke baghair, apne mobile Chrome browser me ye link kholein $\to$ top-right 3 dots dabayein $\to$ <strong>"Install app"</strong> dabayein. Phone me direct native app ban jayegi!
                </div>
              </div>

              <a
                href="https://www.pwabuilder.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open PWABuilder.com in New Tab</span>
              </a>
            </div>

            {/* Method B: Capacitor CLI (Android Studio Native APK) */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#FFC800]" />
                <span>Tareeqa 2: Capacitor / Android Studio (Developers)</span>
              </span>
              <p className="text-[11px] text-neutral-400">
                Neeche "Files (.ZIP)" tab se code download karke terminal me ye commands chalayein:
              </p>
              <pre className="p-2.5 rounded-xl bg-neutral-900 text-neutral-300 font-mono text-[10px] overflow-x-auto leading-relaxed border border-neutral-800">
                {`npm install
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init VideoForge com.videoforge.app --web-dir=dist
npx cap add android
npx cap open android`}
              </pre>
              <p className="text-[10px] text-neutral-400">
                Android Studio me: <strong>Build $\to$ Build Bundle(s) / APK(s) $\to$ Build APK(s)</strong> par click karein.
              </p>
            </div>

            {/* How to Install & Uninstall APK on Phone */}
            <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 space-y-1">
              <span className="font-bold text-white">📲 Phone me APK install aur uninstall kaise karein:</span>
              <p>• <strong>Install:</strong> .APK file par tap karein $\to$ Agar puche to <em>"Allow from this source"</em> on karein $\to$ <strong>Install</strong> dabayein.</p>
              <p>• <strong>Uninstall:</strong> Mobile Settings $\to$ Apps $\to$ VideoForge $\to$ <strong>Uninstall</strong> (ya app icon ko daba kar Uninstall dabayein).</p>
            </div>
          </div>
        )}

        {/* Tab 3: Download Files (.ZIP) */}
        {activeTab === 'download' && (
          <div className="flex flex-col gap-3.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FFC800]/10 text-[#FFC800]">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Complete App Source Code (.ZIP)</h4>
                  <p className="text-[11px] text-neutral-400">Pure project ki all source files, components, and configs</p>
                </div>
              </div>
              <p className="text-[11px] text-neutral-300 mt-1">
                Is ZIP file me complete React + Vite + TypeScript + Tailwind code, audio synthesizer, timeline model, auto-captions, icons aur manifest files shamil hain.
              </p>
              <a
                href="/videoforge-source.zip"
                download="videoforge-mobile-app.zip"
                className="mt-2 w-full py-3 rounded-2xl bg-[#FFC800] text-neutral-950 font-black text-xs hover:bg-[#FFD733] shadow-lg shadow-[#FFC800]/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download videoforge-source.zip (All Files)</span>
              </a>
            </div>

            {/* What's Inside the ZIP */}
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-1.5 text-[11px] text-neutral-400">
              <span className="font-bold text-neutral-200">📂 Folder Structure in ZIP:</span>
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-neutral-300">
                <span>📁 src/components/</span>
                <span>📁 src/screens/</span>
                <span>📁 src/core/</span>
                <span>📁 src/data/</span>
                <span>📁 public/</span>
                <span>📄 package.json</span>
                <span>📄 vite.config.ts</span>
                <span>📄 index.html</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-neutral-400 text-[11px]">
          <span>VideoForge Mobile Studio</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
