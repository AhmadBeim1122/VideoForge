export interface SoundItem {
  id: string;
  name: string;
  category: string;
  durationMs: number;
  type: 'sfx' | 'music';
  synthType: string;
  params: Record<string, number | string | number[]>;
}

export const SOUND_CATEGORIES = [
  'Whooshes & Swishes',
  'Clicks & UI',
  'Pops & Bubbles',
  'Dings & Bells',
  'Impacts & Hits',
  'Risers & Tension',
  'Glitches & Cyber',
  'Bass & Drops',
  'Ambient & Drone',
  'Cartoon & Fun',
];

// Generate ~100 distinct procedural sound presets
export const BUILT_IN_SOUNDS: SoundItem[] = [
  // 1. Whooshes & Swishes (12)
  { id: 'wh_01', name: 'Fast Whip Whoosh', category: 'Whooshes & Swishes', durationMs: 400, type: 'sfx', synthType: 'noise_sweep', params: { freqStart: 800, freqEnd: 200, time: 0.4 } },
  { id: 'wh_02', name: 'Cinematic Air Whoosh', category: 'Whooshes & Swishes', durationMs: 800, type: 'sfx', synthType: 'noise_sweep', params: { freqStart: 1200, freqEnd: 150, time: 0.8 } },
  { id: 'wh_03', name: 'Heavy Low Whoosh', category: 'Whooshes & Swishes', durationMs: 700, type: 'sfx', synthType: 'sub_whoosh', params: { freq: 120, time: 0.7 } },
  { id: 'wh_04', name: 'Double Whoosh', category: 'Whooshes & Swishes', durationMs: 600, type: 'sfx', synthType: 'noise_sweep', params: { freqStart: 900, freqEnd: 300, time: 0.6 } },
  { id: 'wh_05', name: 'Short Swipe', category: 'Whooshes & Swishes', durationMs: 250, type: 'sfx', synthType: 'noise_sweep', params: { freqStart: 1400, freqEnd: 400, time: 0.25 } },
  { id: 'wh_06', name: 'Reverse Riser Whoosh', category: 'Whooshes & Swishes', durationMs: 900, type: 'sfx', synthType: 'riser', params: { freqStart: 100, freqEnd: 1800, time: 0.9 } },
  { id: 'wh_07', name: 'Wind Gust Whoosh', category: 'Whooshes & Swishes', durationMs: 1200, type: 'sfx', synthType: 'noise_sweep', params: { freqStart: 600, freqEnd: 100, time: 1.2 } },
  { id: 'wh_08', name: 'Laser Whoosh', category: 'Whooshes & Swishes', durationMs: 500, type: 'sfx', synthType: 'laser', params: { freqStart: 2000, freqEnd: 200, time: 0.5 } },
  { id: 'wh_09', name: 'Sub Zoom Swoosh', category: 'Whooshes & Swishes', durationMs: 650, type: 'sfx', synthType: 'sub_whoosh', params: { freq: 80, time: 0.65 } },
  { id: 'wh_10', name: 'Metallic Slice', category: 'Whooshes & Swishes', durationMs: 450, type: 'sfx', synthType: 'metallic', params: { freq: 1800, time: 0.45 } },
  { id: 'wh_11', name: 'Deep Space Swish', category: 'Whooshes & Swishes', durationMs: 1000, type: 'sfx', synthType: 'noise_sweep', params: { freqStart: 400, freqEnd: 60, time: 1.0 } },
  { id: 'wh_12', name: 'Snappy Page Turn', category: 'Whooshes & Swishes', durationMs: 300, type: 'sfx', synthType: 'noise_sweep', params: { freqStart: 1600, freqEnd: 600, time: 0.3 } },

  // 2. Clicks & UI (12)
  { id: 'ck_01', name: 'Clean Soft Click', category: 'Clicks & UI', durationMs: 80, type: 'sfx', synthType: 'click', params: { freq: 1200, time: 0.08 } },
  { id: 'ck_02', name: 'Tactile Switch', category: 'Clicks & UI', durationMs: 100, type: 'sfx', synthType: 'click', params: { freq: 900, time: 0.1 } },
  { id: 'ck_03', name: 'Camera Shutter', category: 'Clicks & UI', durationMs: 180, type: 'sfx', synthType: 'shutter', params: { time: 0.18 } },
  { id: 'ck_04', name: 'Toggle On', category: 'Clicks & UI', durationMs: 90, type: 'sfx', synthType: 'click', params: { freq: 1500, time: 0.09 } },
  { id: 'ck_05', name: 'Toggle Off', category: 'Clicks & UI', durationMs: 90, type: 'sfx', synthType: 'click', params: { freq: 650, time: 0.09 } },
  { id: 'ck_06', name: 'Keyboard Key Hit', category: 'Clicks & UI', durationMs: 70, type: 'sfx', synthType: 'click', params: { freq: 1100, time: 0.07 } },
  { id: 'ck_07', name: 'Mouse Button Snap', category: 'Clicks & UI', durationMs: 60, type: 'sfx', synthType: 'click', params: { freq: 2200, time: 0.06 } },
  { id: 'ck_08', name: 'Card Snap', category: 'Clicks & UI', durationMs: 120, type: 'sfx', synthType: 'click', params: { freq: 750, time: 0.12 } },
  { id: 'ck_09', name: 'Tape Stop Click', category: 'Clicks & UI', durationMs: 150, type: 'sfx', synthType: 'click', params: { freq: 400, time: 0.15 } },
  { id: 'ck_10', name: 'Micro Tick', category: 'Clicks & UI', durationMs: 40, type: 'sfx', synthType: 'click', params: { freq: 3000, time: 0.04 } },
  { id: 'ck_11', name: 'Spring Click', category: 'Clicks & UI', durationMs: 110, type: 'sfx', synthType: 'click', params: { freq: 1600, time: 0.11 } },
  { id: 'ck_12', name: 'Wood Tap', category: 'Clicks & UI', durationMs: 130, type: 'sfx', synthType: 'click', params: { freq: 520, time: 0.13 } },

  // 3. Pops & Bubbles (10)
  { id: 'pop_01', name: 'Bubble Pop Crisp', category: 'Pops & Bubbles', durationMs: 140, type: 'sfx', synthType: 'pop', params: { freqStart: 400, freqEnd: 1100, time: 0.14 } },
  { id: 'pop_02', name: 'Liquid Bubble', category: 'Pops & Bubbles', durationMs: 180, type: 'sfx', synthType: 'pop', params: { freqStart: 300, freqEnd: 850, time: 0.18 } },
  { id: 'pop_03', name: 'High Cork Pop', category: 'Pops & Bubbles', durationMs: 120, type: 'sfx', synthType: 'pop', params: { freqStart: 500, freqEnd: 1600, time: 0.12 } },
  { id: 'pop_04', name: 'Double Water Drop', category: 'Pops & Bubbles', durationMs: 220, type: 'sfx', synthType: 'pop', params: { freqStart: 600, freqEnd: 1200, time: 0.22 } },
  { id: 'pop_05', name: 'Deep Plop', category: 'Pops & Bubbles', durationMs: 200, type: 'sfx', synthType: 'pop', params: { freqStart: 180, freqEnd: 420, time: 0.2 } },
  { id: 'pop_06', name: 'Pop Notification', category: 'Pops & Bubbles', durationMs: 160, type: 'sfx', synthType: 'pop', params: { freqStart: 350, freqEnd: 950, time: 0.16 } },
  { id: 'pop_07', name: 'Glossy Blip', category: 'Pops & Bubbles', durationMs: 110, type: 'sfx', synthType: 'pop', params: { freqStart: 700, freqEnd: 1400, time: 0.11 } },
  { id: 'pop_08', name: 'Tiny Bubble Burst', category: 'Pops & Bubbles', durationMs: 90, type: 'sfx', synthType: 'pop', params: { freqStart: 850, freqEnd: 1800, time: 0.09 } },
  { id: 'pop_09', name: 'Suction Release', category: 'Pops & Bubbles', durationMs: 150, type: 'sfx', synthType: 'pop', params: { freqStart: 250, freqEnd: 600, time: 0.15 } },
  { id: 'pop_10', name: 'Mouth Pop Sound', category: 'Pops & Bubbles', durationMs: 130, type: 'sfx', synthType: 'pop', params: { freqStart: 420, freqEnd: 1050, time: 0.13 } },

  // 4. Dings & Bells (12)
  { id: 'dng_01', name: 'Success Ding', category: 'Dings & Bells', durationMs: 900, type: 'sfx', synthType: 'bell', params: { freq: 1046.5, time: 0.9 } }, // C6
  { id: 'dng_02', name: 'Bright Elevator Chime', category: 'Dings & Bells', durationMs: 1200, type: 'sfx', synthType: 'chime', params: { freq1: 659, freq2: 880, time: 1.2 } },
  { id: 'dng_03', name: 'Gold Coin Clink', category: 'Dings & Bells', durationMs: 600, type: 'sfx', synthType: 'bell', params: { freq: 2093, time: 0.6 } }, // C7
  { id: 'dng_04', name: 'Magic Sparkle Chime', category: 'Dings & Bells', durationMs: 1400, type: 'sfx', synthType: 'sparkle', params: { time: 1.4 } },
  { id: 'dng_05', name: 'Triumph Chord', category: 'Dings & Bells', durationMs: 1500, type: 'sfx', synthType: 'chord', params: { notes: [523.25, 659.25, 783.99], time: 1.5 } },
  { id: 'dng_06', name: 'Service Bell Ding', category: 'Dings & Bells', durationMs: 800, type: 'sfx', synthType: 'bell', params: { freq: 1318.5, time: 0.8 } }, // E6
  { id: 'dng_07', name: 'Notification Ping', category: 'Dings & Bells', durationMs: 500, type: 'sfx', synthType: 'bell', params: { freq: 1567.98, time: 0.5 } }, // G6
  { id: 'dng_08', name: 'Crystal Glass Tap', category: 'Dings & Bells', durationMs: 700, type: 'sfx', synthType: 'bell', params: { freq: 2489, time: 0.7 } },
  { id: 'dng_09', name: 'Microwave Ding', category: 'Dings & Bells', durationMs: 1000, type: 'sfx', synthType: 'bell', params: { freq: 880, time: 1.0 } },
  { id: 'dng_10', name: 'Level Up Fanfare', category: 'Dings & Bells', durationMs: 1600, type: 'sfx', synthType: 'fanfare', params: { time: 1.6 } },
  { id: 'dng_11', name: 'Cash Register Cha-Ching', category: 'Dings & Bells', durationMs: 800, type: 'sfx', synthType: 'cash', params: { time: 0.8 } },
  { id: 'dng_12', name: 'Gentle Meditation Gong', category: 'Dings & Bells', durationMs: 2500, type: 'sfx', synthType: 'gong', params: { freq: 220, time: 2.5 } },

  // 5. Impacts & Hits (10)
  { id: 'imp_01', name: 'Cinematic Sub Thud', category: 'Impacts & Hits', durationMs: 800, type: 'sfx', synthType: 'thud', params: { freq: 65, time: 0.8 } },
  { id: 'imp_02', name: 'Heavy Bass Drop', category: 'Impacts & Hits', durationMs: 1200, type: 'sfx', synthType: 'sub_drop', params: { startFreq: 140, endFreq: 30, time: 1.2 } },
  { id: 'imp_03', name: 'Metallic Slam', category: 'Impacts & Hits', durationMs: 750, type: 'sfx', synthType: 'slam', params: { freq: 220, time: 0.75 } },
  { id: 'imp_04', name: 'Punch Impact', category: 'Impacts & Hits', durationMs: 350, type: 'sfx', synthType: 'punch', params: { freq: 110, time: 0.35 } },
  { id: 'imp_05', name: 'Kick Boom', category: 'Impacts & Hits', durationMs: 600, type: 'sfx', synthType: 'thud', params: { freq: 50, time: 0.6 } },
  { id: 'imp_06', name: 'Trailer Hit', category: 'Impacts & Hits', durationMs: 1400, type: 'sfx', synthType: 'trailer_hit', params: { time: 1.4 } },
  { id: 'imp_07', name: 'Stomp Ground Shock', category: 'Impacts & Hits', durationMs: 700, type: 'sfx', synthType: 'thud', params: { freq: 45, time: 0.7 } },
  { id: 'imp_08', name: 'Shield Bash Hit', category: 'Impacts & Hits', durationMs: 500, type: 'sfx', synthType: 'slam', params: { freq: 180, time: 0.5 } },
  { id: 'imp_09', name: 'Explosive Knock', category: 'Impacts & Hits', durationMs: 650, type: 'sfx', synthType: 'thud', params: { freq: 85, time: 0.65 } },
  { id: 'imp_10', name: 'Dramatic Scene Accent', category: 'Impacts & Hits', durationMs: 1100, type: 'sfx', synthType: 'sub_drop', params: { startFreq: 110, endFreq: 40, time: 1.1 } },

  // 6. Risers & Tension (10)
  { id: 'ris_01', name: 'White Noise Tension Riser', category: 'Risers & Tension', durationMs: 2000, type: 'sfx', synthType: 'noise_riser', params: { time: 2.0 } },
  { id: 'ris_02', name: 'Sci-Fi Warp Riser', category: 'Risers & Tension', durationMs: 2500, type: 'sfx', synthType: 'riser', params: { freqStart: 80, freqEnd: 2400, time: 2.5 } },
  { id: 'ris_03', name: 'Pitch Bender Up', category: 'Risers & Tension', durationMs: 1500, type: 'sfx', synthType: 'riser', params: { freqStart: 180, freqEnd: 1200, time: 1.5 } },
  { id: 'ris_04', name: 'Clock Ticking Tension', category: 'Risers & Tension', durationMs: 2000, type: 'sfx', synthType: 'ticking', params: { time: 2.0 } },
  { id: 'ris_05', name: 'Heartbeat Pulse', category: 'Risers & Tension', durationMs: 1800, type: 'sfx', synthType: 'heartbeat', params: { time: 1.8 } },
  { id: 'ris_06', name: 'Reverse Cymbal Swell', category: 'Risers & Tension', durationMs: 2200, type: 'sfx', synthType: 'noise_riser', params: { time: 2.2 } },
  { id: 'ris_07', name: 'Alien Shephard Tone', category: 'Risers & Tension', durationMs: 3000, type: 'sfx', synthType: 'riser', params: { freqStart: 120, freqEnd: 1600, time: 3.0 } },
  { id: 'ris_08', name: 'Laser Charge Build', category: 'Risers & Tension', durationMs: 1800, type: 'sfx', synthType: 'riser', params: { freqStart: 250, freqEnd: 3200, time: 1.8 } },
  { id: 'ris_09', name: 'Sub Pulse Riser', category: 'Risers & Tension', durationMs: 2000, type: 'sfx', synthType: 'sub_drop', params: { startFreq: 40, endFreq: 180, time: 2.0 } },
  { id: 'ris_10', name: 'Fast 1-Sec Stutter Riser', category: 'Risers & Tension', durationMs: 1000, type: 'sfx', synthType: 'noise_riser', params: { time: 1.0 } },

  // 7. Glitches & Cyber (10)
  { id: 'gli_01', name: 'Digital Matrix Glitch', category: 'Glitches & Cyber', durationMs: 350, type: 'sfx', synthType: 'glitch', params: { time: 0.35 } },
  { id: 'gli_02', name: 'Cyberpunk HUD Chirp', category: 'Glitches & Cyber', durationMs: 280, type: 'sfx', synthType: 'chirp', params: { freq: 1800, time: 0.28 } },
  { id: 'gli_03', name: 'Modem Data Burst', category: 'Glitches & Cyber', durationMs: 500, type: 'sfx', synthType: 'glitch', params: { time: 0.5 } },
  { id: 'gli_04', name: 'Error Alert Buzz', category: 'Glitches & Cyber', durationMs: 300, type: 'sfx', synthType: 'buzz', params: { freq: 140, time: 0.3 } },
  { id: 'gli_05', name: 'Static Television Zap', category: 'Glitches & Cyber', durationMs: 400, type: 'sfx', synthType: 'noise_sweep', params: { freqStart: 2000, freqEnd: 100, time: 0.4 } },
  { id: 'gli_06', name: 'System Boot Stutter', category: 'Glitches & Cyber', durationMs: 650, type: 'sfx', synthType: 'glitch', params: { time: 0.65 } },
  { id: 'gli_07', name: 'Tape Rewind Quick', category: 'Glitches & Cyber', durationMs: 450, type: 'sfx', synthType: 'laser', params: { freqStart: 2400, freqEnd: 400, time: 0.45 } },
  { id: 'gli_08', name: 'Robot Vocalization', category: 'Glitches & Cyber', durationMs: 400, type: 'sfx', synthType: 'chirp', params: { freq: 950, time: 0.4 } },
  { id: 'gli_09', name: 'Data Packet Transmission', category: 'Glitches & Cyber', durationMs: 220, type: 'sfx', synthType: 'glitch', params: { time: 0.22 } },
  { id: 'gli_10', name: 'Corrupted Signal Drop', category: 'Glitches & Cyber', durationMs: 550, type: 'sfx', synthType: 'buzz', params: { freq: 220, time: 0.55 } },

  // 8. Bass & Drops (8)
  { id: 'bas_01', name: '808 Boom Hit', category: 'Bass & Drops', durationMs: 900, type: 'sfx', synthType: 'sub_drop', params: { startFreq: 120, endFreq: 35, time: 0.9 } },
  { id: 'bas_02', name: 'Heavy Low Rattle', category: 'Bass & Drops', durationMs: 1400, type: 'sfx', synthType: 'thud', params: { freq: 38, time: 1.4 } },
  { id: 'bas_03', name: 'Subwoofer Test Pulse', category: 'Bass & Drops', durationMs: 1600, type: 'sfx', synthType: 'sub_whoosh', params: { freq: 45, time: 1.6 } },
  { id: 'bas_04', name: 'Trap Bass 808 Slide', category: 'Bass & Drops', durationMs: 1000, type: 'sfx', synthType: 'sub_drop', params: { startFreq: 90, endFreq: 42, time: 1.0 } },
  { id: 'bas_05', name: 'Club Kick Punch', category: 'Bass & Drops', durationMs: 400, type: 'sfx', synthType: 'thud', params: { freq: 60, time: 0.4 } },
  { id: 'bas_06', name: 'Reverb Tail Bass', category: 'Bass & Drops', durationMs: 1500, type: 'sfx', synthType: 'sub_drop', params: { startFreq: 100, endFreq: 28, time: 1.5 } },
  { id: 'bas_07', name: 'Down lifter Bass Sweep', category: 'Bass & Drops', durationMs: 1800, type: 'sfx', synthType: 'sub_drop', params: { startFreq: 200, endFreq: 30, time: 1.8 } },
  { id: 'bas_08', name: 'Distorted Bass Bite', category: 'Bass & Drops', durationMs: 600, type: 'sfx', synthType: 'slam', params: { freq: 75, time: 0.6 } },

  // 9. Ambient & Drone (8)
  { id: 'amb_01', name: 'Warm Atmospheric Pad', category: 'Ambient & Drone', durationMs: 3000, type: 'sfx', synthType: 'drone', params: { freq: 220, time: 3.0 } },
  { id: 'amb_02', name: 'Cosmic Deep Space Bed', category: 'Ambient & Drone', durationMs: 3500, type: 'sfx', synthType: 'drone', params: { freq: 110, time: 3.5 } },
  { id: 'amb_03', name: 'Mysterious Resonance', category: 'Ambient & Drone', durationMs: 2800, type: 'sfx', synthType: 'drone', params: { freq: 330, time: 2.8 } },
  { id: 'amb_04', name: 'Rainfall Texture', category: 'Ambient & Drone', durationMs: 2500, type: 'sfx', synthType: 'noise_sweep', params: { freqStart: 1200, freqEnd: 800, time: 2.5 } },
  { id: 'amb_05', name: 'Dark Dungeon Hum', category: 'Ambient & Drone', durationMs: 3000, type: 'sfx', synthType: 'drone', params: { freq: 85, time: 3.0 } },
  { id: 'amb_06', name: 'Crystal Cave Shimmer', category: 'Ambient & Drone', durationMs: 2600, type: 'sfx', synthType: 'sparkle', params: { time: 2.6 } },
  { id: 'amb_07', name: 'Ethereal High Sine', category: 'Ambient & Drone', durationMs: 2200, type: 'sfx', synthType: 'bell', params: { freq: 1760, time: 2.2 } },
  { id: 'amb_08', name: 'Night Wind Whisper', category: 'Ambient & Drone', durationMs: 3200, type: 'sfx', synthType: 'noise_sweep', params: { freqStart: 500, freqEnd: 200, time: 3.2 } },

  // 10. Cartoon & Fun (8)
  { id: 'fun_01', name: 'Boing Spring Jump', category: 'Cartoon & Fun', durationMs: 400, type: 'sfx', synthType: 'laser', params: { freqStart: 180, freqEnd: 800, time: 0.4 } },
  { id: 'fun_02', name: 'Cartoon Slip Fall', category: 'Cartoon & Fun', durationMs: 700, type: 'sfx', synthType: 'laser', params: { freqStart: 900, freqEnd: 150, time: 0.7 } },
  { id: 'fun_03', name: 'Funny Whistle Peep', category: 'Cartoon & Fun', durationMs: 350, type: 'sfx', synthType: 'chirp', params: { freq: 1250, time: 0.35 } },
  { id: 'fun_04', name: 'Quirky Plink', category: 'Cartoon & Fun', durationMs: 180, type: 'sfx', synthType: 'pop', params: { freqStart: 600, freqEnd: 1800, time: 0.18 } },
  { id: 'fun_05', name: 'Rubber Squeak', category: 'Cartoon & Fun', durationMs: 250, type: 'sfx', synthType: 'chirp', params: { freq: 2200, time: 0.25 } },
  { id: 'fun_06', name: 'Wobbly Jelly Jiggle', category: 'Cartoon & Fun', durationMs: 500, type: 'sfx', synthType: 'laser', params: { freqStart: 300, freqEnd: 450, time: 0.5 } },
  { id: 'fun_07', name: 'Buzzer Fail Sound', category: 'Cartoon & Fun', durationMs: 450, type: 'sfx', synthType: 'buzz', params: { freq: 120, time: 0.45 } },
  { id: 'fun_08', name: 'Victory Tada', category: 'Cartoon & Fun', durationMs: 900, type: 'sfx', synthType: 'fanfare', params: { time: 0.9 } },
];

