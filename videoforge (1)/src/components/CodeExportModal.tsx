import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Download,
  X,
  FileCode,
  FolderGit2,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { SAMPLE_PROJECT } from '../data/projectStorage';

interface CodeFile {
  name: string;
  path: string;
  language: string;
  description: string;
  snippet: string;
}

const KEY_FILES: CodeFile[] = [
  {
    name: 'App.tsx',
    path: 'src/App.tsx',
    language: 'tsx',
    description: 'Main App Shell, Multi-Track Coordinator, Navigation Tabs, Autosave Engine',
    snippet: `// VideoForge - Multi-Track Video Editor Main Entry
import React, { useState, useEffect, useRef } from 'react';
import { Project, Clip } from './types/timeline';
import { loadAllProjects, saveProject } from './data/projectStorage';
import { addClip, moveClip, trimClip, splitClipAtPlayhead, rippleDeleteClip } from './core/timelineModel';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { EditingScreen } from './screens/EditingScreen';

export default function App() {
  const [projects, setProjects] = useState(() => loadAllProjects());
  const [activeProjectId, setActiveId] = useState(() => getActiveProjectId());
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // Autosave & Undo/Redo Stacks are managed here
  return (
    <MobileShell>
      <TopBar />
      <EditingScreen project={currentProject} />
      <BottomNav />
    </MobileShell>
  );
}`,
  },
  {
    name: 'timelineModel.ts',
    path: 'src/core/timelineModel.ts',
    language: 'typescript',
    description: 'Pure functional timeline engine: splits, ripple deletes, auto-transitions, gap snapping',
    snippet: `// Core Timeline Model (Immutable Multi-Track Engine)
export function splitClipAtPlayhead(project: Project, clipId: string, playheadMs: number): Project {
  return {
    ...project,
    tracks: project.tracks.map(track => {
      const clipIndex = track.clips.findIndex(c => c.id === clipId);
      if (clipIndex === -1) return track;
      const target = track.clips[clipIndex];
      if (playheadMs <= target.startMs || playheadMs >= target.startMs + target.durationMs) return track;

      const firstPartDuration = playheadMs - target.startMs;
      const secondPartDuration = target.durationMs - firstPartDuration;

      const firstClip: Clip = { ...target, durationMs: firstPartDuration };
      const secondClip: Clip = {
        ...target,
        id: 'clip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        startMs: playheadMs,
        durationMs: secondPartDuration,
        sourceStartMs: target.sourceStartMs + firstPartDuration,
      };

      const newClips = [...track.clips];
      newClips.splice(clipIndex, 1, firstClip, secondClip);
      return { ...track, clips: newClips };
    })
  };
}`,
  },
  {
    name: 'PreviewPlayer.tsx',
    path: 'src/components/PreviewPlayer.tsx',
    language: 'tsx',
    description: '9:16 Canvas, Reels/TikTok Safe Zone overlay, direct drag & snap alignment',
    snippet: `// Canvas Player with Safe Zones & Direct Text Snapping
export const PreviewPlayer = ({ project, currentTimeMs, onUpdateClip }) => {
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Renders 9:16 vertical stage with Instagram/TikTok UI guides
  // Direct touch/drag positioning of captions with yellow snap crosshairs
  return (
    <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl">
      <video ref={videoRef} ... />
      {showSafeZone && <SafeZoneGuides />}
      <DraggableCaptions onSnap={() => triggerHaptic()} />
    </div>
  );
};`,
  },
  {
    name: 'TimelineEditor.tsx',
    path: 'src/components/TimelineEditor.tsx',
    language: 'tsx',
    description: 'Waveforms, filmstrip sprockets, floating thumb bar, bowtie transition badges',
    snippet: `// Timeline Tracks with Audio Waveforms & Quick Action Thumb Bar
export const TimelineEditor = ({ project, currentTimeMs, selectedClipId }) => {
  return (
    <div className="flex flex-col flex-1 bg-neutral-950">
      {/* Audio Waveforms for Track 0, 1, 2 */}
      {/* Filmstrip sprockets for Video Track */}
      {/* Floating Thumb Zone Quick Action Bar (Split, Speed, Vol, Ripple, Del) */}
      {/* Bowtie Badge |⧖| for instantaneous transitions */}
    </div>
  );
};`,
  },
  {
    name: 'ffmpegKitService.ts',
    path: 'src/data/ffmpegKitService.ts',
    language: 'typescript',
    description: 'FFmpeg command generator for complex filtergraphs, transitions, and audio mix',
    snippet: `// Generates complete FFmpeg CLI syntax for 1080x1920 MP4
export function generateFFmpegExportCommand(project: Project): string {
  // Generates:
  // -filter_complex "[0:v]xfade=transition=fade:duration=0.5:offset=3.0[v0];[v0]format=yuv420p[outv]"
  // -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k export.mp4
  return buildFFmpegCommand(project);
}`,
  },
  {
    name: 'whisperService.ts',
    path: 'src/data/whisperService.ts',
    language: 'typescript',
    description: 'Whisper GGML speech-to-text with multilingual support (Urdu, Hindi, English)',
    snippet: `// Offline Speech Recognition with Urdu/Hindi translation support
export interface WhisperWord {
  word: string;
  start: number;
  end: number;
}
export async function transcribeAudio(audioBlob: Blob, opts: WhisperOptions) {
  // Transcribes audio and returns word-level timestamps for animated captions
}`,
  },
];

export const CodeExportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(KEY_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadProjectJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(SAMPLE_PROJECT, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'videoforge-sample-project.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl bg-neutral-900 border border-neutral-700/80 shadow-2xl p-4 sm:p-6 text-white flex flex-col gap-4 max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFC800] flex items-center justify-center text-neutral-950 font-black text-sm">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                VideoForge App Codebase & Architecture
              </h3>
              <p className="text-xs text-neutral-400">
                Inspect key architecture files, copy code, or export project data
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

        {/* Quick Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <Terminal className="w-3.5 h-3.5 text-[#FFC800]" />
            <span>
              Stack: <strong>React 19 + TypeScript + Vite + Tailwind CSS + PWA</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadProjectJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-medium transition"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download Project JSON</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFC800] text-neutral-950 hover:bg-[#FFD733] font-bold transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Current File'}</span>
            </button>
          </div>
        </div>

        {/* File Tabs & Code Preview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 min-h-0 flex-1">
          {/* File Selector Sidebar */}
          <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto pr-1">
            {KEY_FILES.map(file => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all text-xs shrink-0 md:shrink ${
                  selectedFile.name === file.name
                    ? 'border-[#FFC800] bg-neutral-800/90 text-white'
                    : 'border-neutral-800/60 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <FileCode className={`w-3.5 h-3.5 ${selectedFile.name === file.name ? 'text-[#FFC800]' : 'text-neutral-500'}`} />
                  <span className="truncate">{file.name}</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">{file.path}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="md:col-span-3 flex flex-col rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/80 border-b border-neutral-800 text-xs">
              <span className="font-mono text-neutral-300 font-medium">{selectedFile.path}</span>
              <span className="text-[11px] text-neutral-400 hidden sm:inline">{selectedFile.description}</span>
            </div>
            <pre className="p-3 font-mono text-[11px] sm:text-xs text-neutral-200 overflow-auto flex-1 leading-relaxed whitespace-pre selection:bg-[#FFC800]/30 selection:text-white">
              <code>{selectedFile.snippet}</code>
            </pre>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800 pt-3">
          <span>Run locally: <code className="text-[#FFC800] bg-neutral-950 px-1.5 py-0.5 rounded">npm install &amp;&amp; npm run dev</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
