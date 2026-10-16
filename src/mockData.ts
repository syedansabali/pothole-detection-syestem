import { HazardItem, DeviceDiagnostic } from './types';

export interface RouteCheckpoint {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  roadName: string;
  speedLimitKmh: number;
}

export const HYDERABAD_TANDOJAM_ROUTE: RouteCheckpoint[] = [
  {
    id: 'HYD-01',
    name: 'Hyderabad City Center (Gari Khata)',
    district: 'Hyderabad, Sindh, Pakistan',
    latitude: 25.3960,
    longitude: 68.3578,
    roadName: 'Autobahn / Station Road',
    speedLimitKmh: 50,
  },
  {
    id: 'HYD-02',
    name: 'Latifabad & Autobahn Junction',
    district: 'Hyderabad, Sindh, Pakistan',
    latitude: 25.3705,
    longitude: 68.3490,
    roadName: 'Autobahn Road, Unit 3 Latifabad',
    speedLimitKmh: 60,
  },
  {
    id: 'HYD-03',
    name: 'Hyderabad Bypass / Isra University',
    district: 'Hyderabad, Sindh, Pakistan',
    latitude: 25.4120,
    longitude: 68.3840,
    roadName: 'Hyderabad - Mirpurkhas Dual Carriageway',
    speedLimitKmh: 80,
  },
  {
    id: 'TJ-01',
    name: 'Rahuki / Tando Jam Toll Plaza',
    district: 'Hyderabad District, Sindh',
    latitude: 25.4180,
    longitude: 68.4600,
    roadName: 'N-120 Mirpurkhas Highway',
    speedLimitKmh: 90,
  },
  {
    id: 'TJ-02',
    name: 'Sindh Agriculture University (SAU)',
    district: 'Tando Jam, Sindh, Pakistan',
    latitude: 25.4290,
    longitude: 68.5350,
    roadName: 'University Main Avenue, Tando Jam',
    speedLimitKmh: 40,
  },
  {
    id: 'TJ-03',
    name: 'Tando Jam Main Bazaar & Station',
    district: 'Tando Jam, Sindh, Pakistan',
    latitude: 25.4320,
    longitude: 68.5410,
    roadName: 'Station Road, Tando Jam',
    speedLimitKmh: 50,
  }
];

