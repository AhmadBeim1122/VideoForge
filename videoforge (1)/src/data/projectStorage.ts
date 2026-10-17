import { Project, TRACK_CONFIGS } from '../types/timeline';
import { calculateProjectDuration, migrateProjectLayout } from '../core/timelineModel';

const STORAGE_KEY = 'videoforge_projects_v4';
const ACTIVE_PROJECT_ID_KEY = 'videoforge_active_project_id';

export const SAMPLE_PROJECT: Project = {
  id: 'proj_sample_vertical_explainer',
  name: 'Why Attention Spans Dropped',
  aspectRatio: '9:16', // Shorts / Reels
  resolution: '1080p',
  fps: 30,
  createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  updatedAt: new Date().toISOString(),
  durationMs: 14500,
  layoutVersion: 4,
  tracks: TRACK_CONFIGS,
  sourceMediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  scriptText: 'Why did vertical video conquer the world? Because mobile phones changed human posture forever. Creators who master fast pacing win the algorithm.',
  sourceTranscript: [
    { id: 'st_1', start: 0.0, end: 3.5, text: 'Why did vertical video conquer the world?' },
    { id: 'st_2', start: 3.8, end: 8.2, text: 'Because mobile phones changed human posture forever.' },
    { id: 'st_3', start: 8.5, end: 14.0, text: 'Creators who master fast pacing win the algorithm.' },
  ],
  clips: [
    // Track 0: Voice
    {
      id: 'clip_vo_1',
      name: 'VO 1: Hook Question',
      type: 'audio',
      trackIndex: 0,
      startMs: 0,
      endMs: 3800,
      sourceInMs: 0,
      sourceDurationMs: 3800,
      speed: 1.0,
      volume: 1.0,
      transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      hidden: false,
    },
    {
      id: 'clip_vo_2',
      name: 'VO 2: Core Explanation',
      type: 'audio',
      trackIndex: 0,
      startMs: 4000,
      endMs: 8800,
      sourceInMs: 0,
      sourceDurationMs: 4800,
      speed: 1.0,
      volume: 1.0,
      transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      hidden: false,
    },
    {
      id: 'clip_vo_3',
      name: 'VO 3: Call to Action',
      type: 'audio',
      trackIndex: 0,
      startMs: 9000,
      endMs: 14000,
      sourceInMs: 0,
      sourceDurationMs: 5000,
      speed: 1.0,
      volume: 1.0,
      transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      hidden: false,
    },

    // Track 1: Music
    {
      id: 'clip_mus_1',
      name: 'Lo-Fi Explainer Beat',
      type: 'audio',
      trackIndex: 1,
      startMs: 0,
      endMs: 14500,
      sourceInMs: 0,
      sourceDurationMs: 14500,
      speed: 1.0,
      volume: 0.25, // background level
      transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      hidden: false,
    },

    // Track 2: Sfx
    {
      id: 'clip_sfx_1',
      name: 'Whoosh Fast',
      type: 'audio',
      trackIndex: 2,
      startMs: 3700,
      endMs: 4200,
      sourceInMs: 0,
      sourceDurationMs: 500,
      speed: 1.0,
      volume: 1.0,
      transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      hidden: false,
    },
    {
      id: 'clip_sfx_2',
      name: 'Success Ding',
      type: 'audio',
      trackIndex: 2,
      startMs: 8800,
      endMs: 9700,
      sourceInMs: 0,
      sourceDurationMs: 900,
      speed: 1.0,
      volume: 0.9,
      transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      hidden: false,
    },

    // Track 3: Video (Main)
    {
      id: 'clip_vid_1',
      name: 'Scene 1: Phone Interaction',
      type: 'video',
      trackIndex: 3,
      startMs: 0,
      endMs: 4000,
      sourceInMs: 1000,
      sourceDurationMs: 4000,
      speed: 1.0,
      volume: 0.1,
      color: '#1E1B4B',
      transform: { scale: 1.05, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
      look: { brightness: 0.05, contrast: 1.1, saturation: 1.2 },
      transition: { id: 'slide_left', ms: 700 },
      hidden: false,
    },
    {
      id: 'clip_vid_2',
      name: 'Scene 2: Crowd Scrolling',
      type: 'video',
      trackIndex: 3,
      startMs: 4000,
      endMs: 9000,
      sourceInMs: 5000,
      sourceDurationMs: 5000,
      speed: 1.0,
      volume: 0.1,
      color: '#0F172A',
      transform: { scale: 1.0, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1.15, saturation: 1.05 },
      transition: { id: 'zoom', ms: 800 },
      hidden: false,
    },
    {
      id: 'clip_vid_3',
      name: 'Scene 3: Studio Editing',
      type: 'image', // image clip on video track
      trackIndex: 3,
      startMs: 9000,
      endMs: 14500,
      sourceInMs: 0,
      sourceDurationMs: 5500,
      speed: 1.0,
      volume: 0.0,
      color: '#FFC800', // VideoForge signature amber yellow
      transform: { scale: 1.0, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1.0, saturation: 1.0 },
      transition: {},
      hidden: false,
    },

    // Track 5: Effects
    {
      id: 'clip_eff_1',
      name: 'Vignette Cinematic Layer',
      type: 'effect',
      trackIndex: 5,
      startMs: 0,
      endMs: 9000,
      sourceInMs: 0,
      sourceDurationMs: 9000,
      speed: 1.0,
      volume: 0,
      effectId: 'vignette',
      transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 0.8 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      hidden: false,
    },

    // Track 6: Text (Captions)
    {
      id: 'clip_txt_1',
      name: 'Hook Title',
      type: 'text',
      trackIndex: 6,
      startMs: 200,
      endMs: 3800,
      sourceInMs: 0,
      sourceDurationMs: 3600,
      speed: 1.0,
      volume: 0,
      transform: { scale: 1, offsetX: 0, offsetY: 0.36, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      text: {
        text: 'WHY ATTENTION SPANS DROPPED?',
        size: 0.065,
        color: '#FFC800',
        bold: true,
        box: true,
        boxColor: '#000000',
        animIn: 'pop',
        animOut: 'fade',
        animMs: 250,
      },
      hidden: false,
    },
    {
      id: 'clip_txt_2',
      name: 'Subtitle 2',
      type: 'text',
      trackIndex: 6,
      startMs: 4100,
      endMs: 8800,
      sourceInMs: 0,
      sourceDurationMs: 4700,
      speed: 1.0,
      volume: 0,
      transform: { scale: 1, offsetX: 0, offsetY: 0.36, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      text: {
        text: 'Mobile screens changed human posture',
        size: 0.055,
        color: '#FFFFFF',
        bold: true,
        box: true,
        boxColor: 'rgba(0,0,0,0.8)',
        animIn: 'slide_up',
        animOut: 'fade',
        animMs: 300,
      },
      hidden: false,
    },
    {
      id: 'clip_txt_3',
      name: 'Subtitle 3',
      type: 'text',
      trackIndex: 6,
      startMs: 9200,
      endMs: 14000,
      sourceInMs: 0,
      sourceDurationMs: 4800,
      speed: 1.0,
      volume: 0,
      transform: { scale: 1, offsetX: 0, offsetY: 0.36, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      text: {
        text: 'Master the algorithm with VideoForge ⚡',
        size: 0.058,
        color: '#10B981',
        bold: true,
        box: true,
        boxColor: '#000000',
        animIn: 'pop',
        animOut: 'fade',
        animMs: 250,
      },
      hidden: false,
    },
  ],
};

export function loadAllProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = [SAMPLE_PROJECT];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      localStorage.setItem(ACTIVE_PROJECT_ID_KEY, SAMPLE_PROJECT.id);
      return initial;
    }
    const parsed = JSON.parse(raw) as Project[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = [SAMPLE_PROJECT];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      localStorage.setItem(ACTIVE_PROJECT_ID_KEY, SAMPLE_PROJECT.id);
      return initial;
    }
    return parsed.map(migrateProjectLayout);
  } catch (err) {
    console.error('Failed to load projects from storage:', err);
    return [SAMPLE_PROJECT];
  }
}

export function saveProject(project: Project): void {
  try {
    let existing: Project[] = [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          existing = parsed;
        }
      } catch (_) {}
    }
    if (existing.length === 0) {
      existing = [SAMPLE_PROJECT];
    }

    const index = existing.findIndex(p => p.id === project.id);
    const updated = {
      ...project,
      updatedAt: new Date().toISOString(),
      durationMs: calculateProjectDuration(project.clips),
    };

    let nextList: Project[];
    if (index >= 0) {
      nextList = [...existing];
      nextList[index] = updated;
    } else {
      nextList = [updated, ...existing];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    localStorage.setItem(ACTIVE_PROJECT_ID_KEY, project.id);
  } catch (err) {
    console.error('Failed to save project:', err);
  }
}

export function createNewProject(
  name: string = 'Untitled Explainer',
  aspectRatio: '16:9' | '9:16' | '1:1' = '9:16'
): Project {
  const newProject: Project = {
    id: `vf_proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    aspectRatio,
    resolution: '1080p',
    fps: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    durationMs: 12000,
    layoutVersion: 4,
    tracks: TRACK_CONFIGS,
    clips: [],
    scriptText: '',
  };

  saveProject(newProject);
  return newProject;
}

export function deleteProject(projectId: string): Project[] {
  const existing = loadAllProjects().filter(p => p.id !== projectId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  return existing;
}

export function duplicateProject(projectId: string): Project | null {
  const existing = loadAllProjects();
  const source = existing.find(p => p.id === projectId);
  if (!source) return null;

  const duplicated: Project = {
    ...JSON.parse(JSON.stringify(source)),
    id: `vf_proj_${Date.now()}_dup`,
    name: `${source.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveProject(duplicated);
  return duplicated;
}

export function getActiveProjectId(): string {
  return localStorage.getItem(ACTIVE_PROJECT_ID_KEY) || SAMPLE_PROJECT.id;
}

export function setActiveProjectId(id: string) {
  localStorage.setItem(ACTIVE_PROJECT_ID_KEY, id);
}
