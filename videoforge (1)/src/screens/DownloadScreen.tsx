import React, { useState } from 'react';
import {
  Download,
  Link,
  RefreshCw,
  FileCode,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Sparkles,
} from 'lucide-react';
import { Project, Clip } from '../types/timeline';

interface DownloadScreenProps {
  project: Project;
  onAddMediaClipToProject: (clip: Clip) => void;
  onNavigateToScript: () => void;
}

export const DownloadScreen: React.FC<DownloadScreenProps> = ({
  project,
  onAddMediaClipToProject,
  onNavigateToScript,
}) => {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState<'1080p' | '720p' | '480p' | 'audio'>('1080p');
  const [isDownloading, setIsDownloading] = useState(false);
  const [botBlocked, setBotBlocked] = useState(false);
  const [cookiesFile, setCookiesFile] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([
    '[yt-dlp] Mobile backend initialized (v2026.03.10)',
    '[ffmpeg] Mobile proxy build ready with hwaccel',
    '[system] Ready for link or local import.',
  ]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleStartDownload = () => {
    if (!url.trim()) return;
    setIsDownloading(true);
    setBotBlocked(false);
    addLog(`Resolving video stream: ${url}`);
    addLog(`Selected format: ${quality} bestvideo+bestaudio/best`);

    setTimeout(() => {
      addLog('[yt-dlp] Extracting webpage metadata...');
    }, 600);

    setTimeout(() => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // Demonstrate handling the YouTube "Sign in to confirm you are not a bot" scenario
        addLog('[warning] YouTube returned: "Sign in to confirm you\'re not a bot"');
        setBotBlocked(true);
        setIsDownloading(false);
      } else {
        addLog('[download] 100% of 24.5MiB at 8.2MiB/s ETA 00:00');
        addLog('[ffmpeg] Generating 480p low-res proxy for smooth scrubbing');
        addLog('[success] Download complete! Added to Video track.');

        const newClip: Clip = {
          id: `dl_${Date.now()}`,
          name: 'Downloaded Video Explainer',
          type: 'video',
          trackIndex: 3,
          startMs: 0,
          endMs: 8000,
          sourceInMs: 0,
          sourceDurationMs: 8000,
          speed: 1.0,
          volume: 1.0,
          color: '#1E1B4B',
          transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
          look: { brightness: 0, contrast: 1, saturation: 1 },
          transition: {},
          hidden: false,
        };
        onAddMediaClipToProject(newClip);
        setIsDownloading(false);
      }
    }, 1800);
  };

  const handleUpdateDownloader = () => {
    addLog('[updater] Checking for latest yt-dlp mobile release...');
    setTimeout(() => {
      addLog('[updater] yt-dlp updated to latest stable version.');
      alert('yt-dlp mobile engine is up-to-date!');
    }, 800);
  };

  const handleImportCookies = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCookiesFile(file.name);
      addLog(`[cookies] Imported "${file.name}" for authenticated sessions.`);
      setBotBlocked(false);
    }
  };

  const handleImportFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addLog(`[fallback] Importing local file: "${file.name}"`);
    addLog('[whisper] Auto-transcription queued for imported video');

    const newClip: Clip = {
      id: `fallback_${Date.now()}`,
      name: file.name,
      type: 'video',
      trackIndex: 3,
      startMs: 0,
      endMs: 10000,
      sourceInMs: 0,
      sourceDurationMs: 10000,
      speed: 1.0,
      volume: 1.0,
      color: '#0F172A',
      transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      hidden: false,
    };
    onAddMediaClipToProject(newClip);
    onNavigateToScript();
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 p-4 overflow-y-auto select-none gap-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Download & Import</h1>
        <p className="text-xs text-neutral-400">
          Fetch source explainers via link or device import
        </p>
      </div>

      {/* URL Input Box */}
      <div className="flex flex-col gap-2 p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <Link className="w-3.5 h-3.5 text-[#FFC800]" />
          <span>Video Link</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Paste YouTube, Reels, TikTok, or direct video URL..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC800]"
          />
        </div>

        {/* Quality selector */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-neutral-400">Quality:</span>
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            {(['1080p', '720p', '480p', 'audio'] as const).map(q => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`px-2.5 py-1 text-[11px] rounded font-medium capitalize transition-colors ${
                  quality === q
                    ? 'bg-[#FFC800] text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleStartDownload}
          disabled={!url.trim() || isDownloading}
          className="mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FFC800] text-neutral-950 font-bold text-xs shadow-md shadow-[#FFC800]/20 hover:bg-[#FFD733] disabled:opacity-40 transition-all active:scale-[0.98]"
        >
          {isDownloading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isDownloading ? 'Downloading & Extracting Proxy...' : 'Download Video'}</span>
        </button>
      </div>

      {/* Bot Blocked Callout & Fallback */}
      {botBlocked && (
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4" />
            <span>YouTube: "Sign in to confirm you are not a bot"</span>
          </div>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            YouTube has flagged cloud bot traffic for this link. You can import cookies.txt, update downloader, or use the guaranteed offline fallback:
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FFC800] text-neutral-950 font-bold text-xs cursor-pointer hover:bg-[#FFD733] transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Import video + transcribe with Whisper</span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleImportFallback}
              />
            </label>

            <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-900 border border-amber-500/30 text-amber-300 font-medium text-xs cursor-pointer hover:bg-neutral-800">
              <FileCode className="w-3.5 h-3.5" />
              <span>{cookiesFile ? 'Cookies Loaded' : 'Import cookies.txt'}</span>
              <input type="file" accept=".txt" className="hidden" onChange={handleImportCookies} />
            </label>
          </div>
        </div>
      )}

      {/* Downloader Management Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleUpdateDownloader}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          <span>Update Downloader</span>
        </button>

        <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-medium cursor-pointer transition-colors">
          <Upload className="w-3.5 h-3.5 text-emerald-400" />
          <span>Import Local Video</span>
          <input type="file" accept="video/*" className="hidden" onChange={handleImportFallback} />
        </label>
      </div>

      {/* Live Terminal Log */}
      <div className="flex flex-col flex-1 rounded-2xl bg-neutral-950 border border-neutral-800 p-3 font-mono text-[11px] min-h-[160px]">
        <div className="flex items-center justify-between text-neutral-500 border-b border-neutral-800 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>Downloader Engine Terminal</span>
          </div>
          <span className="text-[10px] text-emerald-400">Active</span>
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto max-h-[160px]">
          {logs.map((l, i) => (
            <div
              key={i}
              className={`${
                l.includes('warning')
                  ? 'text-amber-400'
                  : l.includes('success')
                  ? 'text-emerald-400 font-semibold'
                  : 'text-neutral-400'
              }`}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
