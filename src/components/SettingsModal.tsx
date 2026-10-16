import React from 'react';
import { TelemetryData } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryData;
  onToggleSpeedUnit: () => void;
  isSimulating: boolean;
  onToggleSimulating: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  onToggleSpeedUnit,
  isSimulating,
  onToggleSimulating,
  onResetData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0e11]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e2023] border border-[#414754] rounded-sm max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4 border-b border-[#414754] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#adc7ff]">settings</span>
            <h2 className="text-base font-bold text-[#e2e2e6] uppercase tracking-wider">
              System Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#c1c6d7] hover:text-white p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Speed Unit */}
          <div className="flex items-center justify-between p-3 bg-[#1a1c1f] rounded border border-[#414754]">
            <div>
              <p className="font-semibold text-[#e2e2e6]">Speed Unit</p>
              <p className="text-[#8b90a0] text-[11px] mt-0.5">Toggle between Metric & Imperial</p>
            </div>
            <button
              onClick={onToggleSpeedUnit}
              className="bg-[#333538] hover:bg-[#414754] text-[#adc7ff] font-mono font-bold px-3 py-1.5 rounded border border-[#414754] cursor-pointer"
            >
              {telemetry.speedUnit}
            </button>
          </div>

          {/* Drive Simulator */}
          <div className="flex items-center justify-between p-3 bg-[#1a1c1f] rounded border border-[#414754]">
            <div>
              <p className="font-semibold text-[#e2e2e6]">Live Driving Simulation</p>
              <p className="text-[#8b90a0] text-[11px] mt-0.5">
                Automatically fluctuate speed, pitch, and roll
              </p>
            </div>
            <label className="inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSimulating}
                onChange={onToggleSimulating}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-[#333538] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#adc7ff] peer-checked:after:bg-[#00285b]"></div>
            </label>
          </div>

          {/* Device ID Info */}
          <div className="p-3 bg-[#1a1c1f] rounded border border-[#414754] space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-[#8b90a0]">
              <span>NODE ID:</span>
              <span className="text-[#e2e2e6]">SF-IOT-FLEET-4092</span>
            </div>
            <div className="flex justify-between text-[#8b90a0]">
              <span>FIRMWARE:</span>
              <span className="text-[#e2e2e6]">v2.4.1-BUILD-883</span>
            </div>
            <div className="flex justify-between text-[#8b90a0]">
              <span>MQTT BROKER:</span>
              <span className="text-[#4ae183]">CONNECTED (TLS 1.3)</span>
            </div>
          </div>

          {/* Reset Action */}
          <button
            onClick={onResetData}
            className="w-full bg-[#93000a]/20 border border-[#ffb4ab]/40 text-[#ffb4ab] hover:bg-[#93000a]/40 font-bold py-2 rounded text-xs transition-colors cursor-pointer"
          >
            Reset Telemetry & Hazards to Defaults
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-[#adc7ff] text-[#002e68] font-bold py-2.5 rounded text-xs hover:bg-[#d8e2ff] transition-colors cursor-pointer"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};