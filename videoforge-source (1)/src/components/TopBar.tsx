import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  Smartphone,
  Maximize2,
  RotateCw,
  Edit2,
  Check,
  Zap,
  RefreshCw,
  Cloud,
} from 'lucide-react';

interface TopBarProps {
  projectName: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRenameProject: (newName: string) => void;
  deviceMode: 'iphone' | 'pixel' | 'fullscreen';
  onToggleDeviceMode: (mode: 'iphone' | 'pixel' | 'fullscreen') => void;
  orientation: 'portrait' | 'landscape';
  onToggleOrientation: () => void;
  onQuickExport: () => void;
  onOpenInstallModal?: () => void;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
}

export const TopBar: React.FC<TopBarProps> = ({
  projectName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRenameProject,
  deviceMode,
  onToggleDeviceMode,
  orientation,
  onToggleOrientation,
  onQuickExport,
  onOpenInstallModal,
  saveStatus = 'saved',
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(projectName);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onRenameProject(nameInput.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="shrink-0 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-3 py-2 z-40 select-none">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Brand Zone */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#FFC800] flex items-center justify-center text-neutral-950 font-black text-sm shadow-md shadow-[#FFC800]/20">
            VF
          </div>
          <span className="text-sm font-black tracking-tight text-white hidden sm:inline">
            Video<span className="text-[#FFC800]">Forge</span>
          </span>
        </div>

        {/* Project Name (Editable) & Autosave Status */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 max-w-[160px] sm:max-w-xs px-2 py-1 bg-neutral-900/60 rounded-lg border border-neutral-800/60">
            {isEditingName ? (
              <div className="flex items-center gap-1 w-full">
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                  className="bg-neutral-800 text-white text-xs px-1.5 py-0.5 rounded outline-none w-full"
                />
                <button
                  onClick={handleSaveName}
                  className="text-emerald-400 p-0.5 hover:text-emerald-300"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setNameInput(projectName);
                  setIsEditingName(true);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-200 hover:text-white truncate text-left w-full group"
                title="Click to rename project"
              >
                <span className="truncate">{projectName}</span>
                <Edit2 className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300 shrink-0" />
              </button>
            )}
          </div>

          {/* Autosave Status Indicator */}
          <div className="hidden sm:flex items-center text-[10px] text-neutral-500 shrink-0">
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-1 text-amber-400 font-mono">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>Saving...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-neutral-400 font-mono" title="Autosaved to JSON storage">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
                <span>Saved</span>
              </span>
            )}
          </div>
        </div>

        {/* Actions Zone */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Undo / Redo */}
          <div className="flex items-center bg-neutral-900/80 rounded-lg border border-neutral-800/80 p-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded text-neutral-300 hover:text-white disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-3.5 bg-neutral-800 my-auto" />
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded text-neutral-300 hover:text-white disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Orientation switch */}
          <button
            onClick={onToggleOrientation}
            className="p-1.5 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border border-neutral-800/80 transition-colors"
            title={`Switch to ${orientation === 'portrait' ? 'Landscape' : 'Portrait'}`}
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Mobile Shell Frame Switcher */}
          <div className="hidden md:flex items-center bg-neutral-900/80 rounded-lg border border-neutral-800/80 p-0.5">
            <button
              onClick={() => onToggleDeviceMode('iphone')}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors flex items-center gap-1 ${
                deviceMode === 'iphone'
                  ? 'bg-neutral-800 text-[#FFC800]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="iPhone Simulator View"
            >
              <Smartphone className="w-3 h-3" />
              <span>iOS</span>
            </button>
            <button
              onClick={() => onToggleDeviceMode('pixel')}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors flex items-center gap-1 ${
                deviceMode === 'pixel'
                  ? 'bg-neutral-800 text-[#FFC800]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Pixel Android Simulator View"
            >
              <Smartphone className="w-3 h-3" />
              <span>Android</span>
            </button>
            <button
              onClick={() => onToggleDeviceMode('fullscreen')}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors flex items-center gap-1 ${
                deviceMode === 'fullscreen'
                  ? 'bg-neutral-800 text-[#FFC800]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Full Studio Canvas"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Full</span>
            </button>
          </div>

          {/* Install / APK / Source Download CTA */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-800/80 font-semibold text-xs active:scale-95 transition-all"
              title="Install on Mobile Phone, Generate APK, or Download Files"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#FFC800]" />
              <span className="hidden sm:inline">Install / APK</span>
            </button>
          )}

          {/* Quick Export CTA */}
          <button
            onClick={onQuickExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFC800] text-neutral-950 hover:bg-[#FFD733] font-bold text-xs shadow-md shadow-[#FFC800]/20 active:scale-95 transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-neutral-950" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
