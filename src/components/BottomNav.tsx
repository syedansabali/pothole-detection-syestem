import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  hazardCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  hazardCount = 3,
}) => {
  const navItems: { id: TabType; label: string; icon: string; badge?: number }[] = [
    { id: 'live', label: 'Live', icon: 'dashboard' },
    { id: 'hazards', label: 'Hazards', icon: 'warning', badge: hazardCount },
    { id: 'vision', label: 'Vision', icon: 'visibility' },
    { id: 'history', label: 'Reports', icon: 'description' },
    { id: 'status', label: 'Analytics', icon: 'insights' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#141619]/95 backdrop-blur-lg border-t border-[#414754] flex justify-around items-center h-16 sm:h-18 px-3 py-1 shadow-2xl">
      <div className="flex justify-around items-center w-full max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer relative py-1 px-3 sm:px-5 rounded-full ${
                isActive
                  ? 'bg-[#fd8b00] text-[#4d2600] font-bold shadow-md'
                  : 'text-[#8b90a0] hover:text-[#adc7ff] hover:bg-[#333538]/50'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] sm:text-[24px] ${
                  isActive ? 'text-[#4d2600]' : 'text-inherit'
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold leading-tight ${
                  isActive ? 'text-[#4d2600] font-bold' : 'text-inherit'
                }`}
              >
                {item.label}
              </span>
              {item.badge && !isActive && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-[#ffb4ab] rounded-full animate-ping"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};