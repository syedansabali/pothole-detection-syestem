import { HazardItem } from '../types';

export function exportHazardsToCSV(hazards: HazardItem[], filenamePrefix = 'Maintenance_Log_Report') {
  if (!hazards || hazards.length === 0) {
    alert('No hazard records available to export.');
    return;
  }

  const headers = [
    'Hazard ID',
    'Anomaly Type',
    'Severity',
    'Status',
    'Confidence (%)',
    'Est Depth (cm)',
    'Vehicles Affected',
    'Impact Force (g)',
    'Latitude',
    'Longitude',
    'Corridor Location',
    'Detected By Unit',
    'Timestamp',
  ];

  const rows = hazards.map((h: any) => [
    `"${h.id || ''}"`,
    `"${h.type || h.title || 'POTHOLE'}"`,
    `"${h.severity || 'Medium'}"`,
    `"${h.status || 'PENDING'}"`,
    h.confidence ?? 95,
    h.depthEstCm ?? h.depth ?? 15.2,
    h.vehiclesAffected ?? 1,
    h.impactForceG ?? 1.8,
    h.latitude ?? h.lat ?? 25.4302,
    h.longitude ?? h.lng ?? 68.5379,
    `"${h.locationName || 'Hyderabad - Tando Jam Highway (N-120)'}"`,
    `"${h.unitId || 'ROAD_UNIT_01'}"`,
    `"${h.timestamp || new Date().toISOString()}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}