import { ref, onValue } from 'firebase/database';
import { db } from './firebase';
import { useState, useEffect, useMemo } from 'react';
import { TabType, TelemetryData, HazardItem } from './types';
import { INITIAL_HAZARDS, HYDERABAD_TANDOJAM_ROUTE, RouteCheckpoint } from './mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LiveTelemetryView } from './components/LiveTelemetryView';
import { HazardsView } from './components/HazardsView';
import { VisionFeedView } from './components/VisionFeedView';
import { MaintenanceLogView } from './components/MaintenanceLogView';
import { SystemStatusView } from './components/SystemStatusView';
import { SettingsModal } from './components/SettingsModal';
import { HazardDetailModal } from './components/HazardDetailModal';
import { alertBuzzer } from './utils/Alert';

// Haversine Distance Helper (Meters mein distance nikalne ke liye)
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('live');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [activeCheckpointId, setActiveCheckpointId] = useState<string>('TJ-01');
  const [selectedHazard, setSelectedHazard] = useState<HazardItem | null>(null);

  // LocalStorage persistence taake refresh karne par captured image aur naye hazards barkarar rahein
  const [hazards, setHazards] = useState<HazardItem[]>(() => {
    try {
      const saved = localStorage.getItem('ROAD_HAZARDS_DATA');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load hazards from localStorage', e);
    }
    return INITIAL_HAZARDS;
  });

  // Jab bhi hazards update hon, localStorage mein store ho jayein
  useEffect(() => {
    try {
      localStorage.setItem('ROAD_HAZARDS_DATA', JSON.stringify(hazards));
    } catch (e) {
      console.warn('Failed to save hazards to localStorage', e);
    }
  }, [hazards]);

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speed: 72,
    speedUnit: 'KM/H',
    pitch: 1.8,
    roll: -0.6,
    latitude: 25.418,
    longitude: 68.46,
    heading: 78,
    altitude: 28.0,
    tripSeconds: 4120,
    systemTimeUtc: '14:32:05 PKT',
    isLive: true,
    ultrasonicStatus: 'OK',
    gpsFix: '3D FIX',
    satellites: 14,
    obstacleDetected: false,
  });

  const handleAutoHazardLogged = (data: {
    type: string;
    severity: 'critical' | 'high' | 'medium';
    confidence: number;
    depth: number;
    evidenceImage?: string;
  }) => {
    const targetLat = 25.4302;
    const targetLng = 68.5379;
    const CLUSTER_THRESHOLD_METERS = 15;

    setHazards((prev: HazardItem[]) => {
      const existingIndex = prev.findIndex((h) => {
        const hLat = (h as any).latitude ?? (h as any).lat ?? 0;
        const hLng = (h as any).longitude ?? (h as any).lng ?? 0;
        const dist = getDistanceInMeters(targetLat, targetLng, hLat, hLng);
        return dist <= CLUSTER_THRESHOLD_METERS && h.status !== 'RESOLVED';
      });

      // Duplicate pothole: Count barhayein aur image update karein
      if (existingIndex !== -1) {
        const updated = [...prev];
        const current = updated[existingIndex] as any;
        const currentCount = current.vehiclesAffected ?? current.reportsCount ?? 1;

        updated[existingIndex] = {
          ...current,
          vehiclesAffected: currentCount + 1,
          confidence: Math.min(99, Math.round(((current.confidence ?? 90) + data.confidence) / 2 + 2)),
          evidenceImage: data.evidenceImage || current.evidenceImage,
          thumbnailUrl: data.evidenceImage || current.thumbnailUrl,
          timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date().toISOString(),
        };

        return updated;
      }

      // Naya hazard: Live capture photo ke sath save karein
      const newHazardItem: HazardItem = {
        id: `hazard-${Date.now()}`,
        type: data.type,
        title: data.type,
        severity: (data.severity.charAt(0).toUpperCase() + data.severity.slice(1)) as any,
        confidence: data.confidence,
        distance: 0.0,
        depthEstCm: data.depth,
        impactForceG: Number((1.8 + Math.random() * 0.5).toFixed(2)),
        timestamp: new Date().toISOString(),
        timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latitude: targetLat,
        longitude: targetLng,
        locationName: 'N-120 Mirpurkhas Hwy (Near SAU Tandojam)',
        thumbnailUrl: data.evidenceImage || '',
        evidenceImage: data.evidenceImage || '',
        vehiclesAffected: 1,
        status: 'PENDING' as any,
        unitId: 'ROAD_UNIT_01',
      } as any;

      return [newHazardItem, ...prev];
    });
  };

  const handleUpdateHazardStatus = (id: string | number, newStatus: any) => {
    setHazards((prev: HazardItem[]) =>
      prev.map((h) => (h.id === id ? { ...h, status: newStatus } : h))
    );

    setSelectedHazard((prev: any) =>
      prev && prev.id === id ? { ...prev, status: newStatus } : prev
    );
  };

  const roadHealthScore = useMemo(() => {
    const activeHazards = hazards.filter((h: any) => h.status !== 'RESOLVED');
    const penalty = activeHazards.reduce((acc: number, curr: any) => {
      const weight =
        curr.severity === 'Critical'
          ? 15
          : curr.severity === 'High'
          ? 10
          : curr.severity === 'Medium'
          ? 6
          : 3;
      return acc + weight;
    }, 0);
    return Math.max(12, 100 - penalty);
  }, [hazards]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const pktHours = (now.getUTCHours() + 5) % 24;
      const pktString = `${pktHours.toString().padStart(2, '0')}:${now
        .getUTCMinutes()
        .toString()
        .padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} PKT`;

      setTelemetry((prev: TelemetryData) => {
        if (!isSimulating) {
          return {
            ...prev,
            systemTimeUtc: pktString,
          };
        }

        const speedNoise = (Math.random() - 0.48) * 1.5;
        const newSpeed = Math.min(Math.max(prev.speed + speedNoise, 40), 95);
        const pitchNoise = (Math.random() - 0.5) * 0.2;
        const newPitch = Number((prev.pitch + pitchNoise).toFixed(1));
        const rollNoise = (Math.random() - 0.5) * 0.15;
        const newRoll = Number((prev.roll + rollNoise).toFixed(1));
        const newHeading = (prev.heading + 0.15) % 360;

        const latDrift = (Math.random() - 0.5) * 0.0001;
        const lngDrift = (Math.random() - 0.45) * 0.00015;

        return {
          ...prev,
          tripSeconds: prev.tripSeconds + 1,
          systemTimeUtc: pktString,
          speed: newSpeed,
          pitch: newPitch,
          roll: newRoll,
          heading: newHeading,
          latitude: Number((prev.latitude + latDrift).toFixed(4)),
          longitude: Number((prev.longitude + lngDrift).toFixed(4)),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSimulating]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');

    ws.onopen = () => {
      console.log('Connected to backend server');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'hazard') {
          setHazards((prev: HazardItem[]) => [data.payload, ...prev]);
          return;
        }

        if (!isSimulating) {
          setTelemetry((prev: TelemetryData) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (err) => {
      console.log('WebSocket server offline:', err);
    };

    return () => ws.close();
  }, [isSimulating]);

  useEffect(() => {
    const hazardsRef = ref(db, 'hazards');
    const unsubscribe = onValue(hazardsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const hazardsFromFirebase: HazardItem[] = Object.keys(data).map((key) => {
          const item = data[key];
          return {
            id: key,
            type: item.type || 'POTHOLE',
            title: item.title || 'Road Anomaly',
            severity: item.severity || 'Medium',
            timestamp: item.timestamp || new Date().toISOString(),
            timeDisplay:
              item.timeDisplay ||
              new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            latitude: item.latitude || item.lat || 25.418,
            longitude: item.longitude || item.lng || 68.46,
            locationName: item.locationName || 'Hyderabad - Tando Jam Highway',
            thumbnailUrl: item.thumbnailUrl || '',
            evidenceImage: item.thumbnailUrl || '',
            depthEstCm: item.depthEstCm ?? item.dipCm ?? 12.0,
            vehiclesAffected: item.vehiclesAffected ?? item.reportsCount ?? 1,
            impactForceG: item.impactForceG ?? item.accelPeakG ?? 0.85,
            status: item.status || 'PENDING',
            unitId: item.unitId || 'ROAD_UNIT_01',
          };
        });

        setHazards((prev: HazardItem[]) => {
          const existingIds = new Set(prev.map((h) => h.id));
          const newOnes = hazardsFromFirebase.filter((h) => !existingIds.has(h.id));
          return [...newOnes, ...prev];
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectCheckpoint = (checkpoint: RouteCheckpoint) => {
    setActiveCheckpointId(checkpoint.id);
    setTelemetry((prev: TelemetryData) => ({
      ...prev,
      latitude: checkpoint.latitude,
      longitude: checkpoint.longitude,
      speed: checkpoint.speedLimitKmh - 5,
    }));
  };

const handleUpdateSpeed = (newSpeed: number) => {
    // 80 km/h se upar jane par audio alarm trigger hoga
    if (newSpeed > 80) {
      alertBuzzer.playOverSpeedAlert();
    }
    setTelemetry((prev: TelemetryData) => ({ ...prev, speed: newSpeed }));
  };
  
  const handleToggleSpeedUnit = () => {
    setTelemetry((prev: TelemetryData) => ({
      ...prev,
      speedUnit: prev.speedUnit === 'KM/H' ? 'MPH' : 'KM/H',
      speed:
        prev.speedUnit === 'KM/H'
          ? Math.round(prev.speed * 0.621371)
          : Math.round(prev.speed / 0.621371),
    }));
  };

  const handleDispatchRepair = (id: string) => {
    setHazards((prev: HazardItem[]) =>
      prev.map((h) => (h.id === id ? { ...h, status: 'SCHEDULED' } : h))
    );
  };

  const handleUpdateStatus = (id: string, newStatus: any) => {
    setHazards((prev: HazardItem[]) =>
      prev.map((h) => (h.id === id ? { ...h, status: newStatus } : h))
    );
  };

  const handleResetData = () => {
    localStorage.removeItem('ROAD_HAZARDS_DATA');
    setHazards(INITIAL_HAZARDS);
    const defaultCp = HYDERABAD_TANDOJAM_ROUTE[3];
    setActiveCheckpointId(defaultCp.id);
    setTelemetry((prev: TelemetryData) => ({
      ...prev,
      speed: 72,
      pitch: 1.8,
      roll: -0.6,
      latitude: defaultCp.latitude,
      longitude: defaultCp.longitude,
      tripSeconds: 4120,
    }));
    setIsSettingsOpen(false);
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-[#111316] text-[#1c1b1f] dark:text-[#e2e2e6] min-h-screen flex flex-col font-['Inter',sans-serif] selection:bg-[#4a8eff] selection:text-[#00285b] transition-colors duration-200">
      <Header
        currentTab={currentTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDiagnostics={() => setCurrentTab('status')}
        isSimulating={isSimulating}
        onToggleSimulating={() => setIsSimulating(!isSimulating)}
      />

      <main className="flex-grow flex flex-col w-full px-3 sm:px-6 lg:px-8 py-3.5 max-w-[1920px] mx-auto overflow-x-hidden pb-24 md:pb-28">
        {currentTab === 'live' && (
          <LiveTelemetryView
            telemetry={telemetry}
            onUpdateSpeed={handleUpdateSpeed}
            onNavigateToTab={setCurrentTab}
            onSelectCheckpoint={handleSelectCheckpoint}
            activeCheckpointId={activeCheckpointId}
            hazards={hazards}
            onSelectHazard={(h: HazardItem) => setSelectedHazard(h)}
          />
        )}

        {currentTab === 'hazards' && (
          <HazardsView
            hazards={hazards}
            onDispatchRepair={handleDispatchRepair}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {currentTab === 'vision' && (
          <VisionFeedView onHazardDetected={handleAutoHazardLogged} />
        )}

        {currentTab === 'history' && (
          <MaintenanceLogView
            hazards={hazards}
            onUpdateStatus={handleUpdateStatus}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'status' && <SystemStatusView />}
      </main>

      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        hazardCount={hazards.filter((h: any) => h.status === 'PENDING').length}
      />

      <HazardDetailModal
        isOpen={Boolean(selectedHazard)}
        hazard={selectedHazard}
        onClose={() => setSelectedHazard(null)}
        onUpdateStatus={handleUpdateHazardStatus}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        telemetry={telemetry}
        onToggleSpeedUnit={handleToggleSpeedUnit}
        isSimulating={isSimulating}
        onToggleSimulating={() => setIsSimulating(!isSimulating)}
        onResetData={handleResetData}
      />
    </div>
  );
}