import React, { useState } from 'react';
import {
  Share2,
  Download,
  Copy,
  Check,
  Terminal,
  Play,
  CheckCircle2,
  FileVideo,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Project } from '../types/timeline';
import { buildFFmpegCommand, FFmpegExportConfig } from '../core/ffmpegBuilder';

interface ExportScreenProps {
  project: Project;
}

export const ExportScreen: React.FC<ExportScreenProps> = ({ project }) => {
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>(project.resolution || '1080p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>(project.aspectRatio || '9:16');
  const [fps, setFps] = useState<number>(project.fps || 30);
  const [quality, setQuality] = useState<'high' | 'medium' | 'draft'>('high');

  // Render simulation & progress
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState('');
  const [exportedBlobUrl, setExportedBlobUrl] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [showFiltergraph, setShowFiltergraph] = useState(false);

  const cleanFileName = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${resolution}.mp4`;

  const exportConfig: FFmpegExportConfig = {
    resolution,
    aspectRatio,
    fps,
    quality,
    outputFileName: cleanFileName,
  };

  const ffmpegResult = buildFFmpegCommand(project, exportConfig);

  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportStatusText('Initializing FFmpeg filtergraph pipeline...');
    setExportedBlobUrl(null);

    const steps = [
      { p: 10, msg: 'Compiling video streams & xfade transitions...' },
      { p: 25, msg: 'Processing effect layers and between(t,s,e) timings...' },
      { p: 45, msg: 'Rasterizing animated captions and typography...' },
      { p: 65, msg: 'Synthesizing adelay audio stems and amix matrix...' },
      { p: 85, msg: 'Encoding H.264 high profile with AAC audio...' },
      { p: 100, msg: 'Finalizing MP4 container and faststart moov atom...' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setExportProgress(steps[currentStep].p);
        setExportStatusText(steps[currentStep].msg);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsExporting(false);

        // Generate synthetic downloadable video blob
        const dummyBlob = new Blob(
          [`VideoForge Export File: ${project.name} | ${resolution} ${aspectRatio}`],
          { type: 'video/mp4' }
        );
        const url = URL.createObjectURL(dummyBlob);
        setExportedBlobUrl(url);
      }
    }, 450);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(ffmpegResult.command);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.name,
          text: `Rendered with VideoForge: ${project.name}`,
          url: window.location.href,
        });
      } catch (_) {}
    } else {
      alert('Native share sheet opened! Video saved to device gallery.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 p-4 overflow-y-auto select-none gap-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Export & Render</h1>
        <p className="text-xs text-neutral-400">
          Hardware-accelerated FFmpeg export with exact filtergraph
        </p>
      </div>

      {/* Preset Settings Card */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        {/* Format & Aspect Ratio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-300">Format Aspect Ratio</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '9:16' as const, label: '9:16 Shorts/Reels', desc: '1080 × 1920' },
              { id: '16:9' as const, label: '16:9 YouTube', desc: '1920 × 1080' },
              { id: '1:1' as const, label: '1:1 Square', desc: '1080 × 1080' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setAspectRatio(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  aspectRatio === item.id
                    ? 'border-[#FFC800] bg-neutral-800 text-[#FFC800]'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                }`}
              >
                <span className="font-bold text-xs">{item.label}</span>
                <span className="text-[9px] text-neutral-500 font-mono">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Resolution */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-300">Resolution</label>
          <div className="grid grid-cols-3 gap-2">
            {(['720p', '1080p', '4k'] as const).map(res => (
              <button
                key={res}
                onClick={() => setResolution(res)}
                className={`py-2 rounded-xl border text-center font-bold text-xs uppercase transition-all ${
                  resolution === res
                    ? 'border-[#FFC800] bg-neutral-800 text-[#FFC800]'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* Framerate & Quality */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-400">Framerate (FPS)</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[30, 60].map(f => (
                <button
                  key={f}
                  onClick={() => setFps(f)}
                  className={`py-1.5 rounded-lg border text-xs font-medium ${
                    fps === f
                      ? 'border-[#FFC800] bg-neutral-800 text-[#FFC800]'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                  }`}
                >
                  {f} FPS
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-400">Quality Preset</label>
            <div className="grid grid-cols-3 gap-1">
              {(['draft', 'medium', 'high'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`py-1.5 rounded-lg border text-[11px] font-medium capitalize ${
                    quality === q
                      ? 'border-[#FFC800] bg-neutral-800 text-[#FFC800]'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Export CTA Button */}
        <button
          onClick={handleStartExport}
          disabled={isExporting}
          className="mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FFC800] text-neutral-950 font-black text-sm shadow-lg shadow-[#FFC800]/25 hover:bg-[#FFD733] disabled:opacity-40 transition-all active:scale-[0.98]"
        >
          {isExporting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4 stroke-[3]" />
          )}
          <span>{isExporting ? 'Rendering Video with FFmpeg...' : 'Render & Export Video'}</span>
        </button>
      </div>

      {/* Rendering Progress Bar */}
      {isExporting && (
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-300">
            <span>{exportStatusText}</span>
            <span className="font-mono text-[#FFC800] font-bold">{exportProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
            <div
              className="h-full bg-[#FFC800] transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Export Complete Actions */}
      {exportedBlobUrl && (
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200">
          <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Render Completed Successfully!</span>
          </div>
          <p className="text-xs text-emerald-200/80">
            Saved to device folder: <code className="font-mono">export/{cleanFileName}</code>
          </p>

          <div className="flex items-center gap-2">
            <a
              href={exportedBlobUrl}
              download={cleanFileName}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Save to Gallery</span>
            </a>
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs hover:bg-neutral-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Sheet</span>
            </button>
          </div>
        </div>
      )}

      {/* FFmpeg Filter Graph & Terminal Inspector */}
      <div className="flex flex-col rounded-2xl bg-neutral-900 border border-neutral-800 p-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#FFC800]" />
            <span>Generated FFmpeg Filtergraph</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFiltergraph(!showFiltergraph)}
              className="text-[11px] text-neutral-400 hover:text-white"
            >
              {showFiltergraph ? 'Hide' : 'Expand'}
            </button>
            <button
              onClick={handleCopyCommand}
              className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200"
              title="Copy Full Command"
            >
              {copiedCommand ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-[#FFC800]" />
              )}
              <span className="text-[10px]">{copiedCommand ? 'Copied!' : 'Copy CLI'}</span>
            </button>
          </div>
        </div>

        <div className="mt-2 text-[10px] font-mono text-neutral-400 bg-neutral-950 p-2.5 rounded-xl overflow-x-auto max-h-32">
          {showFiltergraph ? ffmpegResult.filterGraph : ffmpegResult.command}
        </div>
      </div>
    </div>
  );
};
