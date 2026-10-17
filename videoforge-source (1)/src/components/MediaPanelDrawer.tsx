import React, { useState } from 'react';
import {
  FolderOpen,
  Image as ImageIcon,
  Type,
  Music,
  Sparkles,
  Sliders,
  Play,
  Square,
  Plus,
  Wand2,
  Check,
  Search,
  Upload,
  Layers,
  Shuffle,
  Trash2,
  Volume2,
} from 'lucide-react';
import { Clip, Project } from '../types/timeline';
import { STOCK_BACKGROUNDS, StockItem } from '../data/stockLibrary';
import { TEXT_LOOK_PRESETS, TextLookPreset } from '../data/textPresets';
import {
  BUILT_IN_SOUNDS,
  BUILT_IN_MUSIC,
  SOUND_CATEGORIES,
  SoundItem,
  MusicTrackItem,
  playSynthesizedSound,
  playMusicPreview,
  stopCurrentSound,
} from '../data/soundSynthesizer';
import {
  VIDEO_EFFECTS,
  TRANSITIONS,
  TEXT_ANIMATIONS,
  EffectDefinition,
  TransitionDefinition,
} from '../data/effectsAndTransitions';
import { WhisperOptions, generateAutoCaptions } from '../data/whisperService';

export type MainDrawerTab = 'media' | 'text' | 'audio' | 'effects' | 'transitions' | 'details';

interface MediaPanelDrawerProps {
  project: Project;
  currentTimeMs: number;
  selectedClip: Clip | null;
  activeDrawerTab: MainDrawerTab;
  onChangeDrawerTab: (tab: MainDrawerTab) => void;
  onAddClip: (clip: Clip) => void;
  onUpdateClip: (clipId: string, partial: Partial<Clip>) => void;
  onReplaceClipsOfTrack: (trackIndex: number, newClips: Clip[]) => void;
  onApplyTransitionToAllCuts: (transitionId: string, durationMs: number) => void;
  onApplyRandomTransitionToAllCuts: () => void;
  onApplyRandomTransitionsToRandomClips: () => void;
  onRemoveAllTransitions: () => void;
  whisperOptions: WhisperOptions;
  drawerHeightStage?: 'compact' | 'half' | 'expanded';
  onToggleDrawerHeight?: () => void;
}

