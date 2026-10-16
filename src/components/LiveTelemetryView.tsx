import { LiveMap } from './LiveMap';
import React from 'react';
import { TelemetryData, HazardItem } from '../types';
import { HYDERABAD_TANDOJAM_ROUTE, RouteCheckpoint } from '../mockData';
import hyderabadMapAsset from '../assets/images/hyderabad_tandojam_map_1787398809921.jpg';

interface LiveTelemetryViewProps {
  telemetry: TelemetryData;
  onUpdateSpeed?: (newSpeed: number) => void;
  onUpdatePitch?: (pitch: number) => void;
  onUpdateRoll?: (roll: number) => void;
  onNavigateToTab?: (tab: any) => void;
  onSelectCheckpoint?: (checkpoint: RouteCheckpoint) => void;
  activeCheckpointId?: string;
  hazards?: HazardItem[];
  onSelectHazard?: (hazard: HazardItem) => void;
}

export const LiveTelemetryView: React.FC<LiveTelemetryViewProps> = ({
  telemetry,
  onUpdateSpeed,
  onNavigateToTab,
  onSelectCheckpoint,
  activeCheckpointId = 'TJ-01',
  hazards = [],
  onSelectHazard,
}) => {
  // SVG circular gauge calculation: circumference = 2 * PI * 45 ≈ 282.74
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const maxSpeed = 160;
  const normalizedSpeed = Math.min(Math.max(telemetry.speed, 0), maxSpeed);
  // Fill roughly 75% max of the circle for the speedometer arc
  const strokeDashoffset = circumference - (normalizedSpeed / maxSpeed) * (circumference * 0.75);

  const formatTripTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-3 md:gap-4 w-full max-w-[1920px] mx-auto">
      {/* Route & Regional Corridor Selection (Pakistan: Hyderabad & Tando Jam) */}
      <div className="bg-[#181a1d] border border-[#414754] rounded-md p-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#4a8eff]/10 border border-[#4a8eff]/30 flex items-center justify-center text-[#4a8eff] shrink-0">
            <span className="material-symbols-outlined text-[22px]">alt_route</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#adc7ff] uppercase tracking-wider">
                HYDERABAD ⇄ TANDO JAM CORRIDOR
              </span>
              <span className="bg-[#00a657]/20 border border-[#00a657]/40 text-[#4ae183] text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
                SINDH, PAKISTAN
              </span>
            </div>
            <p className="text-xs text-[#8b90a0] mt-0.5">
              N-120 Mirpurkhas Highway & Sindh Agriculture University (SAU) Route
            </p>
          </div>
        </div>

        {/* Checkpoint selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-thin">
          {HYDERABAD_TANDOJAM_ROUTE.map((cp) => {
            const isSelected = activeCheckpointId === cp.id;
            return (
              <button
                key={cp.id}
                onClick={() => onSelectCheckpoint && onSelectCheckpoint(cp)}
                className={`px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#4a8eff] text-[#00285b] font-bold shadow-md ring-1 ring-[#adc7ff]'
                    : 'bg-[#1e2023] text-[#c1c6d7] hover:bg-[#333538] hover:text-white border border-[#414754]'
                }`}
                title={`${cp.name} (${cp.roadName})`}
              >
                {cp.name.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trip Meta Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-2.5 bg-[#181a1d] border border-[#414754] rounded-md gap-2 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4ae183] animate-pulse shadow-[0_0_10px_rgba(74,225,131,0.8)]"></span>
          <span className="font-mono text-xs text-[#e2e2e6] uppercase tracking-wider font-semibold">
            {telemetry.isLive ? 'Active Telemetry Link' : 'Telemetry Paused'}
          </span>
          <span className="text-[#8b90a0] text-xs font-mono hidden sm:inline">|</span>
          <span className="text-xs font-mono text-[#adc7ff] hidden sm:inline">
            ZONE: SINDH-DIST-HYD
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="text-[#adc7ff]">
            TRIP TIME: <span className="text-[#e2e2e6] font-bold">{formatTripTime(telemetry.tripSeconds)}</span>
          </div>
          <div className="text-[#adc7ff]">
            SYS TIME (PKT): <span className="text-[#e2e2e6] font-bold">{telemetry.systemTimeUtc}</span>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
        {/* Speedometer and Orientation (Columns 1-8 on desktop) */}
        <div className="md:col-span-7 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Speedometer Widget */}
          <div className="bg-[#181a1d] flex flex-col items-center justify-center p-6 border border-[#414754] rounded-md relative overflow-hidden min-h-[300px] shadow-md">
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#adc7ff] text-base">speed</span>
              <h2 className="font-['Inter'] text-xs sm:text-sm font-bold text-[#adc7ff] uppercase tracking-wider">
                SPEEDOMETER
              </h2>
            </div>
            
            <div className="relative w-48 h-48 md:w-52 md:h-52 flex items-center justify-center mt-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#282a2d"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
                {/* Progress track */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#4a8eff"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  strokeWidth="8"
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              
              <div className="absolute flex flex-col items-center select-none">
                <span className="font-mono text-5xl md:text-6xl font-bold text-[#e2e2e6] leading-none tracking-tight">
                  {Math.round(telemetry.speed)}
                </span>
                <span className="font-mono text-xs md:text-sm text-[#adc7ff] mt-1 font-semibold tracking-wider">
                  {telemetry.speedUnit}
                </span>
              </div>
            </div>

            {/* Quick interactive throttle adjuster */}
            {onUpdateSpeed && (
              <div className="w-full max-w-[220px] mt-3 flex items-center gap-2 bg-[#1e2023] px-3 py-1.5 rounded border border-[#414754]/50">
                <span className="text-[10px] font-mono text-[#8b90a0]">0</span>
                <input
                  type="range"
                  min="0"
                  max="140"
                  value={telemetry.speed}
                  onChange={(e) => onUpdateSpeed(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#333538] rounded-lg appearance-none cursor-pointer accent-[#4a8eff]"
                />
                <span className="text-[10px] font-mono text-[#8b90a0]">140</span>
              </div>
            )}
          </div>

          {/* Orientation Widget */}
          <div className="bg-[#181a1d] flex flex-col p-6 border border-[#414754] rounded-md relative min-h-[300px] shadow-md justify-between">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#adc7ff] text-base">screen_rotation</span>
              <h2 className="font-['Inter'] text-xs sm:text-sm font-bold text-[#adc7ff] uppercase tracking-wider">
                ORIENTATION & GYRO
              </h2>
            </div>

            <div className="flex-grow flex flex-col justify-center gap-6 my-2">
              {/* Pitch */}
              <div>
                <div className="flex justify-between items-end border-b border-[#414754]/60 pb-2">
                  <span className="text-xs uppercase text-[#c1c6d7] font-semibold tracking-wider">PITCH (ELEVATION)</span>
                  <span className="font-mono text-2xl md:text-3xl font-bold text-[#adc7ff]">
                    {telemetry.pitch >= 0 ? `+${telemetry.pitch.toFixed(1)}°` : `${telemetry.pitch.toFixed(1)}°`}
                  </span>
                </div>
                {/* Visual Horizon Slider */}
                <div className="relative h-2 bg-[#1e2023] border border-[#414754]/40 rounded-full w-full overflow-hidden mt-3">
                  <div
                    className="absolute top-0 h-full bg-[#4a8eff] rounded-full transition-all duration-200"
                    style={{
                      left: '50%',
                      width: '48px',
                      transform: `translateX(calc(-50% + ${telemetry.pitch * 3}px))`
                    }}
                  ></div>
                  <div className="absolute top-0 left-1/2 w-0.5 h-full bg-[#e2e2e6] transform -translate-x-1/2"></div>
                </div>
              </div>

              {/* Roll */}
              <div>
                <div className="flex justify-between items-end border-b border-[#414754]/60 pb-2">
                  <span className="text-xs uppercase text-[#c1c6d7] font-semibold tracking-wider">ROLL (LATERAL TILT)</span>
                  <span className="font-mono text-2xl md:text-3xl font-bold text-[#4ae183]">
                    {telemetry.roll >= 0 ? `+${telemetry.roll.toFixed(1)}°` : `${telemetry.roll.toFixed(1)}°`}
                  </span>
                </div>
                {/* Visual Horizon Slider */}
                <div className="relative h-2 bg-[#1e2023] border border-[#414754]/40 rounded-full w-full overflow-hidden mt-3">
                  <div
                    className="absolute top-0 h-full bg-[#00a657] rounded-full transition-all duration-200"
                    style={{
                      left: '50%',
                      width: '28px',
                      transform: `translateX(calc(-50% + ${telemetry.roll * 4}px))`
                    }}
                  ></div>
                  <div className="absolute top-0 left-1/2 w-0.5 h-full bg-[#e2e2e6] transform -translate-x-1/2"></div>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#8b90a0] flex justify-between items-center pt-2 border-t border-[#414754]/40">
              <span>IMU: MPU-6050</span>
              <span>SAMPLING: 100Hz</span>
            </div>
          </div>
        </div>

        {/* Mini Map & Sensors (Columns 9-12 on desktop) */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-3 md:gap-4">
          {/* Mini Map (real OpenStreetMap) */}
          <div className="bg-[#1e2023] border border-[#414754] rounded-sm relative h-56 md:h-64 overflow-hidden shadow-sm">
            <LiveMap
              latitude={telemetry.latitude}
              longitude={telemetry.longitude}
              onSelectCheckpoint={onSelectCheckpoint}
              hazards={hazards}
              onSelectHazard={onSelectHazard}
            />
          </div>

          {/* Sensor Status */}
          <div className="bg-[#181a1d] border border-[#414754] rounded-md p-4 flex flex-col justify-between shadow-md">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#adc7ff] text-base">hub</span>
                <h2 className="font-['Inter'] text-xs sm:text-sm font-bold text-[#adc7ff] uppercase tracking-wider">
                  SENSOR ARRAY
                </h2>
              </div>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('status')}
                  className="text-xs text-[#4a8eff] hover:text-[#adc7ff] hover:underline font-mono cursor-pointer flex items-center gap-1"
                >
                  Diagnostics →
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {/* Ultrasonic */}
              <div className="flex justify-between items-center p-2.5 bg-[#1e2023] rounded border border-[#414754]/60 hover:border-[#414754] transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#adc7ff] text-base">radar</span>
                  <span className="text-xs text-[#e2e2e6] font-medium">Ultrasonic Proximity</span>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#00a657]/15 text-[#4ae183] border border-[#00a657]/30 font-bold">
                  {telemetry.ultrasonicStatus}
                </span>
              </div>

              {/* GPS Fix */}
              <div className="flex justify-between items-center p-2.5 bg-[#1e2023] rounded border border-[#414754]/60 hover:border-[#414754] transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#adc7ff] text-base">satellite_alt</span>
                  <span className="text-xs text-[#e2e2e6] font-medium">GPS Constellation</span>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#4a8eff]/15 text-[#adc7ff] border border-[#4a8eff]/30 font-bold">
                  {telemetry.gpsFix} ({telemetry.satellites} SVs)
                </span>
              </div>

              {/* Obstacle Warning */}
              <div
                className={`flex justify-between items-center p-2.5 rounded border transition-all ${
                  telemetry.obstacleDetected
                    ? 'bg-[#93000a]/30 border-[#ffb4ab]/60 shadow-[0_0_12px_rgba(255,180,171,0.2)]'
                    : 'bg-[#1e2023] border-[#414754]/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-base ${telemetry.obstacleDetected ? 'text-[#ffb4ab]' : 'text-[#8b90a0]'}`}>
                    warning
                  </span>
                  <span className={`text-xs font-medium ${telemetry.obstacleDetected ? 'text-[#ffb4ab] font-bold' : 'text-[#e2e2e6]'}`}>
                    Road Obstacle
                  </span>
                </div>
                <span
                  className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                    telemetry.obstacleDetected
                      ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/50 animate-pulse'
                      : 'bg-[#00a657]/15 text-[#4ae183] border border-[#00a657]/30'
                  }`}
                >
                  {telemetry.obstacleDetected ? 'DETECTED' : 'CLEAR'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};