export const INITIAL_HAZARDS: HazardItem[] = [
  {
    id: 'TJ-7734',
    type: 'POTHOLE',
    title: 'POTHOLE DETECTED',
    severity: 'High',
    timestamp: '2026-08-22 14:02:11',
    timeDisplay: '14:02:11',
    latitude: 25.4215,
    longitude: 68.4890,
    locationName: 'Hyderabad - Tando Jam Highway (KM 14, near Rahuki)',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwbUSfAmrXZ4xDVzF66P8_9A8ue8ghJCAEuAa0kwEzEf65Y55kQE6D0EHWIm_aMsZb78rIg0LK7d2OhBdxSJaODpBhA6ip7QMP1gdpTO0gPX9Etnfr9LKdDDE01AlAr-J_8ZTnu3JGx82jHBgqvDGyTianSGKD6uah4VGJ6r4u89RDXQbucCqn2UIMkMfuINDNnYZ8_q_W0-Vez-ghQ9eyBtAWLIdSm3Q4cEutGOzS5AqzFQTdLtk',
    depthEstCm: 14,
    vehiclesAffected: 7,
    impactForceG: 4.6,
    status: 'SCHEDULED',
    unitId: '#SD-HYD-04'
  },
  {
    id: 'TJ-8102',
    type: 'DEBRIS',
    title: 'ROAD DEBRIS / GRAVEL',
    severity: 'Medium',
    timestamp: '2026-08-22 13:45:00',
    timeDisplay: '13:45:00',
    latitude: 25.4285,
    longitude: 68.5320,
    locationName: 'Sindh Agriculture University Gate 1, Tando Jam',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBStlY7EiCQn0_RkvF9DTHUaKzt7_FWW-bKiGJfUQA2Ap_Ge3qsr9yj0L679FIvSF9Kev4DQRqCWThss_0Ga7IcDGyB-W50OeVErJ6eg017JVXJWcw8sS-sTO5K1FhnOSYR54Q1IQHWXe7BFk0qC6O9EKorj-7NVlKyhXbeSWoSXxmLB3UhhlsKpDDledGutMw7rj8NC41vHyBUGRowdzZ7i_Pv6MecpdkBiqkhG9-Llh7rCyb0syM',
    depthEstCm: 0,
    vehiclesAffected: 12,
    impactForceG: 1.9,
    status: 'PENDING',
    unitId: '#SD-TJ-01'
  },
  {
    id: 'HYD-9041',
    type: 'POTHOLE',
    title: 'CRITICAL CRATER / CAVITY',
    severity: 'Critical',
    timestamp: '2026-08-22 13:12:44',
    timeDisplay: '13:12:44',
    latitude: 25.3980,
    longitude: 68.3610,
    locationName: 'Autobahn Road near Latifabad Unit 7, Hyderabad',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBptTM9FnE-L9Hgvi2joGCXt_Kv4KmIWDwYpsXN-aJUe0jZ_cctTIJcdFhvIcWJ5ZWXIVxpNSGB4hjX8Kv6Hk8VOLANwkbAEYwtMFBEh-iArUwrlf9aFD8zwMPfelKxaqF5IrPJ7MxIilkwo0LDJI-juO_7TD_NUB7I86omnFZVwiIOkNm5qSMMD9EnlKM8ahC9JNES2pyZEnvZS0aW9eCrRSLOg8Pe_ARG58J-cfgakTTF3OmuMkA',
    depthEstCm: 22,
    vehiclesAffected: 28,
    impactForceG: 5.8,
    status: 'PENDING',
    unitId: '#SD-HYD-02'
  },
  {
    id: 'TJ-6629',
    type: 'STANDING_WATER',
    title: 'CANAL OVERFLOW WATER',
    severity: 'Medium',
    timestamp: '2026-08-22 09:30:15',
    timeDisplay: '09:30:15',
    latitude: 25.4240,
    longitude: 68.5110,
    locationName: 'Rohri Canal Bridge Approach, Tando Jam',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwbUSfAmrXZ4xDVzF66P8_9A8ue8ghJCAEuAa0kwEzEf65Y55kQE6D0EHWIm_aMsZb78rIg0LK7d2OhBdxSJaODpBhA6ip7QMP1gdpTO0gPX9Etnfr9LKdDDE01AlAr-J_8ZTnu3JGx82jHBgqvDGyTianSGKD6uah4VGJ6r4u89RDXQbucCqn2UIMkMfuINDNnYZ8_q_W0-Vez-ghQ9eyBtAWLIdSm3Q4cEutGOzS5AqzFQTdLtk',
    depthEstCm: 11,
    vehiclesAffected: 19,
    impactForceG: 1.4,
    status: 'RESOLVED',
    unitId: '#SD-TJ-03'
  },
  {
    id: 'HYD-5512',
    type: 'POTHOLE',
    title: 'POTHOLE_MINOR',
    severity: 'Low',
    timestamp: '2026-08-22 11:10:00',
    timeDisplay: '11:10:00',
    latitude: 25.4050,
    longitude: 68.3750,
    locationName: 'Qasimabad Bypass Link, Hyderabad',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBStlY7EiCQn0_RkvF9DTHUaKzt7_FWW-bKiGJfUQA2Ap_Ge3qsr9yj0L679FIvSF9Kev4DQRqCWThss_0Ga7IcDGyB-W50OeVErJ6eg017JVXJWcw8sS-sTO5K1FhnOSYR54Q1IQHWXe7BFk0qC6O9EKorj-7NVlKyhXbeSWoSXxmLB3UhhlsKpDDledGutMw7rj8NC41vHyBUGRowdzZ7i_Pv6MecpdkBiqkhG9-Llh7rCyb0syM',
    depthEstCm: 6,
    vehiclesAffected: 4,
    impactForceG: 2.3,
    status: 'SCHEDULED',
    unitId: '#SD-HYD-01'
  }
];

export const INITIAL_DIAGNOSTICS: DeviceDiagnostic[] = [
  {
    name: 'CAN-Bus Controller (MCP2515)',
    status: 'OPTIMAL',
    detail: 'OBD-II / J1939 Vehicle Bus @ 500 kbps (Sindh Fleet Node)',
    metric: '48.2 msg/sec',
    icon: 'cable'
  },
  {
    name: '6-Axis IMU (MPU-6050 / ICM-42688)',
    status: 'OPTIMAL',
    detail: 'Pitch, Roll, Yaw & 3-Axis Accel 100Hz',
    metric: 'Calibrated (0.02° drift)',
    icon: 'screen_rotation'
  },
  {
    name: 'GNSS Receiver (U-Blox NEO-M9N)',
    status: 'OPTIMAL',
    detail: 'GPS / GLONASS / BeiDou (Hyderabad-TandoJam Lock)',
    metric: '14 SVs (HDOP 0.78)',
    icon: 'satellite_alt'
  },
  {
    name: 'Ultrasonic Array (Front/Rear)',
    status: 'OPTIMAL',
    detail: 'Dual-Transducer 40kHz Sonar (0.2m - 4.5m)',
    metric: '2.4m clearance',
    icon: 'radar'
  },
  {
    name: 'Edge AI NPU (Hailo-8 / Orin Nano)',
    status: 'OPTIMAL',
    detail: 'YOLOv8 Road Obstacle & Auto-Rickshaw / Pedestrian Detection',
    metric: '29.8 FPS (42ms Latency)',
    icon: 'memory'
  },
  {
    name: 'Cellular Modem (Jazz / Zong 4G LTE-M)',
    status: 'NORMAL',
    detail: 'MQTT Telemetry Sync to Sindh Urban IoT Server',
    metric: '-62 dBm (4G LTE)',
    icon: 'signal_cellular_alt'
  }
];