export const MediaPanelDrawer: React.FC<MediaPanelDrawerProps> = ({
  project,
  currentTimeMs,
  selectedClip,
  activeDrawerTab,
  onChangeDrawerTab,
  onAddClip,
  onUpdateClip,
  onReplaceClipsOfTrack,
  onApplyTransitionToAllCuts,
  onApplyRandomTransitionToAllCuts,
  onApplyRandomTransitionsToRandomClips,
  onRemoveAllTransitions,
  whisperOptions,
  drawerHeightStage = 'half',
  onToggleDrawerHeight,
}) => {
  // Sub-tabs for each main tab
  const [mediaSubTab, setMediaSubTab] = useState<'import' | 'stock'>('stock');
  const [textSubTab, setTextSubTab] = useState<'add' | 'effects' | 'autocaption'>('effects');
  const [audioSubTab, setAudioSubTab] = useState<'sfx' | 'music' | 'import'>('sfx');
  const [effectsGroup, setEffectsGroup] = useState<string>('All');
  const [transitionSubTab, setTransitionSubTab] = useState<'gallery' | 'batch'>('gallery');
  const [transitionDuration, setTransitionDuration] = useState<number>(0.8);
  const [selectedTransitionId, setSelectedTransitionId] = useState<string>('dissolve');

  // Search queries
  const [sfxSearch, setSfxSearch] = useState('');
  const [musicSearch, setMusicSearch] = useState('');
  const [stockSearch, setStockSearch] = useState('');

  // Audio preview playing state
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);

  // Auto-caption state
  const [isCapturingCaptions, setIsCapturingCaptions] = useState(false);
  const [captionProgressText, setCaptionProgressText] = useState('');

  // Details panel sub-tab
  const [detailsSubTab, setDetailsSubTab] = useState<'video' | 'speed' | 'audio' | 'adjust' | 'text' | 'animation' | 'effect'>('video');

  // Text animation settings in Details
  const [applyAnimationToAllText, setApplyAnimationToAllText] = useState(false);

  // -------------------------------------------------------------
  // Action Handlers
  // -------------------------------------------------------------

  const handleAddStockClip = (stock: StockItem) => {
    const startMs = currentTimeMs;
    const endMs = startMs + 5000; // 5 seconds per spec
    const newClip: Clip = {
      id: `stock_clip_${Date.now()}`,
      name: stock.shortName,
      type: 'image',
      trackIndex: 3, // Main Video track per spec
      startMs,
      endMs,
      sourceInMs: 0,
      sourceDurationMs: 5000,
      speed: 1.0,
      volume: 0,
      color: stock.color,
      transform: { scale: 1.0, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1.0 },
      look: { brightness: 0, contrast: 1.0, saturation: 1.0 },
      transition: {},
      hidden: false,
    };
    onAddClip(newClip);
  };

  const handleAddDefaultText = () => {
    const startMs = currentTimeMs;
    const endMs = startMs + 3000; // 3 seconds per spec
    const newClip: Clip = {
      id: `text_clip_${Date.now()}`,
      name: 'Text Overlay',
      type: 'text',
      trackIndex: 6, // Text track
      startMs,
      endMs,
      sourceInMs: 0,
      sourceDurationMs: 3000,
      speed: 1.0,
      volume: 0,
      transform: { scale: 1.0, offsetX: 0, offsetY: 0.36, rotation: 0, opacity: 1.0 },
      look: { brightness: 0, contrast: 1.0, saturation: 1.0 },
      transition: {},
      text: {
        text: 'Add your headline here',
        size: 0.055,
        color: '#FFFFFF',
        bold: true,
        box: true,
        boxColor: 'rgba(0,0,0,0.7)',
        animIn: 'pop',
        animOut: 'fade',
        animMs: 300,
      },
      hidden: false,
    };
    onAddClip(newClip);
  };

  const handleApplyTextPreset = (preset: TextLookPreset) => {
    if (selectedClip && selectedClip.trackIndex === 6) {
      // Apply to selected text clip
      onUpdateClip(selectedClip.id, {
        text: {
          ...selectedClip.text!,
          ...preset.props,
          text: selectedClip.text?.text || preset.props.text,
        },
      });
    } else {
      // Add new text clip at playhead with that look
      const startMs = currentTimeMs;
      const endMs = startMs + 3000;
      const newClip: Clip = {
        id: `text_clip_${Date.now()}`,
        name: preset.name,
        type: 'text',
        trackIndex: 6,
        startMs,
        endMs,
        sourceInMs: 0,
        sourceDurationMs: 3000,
        speed: 1.0,
        volume: 0,
        transform: { scale: 1.0, offsetX: 0, offsetY: 0.36, rotation: 0, opacity: 1.0 },
        look: { brightness: 0, contrast: 1.0, saturation: 1.0 },
        transition: {},
        text: { ...preset.props },
        hidden: false,
      };
      onAddClip(newClip);
    }
  };

  const handleGenerateCaptions = async () => {
    setIsCapturingCaptions(true);
    setCaptionProgressText('Analyzing timeline audio with Whisper...');
    try {
      const generatedClips = await generateAutoCaptions(
        project,
        whisperOptions,
        progress => {
          setCaptionProgressText(`${progress.stage} (${progress.percent}%)`);
        }
      );
      // Replaces existing Text-track clips as one undo step
      onReplaceClipsOfTrack(6, generatedClips);
    } catch (err: any) {
      alert(err.message || 'Auto caption failed');
    } finally {
      setIsCapturingCaptions(false);
      setCaptionProgressText('');
    }
  };

  const handleAddSfxClip = (sound: SoundItem) => {
    const startMs = currentTimeMs;
    const endMs = startMs + sound.durationMs;
    const newClip: Clip = {
      id: `sfx_${Date.now()}`,
      name: sound.name,
      type: 'audio',
      trackIndex: 2, // Sfx track per layout 4
      startMs,
      endMs,
      sourceInMs: 0,
      sourceDurationMs: sound.durationMs,
      speed: 1.0,
      volume: 1.0, // SFX volume 1.0 per spec
      transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      hidden: false,
    };
    onAddClip(newClip);
  };

  const handleAddMusicClip = (music: MusicTrackItem) => {
    const startMs = currentTimeMs;
    const endMs = startMs + music.durationMs;
    const newClip: Clip = {
      id: `music_${Date.now()}`,
      name: music.name,
      type: 'audio',
      trackIndex: 1, // Music track per layout 4
      startMs,
      endMs,
      sourceInMs: 0,
      sourceDurationMs: music.durationMs,
      speed: 1.0,
      volume: 0.7, // Music volume 0.7 per spec
      transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      hidden: false,
    };
    onAddClip(newClip);
  };

  const handleAddEffectLayer = (effect: EffectDefinition) => {
    let startMs = currentTimeMs;
    let endMs = currentTimeMs + 3000;

    // "default: covers the selected clip, otherwise 3s at the playhead" per spec
    if (selectedClip && selectedClip.trackIndex !== 5) {
      startMs = selectedClip.startMs;
      endMs = selectedClip.endMs;
    }

    const newClip: Clip = {
      id: `eff_layer_${Date.now()}`,
      name: effect.name,
      type: 'effect',
      trackIndex: 5, // Effects track
      startMs,
      endMs,
      sourceInMs: 0,
      sourceDurationMs: endMs - startMs,
      speed: 1.0,
      volume: 0,
      effectId: effect.id,
      transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 0.8 },
      look: { brightness: 0, contrast: 1, saturation: 1 },
      transition: {},
      hidden: false,
    };
    onAddClip(newClip);
  };

  const isVideoOrImageSelected =
    selectedClip && (selectedClip.trackIndex === 3 || selectedClip.trackIndex === 4);

  return (
    <div className="flex flex-col bg-neutral-950 border-t border-neutral-800 h-full select-none transition-all duration-300">
      {/* Top Grab Handle for 3-Stage Height (Compact, Half, Full) */}
      <div
        onClick={onToggleDrawerHeight}
        className="w-full pt-1.5 pb-1 flex items-center justify-center cursor-pointer hover:bg-neutral-900/60 transition-colors shrink-0 group"
        title="Tap to toggle drawer size (Compact, Half, Full)"
      >
        <div className="w-10 h-1 bg-neutral-700 group-hover:bg-[#FFC800] rounded-full transition-colors" />
      </div>

      {/* Top Main Tabs (Scrollable Chip Row) */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-neutral-800/80 overflow-x-auto scrollbar-none bg-neutral-900/50 shrink-0">
        {[
          { id: 'media' as MainDrawerTab, label: 'Media', icon: FolderOpen },
          { id: 'text' as MainDrawerTab, label: 'Text', icon: Type },
          { id: 'audio' as MainDrawerTab, label: 'Audio', icon: Music },
          { id: 'effects' as MainDrawerTab, label: 'Effects', icon: Sparkles },
          { id: 'transitions' as MainDrawerTab, label: 'Transitions', icon: Layers },
          { id: 'details' as MainDrawerTab, label: selectedClip ? `Details: ${selectedClip.name.substring(0, 10)}...` : 'Details', icon: Sliders },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeDrawerTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onChangeDrawerTab(tab.id);
                // If drawer was compact, open to half on tab click
                if (drawerHeightStage === 'compact' && onToggleDrawerHeight) {
                  onToggleDrawerHeight();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-[#FFC800] text-neutral-950 shadow-sm'
                  : 'bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-tab header / Sub-category navigation */}
      {drawerHeightStage !== 'compact' && (
        <div className="flex-1 overflow-y-auto p-3">
        {/* ========================================================= */}
        {/* TAB 1: MEDIA PANEL */}
        {/* ========================================================= */}
        {activeDrawerTab === 'media' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
              <button
                onClick={() => setMediaSubTab('stock')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  mediaSubTab === 'stock' ? 'bg-neutral-800 text-[#FFC800]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Stock (38 Backgrounds)
              </button>
              <button
                onClick={() => setMediaSubTab('import')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  mediaSubTab === 'import' ? 'bg-neutral-800 text-[#FFC800]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Import Media
              </button>
            </div>

            {mediaSubTab === 'stock' ? (
              <div className="flex flex-col gap-2">
                <div className="text-[11px] text-neutral-400">
                  Tap to add as 5s clip on Main Video Track at playhead:
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {STOCK_BACKGROUNDS.map(stock => (
                    <button
                      key={stock.id}
                      onClick={() => handleAddStockClip(stock)}
                      className="flex flex-col items-center p-2 rounded-xl border border-neutral-800 bg-neutral-900 hover:border-[#FFC800] hover:scale-105 transition-all text-left group"
                      title={stock.fullName}
                    >
                      <div
                        className="w-full h-12 rounded-lg mb-1.5 shadow-sm border border-white/10"
                        style={{
                          backgroundColor: stock.color,
                          background: stock.gradient || stock.color,
                        }}
                      />
                      <span className="text-[11px] font-semibold text-neutral-200 group-hover:text-[#FFC800]">
                        {stock.shortName}
                      </span>
                      <span className="text-[9px] text-neutral-500">{stock.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-neutral-800 rounded-2xl bg-neutral-900/40 text-center">
                <Upload className="w-8 h-8 text-neutral-500 mb-2" />
                <h4 className="text-sm font-semibold text-white">Import Video, Image, or Audio</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                  Pick media from your device to add to project timeline
                </p>
                <label className="mt-3 px-4 py-2 bg-[#FFC800] text-neutral-950 font-bold text-xs rounded-xl cursor-pointer hover:bg-[#FFD733] transition-colors">
                  <span>Browse Device Files</span>
                  <input
                    type="file"
                    accept="video/*,image/*,audio/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const isVideo = file.type.startsWith('video');
                      const isAudio = file.type.startsWith('audio');
                      const isImage = file.type.startsWith('image');
                      const clipType = isVideo ? 'video' : isAudio ? 'audio' : 'image';
                      const trackIndex = isAudio ? 1 : 3;

                      const newClip: Clip = {
                        id: `imported_${Date.now()}`,
                        name: file.name,
                        type: clipType,
                        trackIndex,
                        startMs: currentTimeMs,
                        endMs: currentTimeMs + 5000,
                        sourceInMs: 0,
                        sourceDurationMs: 5000,
                        speed: 1.0,
                        volume: 1.0,
                        color: '#3B82F6',
                        transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
                        look: { brightness: 0, contrast: 1, saturation: 1 },
                        transition: {},
                        hidden: false,
                      };
                      onAddClip(newClip);
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TEXT PANEL */}
        {/* ========================================================= */}
        {activeDrawerTab === 'text' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
              <button
                onClick={() => setTextSubTab('add')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  textSubTab === 'add' ? 'bg-neutral-800 text-[#FFC800]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Add Text
              </button>
              <button
                onClick={() => setTextSubTab('effects')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  textSubTab === 'effects' ? 'bg-neutral-800 text-[#FFC800]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Text Effect Presets (~20)
              </button>
              <button
                onClick={() => setTextSubTab('autocaption')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  textSubTab === 'autocaption' ? 'bg-neutral-800 text-[#FFC800]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Auto Caption (Whisper)
              </button>
            </div>

            {textSubTab === 'add' && (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <button
                  onClick={handleAddDefaultText}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FFC800] text-neutral-950 font-bold text-sm shadow-md shadow-[#FFC800]/20 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add text at the playhead</span>
                </button>
                <p className="text-xs text-neutral-500">
                  Adds a 3-second text clip on Track 6 (Text track)
                </p>
              </div>
            )}

            {textSubTab === 'effects' && (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] text-neutral-400">
                  {selectedClip && selectedClip.trackIndex === 6
                    ? 'Selected text clip detected! Tap any look to apply style:'
                    : 'Tap any look preset to insert at playhead:'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TEXT_LOOK_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyTextPreset(preset)}
                      className="flex flex-col justify-between p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:border-[#FFC800] hover:scale-[1.02] transition-all text-left min-h-[80px]"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] text-neutral-500 uppercase font-mono">
                          {preset.category}
                        </span>
                        <Plus className="w-3 h-3 text-[#FFC800]" />
                      </div>
                      <div
                        className="py-1 px-1.5 rounded my-auto text-center font-bold text-xs truncate max-w-full"
                        style={{
                          color: preset.props.color,
                          backgroundColor: preset.props.box ? preset.props.boxColor || '#000000' : 'transparent',
                        }}
                      >
                        {preset.sampleText}
                      </div>
                      <span className="text-[11px] font-semibold text-neutral-300 truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {textSubTab === 'autocaption' && (
              <div className="flex flex-col gap-3 py-2">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-[#FFC800]" />
                    <span>Whisper Auto-Captioning</span>
                  </div>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Transcribes the Voice-over track audio using offline GGML Whisper, segments speech with millisecond timestamps, and places styled captions on the Text track at lower third.
                  </p>
                </div>

                {isCapturingCaptions ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 bg-neutral-900/50 rounded-xl border border-neutral-800">
                    <div className="w-6 h-6 border-2 border-[#FFC800] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-white font-medium">{captionProgressText}</span>
                    <button
                      onClick={() => setIsCapturingCaptions(false)}
                      className="mt-2 text-xs text-red-400 hover:text-red-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateCaptions}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FFC800] text-neutral-950 font-bold text-sm shadow-md shadow-[#FFC800]/20 active:scale-95 transition-all"
                  >
                    <Wand2 className="w-4 h-4 fill-neutral-950" />
                    <span>Generate Captions with Whisper</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: AUDIO PANEL */}
        {/* ========================================================= */}
        {activeDrawerTab === 'audio' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
              <button
                onClick={() => setAudioSubTab('sfx')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  audioSubTab === 'sfx' ? 'bg-neutral-800 text-[#FFC800]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sound Effects (~100 Procedural)
              </button>
              <button
                onClick={() => setAudioSubTab('music')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  audioSubTab === 'music' ? 'bg-neutral-800 text-[#FFC800]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Background Music
              </button>
              <button
                onClick={() => setAudioSubTab('import')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  audioSubTab === 'import' ? 'bg-neutral-800 text-[#FFC800]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Import Assets
              </button>
            </div>

            {audioSubTab === 'sfx' && (
              <div className="flex flex-col gap-2">
                {/* Search */}
                <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-xl">
                  <Search className="w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search 100+ sound effects (whoosh, click, ding, riser)..."
                    value={sfxSearch}
                    onChange={e => setSfxSearch(e.target.value)}
                    className="bg-transparent text-xs text-white outline-none w-full placeholder:text-neutral-500"
                  />
                </div>

                {/* Categories & Sounds list */}
                <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {SOUND_CATEGORIES.map(category => {
                    const soundsInCat = BUILT_IN_SOUNDS.filter(
                      s =>
                        s.category === category &&
                        (sfxSearch ? s.name.toLowerCase().includes(sfxSearch.toLowerCase()) : true)
                    );
                    if (soundsInCat.length === 0) return null;

                    return (
                      <div key={category} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1 pt-1">
                          <span>{category}</span>
                          <span className="text-neutral-600 font-mono text-[10px]">
                            {soundsInCat.length}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {soundsInCat.map(sound => (
                            <div
                              key={sound.id}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <button
                                  onClick={() => {
                                    setPlayingSoundId(sound.id);
                                    playSynthesizedSound(sound);
                                  }}
                                  className="p-1 rounded bg-neutral-800 hover:bg-[#FFC800] hover:text-neutral-950 text-neutral-300 transition-colors"
                                  title="Play Preview"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                </button>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-medium text-neutral-200 truncate">
                                    {sound.name}
                                  </span>
                                  <span className="text-[10px] text-neutral-500 font-mono">
                                    {(sound.durationMs / 1000).toFixed(1)}s
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleAddSfxClip(sound)}
                                className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-[#FFC800] hover:text-neutral-950 text-xs font-medium text-neutral-300 transition-colors"
                                title="Add to SFX Track"
                              >
                                <Plus className="w-3 h-3" />
                                <span className="text-[10px]">Add</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {audioSubTab === 'music' && (
              <div className="flex flex-col gap-2">
                <div className="text-[11px] text-neutral-400">
                  Curated background tracks (volume 0.7 on Track 1):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BUILT_IN_MUSIC.map(music => (
                    <div
                      key={music.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => {
                            setPlayingSoundId(music.id);
                            playMusicPreview(music);
                          }}
                          className="p-2 rounded-lg bg-neutral-800 hover:bg-[#FFC800] hover:text-neutral-950 text-neutral-300 transition-colors"
                          title="Preview Track"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-white truncate">
                            {music.name}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {music.genre} · {music.bpm} BPM · {music.mood}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddMusicClip(music)}
                        className="px-2.5 py-1 rounded-lg bg-[#FFC800] text-neutral-950 font-bold text-xs hover:bg-[#FFD733] transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {audioSubTab === 'import' && (
              <div className="flex flex-col gap-3 py-3">
                <div className="text-xs text-neutral-400">
                  Import local audio stems, Foley effects, or Freesound CC0 packs:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#FFC800] cursor-pointer text-center">
                    <Upload className="w-5 h-5 text-[#FFC800] mb-1" />
                    <span className="text-xs font-semibold text-white">Import Audio Files</span>
                    <span className="text-[10px] text-neutral-500">WAV, MP3, AAC, M4A</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const isSfx = window.confirm(`Import "${file.name}" as Sound Effect? (Click Cancel for Music)`);
                        const trackIndex = isSfx ? 2 : 1;
                        const volume = isSfx ? 1.0 : 0.7;
                        onAddClip({
                          id: `audio_imp_${Date.now()}`,
                          name: file.name,
                          type: 'audio',
                          trackIndex,
                          startMs: currentTimeMs,
                          endMs: currentTimeMs + 4000,
                          sourceInMs: 0,
                          sourceDurationMs: 4000,
                          speed: 1.0,
                          volume,
                          transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
                          look: { brightness: 0, contrast: 1, saturation: 1 },
                          transition: {},
                          hidden: false,
                        });
                      }}
                    />
                  </label>

                  <button
                    onClick={() => {
                      alert('Freesound CC0 bulk search API is available with on-device caching.');
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#FFC800] text-center"
                  >
                    <Music className="w-5 h-5 text-sky-400 mb-1" />
                    <span className="text-xs font-semibold text-white">Download Free CC0 Packs</span>
                    <span className="text-[10px] text-neutral-500">Freesound Royalty-Free</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: EFFECTS PANEL */}
        {/* ========================================================= */}
        {activeDrawerTab === 'effects' && (
          <div className="flex flex-col gap-3">
            {/* Filter tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {['All', 'Cinematic', 'Retro', 'Glitch', 'Lens', 'Stylize'].map(grp => (
                <button
                  key={grp}
                  onClick={() => setEffectsGroup(grp)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                    effectsGroup === grp
                      ? 'bg-[#FFC800] text-neutral-950 font-bold'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>

            {/* Effect cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VIDEO_EFFECTS.filter(e => effectsGroup === 'All' || e.group === effectsGroup).map(
                effect => (
                  <button
                    key={effect.id}
                    onClick={() => handleAddEffectLayer(effect)}
                    className="flex flex-col p-2.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:border-[#FFC800] hover:scale-[1.02] transition-all text-left group"
                  >
                    <div
                      className="w-full h-14 rounded-lg mb-2 relative overflow-hidden flex items-center justify-center text-xs font-bold text-white shadow-inner bg-gradient-to-tr from-neutral-800 to-neutral-700"
                      style={{
                        filter: effect.previewFilter.includes('gradient') ? undefined : effect.previewFilter,
                        background: effect.previewFilter.includes('gradient')
                          ? effect.previewFilter
                          : undefined,
                      }}
                    >
                      <span className="z-10 drop-shadow">{effect.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-neutral-200 group-hover:text-[#FFC800] truncate">
                      {effect.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 truncate">
                      {effect.description}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: TRANSITIONS PANEL */}
        {/* ========================================================= */}
        {activeDrawerTab === 'transitions' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTransitionSubTab('gallery')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    transitionSubTab === 'gallery'
                      ? 'bg-neutral-800 text-[#FFC800]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Transitions Gallery
                </button>
                <button
                  onClick={() => setTransitionSubTab('batch')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    transitionSubTab === 'batch'
                      ? 'bg-neutral-800 text-[#FFC800]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Batch Actions
                </button>
              </div>

              {/* Length Field (0.1 - 3s) */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span>Duration:</span>
                <input
                  type="number"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={transitionDuration}
                  onChange={e => setTransitionDuration(Number(e.target.value))}
                  className="w-14 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-white font-mono text-xs"
                />
                <span>s</span>
              </div>
            </div>

            {transitionSubTab === 'gallery' ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {TRANSITIONS.map(trans => {
                    const isSelected = selectedTransitionId === trans.id;
                    return (
                      <button
                        key={trans.id}
                        onClick={() => setSelectedTransitionId(trans.id)}
                        className={`flex flex-col p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#FFC800] bg-neutral-900 ring-1 ring-[#FFC800]'
                            : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                        }`}
                      >
                        <div className="w-full h-10 rounded-lg bg-neutral-800 mb-1.5 flex items-center justify-center text-[11px] font-mono text-neutral-300">
                          {trans.type.toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-neutral-200 truncate">
                          {trans.name}
                        </span>
                        <span className="text-[10px] text-neutral-500 truncate">
                          {trans.description}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Buttons per Spec Requirement */}
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                  <button
                    disabled={!isVideoOrImageSelected}
                    onClick={() => {
                      if (!selectedClip) return;
                      onUpdateClip(selectedClip.id, {
                        transition: {
                          id: selectedTransitionId,
                          ms: Math.round(transitionDuration * 1000),
                        },
                      });
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#FFC800] text-neutral-950 font-bold text-xs disabled:opacity-40 disabled:bg-neutral-800 disabled:text-neutral-500 transition-colors"
                  >
                    Add this transition to selected clip
                  </button>
                  <button
                    disabled={!isVideoOrImageSelected || !selectedClip?.transition?.id}
                    onClick={() => {
                      if (!selectedClip) return;
                      onUpdateClip(selectedClip.id, {
                        transition: { id: undefined, ms: 800 },
                      });
                    }}
                    className="py-2 px-3 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium disabled:opacity-40 transition-colors"
                  >
                    Remove transition
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() =>
                    onApplyTransitionToAllCuts(selectedTransitionId, Math.round(transitionDuration * 1000))
                  }
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#FFC800] text-left"
                >
                  <div className="text-xs font-bold text-white mb-0.5">
                    Apply this transition to ALL cuts
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Inserts {selectedTransitionId} ({transitionDuration}s) between touching clips on track 3
                  </div>
                </button>

                <button
                  onClick={onApplyRandomTransitionToAllCuts}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#FFC800] text-left flex items-start gap-2"
                >
                  <Shuffle className="w-4 h-4 text-[#FFC800] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white mb-0.5">
                      Apply RANDOM transition to all cut clips
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Mixes dissolve, slides, zooms, and wipes across every cut
                    </div>
                  </div>
                </button>

                <button
                  onClick={onApplyRandomTransitionsToRandomClips}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#FFC800] text-left flex items-start gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white mb-0.5">
                      Apply random transitions to RANDOM clips
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Random runs get transitions while others keep clean straight cuts
                    </div>
                  </div>
                </button>

                <button
                  onClick={onRemoveAllTransitions}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500 text-left flex items-start gap-2"
                >
                  <Trash2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-red-400 mb-0.5">
                      Remove all transitions
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Clears transitions from all timeline clips
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: DETAILS PANEL (Contextual for selected clip) */}
        {/* ========================================================= */}
        {activeDrawerTab === 'details' && (
          <div className="flex flex-col gap-3">
            {selectedClip ? (
              <div className="flex flex-col gap-3">
                {/* Details Tab Switcher */}
                <div className="flex items-center gap-1.5 border-b border-neutral-800 pb-2 overflow-x-auto">
                  {selectedClip.type === 'video' && (
                    <>
                      <button
                        onClick={() => setDetailsSubTab('video')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                          detailsSubTab === 'video' ? 'bg-[#FFC800] text-neutral-950 font-bold' : 'text-neutral-400'
                        }`}
                      >
                        Video Transform
                      </button>
                      <button
                        onClick={() => setDetailsSubTab('speed')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                          detailsSubTab === 'speed' ? 'bg-[#FFC800] text-neutral-950 font-bold' : 'text-neutral-400'
                        }`}
                      >
                        Speed
                      </button>
                      <button
                        onClick={() => setDetailsSubTab('audio')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                          detailsSubTab === 'audio' ? 'bg-[#FFC800] text-neutral-950 font-bold' : 'text-neutral-400'
                        }`}
                      >
                        Audio
                      </button>
                      <button
                        onClick={() => setDetailsSubTab('adjust')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                          detailsSubTab === 'adjust' ? 'bg-[#FFC800] text-neutral-950 font-bold' : 'text-neutral-400'
                        }`}
                      >
                        Adjust
                      </button>
                    </>
                  )}

                  {selectedClip.type === 'text' && (
                    <>
                      <button
                        onClick={() => setDetailsSubTab('text')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                          detailsSubTab === 'text' ? 'bg-[#FFC800] text-neutral-950 font-bold' : 'text-neutral-400'
                        }`}
                      >
                        Text Style
                      </button>
                      <button
                        onClick={() => setDetailsSubTab('video')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                          detailsSubTab === 'video' ? 'bg-[#FFC800] text-neutral-950 font-bold' : 'text-neutral-400'
                        }`}
                      >
                        Position
                      </button>
                      <button
                        onClick={() => setDetailsSubTab('animation')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                          detailsSubTab === 'animation' ? 'bg-[#FFC800] text-neutral-950 font-bold' : 'text-neutral-400'
                        }`}
                      >
                        Animation
                      </button>
                    </>
                  )}

                  {selectedClip.type === 'audio' && (
                    <>
                      <button
                        onClick={() => setDetailsSubTab('audio')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                          detailsSubTab === 'audio' ? 'bg-[#FFC800] text-neutral-950 font-bold' : 'text-neutral-400'
                        }`}
                      >
                        Volume
                      </button>
                      <button
                        onClick={() => setDetailsSubTab('speed')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                          detailsSubTab === 'speed' ? 'bg-[#FFC800] text-neutral-950 font-bold' : 'text-neutral-400'
                        }`}
                      >
                        Audio Speed
                      </button>
                    </>
                  )}
                </div>

                {/* Sub Tab: Video Transform */}
                {detailsSubTab === 'video' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>Scale:</span>
                        <span className="font-mono text-white">
                          {(selectedClip.transform?.scale || 1.0).toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="3.0"
                        step="0.05"
                        value={selectedClip.transform?.scale || 1.0}
                        onChange={e =>
                          onUpdateClip(selectedClip.id, {
                            transform: { ...selectedClip.transform, scale: parseFloat(e.target.value) },
                          })
                        }
                        className="accent-[#FFC800]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>Opacity:</span>
                        <span className="font-mono text-white">
                          {Math.round((selectedClip.transform?.opacity ?? 1.0) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={selectedClip.transform?.opacity ?? 1.0}
                        onChange={e =>
                          onUpdateClip(selectedClip.id, {
                            transform: { ...selectedClip.transform, opacity: parseFloat(e.target.value) },
                          })
                        }
                        className="accent-[#FFC800]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>Position Y:</span>
                        <span className="font-mono text-white">
                          {(selectedClip.transform?.offsetY || 0).toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.8"
                        max="0.8"
                        step="0.02"
                        value={selectedClip.transform?.offsetY || 0}
                        onChange={e =>
                          onUpdateClip(selectedClip.id, {
                            transform: { ...selectedClip.transform, offsetY: parseFloat(e.target.value) },
                          })
                        }
                        className="accent-[#FFC800]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>Rotation:</span>
                        <span className="font-mono text-white">
                          {Math.round(selectedClip.transform?.rotation || 0)}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        value={selectedClip.transform?.rotation || 0}
                        onChange={e =>
                          onUpdateClip(selectedClip.id, {
                            transform: { ...selectedClip.transform, rotation: parseInt(e.target.value) },
                          })
                        }
                        className="accent-[#FFC800]"
                      />
                    </div>
                  </div>
                )}

                {/* Sub Tab: Speed */}
                {detailsSubTab === 'speed' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>Playback Speed:</span>
                      <span className="font-mono text-[#FFC800] font-bold">
                        {(selectedClip.speed || 1.0).toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.25"
                      max="4.0"
                      step="0.05"
                      value={selectedClip.speed || 1.0}
                      onChange={e => {
                        const speed = parseFloat(e.target.value);
                        onUpdateClip(selectedClip.id, { speed });
                      }}
                      className="accent-[#FFC800]"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                      <span>0.25x SlowMo</span>
                      <span>1.0x Normal</span>
                      <span>4.0x Hyper</span>
                    </div>
                  </div>
                )}

                {/* Sub Tab: Audio Volume */}
                {detailsSubTab === 'audio' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>Track Volume:</span>
                      <span className="font-mono text-[#FFC800] font-bold">
                        {Math.round((selectedClip.volume ?? 1.0) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2.0"
                      step="0.05"
                      value={selectedClip.volume ?? 1.0}
                      onChange={e =>
                        onUpdateClip(selectedClip.id, { volume: parseFloat(e.target.value) })
                      }
                      className="accent-[#FFC800]"
                    />
                  </div>
                )}

                {/* Sub Tab: Text Properties */}
                {detailsSubTab === 'text' && selectedClip.text && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-neutral-400">Caption Text Content:</label>
                      <textarea
                        rows={2}
                        value={selectedClip.text.text}
                        onChange={e =>
                          onUpdateClip(selectedClip.id, {
                            text: { ...selectedClip.text!, text: e.target.value },
                          })
                        }
                        className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white outline-none focus:border-[#FFC800]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-neutral-400">Color:</label>
                        <input
                          type="color"
                          value={selectedClip.text.color}
                          onChange={e =>
                            onUpdateClip(selectedClip.id, {
                              text: { ...selectedClip.text!, color: e.target.value },
                            })
                          }
                          className="w-8 h-8 rounded bg-transparent border border-neutral-700 cursor-pointer"
                        />
                      </div>

                      <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedClip.text.bold}
                          onChange={e =>
                            onUpdateClip(selectedClip.id, {
                              text: { ...selectedClip.text!, bold: e.target.checked },
                            })
                          }
                          className="accent-[#FFC800]"
                        />
                        <span>Bold Weight</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedClip.text.box}
                          onChange={e =>
                            onUpdateClip(selectedClip.id, {
                              text: { ...selectedClip.text!, box: e.target.checked },
                            })
                          }
                          className="accent-[#FFC800]"
                        />
                        <span>Dark Background Box</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Sub Tab: Animation Gallery */}
                {detailsSubTab === 'animation' && selectedClip.text && (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {TEXT_ANIMATIONS.map(anim => {
                        const isCurrent = selectedClip.text?.animIn === anim.id;
                        return (
                          <button
                            key={anim.id}
                            onClick={() =>
                              onUpdateClip(selectedClip.id, {
                                text: { ...selectedClip.text!, animIn: anim.id },
                              })
                            }
                            className={`p-2 rounded-lg border text-left transition-colors ${
                              isCurrent
                                ? 'border-[#FFC800] bg-neutral-900 text-[#FFC800]'
                                : 'border-neutral-800 bg-neutral-900/60 text-neutral-300'
                            }`}
                          >
                            <span className="text-xs font-semibold block">{anim.name}</span>
                            <span className="text-[9px] text-neutral-500 block truncate">
                              {anim.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-500 text-xs">
                <span>Select a clip on the timeline to edit properties</span>
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
};
