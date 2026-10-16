import { reverseGeocode } from '../utils/geocode';
import React, { useState, useEffect } from 'react';
import { HazardItem } from '../types';
import { HazardsMap } from './HazardsMap';
import { HazardThumbnailMap } from './HazardThumbnailMap';

const LiveLocationLabel: React.FC<{ lat: number; lng: number; fallback: string }> = ({ lat, lng, fallback }) => {
  const [name, setName] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    reverseGeocode(lat, lng).then((n) => {
      if (!cancelled) setName(n);
    });
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return <>{name}</>;
};

interface HazardsViewProps {
  hazards: HazardItem[];
  onDispatchRepair: (id: string) => void;
  onUpdateStatus?: (id: string, newStatus: 'PENDING' | 'SCHEDULED' | 'RESOLVED' | 'VERIFIED') => void;
}

export const HazardsView: React.FC<HazardsViewProps> = ({
  hazards,
  onDispatchRepair,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'POTHOLES' | 'OBSTACLES'>('ALL');
  const [selectedHazardId, setSelectedHazardId] = useState<string>(hazards[0]?.id || 'ID-7734');
  const [dispatchedMap, setDispatchedMap] = useState<Record<string, boolean>>({});
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  const filteredHazards = hazards.filter((h) => {
    if (filter === 'ALL') return true;
    if (filter === 'POTHOLES') return h.type === 'POTHOLE';
    if (filter === 'OBSTACLES') return h.type === 'DEBRIS' || h.type === 'OBSTACLE' || h.type === 'STANDING_WATER';
    return true;
  });

  const selectedHazard = hazards.find((h) => h.id === selectedHazardId) || hazards[0];

  const handleDispatch = (id: string) => {
    setDispatchedMap((prev) => ({ ...prev, [id]: true }));
    onDispatchRepair(id);
    setShowNotification(`Repair crew dispatched for ${id} (${selectedHazard?.locationName || 'Hazard'})`);
    setTimeout(() => setShowNotification(null), 4000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return { dot: 'bg-[#ffb4ab] animate-ping', text: 'text-[#ffb4ab]' };
      case 'High':
        return { dot: 'bg-[#ffb4ab]', text: 'text-[#ffb4ab]' };
      case 'Medium':
        return { dot: 'bg-[#ffb77d]', text: 'text-[#ffb77d]' };
      default:
        return { dot: 'bg-[#4ae183]', text: 'text-[#4ae183]' };
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[#414754] gap-[1px] rounded-sm overflow-hidden pb-20 md:pb-0 min-h-[calc(100vh-8.5rem)]">
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-20 right-4 z-50 bg-[#00a657] text-[#00210c] px-4 py-2 rounded shadow-xl flex items-center gap-2 font-mono text-xs animate-bounce font-bold">
          <span className="material-symbols-outlined text-base">local_shipping</span>
          {showNotification}
        </div>
      )}

      {/* Left Panel: Live Hazards Feed */}
      <aside className="w-full md:w-80 lg:w-96 bg-[#111316] flex flex-col h-full overflow-hidden shrink-0">
        {/* Feed Header & Filters */}
        <div className="p-4 border-b border-[#414754] bg-[#1a1c1f] shrink-0">
          <h2 className="text-base font-bold mb-2 text-[#ffb4ab] tracking-wider uppercase">
            HAZARD FEED
          </h2>
          <div className="flex gap-1.5 bg-[#1e2023] p-1 rounded border border-[#414754]">
            {(['ALL', 'POTHOLES', 'OBSTACLES'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 py-1 px-2 rounded-sm text-[11px] font-bold tracking-wider uppercase transition-all ${
                  filter === tab
                    ? 'bg-[#4a8eff] text-[#00285b] shadow-sm'
                    : 'text-[#c1c6d7] hover:bg-[#333538]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Alert Banner (Pinned) */}
        <div className="bg-[#fd8b00] text-[#603100] p-3 md:p-4 flex items-center gap-3 shrink-0 border-b border-[#414754]">
          <span className="material-symbols-outlined text-2xl animate-pulse">warning</span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold tracking-wider uppercase leading-tight">CRITICAL ROAD ADVISORY</p>
            <p className="text-xs md:text-sm font-medium leading-tight truncate">
              Anomalies reported on Hyderabad - Tando Jam N-120 Corridor.
            </p>
          </div>
        </div>

        {/* Feed List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[480px] md:max-h-[calc(100vh-18rem)]">
          {filteredHazards.map((item) => {
            const isSelected = item.id === selectedHazard?.id;
            const badge = getSeverityBadge(item.severity);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedHazardId(item.id)}
                className={`rounded-sm border p-3 transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-[#282a2d] border-[#adc7ff] shadow-md'
                    : 'bg-[#1e2023] border-[#414754] hover:bg-[#333538]'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${badge.dot} shadow-[0_0_8px_rgba(255,180,171,0.5)]`}></div>
                    <span className={`text-[11px] font-bold tracking-wider uppercase ${badge.text}`}>
                      {item.title}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#8b90a0]">
                    {item.timeDisplay}
                  </span>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#adc7ff] truncate mt-0.5" title={item.locationName}>
                      <LiveLocationLabel lat={item.latitude} lng={item.longitude} fallback={item.locationName} />
                    </p>
                    <p className="font-mono text-[11px] text-[#8b90a0] mt-0.5">
                      {item.latitude.toFixed(4)}° N, {item.longitude.toFixed(4)}° E
                    </p>
                  </div>

                  <div className="w-16 h-16 bg-[#333538] rounded-sm border border-[#414754] overflow-hidden shrink-0 relative group-hover:border-[#adc7ff] transition-colors flex items-center justify-center">
                    {item.thumbnailUrl || (item as any).evidenceImage ? (
                      <img
                        src={item.thumbnailUrl || (item as any).evidenceImage}
                        alt="Hazard Evidence"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <HazardThumbnailMap lat={item.latitude} lng={item.longitude} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Center Panel: Telemetry & Detail View (Fluid) */}
      <section className="flex-1 bg-[#111316] flex flex-col overflow-hidden relative min-h-[360px] md:min-h-auto">
        {/* Map Telemetry Area */}
        <div className="flex-1 bg-[#0c0e11] relative overflow-hidden min-h-[300px]">
          <HazardsMap
            hazards={filteredHazards}
            selectedHazardId={selectedHazard?.id}
            onSelectHazard={setSelectedHazardId}
            showHeatmap={showHeatmap}
          />

          {/* Sector Badge */}
          <div className="absolute top-4 left-4 bg-[#0c0e11]/85 backdrop-blur-md border border-[#414754] px-3 py-1.5 rounded text-xs font-mono text-[#adc7ff] flex items-center gap-2 z-[1000] pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-[#4ae183] animate-pulse"></span>
            SECTOR: HYDERABAD ⇄ TANDO JAM (SINDH, PK)
          </div>

          {/* Heatmap Toggle Controls */}
          <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
            <button
              onClick={() => setShowHeatmap((prev) => !prev)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold border backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 shadow-lg ${
                showHeatmap
                  ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border-[#ffb4ab]'
                  : 'bg-[#1a1c1f]/85 text-[#8b90a0] border-[#414754] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {showHeatmap ? 'local_fire_department' : 'layers'}
              </span>
              HEATMAP: {showHeatmap ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Telemetry Details */}
        {selectedHazard && (
          <div className="bg-[#111316] border-t border-[#414754] p-4 shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-3">
              <h3 className="text-sm font-bold text-[#adc7ff] uppercase tracking-wider">
                SELECTED HAZARD: {selectedHazard.type} {selectedHazard.id}
              </h3>
              <span className="text-[11px] font-mono text-[#8b90a0]">
                {selectedHazard.locationName}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-[#1e2023] p-2 rounded border border-[#414754]/50">
                <p className="text-[10px] font-bold text-[#c1c6d7] uppercase tracking-wider">DEPTH EST.</p>
                <p className="font-mono text-xl md:text-2xl font-bold text-[#ffb4ab]">
                  {selectedHazard.depthEstCm !== undefined ? `${selectedHazard.depthEstCm}cm` : 'N/A'}
                </p>
              </div>

              <div className="bg-[#1e2023] p-2 rounded border border-[#414754]/50">
                <p className="text-[10px] font-bold text-[#c1c6d7] uppercase tracking-wider">VEHICLES AFFECTED</p>
                <p className="font-mono text-xl md:text-2xl font-bold text-[#ffb77d]">
                  {selectedHazard.vehiclesAffected !== undefined
                    ? selectedHazard.vehiclesAffected.toString().padStart(2, '0')
                    : '01'}
                </p>
              </div>

              <div className="bg-[#1e2023] p-2 rounded border border-[#414754]/50">
                <p className="text-[10px] font-bold text-[#c1c6d7] uppercase tracking-wider">IMPACT FORCE AVG</p>
                <p className="font-mono text-xl md:text-2xl font-bold text-[#e2e2e6]">
                  {selectedHazard.impactForceG !== undefined ? `${selectedHazard.impactForceG}g` : '1.8g'}
                </p>
              </div>

              <div className="flex flex-col justify-end">
                <p className="text-[10px] font-bold text-[#c1c6d7] uppercase tracking-wider mb-1">STATUS</p>
                {dispatchedMap[selectedHazard.id] || selectedHazard.status === 'SCHEDULED' ? (
                  <div className="w-full bg-[#00a657]/20 text-[#4ae183] border border-[#00a657] py-1.5 px-2 rounded-sm text-[11px] font-bold text-center uppercase tracking-wider flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    CREW ASSIGNED
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleDispatch(selectedHazard.id)}
                      className="flex-1 bg-[#adc7ff]/15 text-[#adc7ff] border border-[#adc7ff] py-1.5 px-2 rounded-sm text-[11px] font-bold hover:bg-[#adc7ff]/30 active:scale-95 transition-all text-center uppercase tracking-wider cursor-pointer shadow-sm whitespace-nowrap"
                    >
                      DISPATCH
                    </button>
                    <button
                      onClick={() => onUpdateStatus && onUpdateStatus(selectedHazard.id, 'VERIFIED')}
                      className="px-2 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-sm text-[11px] font-bold hover:bg-amber-500/30 transition-all cursor-pointer whitespace-nowrap"
                    >
                      VERIFY
                    </button>
                    <button
                      onClick={() => onUpdateStatus && onUpdateStatus(selectedHazard.id, 'RESOLVED')}
                      className="px-2 py-1.5 bg-emerald-500/20 text-[#4ae183] border border-emerald-500/40 rounded-sm text-[11px] font-bold hover:bg-emerald-500/30 transition-all cursor-pointer whitespace-nowrap"
                    >
                      RESOLVE
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};