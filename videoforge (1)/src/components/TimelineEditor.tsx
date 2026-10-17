import React, { useRef, useState, useEffect } from 'react';
import {
  Scissors,
  Trash2,
  Copy,
  ArrowLeftRight,
  ZoomIn,
  ZoomOut,
  Magnet,
  Maximize,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import { Project, Clip, TRACK_CONFIGS } from '../types/timeline';

interface TimelineEditorProps {
  project: Project;
  currentTimeMs: number;
  onSeek: (ms: number) => void;
  selectedClipId: string | null;
  onSelectClip: (clipId: string | null) => void;
  onMoveClip: (clipId: string, newStartMs: number, newTrackIndex?: number) => void;
  onTrimClip: (clipId: string, newStartMs: number, newEndMs: number, isStart: boolean) => void;
  onSplitClip: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
  onDuplicateClip: (clipId: string) => void;
  onRippleDeleteClip: (clipId: string) => void;
  onCloseGaps: (trackIndex: number) => void;
  onToggleClipHidden: (clipId: string) => void;
  onUpdateClip?: (clipId: string, partial: Partial<Clip>) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  project,
  currentTimeMs,
  onSeek,
  selectedClipId,
  onSelectClip,
  onMoveClip,
  onTrimClip,
  onSplitClip,
  onDeleteClip,
  onDuplicateClip,
  onRippleDeleteClip,
  onCloseGaps,
  onToggleClipHidden,
  onUpdateClip,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomScale, setZoomScale] = useState(40); // 40px per 1000ms
  const [snappingEnabled, setSnappingEnabled] = useState(true);

  // Dragging states
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [initialClipStartMs, setInitialClipStartMs] = useState<number>(0);

  // Trimming states
  const [trimmingClipId, setTrimmingClipId] = useState<string | null>(null);
  const [trimEdge, setTrimEdge] = useState<'start' | 'end' | null>(null);
  const [initialTrimStartMs, setInitialTrimStartMs] = useState<number>(0);
  const [initialTrimEndMs, setInitialTrimEndMs] = useState<number>(0);

  // Playhead scrub drag
  const [isScrubbingRuler, setIsScrubbingRuler] = useState(false);

  // Transition quick picker modal state
  const [transitionPopoverClipId, setTransitionPopoverClipId] = useState<string | null>(null);
  const [transitionPopoverPos, setTransitionPopoverPos] = useState<number>(0);

  const selectedClip = project.clips.find(c => c.id === selectedClipId);

  // Helper conversions
  const msToPx = (ms: number) => (ms / 1000) * zoomScale;
  const pxToMs = (px: number) => Math.round((px / zoomScale) * 1000);

  // Snap calculation
  const applySnapping = (targetMs: number): number => {
    if (!snappingEnabled) return targetMs;
    const snapThresholdMs = pxToMs(12);

    if (Math.abs(targetMs - currentTimeMs) < snapThresholdMs) {
      return currentTimeMs;
    }

    for (const c of project.clips) {
      if (c.id === draggingClipId) continue;
      if (Math.abs(targetMs - c.startMs) < snapThresholdMs) return c.startMs;
      if (Math.abs(targetMs - c.endMs) < snapThresholdMs) return c.endMs;
    }

    const nearestSecMs = Math.round(targetMs / 1000) * 1000;
    if (Math.abs(targetMs - nearestSecMs) < snapThresholdMs) {
      return nearestSecMs;
    }

    return targetMs;
  };

  // Mouse / Touch handlers for Playhead scrubbing
  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbingRuler(true);
    handleRulerSeek(e.clientX);
  };

  const handleRulerSeek = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const clickX = clientX - rect.left + scrollLeft - 76;
    const newMs = Math.max(0, Math.min(project.durationMs, pxToMs(Math.max(0, clickX))));
    onSeek(newMs);
  };

  // Mouse Move listener for dragging and trimming
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbingRuler) {
        handleRulerSeek(e.clientX);
        return;
      }

      const deltaX = e.clientX - dragStartX;
      const deltaMs = pxToMs(deltaX);

      if (draggingClipId) {
        const rawNewStart = Math.max(0, initialClipStartMs + deltaMs);
        const snapped = applySnapping(rawNewStart);
        onMoveClip(draggingClipId, snapped);
      } else if (trimmingClipId && trimEdge) {
        if (trimEdge === 'start') {
          const rawNewStart = Math.max(0, initialTrimStartMs + deltaMs);
          const snapped = applySnapping(rawNewStart);
          const endMs = initialTrimEndMs;
          if (endMs - snapped >= 100) {
            onTrimClip(trimmingClipId, snapped, endMs, true);
          }
        } else {
          const rawNewEnd = Math.max(initialTrimStartMs + 100, initialTrimEndMs + deltaMs);
          const snapped = applySnapping(rawNewEnd);
          onTrimClip(trimmingClipId, initialTrimStartMs, snapped, false);
        }
      }
    };

    const handleMouseUp = () => {
      setIsScrubbingRuler(false);
      setDraggingClipId(null);
      setTrimmingClipId(null);
      setTrimEdge(null);
    };

    if (isScrubbingRuler || draggingClipId || trimmingClipId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isScrubbingRuler,
    draggingClipId,
    trimmingClipId,
    trimEdge,
    dragStartX,
    initialClipStartMs,
    initialTrimStartMs,
    initialTrimEndMs,
    zoomScale,
    currentTimeMs,
    snappingEnabled,
  ]);

  // Procedural Audio Waveform Bars Generator
  const renderWaveformSvg = (widthPx: number, color: string, seed: string) => {
    const barCount = Math.max(4, Math.floor(widthPx / 4));
    const bars = [];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    for (let i = 0; i < barCount; i++) {
      const pseudoRand = Math.abs(Math.sin((i + hash) * 12.9898));
      const height = Math.max(3, Math.floor(pseudoRand * 22));
      bars.push(
        <rect
          key={i}
          x={i * 4}
          y={15 - height / 2}
          width={2.2}
          height={height}
          fill={color}
          opacity={0.7}
          rx={1}
        />
      );
    }

    return (
      <svg className="absolute bottom-1 left-2 right-2 h-7 w-full pointer-events-none overflow-hidden">
        {bars}
      </svg>
    );
  };

  // Video Track Cuts & Transitions
  const videoClips = project.clips
    .filter(c => c.trackIndex === 3)
    .sort((a, b) => a.startMs - b.startMs);

  const timelineContentWidth = Math.max(600, msToPx(project.durationMs) + 200);

  return (
    <div className="relative flex flex-col h-full bg-neutral-950 border border-neutral-800/80 rounded-2xl overflow-hidden select-none">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/90 border-b border-neutral-800 text-xs">
        {/* Clip Quick Operations */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => selectedClipId && onSplitClip(selectedClipId)}
            disabled={!selectedClipId}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-200 transition-colors"
            title="Split clip at playhead position"
          >
            <Scissors className="w-3.5 h-3.5 text-[#FFC800]" />
            <span className="hidden sm:inline">Split</span>
          </button>

          <button
            onClick={() => selectedClipId && onDuplicateClip(selectedClipId)}
            disabled={!selectedClipId}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-200 transition-colors"
            title="Duplicate clip"
          >
            <Copy className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          <button
            onClick={() => selectedClipId && onRippleDeleteClip(selectedClipId)}
            disabled={!selectedClipId}
            className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-200 transition-colors"
            title="Ripple delete (shifts succeeding clips)"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Ripple Delete</span>
          </button>

          <button
            onClick={() => selectedClipId && onDeleteClip(selectedClipId)}
            disabled={!selectedClipId}
            className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-red-950/50 hover:text-red-400 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-200 transition-colors"
            title="Delete clip"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>

          <div className="w-[1px] h-3.5 bg-neutral-700 mx-1 hidden sm:block" />

          <button
            onClick={() => onCloseGaps(3)}
            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300 transition-colors hidden sm:block"
            title="Close gaps on main video track"
          >
            Close Gaps
          </button>
        </div>

        {/* View Controls: Snap & Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSnappingEnabled(!snappingEnabled)}
            className={`p-1.5 rounded transition-colors ${
              snappingEnabled ? 'bg-[#FFC800]/20 text-[#FFC800]' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title={`Magnet Snapping: ${snappingEnabled ? 'ON' : 'OFF'}`}
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1 bg-neutral-800/80 px-1 py-0.5 rounded-lg border border-neutral-700/60">
            <button
              onClick={() => setZoomScale(Math.max(15, zoomScale - 10))}
              className="p-1 hover:text-white text-neutral-400"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-neutral-400 font-mono w-7 text-center">
              {zoomScale}x
            </span>
            <button
              onClick={() => setZoomScale(Math.min(120, zoomScale + 10))}
              className="p-1 hover:text-white text-neutral-400"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Tracks Area */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900 pb-12"
      >
        <div
          className="relative min-h-[260px] pb-8"
          style={{ width: `${timelineContentWidth + 80}px` }}
        >
          {/* Timeline Time Ruler */}
          <div
            className="sticky top-0 z-20 flex h-7 bg-neutral-900 border-b border-neutral-800 cursor-pointer"
            onMouseDown={handleRulerMouseDown}
          >
            <div className="w-[76px] shrink-0 bg-neutral-950 border-r border-neutral-800 flex items-center justify-center text-[10px] text-neutral-500 font-mono">
              00:00
            </div>

            <div className="relative flex-1 h-full">
              {Array.from({ length: Math.ceil(project.durationMs / 1000) + 2 }).map((_, sec) => {
                const leftPx = msToPx(sec * 1000);
                return (
                  <div
                    key={sec}
                    className="absolute top-0 bottom-0 border-l border-neutral-700/50 flex flex-col justify-between pl-1 text-[9px] text-neutral-400 font-mono select-none"
                    style={{ left: `${leftPx}px` }}
                  >
                    <span>{sec}s</span>
                    <div className="w-0.5 h-1.5 bg-neutral-600 mb-0.5" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Red Playhead Line */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-30 pointer-events-none"
            style={{ left: `${msToPx(currentTimeMs) + 76}px` }}
          >
            <div className="w-3.5 h-3.5 bg-red-500 -translate-x-[6px] -translate-y-0.5 rotate-45 rounded-sm shadow-md shadow-red-500/50" />
          </div>

          {/* Track Rows (Tracks 0 to 6) */}
          <div className="flex flex-col">
            {TRACK_CONFIGS.map(track => {
              const trackClips = project.clips.filter(c => c.trackIndex === track.index);
              const isAudioTrack = [0, 1, 2].includes(track.index);
              const isVideoTrack = track.index === 3;

              return (
                <div
                  key={track.index}
                  className="flex h-12 border-b border-neutral-800/80 bg-neutral-950/40 relative group"
                >
                  {/* Track Left Header */}
                  <div className="w-[76px] shrink-0 bg-neutral-900/95 border-r border-neutral-800 flex flex-col justify-center px-2 py-1 z-10 select-none">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: track.color }}
                      />
                      <span className="text-[11px] font-semibold text-neutral-300 truncate">
                        {track.name}
                      </span>
                    </div>
                    <span className="text-[9px] text-neutral-500 capitalize">
                      {track.type}
                    </span>
                  </div>

                  {/* Track Clips Canvas Area */}
                  <div className="relative flex-1 h-full">
                    {trackClips.map(clip => {
                      const leftPx = msToPx(clip.startMs);
                      const widthPx = Math.max(16, msToPx(clip.endMs - clip.startMs));
                      const isSelected = clip.id === selectedClipId;

                      return (
                        <div
                          key={clip.id}
                          onClick={e => {
                            e.stopPropagation();
                            onSelectClip(clip.id);
                          }}
                          onMouseDown={e => {
                            if ((e.target as HTMLElement).dataset.trim) return;
                            setDraggingClipId(clip.id);
                            setDragStartX(e.clientX);
                            setInitialClipStartMs(clip.startMs);
                            onSelectClip(clip.id);
                          }}
                          className={`absolute top-1 bottom-1 rounded-lg border flex flex-col justify-between p-1.5 cursor-grab active:cursor-grabbing select-none transition-shadow overflow-hidden group/clip ${
                            isSelected
                              ? 'ring-2 ring-[#FFC800] ring-offset-1 ring-offset-neutral-950 z-20 shadow-lg'
                              : 'hover:brightness-110 z-10'
                          }`}
                          style={{
                            left: `${leftPx}px`,
                            width: `${widthPx}px`,
                            backgroundColor: `${track.color}25`,
                            borderColor: isSelected ? '#FFC800' : `${track.color}80`,
                          }}
                        >
                          {/* Left Trim Handle */}
                          <div
                            data-trim="start"
                            onMouseDown={e => {
                              e.stopPropagation();
                              setTrimmingClipId(clip.id);
                              setTrimEdge('start');
                              setDragStartX(e.clientX);
                              setInitialTrimStartMs(clip.startMs);
                              setInitialTrimEndMs(clip.endMs);
                            }}
                            className="absolute left-0 top-0 bottom-0 w-2.5 bg-white/20 hover:bg-[#FFC800] cursor-ew-resize opacity-0 group-hover/clip:opacity-100 transition-opacity rounded-l z-20"
                          />

                          {/* Clip Header Label */}
                          <div className="flex items-center gap-1.5 min-w-0 pointer-events-none z-10">
                            {clip.transition?.id && (
                              <Sparkles className="w-3 h-3 text-[#FFC800] shrink-0" />
                            )}
                            <span className="text-[11px] font-medium text-white truncate drop-shadow">
                              {clip.name}
                            </span>
                          </div>

                          {/* Procedural Audio Waveform Rendering for Tracks 0, 1, 2 */}
                          {isAudioTrack && renderWaveformSvg(widthPx, track.color, clip.id)}

                          {/* Filmstrip Sprockets Simulation for Video Track 3 */}
                          {isVideoTrack && (
                            <div className="absolute inset-0 pointer-events-none opacity-20 flex justify-between px-1">
                              <div className="h-1 w-full border-b border-dashed border-white" />
                              <div className="absolute bottom-0 h-1 w-full border-t border-dashed border-white" />
                            </div>
                          )}

                          {/* Right Trim Handle */}
                          <div
                            data-trim="end"
                            onMouseDown={e => {
                              e.stopPropagation();
                              setTrimmingClipId(clip.id);
                              setTrimEdge('end');
                              setDragStartX(e.clientX);
                              setInitialTrimStartMs(clip.startMs);
                              setInitialTrimEndMs(clip.endMs);
                            }}
                            className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/20 hover:bg-[#FFC800] cursor-ew-resize opacity-0 group-hover/clip:opacity-100 transition-opacity rounded-r z-20"
                          />
                        </div>
                      );
                    })}

                    {/* Transition Cut Markers (|⧖|) Between Video Track Clips */}
                    {isVideoTrack &&
                      videoClips.map((clip, index) => {
                        if (index === 0) return null;
                        const prevClip = videoClips[index - 1];
                        // If touching or has transition
                        const isTouching = Math.abs(clip.startMs - prevClip.endMs) < 100;
                        if (!isTouching && !clip.transition?.id) return null;

                        const markerLeftPx = msToPx(clip.startMs) - 10;
                        const hasTrans = !!clip.transition?.id;

                        return (
                          <button
                            key={`trans_marker_${clip.id}`}
                            onClick={e => {
                              e.stopPropagation();
                              setTransitionPopoverClipId(clip.id);
                              setTransitionPopoverPos(markerLeftPx);
                            }}
                            className={`absolute top-2 z-20 w-5 h-7 rounded flex items-center justify-center text-[10px] font-black border transition-transform hover:scale-110 shadow-md ${
                              hasTrans
                                ? 'bg-[#FFC800] text-neutral-950 border-[#FFC800]'
                                : 'bg-neutral-800 text-neutral-400 border-neutral-600 hover:text-white'
                            }`}
                            style={{ left: `${markerLeftPx}px` }}
                            title="Tap to change transition"
                          >
                            ⧖
                          </button>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Transition Selector Popover on Timeline */}
      {transitionPopoverClipId && (
        <div
          className="absolute z-40 bg-neutral-900 border border-neutral-700 rounded-xl p-2 shadow-2xl flex items-center gap-1.5"
          style={{
            top: '70px',
            left: `${Math.min(window.innerWidth - 220, Math.max(80, transitionPopoverPos))}px`,
          }}
        >
          <span className="text-[10px] font-bold text-neutral-400 uppercase mr-1">
            Transition:
          </span>
          {[
            { id: 'dissolve', label: 'Dissolve' },
            { id: 'slide_left', label: 'Slide' },
            { id: 'zoom', label: 'Zoom' },
            { id: 'wipe', label: 'Wipe' },
            { id: 'none', label: 'None' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                if (onUpdateClip) {
                  onUpdateClip(transitionPopoverClipId, {
                    transition: opt.id === 'none' ? {} : { id: opt.id, ms: 800 },
                  });
                }
                setTransitionPopoverClipId(null);
              }}
              className="px-2 py-1 rounded bg-neutral-800 hover:bg-[#FFC800] hover:text-neutral-950 text-neutral-200 text-xs font-semibold transition-colors"
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => setTransitionPopoverClipId(null)}
            className="p-1 rounded text-neutral-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Thumb-Zone Floating Quick Action Bar (CapCut Style) */}
      {selectedClip && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-neutral-900/95 backdrop-blur-md border border-neutral-700 rounded-2xl px-2 py-1.5 shadow-2xl max-w-[95%] overflow-x-auto scrollbar-none animate-in fade-in slide-in-from-bottom-2">
          {/* Split */}
          <button
            onClick={() => onSplitClip(selectedClip.id)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 min-h-[44px] active:scale-95 transition-all"
            title="Split clip at playhead"
          >
            <Scissors className="w-4 h-4 text-[#FFC800]" />
            <span className="text-xs font-bold">Split</span>
          </button>

          {/* Quick Speed Switcher */}
          <button
            onClick={() => {
              if (onUpdateClip) {
                const nextSpeed = selectedClip.speed === 1.0 ? 1.5 : selectedClip.speed === 1.5 ? 2.0 : selectedClip.speed === 2.0 ? 0.5 : 1.0;
                onUpdateClip(selectedClip.id, { speed: nextSpeed });
              }
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 min-h-[44px] active:scale-95 transition-all"
            title="Cycle Speed (0.5x, 1x, 1.5x, 2x)"
          >
            <Gauge className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold font-mono">{(selectedClip.speed || 1.0).toFixed(1)}x</span>
          </button>

          {/* Quick Volume Toggle */}
          <button
            onClick={() => {
              if (onUpdateClip) {
                const nextVol = (selectedClip.volume || 1.0) === 0 ? 1.0 : (selectedClip.volume || 1.0) === 1.0 ? 1.5 : 0;
                onUpdateClip(selectedClip.id, { volume: nextVol });
              }
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 min-h-[44px] active:scale-95 transition-all"
            title="Cycle Volume (Mute, 100%, 150%)"
          >
            {(selectedClip.volume || 1.0) === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
            <span className="text-xs font-bold font-mono">{Math.round((selectedClip.volume ?? 1.0) * 100)}%</span>
          </button>

          {/* Duplicate */}
          <button
            onClick={() => onDuplicateClip(selectedClip.id)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 min-h-[44px] active:scale-95 transition-all"
            title="Duplicate clip"
          >
            <Copy className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold">Copy</span>
          </button>

          {/* Ripple Delete */}
          <button
            onClick={() => onRippleDeleteClip(selectedClip.id)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 min-h-[44px] active:scale-95 transition-all"
            title="Ripple delete (shifts all subsequent clips left)"
          >
            <ArrowLeftRight className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold">Ripple</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDeleteClip(selectedClip.id)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-red-950/70 hover:text-red-400 text-neutral-200 min-h-[44px] active:scale-95 transition-all"
            title="Delete clip"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>

          <div className="w-[1px] h-6 bg-neutral-700 mx-0.5" />

          {/* Deselect Button */}
          <button
            onClick={() => onSelectClip(null)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title="Deselect clip"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
