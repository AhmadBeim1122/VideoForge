import React, { useState } from 'react';
import { Project, Clip } from '../types/timeline';
import { PreviewPlayer } from '../components/PreviewPlayer';
import { TimelineEditor } from '../components/TimelineEditor';
import { MediaPanelDrawer, MainDrawerTab } from '../components/MediaPanelDrawer';
import { WhisperOptions } from '../data/whisperService';

interface EditingScreenProps {
  project: Project;
  currentTimeMs: number;
  onSeek: (ms: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  selectedClipId: string | null;
  onSelectClip: (clipId: string | null) => void;
  onAddClip: (clip: Clip) => void;
  onMoveClip: (clipId: string, newStartMs: number, newTrackIndex?: number) => void;
  onTrimClip: (clipId: string, newStartMs: number, newEndMs: number, isStart: boolean) => void;
  onSplitClip: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
  onDuplicateClip: (clipId: string) => void;
  onRippleDeleteClip: (clipId: string) => void;
  onCloseGaps: (trackIndex: number) => void;
  onToggleClipHidden: (clipId: string) => void;
  onUpdateClip: (clipId: string, partial: Partial<Clip>) => void;
  onReplaceClipsOfTrack: (trackIndex: number, newClips: Clip[]) => void;
  onApplyTransitionToAllCuts: (transitionId: string, durationMs: number) => void;
  onApplyRandomTransitionToAllCuts: () => void;
  onApplyRandomTransitionsToRandomClips: () => void;
  onRemoveAllTransitions: () => void;
  whisperOptions: WhisperOptions;
  orientation: 'portrait' | 'landscape';
}

export const EditingScreen: React.FC<EditingScreenProps> = ({
  project,
  currentTimeMs,
  onSeek,
  isPlaying,
  onTogglePlay,
  selectedClipId,
  onSelectClip,
  onAddClip,
  onMoveClip,
  onTrimClip,
  onSplitClip,
  onDeleteClip,
  onDuplicateClip,
  onRippleDeleteClip,
  onCloseGaps,
  onToggleClipHidden,
  onUpdateClip,
  onReplaceClipsOfTrack,
  onApplyTransitionToAllCuts,
  onApplyRandomTransitionToAllCuts,
  onApplyRandomTransitionsToRandomClips,
  onRemoveAllTransitions,
  whisperOptions,
  orientation,
}) => {
  const [activeDrawerTab, setActiveDrawerTab] = useState<MainDrawerTab>('media');
  const [drawerHeightStage, setDrawerHeightStage] = useState<'compact' | 'half' | 'expanded'>('half');

  // Toggle drawer 3-stage height
  const handleToggleDrawerHeight = () => {
    setDrawerHeightStage(prev => {
      if (prev === 'compact') return 'half';
      if (prev === 'half') return 'expanded';
      return 'compact';
    });
  };

  // When a clip is selected on timeline, switch drawer to Details tab automatically
  const handleSelectClipWithTab = (clipId: string | null) => {
    onSelectClip(clipId);
    if (clipId) {
      setActiveDrawerTab('details');
      if (drawerHeightStage === 'compact') {
        setDrawerHeightStage('half');
      }
    }
  };

  const selectedClip = project.clips.find(c => c.id === selectedClipId) || null;

  if (orientation === 'landscape') {
    return (
      <div className="flex h-full w-full bg-neutral-950 overflow-hidden">
        {/* Left Side: Media Panel & Details (40%) */}
        <div className="w-[42%] h-full border-r border-neutral-800 flex flex-col overflow-hidden">
          <MediaPanelDrawer
            project={project}
            currentTimeMs={currentTimeMs}
            selectedClip={selectedClip}
            activeDrawerTab={activeDrawerTab}
            onChangeDrawerTab={setActiveDrawerTab}
            onAddClip={onAddClip}
            onUpdateClip={onUpdateClip}
            onReplaceClipsOfTrack={onReplaceClipsOfTrack}
            onApplyTransitionToAllCuts={onApplyTransitionToAllCuts}
            onApplyRandomTransitionToAllCuts={onApplyRandomTransitionToAllCuts}
            onApplyRandomTransitionsToRandomClips={onApplyRandomTransitionsToRandomClips}
            onRemoveAllTransitions={onRemoveAllTransitions}
            whisperOptions={whisperOptions}
            drawerHeightStage="expanded"
          />
        </div>

        {/* Right Side: Preview on top (48% height), Timeline on bottom (52% height) */}
        <div className="flex-1 h-full flex flex-col overflow-hidden">
          <div className="h-[46%] p-2 overflow-hidden flex items-center justify-center border-b border-neutral-800">
            <PreviewPlayer
              project={project}
              currentTimeMs={currentTimeMs}
              onSeek={onSeek}
              isPlaying={isPlaying}
              onTogglePlay={onTogglePlay}
              selectedClipId={selectedClipId}
              onSelectClip={handleSelectClipWithTab}
              onUpdateClip={onUpdateClip}
            />
          </div>
          <div className="flex-1 p-2 overflow-hidden">
            <TimelineEditor
              project={project}
              currentTimeMs={currentTimeMs}
              onSeek={onSeek}
              selectedClipId={selectedClipId}
              onSelectClip={handleSelectClipWithTab}
              onMoveClip={onMoveClip}
              onTrimClip={onTrimClip}
              onSplitClip={onSplitClip}
              onDeleteClip={onDeleteClip}
              onDuplicateClip={onDuplicateClip}
              onRippleDeleteClip={onRippleDeleteClip}
              onCloseGaps={onCloseGaps}
              onToggleClipHidden={onToggleClipHidden}
              onUpdateClip={onUpdateClip}
            />
          </div>
        </div>
      </div>
    );
  }

  // Portrait Layout (Default Mobile Adaptation)
  const drawerHeightClass =
    drawerHeightStage === 'compact'
      ? 'h-[46px]'
      : drawerHeightStage === 'expanded'
      ? 'h-[370px] sm:h-[390px]'
      : 'h-[230px] sm:h-[250px]';

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 overflow-hidden">
      {/* 1. Preview on Top with Safe Zone Overlay & Direct Canvas Dragging */}
      <div className="shrink-0 p-2 sm:p-2.5 bg-neutral-950">
        <PreviewPlayer
          project={project}
          currentTimeMs={currentTimeMs}
          onSeek={onSeek}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          selectedClipId={selectedClipId}
          onSelectClip={handleSelectClipWithTab}
          onUpdateClip={onUpdateClip}
        />
      </div>

      {/* 2. Timeline in the Middle with Waveforms, Filmstrips & Quick Action Bar */}
      <div className="flex-1 min-h-[160px] p-2 overflow-hidden relative">
        <TimelineEditor
          project={project}
          currentTimeMs={currentTimeMs}
          onSeek={onSeek}
          selectedClipId={selectedClipId}
          onSelectClip={handleSelectClipWithTab}
          onMoveClip={onMoveClip}
          onTrimClip={onTrimClip}
          onSplitClip={onSplitClip}
          onDeleteClip={onDeleteClip}
          onDuplicateClip={onDuplicateClip}
          onRippleDeleteClip={onRippleDeleteClip}
          onCloseGaps={onCloseGaps}
          onToggleClipHidden={onToggleClipHidden}
          onUpdateClip={onUpdateClip}
        />
      </div>

      {/* 3. Three-Stage Expandable Bottom Sheet / Drawer */}
      <div
        className={`shrink-0 ${drawerHeightClass} border-t border-neutral-800/80 bg-neutral-950 overflow-hidden transition-all duration-300`}
      >
        <MediaPanelDrawer
          project={project}
          currentTimeMs={currentTimeMs}
          selectedClip={selectedClip}
          activeDrawerTab={activeDrawerTab}
          onChangeDrawerTab={setActiveDrawerTab}
          onAddClip={onAddClip}
          onUpdateClip={onUpdateClip}
          onReplaceClipsOfTrack={onReplaceClipsOfTrack}
          onApplyTransitionToAllCuts={onApplyTransitionToAllCuts}
          onApplyRandomTransitionToAllCuts={onApplyRandomTransitionToAllCuts}
          onApplyRandomTransitionsToRandomClips={onApplyRandomTransitionsToRandomClips}
          onRemoveAllTransitions={onRemoveAllTransitions}
          whisperOptions={whisperOptions}
          drawerHeightStage={drawerHeightStage}
          onToggleDrawerHeight={handleToggleDrawerHeight}
        />
      </div>
    </div>
  );
};
