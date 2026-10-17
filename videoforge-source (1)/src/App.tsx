/**
 * VideoForge - Mobile Multi-Track Video Editor
 * Production Mobile Application (Android / iOS / PWA)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Project, Clip } from './types/timeline';
import {
  loadAllProjects,
  saveProject,
  createNewProject,
  deleteProject as deleteStoredProject,
  duplicateProject as duplicateStoredProject,
  getActiveProjectId,
  setActiveProjectId,
  SAMPLE_PROJECT,
} from './data/projectStorage';
import {
  addClip,
  moveClip,
  trimClip,
  splitClipAtPlayhead,
  deleteClip,
  duplicateClip,
  rippleDeleteClip,
  closeGapsOnTrack,
  updateClipProperties,
  replaceAllClipsOfTrack,
  applyTransitionToAllCuts,
  applyRandomTransitionToAllCuts,
  applyRandomTransitionsToRandomClips,
  removeAllTransitions,
  TimelineUndoRedoStack,
} from './core/timelineModel';
import { WhisperOptions } from './data/whisperService';

import { MobileShell } from './components/MobileShell';
import { TopBar } from './components/TopBar';
import { BottomNav, NavTab } from './components/BottomNav';

import { ProjectsScreen } from './screens/ProjectsScreen';
import { DownloadScreen } from './screens/DownloadScreen';
import { ScriptVoiceScreen } from './screens/ScriptVoiceScreen';
import { EditingScreen } from './screens/EditingScreen';
import { ExportScreen } from './screens/ExportScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { PWAInstallModal } from './components/PWAInstallModal';

export default function App() {
  // Navigation & Shell State
  const [activeTab, setActiveTab] = useState<NavTab>('editing');
  const [deviceMode, setDeviceMode] = useState<'iphone' | 'pixel' | 'fullscreen'>('iphone');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<Project[]>(() => loadAllProjects());
  const [activeProjectId, setActiveId] = useState<string>(() => getActiveProjectId());

  const currentProject =
    projects.find(p => p.id === activeProjectId) || projects[0] || SAMPLE_PROJECT;

  // Undo / Redo Stack
  const undoStackRef = useRef<TimelineUndoRedoStack>(new TimelineUndoRedoStack(currentProject));
  const [, setHistoryVersion] = useState(0);

  // Synchronize undo stack when active project changes
  useEffect(() => {
    undoStackRef.current = new TimelineUndoRedoStack(currentProject);
    setHistoryVersion(v => v + 1);
  }, [activeProjectId]);

  // Playhead & Playback State
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // Settings: Whisper configuration
  const [whisperOptions, setWhisperOptions] = useState<WhisperOptions>({
    model: 'base',
    language: 'auto',
    threads: 4,
    translate: false,
  });

  // Autosave State & Debounce Timer Refs
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingProjectRef = useRef<Project | null>(null);

  // Synchronously flush any pending debounced autosave to JSON storage
  const flushPendingAutosave = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    if (pendingProjectRef.current) {
      saveProject(pendingProjectRef.current);
      pendingProjectRef.current = null;
      setSaveStatus('saved');
    }
  }, []);

  // Schedule debounced autosave (500ms debounce after meaningful modification)
  const scheduleDebouncedAutosave = useCallback((projectToPersist: Project) => {
    pendingProjectRef.current = projectToPersist;
    setSaveStatus('saving');

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      if (pendingProjectRef.current) {
        saveProject(pendingProjectRef.current);
        pendingProjectRef.current = null;
      }
      setSaveStatus('saved');
      autosaveTimerRef.current = null;
    }, 500);
  }, []);

  // Flush on page unload or backgrounding
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushPendingAutosave();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushPendingAutosave();
    };
  }, [flushPendingAutosave]);

  // -------------------------------------------------------------
  // Project Update & Undo Dispatcher with Debounced Autosave
  // -------------------------------------------------------------
  const commitProjectUpdate = useCallback(
    (newProject: Project) => {
      undoStackRef.current.push(newProject);
      setProjects(prev =>
        prev.map(p => (p.id === newProject.id ? newProject : p))
      );
      setHistoryVersion(v => v + 1);
      scheduleDebouncedAutosave(newProject);
    },
    [scheduleDebouncedAutosave]
  );

  const handleUndo = useCallback(() => {
    const previous = undoStackRef.current.undo();
    if (previous) {
      setProjects(prev =>
        prev.map(p => (p.id === previous.id ? previous : p))
      );
      setHistoryVersion(v => v + 1);
      scheduleDebouncedAutosave(previous);
    }
  }, [scheduleDebouncedAutosave]);

  const handleRedo = useCallback(() => {
    const next = undoStackRef.current.redo();
    if (next) {
      setProjects(prev =>
        prev.map(p => (p.id === next.id ? next : p))
      );
      setHistoryVersion(v => v + 1);
      scheduleDebouncedAutosave(next);
    }
  }, [scheduleDebouncedAutosave]);

  // -------------------------------------------------------------
  // Timeline Operations
  // -------------------------------------------------------------
  const handleAddClip = useCallback(
    (clip: Clip) => {
      const res = addClip(currentProject, clip);
      if (res.success) {
        commitProjectUpdate(res.project);
        setSelectedClipId(clip.id);
      } else if (res.error) {
        alert(res.error);
      }
    },
    [currentProject, commitProjectUpdate]
  );

  const handleMoveClip = useCallback(
    (clipId: string, newStartMs: number, newTrackIndex?: number) => {
      const res = moveClip(currentProject, clipId, newStartMs, newTrackIndex);
      if (res.success) {
        commitProjectUpdate(res.project);
      }
    },
    [currentProject, commitProjectUpdate]
  );

  const handleTrimClip = useCallback(
    (clipId: string, newStartMs: number, newEndMs: number, isStart: boolean) => {
      const res = trimClip(currentProject, clipId, newStartMs, newEndMs, isStart);
      if (res.success) {
        commitProjectUpdate(res.project);
      }
    },
    [currentProject, commitProjectUpdate]
  );

  const handleSplitClip = useCallback(
    (clipId: string) => {
      const res = splitClipAtPlayhead(currentProject, clipId, currentTimeMs);
      if (res.success) {
        commitProjectUpdate(res.project);
        if (res.newClipId) {
          setSelectedClipId(res.newClipId);
        }
      } else if (res.error) {
        alert(res.error);
      }
    },
    [currentProject, currentTimeMs, commitProjectUpdate]
  );

  const handleDeleteClip = useCallback(
    (clipId: string) => {
      const updated = deleteClip(currentProject, clipId);
      commitProjectUpdate(updated);
      if (selectedClipId === clipId) {
        setSelectedClipId(null);
      }
    },
    [currentProject, selectedClipId, commitProjectUpdate]
  );

  const handleDuplicateClip = useCallback(
    (clipId: string) => {
      const res = duplicateClip(currentProject, clipId);
      if (res.success) {
        commitProjectUpdate(res.project);
        if (res.newClipId) {
          setSelectedClipId(res.newClipId);
        }
      }
    },
    [currentProject, commitProjectUpdate]
  );

  const handleRippleDeleteClip = useCallback(
    (clipId: string) => {
      const updated = rippleDeleteClip(currentProject, clipId);
      commitProjectUpdate(updated);
      if (selectedClipId === clipId) {
        setSelectedClipId(null);
      }
    },
    [currentProject, selectedClipId, commitProjectUpdate]
  );

  const handleCloseGaps = useCallback(
    (trackIndex: number) => {
      const updated = closeGapsOnTrack(currentProject, trackIndex);
      commitProjectUpdate(updated);
    },
    [currentProject, commitProjectUpdate]
  );

  const handleToggleClipHidden = useCallback(
    (clipId: string) => {
      const clip = currentProject.clips.find(c => c.id === clipId);
      if (clip) {
        const updated = updateClipProperties(currentProject, clipId, { hidden: !clip.hidden });
        commitProjectUpdate(updated);
      }
    },
    [currentProject, commitProjectUpdate]
  );

  const handleUpdateClip = useCallback(
    (clipId: string, partial: Partial<Clip>) => {
      const updated = updateClipProperties(currentProject, clipId, partial);
      commitProjectUpdate(updated);
    },
    [currentProject, commitProjectUpdate]
  );

  const handleReplaceClipsOfTrack = useCallback(
    (trackIndex: number, newClips: Clip[]) => {
      const updated = replaceAllClipsOfTrack(currentProject, trackIndex, newClips);
      commitProjectUpdate(updated);
    },
    [currentProject, commitProjectUpdate]
  );

  // Transitions batch operations
  const handleApplyTransitionToAllCuts = useCallback(
    (transitionId: string, durationMs: number) => {
      const updated = applyTransitionToAllCuts(currentProject, transitionId, durationMs);
      commitProjectUpdate(updated);
    },
    [currentProject, commitProjectUpdate]
  );

  const handleApplyRandomTransitionToAllCuts = useCallback(() => {
    const updated = applyRandomTransitionToAllCuts(currentProject);
    commitProjectUpdate(updated);
  }, [currentProject, commitProjectUpdate]);

  const handleApplyRandomTransitionsToRandomClips = useCallback(() => {
    const updated = applyRandomTransitionsToRandomClips(currentProject);
    commitProjectUpdate(updated);
  }, [currentProject, commitProjectUpdate]);

  const handleRemoveAllTransitions = useCallback(() => {
    const updated = removeAllTransitions(currentProject);
    commitProjectUpdate(updated);
  }, [currentProject, commitProjectUpdate]);

  // Project management
  const handleCreateProject = (name: string, aspectRatio: '16:9' | '9:16' | '1:1') => {
    flushPendingAutosave();
    const newProj = createNewProject(name, aspectRatio);
    setProjects(loadAllProjects());
    setActiveId(newProj.id);
    setActiveProjectId(newProj.id);
    setActiveTab('editing');
  };

  const handleSelectProject = (id: string) => {
    flushPendingAutosave();
    setActiveId(id);
    setActiveProjectId(id);
    setCurrentTimeMs(0);
    setIsPlaying(false);
    setSelectedClipId(null);
    setActiveTab('editing');
  };

  const handleDuplicateProject = (id: string) => {
    const dup = duplicateStoredProject(id);
    if (dup) {
      setProjects(loadAllProjects());
    }
  };

  const handleDeleteProject = (id: string) => {
    const remaining = deleteStoredProject(id);
    setProjects(remaining);
    if (activeProjectId === id && remaining.length > 0) {
      handleSelectProject(remaining[0].id);
    }
  };

  const handleRenameProject = (newName: string) => {
    const updated: Project = { ...currentProject, name: newName };
    commitProjectUpdate(updated);
  };

  const handleResetToSampleProject = () => {
    saveProject(SAMPLE_PROJECT);
    setProjects(loadAllProjects());
    handleSelectProject(SAMPLE_PROJECT.id);
  };

  // -------------------------------------------------------------
  // Playback Loop
  // -------------------------------------------------------------
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (isPlaying) {
        setCurrentTimeMs(prev => {
          const next = prev + delta;
          if (next >= currentProject.durationMs) {
            setIsPlaying(false);
            return currentProject.durationMs;
          }
          return next;
        });
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentProject.durationMs]);

  // Keyboard Shortcuts (Space: Play/Pause, Ctrl+Z: Undo, Ctrl+Y: Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const canUndo = undoStackRef.current.canUndo();
  const canRedo = undoStackRef.current.canRedo();

  return (
    <MobileShell deviceMode={deviceMode} orientation={orientation}>
      <div className="flex flex-col h-full w-full bg-neutral-950 overflow-hidden">
        {/* Top App Bar */}
        <TopBar
          projectName={currentProject.name}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onRenameProject={handleRenameProject}
          deviceMode={deviceMode}
          onToggleDeviceMode={setDeviceMode}
          orientation={orientation}
          onToggleOrientation={() =>
            setOrientation(o => (o === 'portrait' ? 'landscape' : 'portrait'))
          }
          onQuickExport={() => setActiveTab('export')}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          saveStatus={saveStatus}
        />

        {/* Main Active Tab Screen Content */}
        <main className="flex-1 min-h-0 overflow-hidden relative">
          {activeTab === 'projects' && (
            <ProjectsScreen
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={handleSelectProject}
              onCreateProject={handleCreateProject}
              onDuplicateProject={handleDuplicateProject}
              onDeleteProject={handleDeleteProject}
              onImportProjectJson={json => {
                try {
                  const parsed = JSON.parse(json);
                  saveProject(parsed);
                  setProjects(loadAllProjects());
                  handleSelectProject(parsed.id);
                } catch {
                  alert('Invalid JSON file');
                }
              }}
            />
          )}

          {activeTab === 'download' && (
            <DownloadScreen
              project={currentProject}
              onAddMediaClipToProject={handleAddClip}
              onNavigateToScript={() => setActiveTab('script')}
            />
          )}

          {activeTab === 'script' && (
            <ScriptVoiceScreen
              project={currentProject}
              onUpdateProjectScript={text => {
                commitProjectUpdate({ ...currentProject, scriptText: text });
              }}
              onReplaceClipsOfTrack={handleReplaceClipsOfTrack}
              onAddClipsToTimeline={clips => {
                clips.forEach(handleAddClip);
              }}
              onNavigateToEditing={() => setActiveTab('editing')}
            />
          )}

          {activeTab === 'editing' && (
            <EditingScreen
              project={currentProject}
              currentTimeMs={currentTimeMs}
              onSeek={setCurrentTimeMs}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              selectedClipId={selectedClipId}
              onSelectClip={setSelectedClipId}
              onAddClip={handleAddClip}
              onMoveClip={handleMoveClip}
              onTrimClip={handleTrimClip}
              onSplitClip={handleSplitClip}
              onDeleteClip={handleDeleteClip}
              onDuplicateClip={handleDuplicateClip}
              onRippleDeleteClip={handleRippleDeleteClip}
              onCloseGaps={handleCloseGaps}
              onToggleClipHidden={handleToggleClipHidden}
              onUpdateClip={handleUpdateClip}
              onReplaceClipsOfTrack={handleReplaceClipsOfTrack}
              onApplyTransitionToAllCuts={handleApplyTransitionToAllCuts}
              onApplyRandomTransitionToAllCuts={handleApplyRandomTransitionToAllCuts}
              onApplyRandomTransitionsToRandomClips={handleApplyRandomTransitionsToRandomClips}
              onRemoveAllTransitions={handleRemoveAllTransitions}
              whisperOptions={whisperOptions}
              orientation={orientation}
            />
          )}

          {activeTab === 'export' && <ExportScreen project={currentProject} />}

          {activeTab === 'settings' && (
            <SettingsScreen
              whisperOptions={whisperOptions}
              onChangeWhisperOptions={setWhisperOptions}
              onResetToSampleProject={handleResetToSampleProject}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Global PWA Install & Source Code Modal */}
        <PWAInstallModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />
      </div>
    </MobileShell>
  );
}
