import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HazardItem } from '../types';

// Custom Map Marker Pin
const createHazardIcon = (severity: string, isSelected: boolean) => {
  const color =
    severity === 'Critical' ? '#ff5449' : severity === 'High' ? '#ffb4ab' : '#ffb77d';
  const size = isSelected ? 32 : 24;

  return L.divIcon({
    className: 'custom-hazard-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 ${isSelected ? '14px' : '8px'} ${color};
        transform: translate(-50%, -50%);
        transition: all 0.2s ease-in-out;
      ">
        <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

interface HazardsMapProps {
  hazards: HazardItem[];
  selectedHazardId?: string;
  onSelectHazard?: (id: string) => void;
  showHeatmap?: boolean;
}

export const HazardsMap: React.FC<HazardsMapProps> = ({
  hazards,
  selectedHazardId,
  onSelectHazard,
  showHeatmap = true,
}) => {
  // Center: Hyderabad to Tando Jam N-120 Corridor
  const centerPosition: [number, number] = [25.4298, 68.5385];

  return (
    <MapContainer
      center={centerPosition}
      zoom={14}
      scrollWheelZoom={true}
      className="w-full h-full z-0"
      style={{ background: '#111316' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* DYNAMIC HEATMAP LAYER */}
      {showHeatmap &&
        hazards.map((hazard) => {
          const lat = (hazard as any).latitude ?? (hazard as any).lat ?? 0;
          const lng = (hazard as any).longitude ?? (hazard as any).lng ?? 0;
          if (!lat || !lng) return null;

          const isResolved = hazard.status === 'RESOLVED';
          const frequency = (hazard as any).vehiclesAffected ?? 1;

          // Frequency (Clustering) ke hisaab se radius barhega
          const baseRadius = hazard.severity === 'Critical' ? 45 : 30;
          const heatRadius = Math.min(90, baseRadius + frequency * 6);

          const heatColor = isResolved
            ? '#4ae183'
            : hazard.severity === 'Critical'
            ? '#ff3b30'
            : '#ff9500';

          return (
            <React.Fragment key={`heat-${hazard.id}`}>
              {/* Outer faint heat aura */}
              <Circle
                center={[lat, lng]}
                radius={heatRadius * 1.6}
                pathOptions={{
                  fillColor: heatColor,
                  fillOpacity: isResolved ? 0.08 : 0.16,
                  stroke: false,
                }}
              />
              {/* Core intense thermal hotspot */}
              <Circle
                center={[lat, lng]}
                radius={heatRadius}
                pathOptions={{
                  fillColor: heatColor,
                  fillOpacity: isResolved ? 0.2 : 0.45,
                  stroke: false,
                }}
              />
            </React.Fragment>
          );
        })}

      {/* ACCURATE MARKER PINS WITH CAMERA EVIDENCE POPUP */}
      {hazards.map((hazard) => {
        const lat = (hazard as any).latitude ?? (hazard as any).lat ?? 0;
        const lng = (hazard as any).longitude ?? (hazard as any).lng ?? 0;
        if (!lat || !lng) return null;

        const isSelected = hazard.id === selectedHazardId;
        const evidenceImg = (hazard as any).evidenceImage || hazard.thumbnailUrl;

        return (
          <Marker
            key={`marker-${hazard.id}`}
            position={[lat, lng]}
            icon={createHazardIcon(hazard.severity, isSelected)}
            eventHandlers={{
              click: () => onSelectHazard && onSelectHazard(hazard.id),
            }}
          >
            <Popup className="custom-dark-popup">
              <div className="p-1 min-w-[200px] text-[#111316] font-sans">
                {/* Photo Snapshot Evidence in Map Pin */}
                {evidenceImg ? (
                  <div className="w-full h-24 mb-2 rounded overflow-hidden border border-gray-300 relative bg-black">
                    <img
                      src={evidenceImg}
                      alt="Hazard Evidence"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded font-mono">
                    CONF: {(hazard as any).confidence || 96}%                    </div>
                  </div>
                ) : null}

                <div className="font-bold text-xs uppercase text-[#b3261e] mb-0.5">
                  {hazard.type || hazard.title}
                </div>
                <div className="text-[11px] text-gray-700 leading-tight mb-1">
                  {hazard.locationName || 'N-120 Corridor'}
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono border-t pt-1 mt-1 text-gray-600">
                  <span>VEHICLES: {(hazard as any).vehiclesAffected ?? '01'}</span>
                  <span className="font-bold text-[#b3261e]">
                    STATUS: {hazard.status || 'PENDING'}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};