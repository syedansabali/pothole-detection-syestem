import React, { useState } from 'react';
import { HazardItem } from '../types';
import { exportHazardsToCSV } from '../utils/exportCsv';

interface MaintenanceLogViewProps {
  hazards: HazardItem[];
  onUpdateStatus?: (id: string, newStatus: any) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const MaintenanceLogView: React.FC<MaintenanceLogViewProps> = ({
  hazards,
  onUpdateStatus,
  onNavigateToTab,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Search filter by Title, Location, or ID
  const filteredHazards = hazards.filter((item: any) => {
    const query = searchTerm.toLowerCase();
    const title = (item.title || item.type || '').toLowerCase();
    const loc = (item.locationName || '').toLowerCase();
    const id = String(item.id || '').toLowerCase();
    return title.includes(query) || loc.includes(query) || id.includes(query);
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-950/60 text-[#4ae183] border-emerald-500/50';
      case 'SCHEDULED':
      case 'VERIFIED':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/50';
      default:
        return 'bg-[#22252a] text-[#ffb4ab] border-[#414754]';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Incident Registry
                    </h1>
          <p className="text-sm text-[#8b90a0] mt-1">
            Hyderabad & Tando Jam corridor hazard detection, dispatch, and road repair records.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Working Export Button */}
          <button
            onClick={() => exportHazardsToCSV(filteredHazards, 'Corridor_Hazard_Log')}
            className="px-4 py-2 bg-[#adc7ff] hover:bg-[#cbe0ff] text-[#00285b] rounded text-xs font-mono font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export Report
          </button>

          {/* Quick Route to Hazards Map */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('hazards')}
            className="px-4 py-2 bg-[#1e2023] hover:bg-[#282a2d] border border-[#414754] text-[#e2e2e6] rounded text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">map</span>
            Map View
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#16181c] p-3 rounded border border-[#414754]">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8b90a0] text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Search hazards, road sectors, or IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111316] border border-[#414754] rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8b90a0] focus:outline-none focus:border-[#adc7ff]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#8b90a0]">
          <span className="px-3 py-1.5 bg-[#111316] border border-[#414754] rounded">
            TOTAL: {filteredHazards.length} RECORDED
          </span>
        </div>
      </div>

      {/* Hazard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHazards.map((item: any) => {
          const status = item.status || 'PENDING';
          const formattedDate = item.timestamp
            ? item.timestamp.slice(0, 19).replace('T', ' ')
            : '2026-09-12 14:10';

          return (
            <div
              key={item.id}
              className="bg-[#1a1c1f] border border-[#414754] rounded p-4 flex flex-col justify-between hover:border-[#adc7ff]/60 transition-all group"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ffb4ab] text-lg">
                      warning
                    </span>
                    <span className="font-mono text-xs font-bold text-[#ffb4ab] uppercase tracking-wider">
                      {item.type || item.title || 'POTHOLE_CRITICAL'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#8b90a0]">
                    {formattedDate}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-3">
                  {item.locationName || 'Hyderabad - Tando Jam Highway (N-120)'}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#414754]/50">
                <div className="font-mono text-[11px] text-[#8b90a0]">
                  DETECTED BY <span className="text-white block">{item.unitId || 'ROAD_UNIT_01'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border tracking-wider uppercase ${getStatusClass(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};