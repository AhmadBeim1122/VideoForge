export interface EffectDefinition {
  id: string;
  name: string;
  group: 'Stylize' | 'Cinematic' | 'Retro' | 'Glitch' | 'Lens';
  previewFilter: string; // CSS filter or class
  ffmpegFilter: string;
  description: string;
}

export const VIDEO_EFFECTS: EffectDefinition[] = [
  {
    id: 'vignette',
    name: 'Classic Vignette',
    group: 'Lens',
    previewFilter: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.85) 100%)',
    ffmpegFilter: 'vignette=PI/4',
    description: 'Darkened cinematic border focus',
  },
  {
    id: 'film_grain',
    name: '35mm Film Grain',
    group: 'Retro',
    previewFilter: 'contrast(1.15) brightness(0.95)',
    ffmpegFilter: 'noise=alls=20:allf=t+u',
    description: 'Organic photochemical texture',
  },
  {
    id: 'black_white',
    name: 'B&W Film Noir',
    group: 'Cinematic',
    previewFilter: 'grayscale(100%) contrast(1.25)',
    ffmpegFilter: 'hue=s=0',
    description: 'High-contrast monochrome tone',
  },
  {
    id: 'sepia',
    name: 'Sepia Nostalgia',
    group: 'Retro',
    previewFilter: 'sepia(80%) contrast(1.1)',
    ffmpegFilter: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0',
    description: 'Vintage golden archival look',
  },
  {
    id: 'rgb_split',
    name: 'RGB Chromatic Shift',
    group: 'Glitch',
    previewFilter: 'drop-shadow(-3px 0px 0px rgba(255,0,0,0.7)) drop-shadow(3px 0px 0px rgba(0,255,255,0.7))',
    ffmpegFilter: 'rgbashift=rh=-8:bh=8',
    description: 'Cybernetic color channel splitting',
  },
  {
    id: 'vhs_glitch',
    name: 'VHS Tape Glitch',
    group: 'Glitch',
    previewFilter: 'hue-rotate(20deg) contrast(1.3) saturate(1.4)',
    ffmpegFilter: 'curves=vintage',
    description: 'Analog tracking distortion & scanlines',
  },
  {
    id: 'glow',
    name: 'Dreamy Bloom Glow',
    group: 'Stylize',
    previewFilter: 'brightness(1.15) drop-shadow(0 0 12px rgba(255,255,255,0.4))',
    ffmpegFilter: 'gblur=sigma=10:steps=1',
    description: 'Ethereal highlight diffusion',
  },
  {
    id: 'cyber_duotone',
    name: 'Cyber Duotone',
    group: 'Stylize',
    previewFilter: 'contrast(1.4) hue-rotate(180deg) saturate(1.8)',
    ffmpegFilter: 'colorbalance=rs=0.5:bs=-0.5',
    description: 'Futuristic high-contrast dual tint',
  },
  {
    id: 'high_contrast',
    name: 'Punchy Contrast',
    group: 'Cinematic',
    previewFilter: 'contrast(1.4) saturate(1.2)',
    ffmpegFilter: 'eq=contrast=1.35:saturation=1.2',
    description: 'Deep blacks and radiant highlights',
  },
  {
    id: 'strobe_flash',
    name: 'Strobe Flash Accent',
    group: 'Glitch',
    previewFilter: 'brightness(1.5) contrast(1.2)',
    ffmpegFilter: 'eq=brightness=0.3',
    description: 'High energy rhythmic illumination',
  },
  {
    id: 'heatwave',
    name: 'Heatwave Thermal',
    group: 'Stylize',
    previewFilter: 'invert(80%) hue-rotate(90deg)',
    ffmpegFilter: 'lutrgb=r=maxval-val:g=maxval-val',
    description: 'Thermal infrared spectrum shift',
  },
  {
    id: 'crt_scan',
    name: 'CRT Monitor Lines',
    group: 'Retro',
    previewFilter: 'contrast(1.2) brightness(0.9)',
    ffmpegFilter: 'drawgrid=width=100:height=4:thickness=1:color=black@0.3',
    description: 'Retro arcade monitor raster lines',
  },
];

export interface TransitionDefinition {
  id: string;
  name: string;
  type: 'fade' | 'slide' | 'zoom' | 'wipe' | 'glitch';
  description: string;
  ffmpegTransitionName: string;
}

export const TRANSITIONS: TransitionDefinition[] = [
  { id: 'dissolve', name: 'Cross Dissolve', type: 'fade', description: 'Smooth blend between scenes', ffmpegTransitionName: 'fade' },
  { id: 'slide_left', name: 'Slide Left', type: 'slide', description: 'Next scene sweeps in from right', ffmpegTransitionName: 'slideleft' },
  { id: 'slide_right', name: 'Slide Right', type: 'slide', description: 'Next scene sweeps in from left', ffmpegTransitionName: 'slideright' },
  { id: 'push_up', name: 'Push Up', type: 'slide', description: 'Vertical upward scene push', ffmpegTransitionName: 'slideup' },
  { id: 'zoom', name: 'Zoom In Punch', type: 'zoom', description: 'Dynamic camera plunge forward', ffmpegTransitionName: 'zoomin' },
  { id: 'cross_zoom', name: 'Cross Zoom Rush', type: 'zoom', description: 'Dual speed zoom transition', ffmpegTransitionName: 'smoothleft' },
  { id: 'wipe', name: 'Linear Wipe', type: 'wipe', description: 'Clean geometric horizontal cut', ffmpegTransitionName: 'wipeleft' },
  { id: 'glitch_cut', name: 'Glitch Cut', type: 'glitch', description: 'Digital signal rupture into next clip', ffmpegTransitionName: 'pixelize' },
  { id: 'fade_black', name: 'Dip to Black', type: 'fade', description: 'Dramatic blackout punctuation', ffmpegTransitionName: 'fadeblack' },
  { id: 'fade_white', name: 'Flash to White', type: 'fade', description: 'High intensity flash cut', ffmpegTransitionName: 'fadewhite' },
];

export interface TextAnimationDefinition {
  id: string;
  name: string;
  description: string;
}

export const TEXT_ANIMATIONS: TextAnimationDefinition[] = [
  { id: 'none', name: 'None', description: 'Static instant appearance' },
  { id: 'fade', name: 'Fade In / Out', description: 'Smooth opacity ramp' },
  { id: 'slide_up', name: 'Slide Up', description: 'Enters gracefully from below' },
  { id: 'slide_down', name: 'Slide Down', description: 'Drops in from top' },
  { id: 'pop', name: 'Pop Scale', description: 'High impact scale overshoot' },
  { id: 'typewriter', name: 'Typewriter', description: 'Char-by-char terminal reveal' },
  { id: 'zoom', name: 'Zoom Rush', description: 'Punches from small to full' },
];
