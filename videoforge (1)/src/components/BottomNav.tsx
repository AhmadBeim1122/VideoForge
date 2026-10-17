import React from 'react';
import {
  FolderKanban,
  Download,
  Mic2,
  Film,
  Share2,
  Settings,
} from 'lucide-react';

export type NavTab = 'projects' | 'download' | 'script' | 'editing' | 'export' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'projects' as NavTab, label: 'Projects', icon: FolderKanban },
    { id: 'download' as NavTab, label: 'Download', icon: Download },
    { id: 'script' as NavTab, label: 'Script & Voice', icon: Mic2 },
    { id: 'editing' as NavTab, label: 'Editing', icon: Film },
    { id: 'export' as NavTab, label: 'Export', icon: Share2 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="shrink-0 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/80 px-2 py-1.5 z-40 select-none">
      <div className="grid grid-cols-6 items-center max-w-md mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all min-h-[48px] active:scale-95 ${
                isActive
                  ? 'text-[#FFC800]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-[#FFC800]/15' : ''}`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap truncate max-w-[58px] ${
                isActive ? 'text-[#FFC800] font-semibold' : 'text-neutral-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
