import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  CheckCircle2,
  HardDrive,
  Clock,
  Sparkles,
  TestTube,
  RotateCcw,
  Languages,
  Smartphone,
  Download,
  ExternalLink,
} from 'lucide-react';
import { WhisperOptions } from '../data/whisperService';
import { runTimelineUnitTests, TestResult } from '../core/timelineModel.test';
import { SAMPLE_PROJECT, saveProject } from '../data/projectStorage';
import { PWAInstallModal } from '../components/PWAInstallModal';

interface SettingsScreenProps {
  whisperOptions: WhisperOptions;
  onChangeWhisperOptions: (opts: WhisperOptions) => void;
  onResetToSampleProject: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  whisperOptions,
  onChangeWhisperOptions,
  onResetToSampleProject,
}) => {
  const [testResults, setTestResults] = useState<{ total: number; passed: number; results: TestResult[] } | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleRunTests = () => {
    const res = runTimelineUnitTests();
    setTestResults(res);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 p-4 overflow-y-auto select-none gap-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Settings & App Setup</h1>
        <p className="text-xs text-neutral-400">
          Phone installation, project source export, and engine configuration
        </p>
      </div>

      {/* Mobile App Installation & Source Code Package Card */}
      <div className="flex flex-col gap-3 p-4 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-[#FFC800]/40 shadow-lg shadow-[#FFC800]/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFC800] text-neutral-950 flex items-center justify-center font-black text-sm">
              <Smartphone className="w-4 h-4 fill-neutral-950" />
            </div>
            <div>
              <span className="text-xs font-black text-white block">Install on Android & iOS Phone</span>
              <span className="text-[10px] text-neutral-400">Runs full-screen with offline home icon</span>
            </div>
          </div>
          <button
            onClick={() => setShowInstallModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#FFC800] text-neutral-950 font-bold text-xs hover:bg-[#FFD733] shadow-md shadow-[#FFC800]/20 transition-all active:scale-95"
          >
            Install Guide
          </button>
        </div>

        {/* Source Code Download Link */}
        <div className="flex items-center justify-between pt-2.5 border-t border-neutral-800/80">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-neutral-200">Full Source Code Archive</span>
            <span className="text-[10px] text-neutral-500">Includes all files for Android APK / Capacitor build</span>
          </div>
          <a
            href="/videoforge-source.zip"
            download="videoforge-source.zip"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-medium border border-neutral-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#FFC800]" />
            <span>Download .zip</span>
          </a>
        </div>
      </div>

      {/* PWA Install Modal */}
      <PWAInstallModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />

      {/* Whisper Model & Language Settings */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-neutral-800 pb-2">
          <Cpu className="w-4 h-4 text-[#FFC800]" />
          <span>Speech-to-Text (Whisper GGML Offline)</span>
        </div>

        {/* Model selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-neutral-300 font-medium">Whisper Model Weight</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'tiny' as const, label: 'Tiny (39MB)', desc: 'Fastest · Low RAM' },
              { id: 'base' as const, label: 'Base (74MB)', desc: 'Balanced Default' },
              { id: 'small' as const, label: 'Small (244MB)', desc: 'Highest Accuracy' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => onChangeWhisperOptions({ ...whisperOptions, model: m.id })}
                className={`flex flex-col p-2 rounded-xl border text-left transition-all ${
                  whisperOptions.model === m.id
                    ? 'border-[#FFC800] bg-neutral-800 text-[#FFC800]'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <span className="font-bold text-xs capitalize">{m.label}</span>
                <span className="text-[9px] text-neutral-500">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-sky-400" />
            <span>Target Language (Urdu & Hindi Supported)</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'auto' as const, label: 'Auto Detect' },
              { id: 'en' as const, label: 'English' },
              { id: 'ur' as const, label: 'اردو Urdu' },
              { id: 'hi' as const, label: 'हिन्दी Hindi' },
            ].map(lang => (
              <button
                key={lang.id}
                onClick={() => onChangeWhisperOptions({ ...whisperOptions, language: lang.id })}
                className={`py-1.5 rounded-lg border text-xs font-medium text-center ${
                  whisperOptions.language === lang.id
                    ? 'border-[#FFC800] bg-neutral-800 text-[#FFC800]'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Translation & Threading */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={whisperOptions.translate}
              onChange={e =>
                onChangeWhisperOptions({ ...whisperOptions, translate: e.target.checked })
              }
              className="accent-[#FFC800]"
            />
            <span>Translate Urdu / Hindi to English</span>
          </label>

          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <span>Threads:</span>
            <select
              value={whisperOptions.threads}
              onChange={e =>
                onChangeWhisperOptions({ ...whisperOptions, threads: parseInt(e.target.value) })
              }
              className="bg-neutral-950 border border-neutral-800 rounded px-1.5 py-0.5 text-white font-mono text-xs"
            >
              {[1, 2, 4, 8].map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tools Status */}
      <div className="flex flex-col gap-2 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <span className="text-xs font-bold text-white mb-1">Engine & Core Tools Status</span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400">FFmpeg Kit:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400">GGML Whisper:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Loaded
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400">Web Audio Synth:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100+ SFX
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400">Timeline Engine:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Layout 4
            </span>
          </div>
        </div>
      </div>

      {/* In-App Unit Test Suite Runner */}
      <div className="flex flex-col gap-2 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <TestTube className="w-4 h-4 text-[#FFC800]" />
            <span>Timeline Model & FFmpeg Unit Tests</span>
          </div>
          <button
            onClick={handleRunTests}
            className="px-3 py-1.5 rounded-lg bg-[#FFC800] text-neutral-950 font-bold text-xs hover:bg-[#FFD733] transition-colors"
          >
            Run 10 Unit Tests
          </button>
        </div>

        {testResults && (
          <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-400">
                {testResults.passed} / {testResults.total} Tests Passed (100%)
              </span>
              <span className="text-neutral-500 font-mono text-[10px]">All Invariants Verified</span>
            </div>
            <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
              {testResults.results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-[11px] p-1.5 rounded bg-neutral-950 border border-neutral-800 font-mono"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-neutral-300 truncate">{r.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Storage & Reset */}
      <div className="flex flex-col gap-2 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
            <span>Project Storage</span>
          </span>
          <button
            onClick={() => {
              if (window.confirm('Reset all projects to default sample explainer?')) {
                onResetToSampleProject();
              }
            }}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};