export interface MusicTrackItem {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  durationMs: number;
  mood: string;
  synthTheme: string;
}

export const BUILT_IN_MUSIC: MusicTrackItem[] = [
  { id: 'mus_01', name: 'Synthwave Neon Drive', genre: 'Synthwave', bpm: 120, durationMs: 30000, mood: 'Energetic / Focus', synthTheme: 'synthwave' },
  { id: 'mus_02', name: 'Chill Lo-Fi Study Beat', genre: 'Lo-Fi', bpm: 85, durationMs: 35000, mood: 'Relaxed / Explainer', synthTheme: 'lofi' },
  { id: 'mus_03', name: 'Cinematic Ambient Pulse', genre: 'Cinematic', bpm: 100, durationMs: 40000, mood: 'Suspense / Story', synthTheme: 'cinematic' },
  { id: 'mus_04', name: 'Tech Product Upbeat', genre: 'Commercial', bpm: 128, durationMs: 25000, mood: 'Modern / Clean', synthTheme: 'upbeat' },
  { id: 'mus_05', name: 'Acoustic Bright Journey', genre: 'Indie', bpm: 110, durationMs: 30000, mood: 'Inspiring / Cheerful', synthTheme: 'acoustic' },
];

// Audio Context Singleton for synthesis
let audioCtxInstance: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!audioCtxInstance) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxInstance = new AudioCtx();
  }
  if (audioCtxInstance.state === 'suspended') {
    audioCtxInstance.resume();
  }
  return audioCtxInstance;
}

