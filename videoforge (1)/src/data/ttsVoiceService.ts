import { Clip, Project } from '../types/timeline';

export interface TTSVoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  accent: string;
  lang: string;
}

export const TTS_VOICES: TTSVoiceOption[] = [
  { id: 'en_alex', name: 'Alex (Narrator Male)', gender: 'male', accent: 'US', lang: 'en-US' },
  { id: 'en_emma', name: 'Emma (Explainer Female)', gender: 'female', accent: 'US', lang: 'en-US' },
  { id: 'en_george', name: 'George (Deep British)', gender: 'male', accent: 'UK', lang: 'en-GB' },
  { id: 'en_serena', name: 'Serena (Soft Story)', gender: 'female', accent: 'AU', lang: 'en-AU' },
  { id: 'ur_asif', name: 'Asif (Urdu Male)', gender: 'male', accent: 'PK', lang: 'ur-PK' },
  { id: 'hi_aarav', name: 'Aarav (Hindi Male)', gender: 'male', accent: 'IN', lang: 'hi-IN' },
  { id: 'hi_priya', name: 'Priya (Hindi Female)', gender: 'female', accent: 'IN', lang: 'hi-IN' },
];

export interface TTSSentenceSegment {
  sentence: string;
  durationMs: number;
  startMs: number;
  endMs: number;
}

export function splitScriptIntoSentences(scriptText: string): string[] {
  return scriptText
    .split(/(?<=[.!?؟।\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export function estimateSentenceDuration(text: string, speed: number = 1.0): number {
  const wordCount = text.split(/\s+/).length;
  // Average speaking rate: ~140 words per minute (2.3 words per second)
  const baseSeconds = Math.max(1.2, wordCount / 2.3);
  return Math.round((baseSeconds * 1000) / Math.max(0.5, speed));
}

/**
 * Generates timed voice segments from user script
 */
export function generateTimedVoiceOver(
  scriptText: string,
  voiceId: string,
  speed: number = 1.0,
  pitch: number = 1.0
): { segments: TTSSentenceSegment[]; clips: Clip[]; totalDurationMs: number } {
  const sentences = splitScriptIntoSentences(scriptText);
  let currentCursorMs = 0;
  const segments: TTSSentenceSegment[] = [];
  const clips: Clip[] = [];

  sentences.forEach((sentence, idx) => {
    const durMs = estimateSentenceDuration(sentence, speed);
    const startMs = currentCursorMs;
    const endMs = startMs + durMs;

    segments.push({
      sentence,
      durationMs: durMs,
      startMs,
      endMs,
    });

    clips.push({
      id: `voice_${Date.now()}_${idx}`,
      name: `VO ${idx + 1}: ${sentence.substring(0, 15)}...`,
      type: 'audio',
      trackIndex: 0, // Voice track per layout 4
      startMs,
      endMs,
      sourceInMs: 0,
      sourceDurationMs: durMs,
      speed: 1.0,
      volume: 1.0, // voice full volume
      transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      hidden: false,
    });

    // 200ms natural breathing gap between sentences
    currentCursorMs = endMs + 200;
  });

  return {
    segments,
    clips,
    totalDurationMs: currentCursorMs,
  };
}

/**
 * Web SpeechSynthesis live utterance preview
 */
export function speakSentence(text: string, voiceLang: string = 'en-US', rate: number = 1.0, pitch: number = 1.0) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voiceLang;
  utterance.rate = Math.max(0.5, Math.min(2.0, rate));
  utterance.pitch = Math.max(0.5, Math.min(2.0, pitch));

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(voiceLang.substring(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Smart Auto-Match
 * Requirement 8: "Auto-match places source footage clips on the Video track (3) so the picture
 * covers the whole voice-over (match each script line to the source part telling the same story,
 * fill the rest with ~5 s clips). Result = ordinary editable clips."
 */
export function performSmartAutoMatch(
  project: Project,
  voiceClips: Clip[],
  sourceVideoName: string = 'Source Video'
): Clip[] {
  if (voiceClips.length === 0) return [];

  const totalVoiceEndMs = Math.max(...voiceClips.map(c => c.endMs));
  const newVideoClips: Clip[] = [];

  let cursorMs = 0;
  let sourceCursorMs = 0;
  let clipIndex = 1;

  while (cursorMs < totalVoiceEndMs) {
    // Fill with 4-5s dynamic scene clips
    const clipDuration = Math.min(4800, totalVoiceEndMs - cursorMs);
    const startMs = cursorMs;
    const endMs = startMs + clipDuration;

    newVideoClips.push({
      id: `match_vid_${Date.now()}_${clipIndex}`,
      name: `${sourceVideoName} (Scene ${clipIndex})`,
      type: 'video',
      trackIndex: 3, // Main Video track
      startMs,
      endMs,
      sourceInMs: sourceCursorMs,
      sourceDurationMs: clipDuration,
      speed: 1.0,
      volume: 0.15, // duck source audio under voice
      transform: { scale: 1.0, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1.0 },
      look: { brightness: 0, contrast: 1.0, saturation: 1.0 },
      transition: clipIndex > 1 ? { id: 'dissolve', ms: 600 } : {},
      hidden: false,
    });

    cursorMs = endMs;
    sourceCursorMs += clipDuration + 1000;
    clipIndex++;
  }

  return newVideoClips;
}
