import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HYDERABAD_TANDOJAM_ROUTE, RouteCheckpoint } from '../mockData';
import { HazardItem } from '../types';

// Fix for default Leaflet marker icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Hazard Pin Icon
const createHazardIcon = (severity: string) => {
  const color = severity === 'Critical' ? '#ff3b30' : severity === 'High' ? '#ff9500' : '#ffcc00';
  return L.divIcon({
    className: 'custom-hazard-pin',
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background-color: ${color};
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 10px ${color};
        transform: translate(-50%, -50%);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

export interface LiveMapProps {
  latitude: number;
  longitude: number;
  onSelectCheckpoint?: (checkpoint: RouteCheckpoint) => void;
  hazards?: HazardItem[];
  onSelectHazard?: (hazard: HazardItem) => void;
}

// Dynamic Map Recenter when vehicle moves
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  latitude,
  longitude,
  onSelectCheckpoint,
  hazards = [],
  onSelectHazard,
}) => {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ background: '#111316' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter lat={latitude} lng={longitude} />

        {/* DYNAMIC HEATMAP LAYER FOR DETECTED HAZARDS */}
        {hazards.map((h: any) => {
          const lat = h.latitude ?? h.lat ?? 0;
          const lng = h.longitude ?? h.lng ?? 0;
          if (!lat || !lng) return null;

          const isResolved = h.status === 'RESOLVED';
          const frequency = h.vehiclesAffected ?? 1;
          const baseRadius = h.severity === 'Critical' ? 40 : 25;
          const heatRadius = Math.min(85, baseRadius + frequency * 5);
          const heatColor = isResolved
            ? '#4ae183'
            : h.severity === 'Critical'
            ? '#ff3b30'
            : '#ff9500';

          return (
            <React.Fragment key={`live-heat-${h.id}`}>
              {/* Outer faint thermal field */}
              <Circle
                center={[lat, lng]}
                radius={heatRadius * 1.5}
                pathOptions={{
                  fillColor: heatColor,
                  fillOpacity: isResolved ? 0.08 : 0.18,
                  stroke: false,
                }}
              />
              {/* Core intense thermal hotspot */}
              <Circle
                center={[lat, lng]}
                radius={heatRadius}
                pathOptions={{
                  fillColor: heatColor,
                  fillOpacity: isResolved ? 0.22 : 0.45,
                  stroke: false,
                }}
              />
            </React.Fragment>
          );
        })}

        {/* Live Vehicle Marker */}
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-xs font-bold text-gray-900">
              🚗 Active Inspection Unit (ROAD_UNIT_01)
            </div>
          </Popup>
        </Marker>

        {/* Route Checkpoints (Corridor Landmarks) */}
        {HYDERABAD_TANDOJAM_ROUTE.map((cp) => (
          <Marker
            key={cp.id}
            position={[cp.latitude, cp.longitude]}
            eventHandlers={{
              click: () => onSelectCheckpoint && onSelectCheckpoint(cp),
            }}
          >
            <Popup>
              <div className="text-xs font-semibold text-gray-900">{cp.name}</div>
            </Popup>
          </Marker>
        ))}

        {/* Hazard Markers with Evidence Snapshot */}
        {hazards.map((h: any) => {
          const lat = h.latitude ?? h.lat ?? 0;
          const lng = h.longitude ?? h.lng ?? 0;
          if (!lat || !lng) return null;

          const evidenceImg = h.evidenceImage || h.thumbnailUrl;

          return (
            <Marker
              key={h.id}
              position={[lat, lng]}
              icon={createHazardIcon(h.severity)}
              eventHandlers={{
                click: () => onSelectHazard && onSelectHazard(h),
              }}
            >
              <Popup>
                <div className="min-w-[190px] text-gray-900 font-sans p-0.5">
                  {evidenceImg && (
                    <div className="w-full h-24 mb-1.5 rounded overflow-hidden border border-gray-300 bg-black">
                      <img
                        src={evidenceImg}
                        alt="Evidence Proof"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="text-[11px] font-bold uppercase text-red-600">
                    {h.type || h.title}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-0.5">
                    {h.locationName || 'N-120 Mirpurkhas Hwy'}
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono border-t pt-1 mt-1 text-gray-500">
                    <span>SEVERITY: {h.severity}</span>
                    <span className="font-bold text-red-700">{h.status || 'PENDING'}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};