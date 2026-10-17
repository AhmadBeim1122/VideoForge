import React, { useState } from 'react';
import {
  Mic2,
  FileText,
  Volume2,
  Play,
  Square,
  Wand2,
  Sparkles,
  Layers,
  ArrowRight,
  Clock,
  Languages,
} from 'lucide-react';
import { Project, Clip, WhisperSegment } from '../types/timeline';
import {
  TTS_VOICES,
  generateTimedVoiceOver,
  speakSentence,
  stopSpeaking,
  performSmartAutoMatch,
} from '../data/ttsVoiceService';

interface ScriptVoiceScreenProps {
  project: Project;
  onUpdateProjectScript: (scriptText: string) => void;
  onReplaceClipsOfTrack: (trackIndex: number, clips: Clip[]) => void;
  onAddClipsToTimeline: (clips: Clip[]) => void;
  onNavigateToEditing: () => void;
}

export const ScriptVoiceScreen: React.FC<ScriptVoiceScreenProps> = ({
  project,
  onUpdateProjectScript,
  onReplaceClipsOfTrack,
  onAddClipsToTimeline,
  onNavigateToEditing,
}) => {
  const [scriptText, setScriptText] = useState(
    project.scriptText ||
      'Why did vertical video conquer the world? Because mobile phones changed human posture forever. Creators who master fast pacing win the algorithm.'
  );

  const [selectedVoiceId, setSelectedVoiceId] = useState('en_alex');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);

  // Split and timed preview
  const timedResult = generateTimedVoiceOver(scriptText, selectedVoiceId, speed, pitch);

  const handleApplyVoiceToTimeline = () => {
    // Places voice clips on Track 0 (Voice track)
    onReplaceClipsOfTrack(0, timedResult.clips);
    onUpdateProjectScript(scriptText);
    alert(`Generated ${timedResult.clips.length} voice-over clips on Track 0!`);
  };

  const handleSmartAutoMatch = () => {
    // Generate voice clips first if not present
    const voiceClips = timedResult.clips;
    onReplaceClipsOfTrack(0, voiceClips);

    // Auto-match footage on Video Track 3
    const matchedClips = performSmartAutoMatch(project, voiceClips, project.name);
    if (matchedClips.length > 0) {
      onReplaceClipsOfTrack(3, matchedClips);
      alert(
        `Smart Match generated ${matchedClips.length} video scene clips on Track 3 synchronized with voice-over!`
      );
      onNavigateToEditing();
    }
  };

  const handleAiRewriteHook = () => {
    const hooks = [
      'Stop scrolling: if you create video in 2026, this changes everything. Attention spans are now down to 3 seconds flat. Here is how top creators stay ahead.',
      '99% of people edit video completely wrong on their phone. Here is the 3-step timeline framework that 10x your retention.',
      'Why does every viral short look so punchy? The secret is multi-track sound effects and sub-second transitions. Watch how VideoForge builds this.',
    ];
    const picked = hooks[Math.floor(Math.random() * hooks.length)];
    setScriptText(picked);
    onUpdateProjectScript(picked);
  };

  const handlePreviewSentence = (sentence: string, index: number) => {
    const voice = TTS_VOICES.find(v => v.id === selectedVoiceId);
    setActiveSentenceIndex(index);
    setIsPlayingPreview(true);
    speakSentence(sentence, voice?.lang || 'en-US', speed, pitch);
  };

  const handleStopPreview = () => {
    stopSpeaking();
    setIsPlayingPreview(false);
    setActiveSentenceIndex(null);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 p-4 overflow-y-auto select-none gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Script & Voice</h1>
          <p className="text-xs text-neutral-400">
            Source transcription, script rewrite, and timed TTS voice-over
          </p>
        </div>

        <button
          onClick={handleSmartAutoMatch}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFC800] text-neutral-950 font-bold text-xs shadow-md shadow-[#FFC800]/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
          <span>Smart Auto-Match</span>
        </button>
      </div>

      {/* Source Transcript Card (Whisper) */}
      {project.sourceTranscript && project.sourceTranscript.length > 0 && (
        <div className="flex flex-col p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-sky-400" />
              <span>Whisper Source Transcript</span>
            </span>
            <button
              onClick={() => {
                const combined = project.sourceTranscript!.map(s => s.text).join(' ');
                setScriptText(combined);
                onUpdateProjectScript(combined);
              }}
              className="text-[11px] text-[#FFC800] hover:underline"
            >
              Use as script
            </button>
          </div>
          <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
            {project.sourceTranscript.map((seg, i) => (
              <div key={seg.id || i} className="text-[11px] text-neutral-400 font-mono">
                <span className="text-neutral-500 mr-2">[{seg.start.toFixed(1)}s]</span>
                <span className="text-neutral-300">{seg.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Script Editor Box */}
      <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#FFC800]" />
            <span>Explainer Script (Sentences split automatically)</span>
          </label>
          <button
            onClick={handleAiRewriteHook}
            className="flex items-center gap-1 text-[11px] text-[#FFC800] hover:text-[#FFD733] font-medium"
          >
            <Wand2 className="w-3 h-3" />
            <span>Viral Hook Rewrite</span>
          </button>
        </div>

        <textarea
          rows={3}
          value={scriptText}
          onChange={e => {
            setScriptText(e.target.value);
            onUpdateProjectScript(e.target.value);
          }}
          placeholder="Paste or write your explainer script here..."
          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white leading-relaxed outline-none focus:border-[#FFC800]"
        />
      </div>

      {/* TTS Voice Settings */}
      <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center justify-between text-xs font-semibold text-white">
          <span className="flex items-center gap-1.5">
            <Mic2 className="w-3.5 h-3.5 text-pink-400" />
            <span>Voice-over Synthesis (TTS)</span>
          </span>
          <span className="text-neutral-400 text-[11px] font-mono">
            Est. Duration: {(timedResult.totalDurationMs / 1000).toFixed(1)}s
          </span>
        </div>

        {/* Voice Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TTS_VOICES.map(voice => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoiceId(voice.id)}
              className={`p-2 rounded-xl border text-left transition-all ${
                selectedVoiceId === voice.id
                  ? 'border-[#FFC800] bg-neutral-800 text-[#FFC800]'
                  : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <div className="text-xs font-semibold truncate">{voice.name}</div>
              <div className="text-[10px] text-neutral-500">{voice.accent} · {voice.gender}</div>
            </button>
          ))}
        </div>

        {/* Speed and Pitch Sliders */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Speaking Speed:</span>
              <span className="font-mono text-white">{speed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.05"
              value={speed}
              onChange={e => setSpeed(parseFloat(e.target.value))}
              className="accent-[#FFC800]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Voice Pitch:</span>
              <span className="font-mono text-white">{pitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={pitch}
              onChange={e => setPitch(parseFloat(e.target.value))}
              className="accent-[#FFC800]"
            />
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
          <button
            onClick={handleApplyVoiceToTimeline}
            className="flex-1 py-2.5 rounded-xl bg-[#FFC800] text-neutral-950 font-bold text-xs shadow-md hover:bg-[#FFD733] transition-colors"
          >
            Generate Voice-over on Track 0
          </button>
          {isPlayingPreview ? (
            <button
              onClick={handleStopPreview}
              className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30"
              title="Stop Speech"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={() => handlePreviewSentence(scriptText, -1)}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
              title="Preview Full Speech"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sentence Breakdown List */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
          Sentence Timeline Timing ({timedResult.segments.length} segments)
        </span>
        <div className="flex flex-col gap-1.5">
          {timedResult.segments.map((seg, idx) => {
            const isPlaying = activeSentenceIndex === idx;
            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                  isPlaying
                    ? 'border-[#FFC800] bg-neutral-900'
                    : 'border-neutral-800 bg-neutral-900/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="text-[10px] font-mono text-[#FFC800] shrink-0">
                    {(seg.startMs / 1000).toFixed(1)}s - {(seg.endMs / 1000).toFixed(1)}s
                  </span>
                  <span className="text-xs text-neutral-200 truncate">{seg.sentence}</span>
                </div>

                <button
                  onClick={() => handlePreviewSentence(seg.sentence, idx)}
                  className="p-1 rounded bg-neutral-800 hover:bg-[#FFC800] hover:text-neutral-950 text-neutral-300 shrink-0 transition-colors"
                  title="Listen"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
