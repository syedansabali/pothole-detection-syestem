// Known landmarks on N-120 Corridor
const CORRIDOR_LANDMARKS = [
  { lat: 25.3960, lng: 68.3578, name: 'Hyderabad City Center (Gari Khata)' },
  { lat: 25.3963, lng: 68.3592, name: 'Autobahn Road & Latifabad Junction' },
  { lat: 25.3979, lng: 68.3662, name: 'Sarfaraz Incline, Hyderabad City' },
  { lat: 25.3995, lng: 68.3733, name: 'Anaj Mandi, Hyderabad East' },
  { lat: 25.4120, lng: 68.4320, name: 'Hyderabad Bypass / Isra University' },
  { lat: 25.4285, lng: 68.5250, name: 'Rahuki / Tando Jam Toll Plaza' },
  { lat: 25.4302, lng: 68.5379, name: 'N-120 Mirpurkhas Hwy (Near SAU Tandojam)' },
  { lat: 25.4320, lng: 68.5410, name: 'Sindh Agriculture University Sub-Gate' },
];

function getNearestLandmark(lat: number, lng: number): string {
  let closest = CORRIDOR_LANDMARKS[0].name;
  let minDiff = Infinity;

  for (const item of CORRIDOR_LANDMARKS) {
    const diff = Math.hypot(item.lat - lat, item.lng - lng);
    if (diff < minDiff) {
      minDiff = diff;
      closest = item.name;
    }
  }
  return closest;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const localFallback = getNearestLandmark(lat, lng);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'SmartRoadDashboard/1.0' },
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address;
      if (addr) {
        const road = addr.road || addr.suburb || addr.neighbourhood || addr.city_district;
        const city = addr.city || addr.town || 'Hyderabad';
        if (road) return `${road}, ${city}`;
      }
      if (data.display_name) {
        return data.display_name.split(',').slice(0, 2).join(',');
      }
    }
  } catch (e) {
    // Graceful fallback to precise corridor landmark
  }

  return localFallback;
}

export function getStaticMapThumbnail(lat: number, lng: number): string {
  return '';
}