import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Shield,
  Move,
} from 'lucide-react';
import { Project, Clip } from '../types/timeline';
import { VIDEO_EFFECTS } from '../data/effectsAndTransitions';

interface PreviewPlayerProps {
  project: Project;
  currentTimeMs: number;
  onSeek: (timeMs: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  selectedClipId?: string | null;
  onSelectClip?: (clipId: string | null) => void;
  onUpdateClip?: (clipId: string, partial: Partial<Clip>) => void;
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({
  project,
  currentTimeMs,
  onSeek,
  isPlaying,
  onTogglePlay,
  selectedClipId,
  onSelectClip,
  onUpdateClip,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showSafeZone, setShowSafeZone] = useState(false);

  // Direct canvas dragging state
  const [isDraggingCanvasClip, setIsDraggingCanvasClip] = useState(false);
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialClipOffset, setInitialClipOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [snappedCenter, setSnappedCenter] = useState<{ x: boolean; y: boolean }>({ x: false, y: false });

  // Format milliseconds into MM:SS.CS
  const formatTimecode = (ms: number) => {
    const totalSeconds = Math.max(0, ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const centis = Math.floor((totalSeconds % 1) * 100);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  };

  // Determine aspect ratio geometry
  const getAspectRatioGeometry = () => {
    if (project.aspectRatio === '9:16') {
      return { width: 360, height: 640 };
    } else if (project.aspectRatio === '1:1') {
      return { width: 480, height: 480 };
    }
    return { width: 640, height: 360 };
  };

  const { width: canvasW, height: canvasH } = getAspectRatioGeometry();

  // Draw composite frame onto canvas
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const t = currentTimeMs;

    // 1. Clear background
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Main Video Track (Track 3)
    const activeVideoClip = project.clips.find(
      c => c.trackIndex === 3 && !c.hidden && t >= c.startMs && t <= c.endMs
    );

    if (activeVideoClip) {
      ctx.save();
      const scale = activeVideoClip.transform?.scale || 1.0;
      const offsetX = (activeVideoClip.transform?.offsetX || 0) * canvas.width;
      const offsetY = (activeVideoClip.transform?.offsetY || 0) * canvas.height;
      const rotation = ((activeVideoClip.transform?.rotation || 0) * Math.PI) / 180;
      const opacity = activeVideoClip.transform?.opacity ?? 1.0;

      ctx.globalAlpha = opacity;
      ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      // Transitions
      if (activeVideoClip.transition?.id && activeVideoClip.transition?.ms) {
        const transDur = activeVideoClip.transition.ms;
        const transProgress = Math.min(1, Math.max(0, (t - activeVideoClip.startMs) / transDur));
        if (transProgress < 1) {
          if (activeVideoClip.transition.id === 'dissolve') {
            ctx.globalAlpha = opacity * transProgress;
          } else if (activeVideoClip.transition.id === 'slide_left') {
            ctx.translate((1 - transProgress) * canvas.width, 0);
          } else if (activeVideoClip.transition.id === 'zoom') {
            ctx.scale(0.7 + transProgress * 0.3, 0.7 + transProgress * 0.3);
          }
        }
      }

      ctx.fillStyle = activeVideoClip.color || '#1e293b';
      ctx.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.arc(0, 0, canvas.width * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activeVideoClip.name, 0, -20);

      ctx.fillStyle = 'rgba(255, 200, 0, 0.9)';
      ctx.font = '12px monospace';
      ctx.fillText(`${formatTimecode(t - activeVideoClip.startMs)}`, 0, 10);

      ctx.restore();
    } else {
      ctx.fillStyle = '#171717';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#525252';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No Video Clip at Playhead', canvas.width / 2, canvas.height / 2);
    }

    // 3. Overlay Track (Track 4)
    const activeOverlay = project.clips.find(
      c => c.trackIndex === 4 && !c.hidden && t >= c.startMs && t <= c.endMs
    );
    if (activeOverlay) {
      ctx.save();
      ctx.fillStyle = activeOverlay.color || 'rgba(16, 185, 129, 0.35)';
      ctx.fillRect(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8);
      ctx.restore();
    }

    // 4. Effects Track (Track 5)
    const activeEffects = project.clips.filter(
      c => c.trackIndex === 5 && !c.hidden && t >= c.startMs && t <= c.endMs
    );
    activeEffects.forEach(eff => {
      if (eff.effectId === 'vignette') {
        const grad = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.25,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.7
        );
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (eff.effectId === 'film_grain') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        for (let i = 0; i < 300; i++) {
          ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
        }
      } else if (eff.effectId === 'black_white') {
        ctx.save();
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else if (eff.effectId === 'sepia') {
        ctx.save();
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = '#704214';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else if (eff.effectId === 'rgb_split') {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
        ctx.fillRect(3, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.fillRect(-3, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    });

    // 5. Text Track (Track 6) with Animation & Direct Selection Handle
    const activeTexts = project.clips.filter(
      c => c.trackIndex === 6 && !c.hidden && t >= c.startMs && t <= c.endMs
    );
    activeTexts.forEach(txt => {
      if (!txt.text?.text) return;
      ctx.save();

      const fontSize = Math.max(14, Math.round(canvas.height * (txt.text.size || 0.055)));
      ctx.font = `${txt.text.bold ? 'bold ' : ''}${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let textToRender = txt.text.text;
      let alpha = 1.0;
      let translateY = 0;
      let scale = 1.0;

      const elapsed = t - txt.startMs;
      const animDur = txt.text.animMs || 400;

      if (elapsed < animDur) {
        const progress = Math.max(0, Math.min(1, elapsed / animDur));
        if (txt.text.animIn === 'fade') {
          alpha = progress;
        } else if (txt.text.animIn === 'slide_up') {
          translateY = (1 - progress) * 30;
          alpha = progress;
        } else if (txt.text.animIn === 'pop') {
          scale = 0.5 + progress * 0.5;
          alpha = progress;
        } else if (txt.text.animIn === 'typewriter') {
          const charCount = Math.floor(progress * txt.text.text.length);
          textToRender = txt.text.text.substring(0, charCount);
        }
      }

      ctx.globalAlpha = alpha;

      const posX = canvas.width / 2 + (txt.transform?.offsetX || 0) * canvas.width;
      const posY = canvas.height / 2 + (txt.transform?.offsetY ?? 0.36) * canvas.height + translateY;

      ctx.translate(posX, posY);
      ctx.scale(scale, scale);

      const metrics = ctx.measureText(textToRender);
      const textWidth = metrics.width;
      const padX = 14;
      const padY = 8;
      const boxHeight = fontSize + padY * 2;
      const boxWidth = textWidth + padX * 2;

      if (txt.text.box) {
        ctx.fillStyle = txt.text.boxColor || 'rgba(0, 0, 0, 0.75)';
        ctx.beginPath();
        ctx.roundRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 8);
        ctx.fill();
      }

      ctx.fillStyle = txt.text.color || '#FFFFFF';
      ctx.fillText(textToRender, 0, 0);

      // Selected clip on-canvas bounding box with handles
      if (txt.id === selectedClipId) {
        ctx.strokeStyle = '#FFC800';
        ctx.lineWidth = 2;
        ctx.strokeRect(-boxWidth / 2 - 4, -boxHeight / 2 - 4, boxWidth + 8, boxHeight + 8);

        // Corner handles
        ctx.fillStyle = '#FFC800';
        const hs = 6;
        ctx.fillRect(-boxWidth / 2 - 7, -boxHeight / 2 - 7, hs, hs);
        ctx.fillRect(boxWidth / 2 + 1, -boxHeight / 2 - 7, hs, hs);
        ctx.fillRect(-boxWidth / 2 - 7, boxHeight / 2 + 1, hs, hs);
        ctx.fillRect(boxWidth / 2 + 1, boxHeight / 2 + 1, hs, hs);
      }

      ctx.restore();
    });

    // 6. Snapping Crosshair Guidelines
    if (isDraggingCanvasClip) {
      ctx.save();
      ctx.strokeStyle = '#FFC800';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      if (snappedCenter.x) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
      }
      if (snappedCenter.y) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 7. Reels & TikTok Safe Zone Overlay
    if (showSafeZone && project.aspectRatio === '9:16') {
      ctx.save();

      // Right Rail (Like, Comment, Share, Music Disc)
      const rightRailWidth = 54;
      const rightRailX = canvas.width - rightRailWidth;

      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(rightRailX, canvas.height * 0.45, rightRailWidth, canvas.height * 0.45);

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rightRailX, canvas.height * 0.45, rightRailWidth, canvas.height * 0.45);

      // Bottom Area (Username, Captions & Sound Bar)
      const bottomAreaHeight = canvas.height * 0.22;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.fillRect(0, canvas.height - bottomAreaHeight, canvas.width, bottomAreaHeight);

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.strokeRect(0, canvas.height - bottomAreaHeight, canvas.width, bottomAreaHeight);

      // Top Safe Area (Header / Status bar)
      const topAreaHeight = canvas.height * 0.12;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
      ctx.fillRect(0, 0, canvas.width, topAreaHeight);

      // Safe Zone Labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('UI ICONS (DO NOT COVER)', rightRailX - 6, canvas.height * 0.5);

      ctx.textAlign = 'left';
      ctx.fillText('CAPTIONS & SOUND BAR', 10, canvas.height - bottomAreaHeight + 14);

      ctx.restore();
    }
  }, [currentTimeMs, project, selectedClipId, isDraggingCanvasClip, snappedCenter, showSafeZone]);

  useEffect(() => {
    renderFrame();
  }, [renderFrame]);

  // Frame step controls
  const stepFrame = (frames: number) => {
    const frameMs = 1000 / (project.fps || 30);
    const target = Math.max(0, Math.min(project.durationMs, currentTimeMs + frames * frameMs));
    onSeek(target);
  };

  // Direct Canvas Drag Event Listeners
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Find any text clip currently active at currentTimeMs
    const t = currentTimeMs;
    const activeText = project.clips.find(
      c => c.trackIndex === 6 && !c.hidden && t >= c.startMs && t <= c.endMs
    );

    if (activeText) {
      setIsDraggingCanvasClip(true);
      setDraggedClipId(activeText.id);
      onSelectClip?.(activeText.id);
      setDragStartPos({ x: clickX, y: clickY });
      setInitialClipOffset({
        x: activeText.transform?.offsetX || 0,
        y: activeText.transform?.offsetY ?? 0.36,
      });
    } else {
      // Toggle play if clicking background
      onTogglePlay();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingCanvasClip || !draggedClipId || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const currentX = (e.clientX - rect.left) * scaleX;
      const currentY = (e.clientY - rect.top) * scaleY;

      const deltaX = (currentX - dragStartPos.x) / canvas.width;
      const deltaY = (currentY - dragStartPos.y) / canvas.height;

      let newOffsetX = Math.max(-0.45, Math.min(0.45, initialClipOffset.x + deltaX));
      let newOffsetY = Math.max(-0.45, Math.min(0.45, initialClipOffset.y + deltaY));

      // Snapping to horizontal center (x = 0)
      let snapX = false;
      if (Math.abs(newOffsetX) < 0.035) {
        newOffsetX = 0;
        snapX = true;
      }

      // Snapping to vertical center (y = 0) or lower third (y = 0.36)
      let snapY = false;
      if (Math.abs(newOffsetY) < 0.035) {
        newOffsetY = 0;
        snapY = true;
      } else if (Math.abs(newOffsetY - 0.36) < 0.035) {
        newOffsetY = 0.36;
        snapY = true;
      }

      setSnappedCenter({ x: snapX, y: snapY });

      onUpdateClip?.(draggedClipId, {
        transform: {
          scale: 1.0,
          rotation: 0,
          opacity: 1.0,
          offsetX: newOffsetX,
          offsetY: newOffsetY,
        },
      });
    };

    const handleMouseUp = () => {
      setIsDraggingCanvasClip(false);
      setDraggedClipId(null);
      setSnappedCenter({ x: false, y: false });
    };

    if (isDraggingCanvasClip) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingCanvasClip, draggedClipId, dragStartPos, initialClipOffset, onUpdateClip]);

  return (
    <div className="flex flex-col items-center bg-neutral-950 p-2 sm:p-3 rounded-2xl border border-neutral-800/80 shadow-inner select-none w-full">
      {/* Aspect Ratio Container for Preview */}
      <div className="relative flex items-center justify-center w-full max-h-[38vh] sm:max-h-[42vh] overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 shadow-lg">
        <canvas
          ref={canvasRef}
          width={canvasW}
          height={canvasH}
          onMouseDown={handleCanvasMouseDown}
          className="max-h-[38vh] sm:max-h-[42vh] w-auto max-w-full object-contain cursor-crosshair"
          title="Click to play, or drag captions/elements on screen"
        />

        {/* Floating Approximation Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-neutral-400 font-mono border border-white/10">
          Proxy Preview 480p
        </div>

        {/* Right Header Badges: Safe Zone Toggle & Aspect Ratio */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {/* Safe Zone Toggle Button */}
          <button
            onClick={() => setShowSafeZone(!showSafeZone)}
            className={`px-2 py-0.5 rounded backdrop-blur-sm text-[10px] font-semibold border flex items-center gap-1 transition-colors ${
              showSafeZone
                ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                : 'bg-black/60 border-white/10 text-neutral-400 hover:text-white'
            }`}
            title="Toggle TikTok / Reels Safe Zone Overlay"
          >
            <Shield className="w-3 h-3" />
            <span>Safe Zone</span>
          </button>

          <div className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-[#FFC800] font-semibold border border-[#FFC800]/20">
            {project.aspectRatio}
          </div>
        </div>
      </div>

      {/* Playback Controls & Timecode Bar */}
      <div className="flex items-center justify-between w-full mt-2.5 px-1 max-w-md">
        {/* Timecode display */}
        <div className="font-mono text-xs text-neutral-300 tabular-nums font-medium">
          <span className="text-[#FFC800]">{formatTimecode(currentTimeMs)}</span>
          <span className="text-neutral-500 mx-1">/</span>
          <span className="text-neutral-400">{formatTimecode(project.durationMs)}</span>
        </div>

        {/* Transport buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSeek(0)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Jump to Start"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => stepFrame(-1)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Step Back 1 Frame"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-2.5 rounded-full bg-[#FFC800] text-neutral-950 hover:bg-[#FFD733] shadow-md shadow-[#FFC800]/30 active:scale-95 transition-all"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-neutral-950" />
            ) : (
              <Play className="w-4 h-4 fill-neutral-950 translate-x-0.5" />
            )}
          </button>

          <button
            onClick={() => stepFrame(1)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Step Forward 1 Frame"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSeek(project.durationMs)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Jump to End"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Mute toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
