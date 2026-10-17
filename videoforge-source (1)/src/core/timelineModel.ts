import { Clip, ClipType, Project, TRACK_CONFIGS, TrackDefinition } from '../types/timeline';

export const MIN_CLIP_DURATION_MS = 100;
export const MAX_EFFECT_LAYERS = 40;

export function createDefaultTransform() {
  return {
    scale: 1.0,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    opacity: 1.0,
  };
}

export function createDefaultLook() {
  return {
    brightness: 0,
    contrast: 1.0,
    saturation: 1.0,
  };
}

export function createDefaultTransition() {
  return {
    id: undefined,
    ms: 800,
  };
}

export function isClipTypeAllowedOnTrack(clipType: ClipType, trackIndex: number): boolean {
  const track = TRACK_CONFIGS.find(t => t.index === trackIndex);
  if (!track) return false;
  return track.allowedClipTypes.includes(clipType);
}

export function calculateProjectDuration(clips: Clip[]): number {
  // Timeline length ignores Effect clips (Track 5) per requirement 6
  const mediaClips = clips.filter(c => c.trackIndex !== 5);
  if (mediaClips.length === 0) return 10000; // minimum 10s base timeline
  const maxEnd = Math.max(...mediaClips.map(c => c.endMs));
  return Math.max(10000, maxEnd + 1000);
}

export function sanitizeClipDuration(startMs: number, endMs: number): { startMs: number; endMs: number } {
  const start = Math.max(0, startMs);
  let end = Math.max(start + MIN_CLIP_DURATION_MS, endMs);
  return { startMs: start, endMs: end };
}

/**
 * Migration helper: If an older project had layout 1, 2, or 3, remap tracks to layout 4
 */
export function migrateProjectLayout(rawProject: any): Project {
  const layout = rawProject.layoutVersion || 1;
  const project: Project = {
    ...rawProject,
    layoutVersion: 4,
    tracks: TRACK_CONFIGS,
    clips: [...(rawProject.clips || [])],
  };

  if (layout < 4) {
    project.clips = project.clips.map(clip => {
      let targetTrack = clip.trackIndex;
      // Remap if needed based on clip type
      if (clip.type === 'text') targetTrack = 6;
      else if (clip.type === 'effect') targetTrack = 5;
      else if (clip.type === 'video' && clip.trackIndex === 0) targetTrack = 3;
      return {
        ...clip,
        trackIndex: targetTrack,
        transform: clip.transform || createDefaultTransform(),
        look: clip.look || createDefaultLook(),
        transition: clip.transition || createDefaultTransition(),
      };
    });
  }

  project.durationMs = calculateProjectDuration(project.clips);
  return project;
}

// -------------------------------------------------------------
// Timeline Operations (Immutable - returns updated project)
// -------------------------------------------------------------

