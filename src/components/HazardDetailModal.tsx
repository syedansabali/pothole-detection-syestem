import React from 'react';

export type HazardStatus = 'NEW' | 'VERIFIED' | 'RESOLVED';

export interface HazardData {
  id?: string | number;
  type?: string;
  title?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical' | string;
  status?: HazardStatus; // Naya lifecycle status
  confidence?: number;
  distance?: number;
  depth?: number;
  gForce?: number;
  timestamp?: string;
  location?: {
    lat: number;
    lng: number;
    roadName?: string;
  };
  lat?: number;
  lng?: number;
  [key: string]: any;
}

interface HazardDetailModalProps {
  hazard: HazardData | any;
  isOpen?: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string | number, newStatus: HazardStatus) => void;
}

export const HazardDetailModal: React.FC<HazardDetailModalProps> = ({
  hazard,
  isOpen = true,
  onClose,
  onUpdateStatus,
}) => {
  if (!isOpen || !hazard) return null;

  const currentStatus: HazardStatus = hazard.status || 'NEW';
  const severityStr = String(hazard.severity || 'high').toLowerCase();

  // Status ke hisaab se styling
  const getStatusBadge = (st: HazardStatus) => {
    switch (st) {
      case 'RESOLVED':
        return 'bg-emerald-950/80 text-[#4ae183] border-emerald-500/50';
      case 'VERIFIED':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
      default:
        return 'bg-red-950/80 text-[#ffb4ab] border-red-500/50';
    }
  };

  const latitude = hazard.location?.lat ?? hazard.lat ?? 25.4298;
  const longitude = hazard.location?.lng ?? hazard.lng ?? 68.5385;
  const hazardTitle = hazard.type || hazard.title || 'Pothole Defect';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-[#1a1c1f] border border-[#414754] rounded-lg max-w-lg w-full overflow-hidden shadow-2xl flex flex-col text-[#e2e2e6]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#414754] bg-[#22252a]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#ffb4ab] text-[24px]">
              crisis_alert
            </span>
            <span className="font-['Inter'] font-bold text-base tracking-wide text-white uppercase">
              Hazard Telemetry & Status
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b90a0] hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 font-mono text-xs">
          {/* Status & Lifecycle Banner */}
          <div className="flex items-center justify-between p-3 rounded bg-[#121417] border border-[#414754]/50">
            <div>
              <span className="text-[#8b90a0] text-[10px] uppercase block">Current Lifecycle</span>
              <span className="text-sm font-bold text-white">{hazardTitle}</span>
            </div>
            <span className={`px-3 py-1 rounded text-xs font-bold border tracking-wider ${getStatusBadge(currentStatus)}`}>
              ● {currentStatus}
            </span>
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#121417] p-3 rounded border border-[#414754]/40">
              <span className="text-[#8b90a0] text-[10px] block">CONFIDENCE</span>
              <span className="text-sm font-bold text-white">
                {hazard.confidence ? `${hazard.confidence}%` : '94.2%'}
              </span>
            </div>
            <div className="bg-[#121417] p-3 rounded border border-[#414754]/40">
              <span className="text-[#8b90a0] text-[10px] block">EST. CAVITY DEPTH</span>
              <span className="text-sm font-bold text-[#ffb4ab]">
                {hazard.depth ? `~${hazard.depth}cm` : '~15.2cm'}
              </span>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-[#121417] p-3 rounded border border-[#414754]/40 flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-[#8b90a0]">COORDINATES:</span>
              <span className="text-white font-bold">
                {typeof latitude === 'number' ? latitude.toFixed(5) : latitude},{' '}
                {typeof longitude === 'number' ? longitude.toFixed(5) : longitude}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b90a0]">CORRIDOR:</span>
              <span className="text-[#adc7ff]">
                {hazard.location?.roadName || hazard.roadName || 'Hyderabad ⇄ Tando Jam (N-120)'}
              </span>
            </div>
          </div>

          {/* Admin Workflow Status Actions */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#414754]/40">
            <span className="text-[#8b90a0] text-[10px] uppercase font-bold tracking-wider">
              Governance Action (Change Lifecycle):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateStatus && hazard.id && onUpdateStatus(hazard.id, 'VERIFIED')}
                className={`py-2 px-3 rounded text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  currentStatus === 'VERIFIED'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-[#22252a] text-[#c1c6d7] border-[#414754] hover:bg-[#2c3036]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">verified</span>
                Mark Verified
              </button>

              <button
                onClick={() => onUpdateStatus && hazard.id && onUpdateStatus(hazard.id, 'RESOLVED')}
                className={`py-2 px-3 rounded text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  currentStatus === 'RESOLVED'
                    ? 'bg-emerald-500/20 text-[#4ae183] border-emerald-500'
                    : 'bg-[#22252a] text-[#c1c6d7] border-[#414754] hover:bg-[#2c3036]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Mark Resolved
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#414754] bg-[#22252a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#4a8eff] hover:bg-[#adc7ff] text-[#00285b] font-mono text-xs font-bold rounded transition-colors cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};

export default HazardDetailModal;