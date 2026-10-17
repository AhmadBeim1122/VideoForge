export type TrackType = 'voice' | 'music' | 'sfx' | 'video' | 'overlay' | 'effects' | 'text';

export type ClipType = 'video' | 'audio' | 'image' | 'text' | 'effect' | 'sticker';

export interface TransformProperties {
  scale: number;        // default: 1.0
  offsetX: number;      // -1.0 to 1.0, 0 is center
  offsetY: number;      // -1.0 to 1.0, 0 is center
  rotation: number;     // degrees (-180 to 180)
  opacity: number;      // 0 to 1.0
}

export interface LookProperties {
  brightness: number;   // -1.0 to 1.0, default 0
  contrast: number;     // 0 to 2.0, default 1.0
  saturation: number;   // 0 to 2.0, default 1.0
  effectId?: string;
}

export interface TransitionProperties {
  id?: string;          // e.g. 'dissolve', 'slide_left', 'wipe', 'zoom'
  ms?: number;          // 100 to 3000 ms, default 800
}

export interface TextProperties {
  text: string;
  size: number;         // 0.02 to 0.15 (fraction of height, default 0.055)
  color: string;        // hex or css
  bold: boolean;
  box: boolean;         // dark box behind text
  boxColor?: string;
  fontFamily?: string;
  animIn: string;       // 'none' | 'fade' | 'slide_up' | 'pop' | 'typewriter' | 'zoom'
  animOut: string;      // 'none' | 'fade' | 'slide_down' | 'zoom'
  animMs: number;       // 100 to 2000 ms, default 500
  align?: 'left' | 'center' | 'right';
  animScope?: 'in' | 'out' | 'in_out';
}

export interface Clip {
  id: string;
  name: string;
  type: ClipType;
  trackIndex: number;   // 0 to 6
  startMs: number;
  endMs: number;
  sourceFilePath?: string;
  sourceInMs: number;
  sourceDurationMs: number;
  speed: number;        // 0.1 to 10.0, default 1.0
  volume: number;       // 0 to 2.0, default 1.0
  transform: TransformProperties;
  look: LookProperties;
  transition: TransitionProperties;
  text?: TextProperties;
  effectId?: string;    // for effect clips on Track 5
  color?: string;       // for color blocks / stock items
  thumbnailUrl?: string;
  hidden: boolean;
}

export interface TrackDefinition {
  index: number;
  name: string;
  type: TrackType;
  color: string;
  allowedClipTypes: ClipType[];
  muted?: boolean;
  locked?: boolean;
}

export interface Project {
  id: string;
  name: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  resolution: '720p' | '1080p' | '4k';
  fps: number;
  createdAt: string;
  updatedAt: string;
  durationMs: number;
  layoutVersion: number; // 4
  tracks: TrackDefinition[];
  clips: Clip[];
  thumbnailUrl?: string;
  sourceMediaUrl?: string;
  sourceTranscript?: WhisperSegment[];
  scriptText?: string;
}

export interface WhisperSegment {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
  confidence?: number;
}

export const TRACK_CONFIGS: TrackDefinition[] = [
  { index: 0, name: 'Voice', type: 'voice', color: '#38BDF8', allowedClipTypes: ['audio'] },
  { index: 1, name: 'Music', type: 'music', color: '#A855F7', allowedClipTypes: ['audio'] },
  { index: 2, name: 'Sfx', type: 'sfx', color: '#EC4899', allowedClipTypes: ['audio'] },
  { index: 3, name: 'Video (Main)', type: 'video', color: '#FFC800', allowedClipTypes: ['video', 'image'] },
  { index: 4, name: 'Overlay', type: 'overlay', color: '#10B981', allowedClipTypes: ['video', 'image', 'sticker'] },
  { index: 5, name: 'Effects', type: 'effects', color: '#F97316', allowedClipTypes: ['effect'] },
  { index: 6, name: 'Text', type: 'text', color: '#6366F1', allowedClipTypes: ['text'] },
];