export function addClip(project: Project, clip: Clip): { success: boolean; project: Project; error?: string } {
  if (!isClipTypeAllowedOnTrack(clip.type, clip.trackIndex)) {
    return {
      success: false,
      project,
      error: `Track ${clip.trackIndex} does not accept clips of type '${clip.type}'`,
    };
  }

  if (clip.trackIndex === 5) {
    const effectCount = project.clips.filter(c => c.trackIndex === 5).length;
    if (effectCount >= MAX_EFFECT_LAYERS) {
      return {
        success: false,
        project,
        error: `Maximum ${MAX_EFFECT_LAYERS} effect layers allowed per project`,
      };
    }
  }

  const { startMs, endMs } = sanitizeClipDuration(clip.startMs, clip.endMs);
  const validatedClip: Clip = {
    ...clip,
    startMs,
    endMs,
    speed: clip.speed || 1.0,
    volume: clip.volume !== undefined ? clip.volume : 1.0,
    transform: clip.transform || createDefaultTransform(),
    look: clip.look || createDefaultLook(),
    transition: clip.transition || createDefaultTransition(),
  };

  const updatedClips = [...project.clips, validatedClip];
  return {
    success: true,
    project: {
      ...project,
      clips: updatedClips,
      durationMs: calculateProjectDuration(updatedClips),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function moveClip(
  project: Project,
  clipId: string,
  newStartMs: number,
  newTrackIndex?: number
): { success: boolean; project: Project; error?: string } {
  const clip = project.clips.find(c => c.id === clipId);
  if (!clip) return { success: false, project, error: 'Clip not found' };

  const targetTrack = newTrackIndex !== undefined ? newTrackIndex : clip.trackIndex;
  if (!isClipTypeAllowedOnTrack(clip.type, targetTrack)) {
    return {
      success: false,
      project,
      error: `Cannot move clip of type '${clip.type}' to track ${targetTrack}`,
    };
  }

  const duration = clip.endMs - clip.startMs;
  const startMs = Math.max(0, Math.round(newStartMs));
  const endMs = startMs + duration;

  const updatedClips = project.clips.map(c => {
    if (c.id === clipId) {
      return { ...c, startMs, endMs, trackIndex: targetTrack };
    }
    return c;
  });

  return {
    success: true,
    project: {
      ...project,
      clips: updatedClips,
      durationMs: calculateProjectDuration(updatedClips),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function trimClip(
  project: Project,
  clipId: string,
  newStartMs: number,
  newEndMs: number,
  isStartTrim: boolean
): { success: boolean; project: Project; error?: string } {
  const clip = project.clips.find(c => c.id === clipId);
  if (!clip) return { success: false, project, error: 'Clip not found' };

  let startMs = Math.max(0, Math.round(newStartMs));
  let endMs = Math.max(startMs + MIN_CLIP_DURATION_MS, Math.round(newEndMs));

  // Source media trim bounds calculation
  let sourceInMs = clip.sourceInMs;
  if (isStartTrim) {
    const deltaMs = startMs - clip.startMs;
    sourceInMs = Math.max(0, clip.sourceInMs + Math.round(deltaMs * clip.speed));
  }

  const updatedClips = project.clips.map(c => {
    if (c.id === clipId) {
      return {
        ...c,
        startMs,
        endMs,
        sourceInMs,
      };
    }
    return c;
  });

  return {
    success: true,
    project: {
      ...project,
      clips: updatedClips,
      durationMs: calculateProjectDuration(updatedClips),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function splitClipAtPlayhead(
  project: Project,
  clipId: string,
  playheadMs: number
): { success: boolean; project: Project; newClipId?: string; error?: string } {
  const clip = project.clips.find(c => c.id === clipId);
  if (!clip) return { success: false, project, error: 'Clip not found' };

  if (playheadMs <= clip.startMs + MIN_CLIP_DURATION_MS || playheadMs >= clip.endMs - MIN_CLIP_DURATION_MS) {
    return {
      success: false,
      project,
      error: 'Playhead is too close to clip boundary to split (min 100ms)',
    };
  }

  const firstClipEnd = playheadMs;
  const secondClipStart = playheadMs;
  const splitSourceIn = clip.sourceInMs + Math.round((playheadMs - clip.startMs) * clip.speed);

  const updatedFirstClip: Clip = {
    ...clip,
    endMs: firstClipEnd,
  };

  const newClipId = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const secondClip: Clip = {
    ...clip,
    id: newClipId,
    name: `${clip.name} (Part 2)`,
    startMs: secondClipStart,
    endMs: clip.endMs,
    sourceInMs: splitSourceIn,
    transition: createDefaultTransition(), // remove transition from second split part
  };

  const updatedClips = project.clips.map(c => (c.id === clipId ? updatedFirstClip : c)).concat(secondClip);

  return {
    success: true,
    newClipId,
    project: {
      ...project,
      clips: updatedClips,
      durationMs: calculateProjectDuration(updatedClips),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function deleteClip(project: Project, clipId: string): Project {
  const updatedClips = project.clips.filter(c => c.id !== clipId);
  return {
    ...project,
    clips: updatedClips,
    durationMs: calculateProjectDuration(updatedClips),
    updatedAt: new Date().toISOString(),
  };
}

export function duplicateClip(project: Project, clipId: string): { success: boolean; project: Project; newClipId?: string } {
  const clip = project.clips.find(c => c.id === clipId);
  if (!clip) return { success: false, project };

  const duration = clip.endMs - clip.startMs;
  const newStart = clip.endMs + 100; // place right after with tiny spacing or flush
  const newEnd = newStart + duration;
  const newClipId = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newClip: Clip = {
    ...clip,
    id: newClipId,
    name: `${clip.name} Copy`,
    startMs: newStart,
    endMs: newEnd,
  };

  const updatedClips = [...project.clips, newClip];
  return {
    success: true,
    newClipId,
    project: {
      ...project,
      clips: updatedClips,
      durationMs: calculateProjectDuration(updatedClips),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function rippleDeleteClip(project: Project, clipId: string): Project {
  const target = project.clips.find(c => c.id === clipId);
  if (!target) return project;

  const gapDuration = target.endMs - target.startMs;
  const targetTrack = target.trackIndex;
  const targetStart = target.startMs;

  const updatedClips = project.clips
    .filter(c => c.id !== clipId)
    .map(c => {
      if (c.trackIndex === targetTrack && c.startMs >= targetStart) {
        return {
          ...c,
          startMs: Math.max(0, c.startMs - gapDuration),
          endMs: Math.max(MIN_CLIP_DURATION_MS, c.endMs - gapDuration),
        };
      }
      return c;
    });

  return {
    ...project,
    clips: updatedClips,
    durationMs: calculateProjectDuration(updatedClips),
    updatedAt: new Date().toISOString(),
  };
}

export function closeGapsOnTrack(project: Project, trackIndex: number): Project {
  const trackClips = project.clips
    .filter(c => c.trackIndex === trackIndex)
    .sort((a, b) => a.startMs - b.startMs);

  if (trackClips.length <= 1) return project;

  let currentCursor = trackClips[0].startMs;
  const updatedTrackClips: Clip[] = [];

  for (const clip of trackClips) {
    const duration = clip.endMs - clip.startMs;
    updatedTrackClips.push({
      ...clip,
      startMs: currentCursor,
      endMs: currentCursor + duration,
    });
    currentCursor += duration;
  }

  const otherClips = project.clips.filter(c => c.trackIndex !== trackIndex);
  const allClips = [...otherClips, ...updatedTrackClips];

  return {
    ...project,
    clips: allClips,
    durationMs: calculateProjectDuration(allClips),
    updatedAt: new Date().toISOString(),
  };
}

export function changeClipSpeed(project: Project, clipId: string, newSpeed: number): Project {
  const speed = Math.max(0.1, Math.min(10.0, newSpeed));
  const clip = project.clips.find(c => c.id === clipId);
  if (!clip) return project;

  // recalculate endMs based on speed ratio
  const originalDuration = (clip.endMs - clip.startMs) * clip.speed;
  const newTimelineDuration = Math.round(originalDuration / speed);
  const endMs = clip.startMs + Math.max(MIN_CLIP_DURATION_MS, newTimelineDuration);

  const updatedClips = project.clips.map(c => (c.id === clipId ? { ...c, speed, endMs } : c));

  return {
    ...project,
    clips: updatedClips,
    durationMs: calculateProjectDuration(updatedClips),
    updatedAt: new Date().toISOString(),
  };
}

export function updateClipProperties(project: Project, clipId: string, partial: Partial<Clip>): Project {
  const updatedClips = project.clips.map(c => {
    if (c.id === clipId) {
      return {
        ...c,
        ...partial,
        transform: partial.transform ? { ...c.transform, ...partial.transform } : c.transform,
        look: partial.look ? { ...c.look, ...partial.look } : c.look,
        transition: partial.transition ? { ...c.transition, ...partial.transition } : c.transition,
        text: partial.text ? { ...c.text, ...partial.text } : c.text,
      };
    }
    return c;
  });

  return {
    ...project,
    clips: updatedClips,
    durationMs: calculateProjectDuration(updatedClips),
    updatedAt: new Date().toISOString(),
  };
}

export function replaceAllClipsOfTrack(project: Project, trackIndex: number, newClips: Clip[]): Project {
  // Validate that all newClips match track type
  const valid = newClips.filter(c => isClipTypeAllowedOnTrack(c.type, trackIndex));
  const otherClips = project.clips.filter(c => c.trackIndex !== trackIndex);
  const allClips = [...otherClips, ...valid];

  return {
    ...project,
    clips: allClips,
    durationMs: calculateProjectDuration(allClips),
    updatedAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// Transition Batch Operations
// -------------------------------------------------------------

const TRANSITION_PRESETS = ['dissolve', 'slide_left', 'slide_right', 'push_up', 'zoom', 'wipe', 'glitch_cut'];

export function applyTransitionToAllCuts(project: Project, transitionId: string, durationMs: number = 800): Project {
  const videoClips = project.clips
    .filter(c => c.trackIndex === 3)
    .sort((a, b) => a.startMs - b.startMs);

  // Apply to all except the very first clip (must touch previous clip)
  const updatedVideoClips = videoClips.map((clip, index) => {
    if (index === 0) return clip;
    return {
      ...clip,
      transition: { id: transitionId, ms: durationMs },
    };
  });

  const otherClips = project.clips.filter(c => c.trackIndex !== 3);
  return {
    ...project,
    clips: [...otherClips, ...updatedVideoClips],
    updatedAt: new Date().toISOString(),
  };
}

export function applyRandomTransitionToAllCuts(project: Project): Project {
  const videoClips = project.clips
    .filter(c => c.trackIndex === 3)
    .sort((a, b) => a.startMs - b.startMs);

  const updatedVideoClips = videoClips.map((clip, index) => {
    if (index === 0) return clip;
    const randomTrans = TRANSITION_PRESETS[Math.floor(Math.random() * TRANSITION_PRESETS.length)];
    return {
      ...clip,
      transition: { id: randomTrans, ms: 800 },
    };
  });

  const otherClips = project.clips.filter(c => c.trackIndex !== 3);
  return {
    ...project,
    clips: [...otherClips, ...updatedVideoClips],
    updatedAt: new Date().toISOString(),
  };
}

export function applyRandomTransitionsToRandomClips(project: Project): Project {
  const videoClips = project.clips
    .filter(c => c.trackIndex === 3)
    .sort((a, b) => a.startMs - b.startMs);

  const updatedVideoClips = videoClips.map((clip, index) => {
    if (index === 0) return clip;
    // 50% chance of transition
    if (Math.random() > 0.45) {
      const randomTrans = TRANSITION_PRESETS[Math.floor(Math.random() * TRANSITION_PRESETS.length)];
      return {
        ...clip,
        transition: { id: randomTrans, ms: 700 },
      };
    }
    return {
      ...clip,
      transition: { id: undefined, ms: 800 },
    };
  });

  const otherClips = project.clips.filter(c => c.trackIndex !== 3);
  return {
    ...project,
    clips: [...otherClips, ...updatedVideoClips],
    updatedAt: new Date().toISOString(),
  };
}

export function removeAllTransitions(project: Project): Project {
  const updatedClips = project.clips.map(c => ({
    ...c,
    transition: { id: undefined, ms: 800 },
  }));

  return {
    ...project,
    clips: updatedClips,
    updatedAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// Snapshot Undo / Redo Manager
// -------------------------------------------------------------

export class TimelineUndoRedoStack {
  private past: Project[] = [];
  private future: Project[] = [];
  private current: Project;
  private maxDepth = 40;

  constructor(initialProject: Project) {
    this.current = JSON.parse(JSON.stringify(initialProject));
  }

  getCurrent(): Project {
    return this.current;
  }

  push(newProject: Project) {
    this.past.push(JSON.parse(JSON.stringify(this.current)));
    if (this.past.length > this.maxDepth) {
      this.past.shift();
    }
    this.current = JSON.parse(JSON.stringify(newProject));
    this.future = []; // clear redo on new action
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  undo(): Project | null {
    if (!this.canUndo()) return null;
    const previous = this.past.pop()!;
    this.future.push(this.current);
    this.current = previous;
    return this.current;
  }

  redo(): Project | null {
    if (!this.canRedo()) return null;
    const next = this.future.pop()!;
    this.past.push(this.current);
    this.current = next;
    return this.current;
  }
}
