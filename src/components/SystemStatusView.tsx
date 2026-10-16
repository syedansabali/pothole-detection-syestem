import React, { useMemo } from 'react';
import { HazardItem } from '../types';

interface SystemStatusViewProps {
  hazards?: HazardItem[];
}

export const SystemStatusView: React.FC<SystemStatusViewProps> = ({ hazards = [] }) => {
  // Corridor segments between Hyderabad and Tando Jam
  const segments = useMemo(() => [
    { id: 'S1', name: 'Hyderabad City Center (0-3 km)', baseIri: 2.1, lengthKm: 3 },
    { id: 'S2', name: 'Autobahn to Bypass (3-7 km)', baseIri: 3.4, lengthKm: 4 },
    { id: 'S3', name: 'Bypass / Isra University (7-12 km)', baseIri: 4.8, lengthKm: 5 },
    { id: 'S4', name: 'Rahuki Toll Plaza Zone (12-16 km)', baseIri: 5.6, lengthKm: 4 },
    { id: 'S5', name: 'N-120 Near SAU Tando Jam (16-20 km)', baseIri: 4.2, lengthKm: 4 },
  ], []);

  // Compute live roughness degradation based on detected hazards
  const segmentStats = useMemo(() => {
    return segments.map((seg, idx) => {
      const activeCount = hazards.filter((h: any) => h.status !== 'RESOLVED').length;
      const roughnessIndex = Number((seg.baseIri + (idx === 4 ? activeCount * 0.4 : 0.2)).toFixed(2));
      
      let condition = 'Good';
      let color = 'bg-[#4ae183] text-[#003919]';
      let barColor = '#4ae183';

      if (roughnessIndex > 4.5) {
        condition = 'Poor / Critical';
        color = 'bg-[#ffb4ab] text-[#690005]';
        barColor = '#ff3b30';
      } else if (roughnessIndex > 3.0) {
        condition = 'Fair / Deteriorating';
        color = 'bg-[#ffdcc1] text-[#6a3b00]';
        barColor = '#ff9500';
      }

      return {
        ...seg,
        roughnessIndex,
        condition,
        color,
        barColor,
      };
    });
  }, [segments, hazards]);

  const avgIri = useMemo(() => {
    const sum = segmentStats.reduce((acc, curr) => acc + curr.roughnessIndex, 0);
    return (sum / segmentStats.length).toFixed(2);
  }, [segmentStats]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-5 select-none pb-12">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#16181c] border border-[#414754] p-4 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-mono text-[#8b90a0] uppercase tracking-wider">
            Corridor Avg Roughness (IRI)
          </span>
          <div className="text-3xl font-bold font-mono text-white mt-2">
            {avgIri} <span className="text-sm text-gray-400 font-normal">m/km</span>
          </div>
          <span className="text-[11px] text-amber-400 mt-1">Acceptable Threshold: &lt; 3.5 m/km</span>
        </div>

        <div className="bg-[#16181c] border border-[#414754] p-4 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-mono text-[#8b90a0] uppercase tracking-wider">
            Monitored Highway Length
          </span>
          <div className="text-3xl font-bold font-mono text-[#adc7ff] mt-2">
            20.4 <span className="text-sm text-gray-400 font-normal">KM</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1">N-120 Mirpurkhas Dual Carriageway</span>
        </div>

        <div className="bg-[#16181c] border border-[#414754] p-4 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-mono text-[#8b90a0] uppercase tracking-wider">
            Critical Impact Zones
          </span>
          <div className="text-3xl font-bold font-mono text-[#ffb4ab] mt-2">
            {hazards.filter((h: any) => h.severity === 'Critical' && h.status !== 'RESOLVED').length}
          </div>
          <span className="text-[11px] text-red-400 mt-1">Requiring immediate patch repair</span>
        </div>
      </div>

      {/* Main Roughness Index Visualizer */}
      <div className="bg-[#16181c] border border-[#414754] p-5 rounded-xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-[#414754] pb-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Corridor Roughness Profile (N-120 Hyderabad ⇄ Tando Jam)
            </h2>
            <p className="text-xs text-[#8b90a0]">
              Real-time vibration telemetry & visual depth estimation per sector
            </p>
          </div>
          <span className="text-xs font-mono bg-[#282a2d] px-2.5 py-1 rounded text-[#adc7ff] border border-white/10">
            IRI STANDARD: ASTM E1926
          </span>
        </div>

        {/* Visual Progress Bar Chart */}
        <div className="flex flex-col gap-4 mt-2">
          {segmentStats.map((seg) => {
            const barWidthPercent = Math.min(100, (seg.roughnessIndex / 8.0) * 100);

            return (
              <div key={seg.id} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-200 font-semibold">{seg.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${seg.color}`}>
                      {seg.condition}
                    </span>
                    <span className="text-white font-bold">{seg.roughnessIndex} m/km</span>
                  </div>
                </div>

                <div className="w-full h-3.5 bg-[#22252a] rounded-full overflow-hidden flex border border-[#414754]/50">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${barWidthPercent}%`,
                      backgroundColor: seg.barColor,
                      boxShadow: `0 0 10px ${seg.barColor}55`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 mt-4 pt-3 border-t border-[#414754]/60 text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#4ae183]" />
            <span>Good (&lt; 3.0 m/km)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#ff9500]" />
            <span>Moderate (3.0 - 4.5 m/km)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#ff3b30]" />
            <span>Severely Damaged (&gt; 4.5 m/km)</span>
          </div>
        </div>
      </div>
    </div>
  );
};