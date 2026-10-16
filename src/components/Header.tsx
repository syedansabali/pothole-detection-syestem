import React from 'react';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onOpenSettings: () => void;
  onOpenDiagnostics: () => void;
  isSimulating: boolean;
  onToggleSimulating: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenDiagnostics,
  isSimulating,
  onToggleSimulating,
}) => {
  return (
    <header className="sticky top-0 w-full z-50 bg-[#111316]/95 backdrop-blur-md border-b border-[#414754] flex justify-between items-center px-4 md:px-8 h-16 shrink-0 shadow-lg">
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDiagnostics}
          title="IoT Sensors & Diagnostics"
           className="text-[#adc7ff] hover:bg-[#333538] transition-colors active:scale-95 cursor-pointer rounded-full p-2 flex items-center justify-center"
        >
            <span className="material-symbols-outlined text-[24px]">sensors</span>

        </button>
        
        
      </div>

      <div className="font-['Inter'] text-base md:text-xl font-bold text-[#adc7ff] uppercase tracking-widest text-center flex-grow">
        POTHOLE ALERT
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          title="System Settings"
          className="text-[#adc7ff] hover:bg-[#333538] transition-colors active:scale-95 cursor-pointer rounded-full p-2 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[24px]">settings</span>
        </button>
      </div>
    </header>
  );
};
