export type TabType = 'live' | 'hazards' | 'vision' | 'history' | 'status';

export interface TelemetryData {
  speed: number;
  speedUnit: 'KM/H' | 'MPH';
  pitch: number;
  roll: number;
  latitude: number;
  longitude: number;
  heading: number;
  altitude: number;
  tripSeconds: number;
  systemTimeUtc: string;
  isLive: boolean;
  ultrasonicStatus: 'OK' | 'WARNING' | 'FAULT';
  gpsFix: string;
  satellites: number;
  obstacleDetected: boolean;
}

export interface HazardItem {
  id: string;
  type: 'POTHOLE' | 'DEBRIS' | 'OBSTACLE' | 'STANDING_WATER' | string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: string;
  timeDisplay: string;
  latitude: number;
  longitude: number;
  locationName: string;
  thumbnailUrl: string;
  depthEstCm?: number;
  vehiclesAffected?: number;
  impactForceG?: number;
  status: 'PENDING' | 'SCHEDULED' | 'RESOLVED';
  unitId: string;
}

export interface VisionDetection {
  id: string;
  label: string;
  confidence: number;
  color: string;
  severity: 'safe' | 'warning' | 'critical';
  bbox: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
}

export interface DeviceDiagnostic {
  name: string;
  status: 'OPTIMAL' | 'NORMAL' | 'WARNING' | 'OFFLINE';
  detail: string;
  metric: string;
  icon: string;
}