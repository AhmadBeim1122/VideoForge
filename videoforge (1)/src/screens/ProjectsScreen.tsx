import React, { useState } from 'react';
import {
  Plus,
  Copy,
  Trash2,
  Calendar,
  Clock,
  Film,
  Download,
  Upload,
  Sparkles,
} from 'lucide-react';
import { Project } from '../types/timeline';

interface ProjectsScreenProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string, aspectRatio: '16:9' | '9:16' | '1:1') => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onImportProjectJson: (jsonString: string) => void;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDuplicateProject,
  onDeleteProject,
  onImportProjectJson,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newAspectRatio, setNewAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('9:16');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName.trim(), newAspectRatio);
    setNewProjectName('');
    setShowCreateModal(false);
  };

  const formatDuration = (ms: number) => {
    const totalSecs = Math.round(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 p-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Projects</h1>
          <p className="text-xs text-neutral-400">Multi-track video explainers on device</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFC800] text-neutral-950 font-bold text-xs shadow-md shadow-[#FFC800]/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects.map(p => {
          const isActive = p.id === activeProjectId;
          const clipCount = p.clips.length;
          return (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`flex flex-col rounded-2xl border p-3 cursor-pointer transition-all ${
                isActive
                  ? 'border-[#FFC800] bg-neutral-900 shadow-md shadow-[#FFC800]/10 ring-1 ring-[#FFC800]'
                  : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative w-full h-28 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden mb-2.5">
                <div
                  className="flex flex-col items-center justify-center w-full h-full p-2 text-center"
                  style={{
                    background:
                      p.aspectRatio === '9:16'
                        ? 'linear-gradient(180deg, #18181b, #09090b)'
                        : 'linear-gradient(135deg, #1e1b4b, #0f172a)',
                  }}
                >
                  <Film className="w-6 h-6 text-[#FFC800] mb-1" />
                  <span className="text-xs font-semibold text-neutral-300 truncate max-w-[85%]">
                    {p.name}
                  </span>
                </div>

                {/* Aspect ratio badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-[#FFC800] border border-[#FFC800]/30">
                  {p.aspectRatio}
                </div>

                {/* Active indicator badge */}
                {isActive && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FFC800] text-[10px] font-bold text-neutral-950">
                    Active
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white truncate max-w-[70%]">
                  {p.name}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {formatDuration(p.durationMs)}
                </span>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-800/80 pt-2 mt-auto">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(p.updatedAt)}</span>
                  </span>
                  <span>·</span>
                  <span>{clipCount} clips</span>
                </div>

                {/* Project actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDuplicateProject(p.id);
                    }}
                    className="p-1 hover:text-white text-neutral-400 rounded transition-colors"
                    title="Duplicate Project"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {projects.length > 1 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (window.confirm(`Delete project "${p.name}"?`)) {
                          onDeleteProject(p.id);
                        }
                      }}
                      className="p-1 hover:text-red-400 text-neutral-500 rounded transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-4 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Create New Project</h3>
            <p className="text-xs text-neutral-400 mb-4">Set format and target platform</p>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3 Tips for Better Reels"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  autoFocus
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC800]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '9:16' as const, label: '9:16', desc: 'Shorts/Reels' },
                    { id: '16:9' as const, label: '16:9', desc: 'YouTube' },
                    { id: '1:1' as const, label: '1:1', desc: 'Square' },
                  ].map(ar => (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => setNewAspectRatio(ar.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                        newAspectRatio === ar.id
                          ? 'border-[#FFC800] bg-neutral-800 text-[#FFC800]'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                      }`}
                    >
                      <span className="font-bold text-xs">{ar.label}</span>
                      <span className="text-[9px] text-neutral-500">{ar.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-medium hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="flex-1 py-2 rounded-xl bg-[#FFC800] text-neutral-950 text-xs font-bold hover:bg-[#FFD733] disabled:opacity-40"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