let activeSource: AudioNode | null = null;

export function stopCurrentSound() {
  if (activeSource) {
    try {
      (activeSource as any).stop?.();
    } catch (_) {}
    activeSource = null;
  }
}

/**
 * Procedural Web Audio Sound Synthesizer
 * Plays high quality procedural audio in real time with zero external asset dependencies!
 */
export function playSynthesizedSound(sound: SoundItem) {
  stopCurrentSound();
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const p = sound.params;

  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0.85, now);

  switch (sound.synthType) {
    case 'noise_sweep': {
      const bufferSize = ctx.sampleRate * (Number(p.time) || 0.4);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(Number(p.freqStart) || 1000, now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(40, Number(p.freqEnd) || 200), now + Number(p.time));

      masterGain.gain.setValueAtTime(0.01, now);
      masterGain.gain.linearRampToValueAtTime(0.9, now + Number(p.time) * 0.4);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + Number(p.time));

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
      noise.stop(now + Number(p.time));
      activeSource = noise;
      break;
    }

    case 'click': {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(Number(p.freq) || 1200, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + Number(p.time));

      masterGain.gain.setValueAtTime(0.9, now);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + Number(p.time));

      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + Number(p.time));
      activeSource = osc;
      break;
    }

    case 'pop': {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(Number(p.freqStart) || 400, now);
      osc.frequency.exponentialRampToValueAtTime(Number(p.freqEnd) || 1200, now + Number(p.time) * 0.7);

      masterGain.gain.setValueAtTime(0.8, now);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + Number(p.time));

      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + Number(p.time));
      activeSource = osc;
      break;
    }

    case 'bell': {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(Number(p.freq) || 1046, now);

      masterGain.gain.setValueAtTime(0.7, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + Number(p.time));

      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + Number(p.time));
      activeSource = osc;
      break;
    }

    case 'thud':
    case 'sub_drop': {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const startF = Number(p.startFreq || p.freq || 120);
      const endF = Number(p.endFreq || 35);
      osc.frequency.setValueAtTime(startF, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endF), now + Number(p.time));

      masterGain.gain.setValueAtTime(1.0, now);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + Number(p.time));

      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + Number(p.time));
      activeSource = osc;
      break;
    }

    case 'glitch': {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.setValueAtTime(1800, now + 0.05);
      osc.frequency.setValueAtTime(450, now + 0.1);
      osc.frequency.setValueAtTime(120, now + 0.2);

      masterGain.gain.setValueAtTime(0.6, now);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + Number(p.time));

      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + Number(p.time));
      activeSource = osc;
      break;
    }

    default: {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      masterGain.gain.setValueAtTime(0.5, now);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.5);
      activeSource = osc;
    }
  }
}

/**
 * Preview synthesizer for background music grooves
 */
export function playMusicPreview(track: MusicTrackItem) {
  stopCurrentSound();
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0.35, now);

  const bassOsc = ctx.createOscillator();
  bassOsc.type = 'sawtooth';
  const notes = [130.81, 146.83, 164.81, 196.00]; // C3, D3, E3, G3
  notes.forEach((freq, idx) => {
    bassOsc.frequency.setValueAtTime(freq, now + idx * 0.5);
  });

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);

  bassOsc.connect(filter);
  filter.connect(masterGain);

  bassOsc.start(now);
  bassOsc.stop(now + 3.0);
  activeSource = bassOsc;
}
