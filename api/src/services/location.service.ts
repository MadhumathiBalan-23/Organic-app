export interface ReverseGeocodeResult {
  areaLabel: string;
  city: string;
  state: string;
  pincode: string;
}

// Major hub coordinates for distance calculations and offline fallback
const REGIONAL_HUBS = [
  { name: 'Bangalore Urban', state: 'Karnataka', lat: 12.9716, lng: 77.5946, radiusKm: 45 },
  { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, radiusKm: 35 },
  { name: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lng: 78.1460, radiusKm: 30 },
  { name: 'Erode', state: 'Tamil Nadu', lat: 11.3410, lng: 77.7172, radiusKm: 25 },
  { name: 'Tirupur', state: 'Tamil Nadu', lat: 11.1085, lng: 77.3411, radiusKm: 25 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, radiusKm: 40 },
  { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198, radiusKm: 30 },
  { name: 'Trichy', state: 'Tamil Nadu', lat: 10.7905, lng: 78.7047, radiusKm: 25 },
  { name: 'Mysore', state: 'Karnataka', lat: 12.2958, lng: 76.6394, radiusKm: 30 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, radiusKm: 45 },
  { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, radiusKm: 30 },
  { name: 'Palakkad', state: 'Kerala', lat: 10.7867, lng: 76.6548, radiusKm: 25 },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function offlineResolveCoordinates(lat: number, lng: number): ReverseGeocodeResult {
  let closestHub: (typeof REGIONAL_HUBS)[0] | null = null;
  let minDistance = Infinity;

  for (const hub of REGIONAL_HUBS) {
    const dist = calculateDistanceKm(lat, lng, hub.lat, hub.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestHub = hub;
    }
  }

  if (closestHub && minDistance <= closestHub.radiusKm) {
    return {
      areaLabel: `${closestHub.name}, ${closestHub.state}`,
      city: closestHub.name,
      state: closestHub.state,
      pincode: '',
    };
  }

  if (closestHub && minDistance <= 120) {
    return {
      areaLabel: `Near ${closestHub.name}, ${closestHub.state}`,
      city: closestHub.name,
      state: closestHub.state,
      pincode: '',
    };
  }

  return {
    areaLabel: `Region (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
    city: 'Local Area',
    state: '',
    pincode: '',
  };
}

export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<ReverseGeocodeResult> {
  // Method 1: OpenStreetMap Nominatim from Node server
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
    const res = await (global as any).fetch(osmUrl, {
      headers: {
        'User-Agent': 'MathiraOrganicFarmingBackend/1.0 (contact@mathira.farm)',
        Accept: 'application/json',
      },
      signal: controller.signal as any,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data: any = await res.json();
      if (data && data.address) {
        const locality =
          data.address.suburb ||
          data.address.neighbourhood ||
          data.address.residential ||
          data.address.village ||
          data.address.hamlet ||
          data.address.road ||
          '';
        const city =
          data.address.city ||
          data.address.town ||
          data.address.county ||
          data.address.state_district ||
          '';
        const state = data.address.state || '';
        const pincode = data.address.postcode || '';

        const parts: string[] = [];
        if (locality && locality !== city) parts.push(locality);
        if (city) parts.push(city);
        if (state && state !== city) parts.push(state);

        const areaLabel = parts.length > 0 ? parts.join(', ') : city || state || '';
        if (areaLabel) {
          return { areaLabel, city: city || 'Local Area', state, pincode };
        }
      }
    }
  } catch (err) {
    // OSM timed out or had network blip; continue to fallback
  }

  // Method 2: BigDataCloud Reverse Geocoding API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await (global as any).fetch(bdcUrl, { signal: controller.signal as any });
    clearTimeout(timeout);

    if (res.ok) {
      const data: any = await res.json();
      if (data) {
        const locality = data.locality || data.principalSubdivisionCode || '';
        const city = data.city || data.locality || '';
        const state = data.principalSubdivision || '';
        const pincode = data.postcode || '';

        const parts: string[] = [];
        if (locality && locality !== city) parts.push(locality);
        if (city) parts.push(city);
        if (state && state !== city) parts.push(state);

        const areaLabel = parts.length > 0 ? parts.join(', ') : city || state || '';
        if (areaLabel) {
          return { areaLabel, city: city || 'Local Area', state, pincode };
        }
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  // Method 3: Deterministic regional coordinate hub resolution
  return offlineResolveCoordinates(lat, lon);
}

export interface LocationSuggestion {
  id: string;
  title: string;
  subtitle: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  pincode: string;
}

export const savedLocationsStore: Array<{
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  pincode: string;
  isGpsVerified: boolean;
  savedAt: string;
}> = [];

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  const trimmed = (query || '').trim();
  if (!trimmed) return [];

  const results: LocationSuggestion[] = [];

  // 1. Live OpenStreetMap Search via Node
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&addressdetails=1&limit=6&countrycodes=in`;
    const res = await (global as any).fetch(url, {
      headers: {
        'User-Agent': 'MathiraOrganicFarmingBackend/1.0 (contact@mathira.farm)',
        Accept: 'application/json',
      },
      signal: controller.signal as any,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data: any[] = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const addr = item.address || {};
          const title = item.name || addr.suburb || addr.town || addr.city || trimmed;
          const city = addr.city || addr.town || addr.county || addr.state_district || '';
          const state = addr.state || '';
          const pincode = addr.postcode || '';

          const subParts: string[] = [];
          if (city && city !== title) subParts.push(city);
          if (state && state !== title) subParts.push(state);
          const subtitle = subParts.length > 0 ? subParts.join(', ') : (addr.country || 'India');

          const fullParts: string[] = [];
          if (title) fullParts.push(title);
          if (city && city !== title) fullParts.push(city);
          if (state && state !== city) fullParts.push(state);
          const fullAddress = fullParts.join(', ');

          results.push({
            id: String(item.osm_id || Math.random()),
            title,
            subtitle,
            fullAddress,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            city: city || title,
            state,
            pincode,
          });
        }
      }
    }
  } catch (err) {
    // network fallback below
  }

  // 2. High-speed local landmark matching for offline/instant feedback
  const qLower = trimmed.toLowerCase();
  const COMMON_LANDMARKS = [
    { title: 'Perundurai', subtitle: 'Erode, Tamil Nadu', lat: 11.2765, lng: 77.5836, city: 'Perundurai', state: 'Tamil Nadu' },
    { title: 'Perundurai Bus Stand', subtitle: 'Erode, Tamil Nadu', lat: 11.2736, lng: 77.5800, city: 'Perundurai', state: 'Tamil Nadu' },
    { title: 'Perundurai Railway Station', subtitle: 'Erode, Tamil Nadu', lat: 11.2539, lng: 77.6288, city: 'Perundurai', state: 'Tamil Nadu' },
    { title: 'Perundurai Municipal Office', subtitle: 'Erode, Tamil Nadu', lat: 11.2740, lng: 77.5815, city: 'Perundurai', state: 'Tamil Nadu' },
    { title: 'Sanitorium', subtitle: 'Perundurai, Tamil Nadu', lat: 11.2710, lng: 77.5790, city: 'Perundurai', state: 'Tamil Nadu' },
    { title: 'Erode Central', subtitle: 'Erode, Tamil Nadu', lat: 11.3410, lng: 77.7172, city: 'Erode', state: 'Tamil Nadu' },
    { title: 'Salem Hub', subtitle: 'Salem, Tamil Nadu', lat: 11.6643, lng: 78.1460, city: 'Salem', state: 'Tamil Nadu' },
    { title: 'Indiranagar', subtitle: 'Bengaluru, Karnataka', lat: 12.9784, lng: 77.6408, city: 'Bengaluru', state: 'Karnataka' },
    { title: 'Koramangala', subtitle: 'Bengaluru, Karnataka', lat: 12.9352, lng: 77.6245, city: 'Bengaluru', state: 'Karnataka' },
    { title: 'Whitefield', subtitle: 'Bengaluru, Karnataka', lat: 12.9698, lng: 77.7500, city: 'Bengaluru', state: 'Karnataka' },
    { title: 'Coimbatore Town', subtitle: 'Coimbatore, Tamil Nadu', lat: 11.0168, lng: 76.9558, city: 'Coimbatore', state: 'Tamil Nadu' },
    { title: 'Tirupur Textile Hub', subtitle: 'Tirupur, Tamil Nadu', lat: 11.1085, lng: 77.3411, city: 'Tirupur', state: 'Tamil Nadu' },
    { title: 'Dharmapuri Central', subtitle: 'Dharmapuri, Tamil Nadu', lat: 12.1211, lng: 78.1582, city: 'Dharmapuri', state: 'Tamil Nadu' },
  ];

  const matched = COMMON_LANDMARKS.filter(
    (m) => m.title.toLowerCase().includes(qLower) || m.subtitle.toLowerCase().includes(qLower)
  );

  for (const m of matched) {
    if (!results.some((r) => r.title.toLowerCase() === m.title.toLowerCase())) {
      results.push({
        id: `local_${m.title}`,
        title: m.title,
        subtitle: m.subtitle,
        fullAddress: `${m.title}, ${m.subtitle}`,
        latitude: m.lat,
        longitude: m.lng,
        city: m.city,
        state: m.state,
        pincode: '',
      });
    }
  }

  return results;
}

export function saveUserLocation(location: {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  pincode?: string;
  isGpsVerified?: boolean;
}) {
  const record = {
    id: `loc_${Date.now()}`,
    address: location.address,
    latitude: location.latitude,
    longitude: location.longitude,
    city: location.city || '',
    pincode: location.pincode || '',
    isGpsVerified: !!location.isGpsVerified,
    savedAt: new Date().toISOString(),
  };
  savedLocationsStore.unshift(record);
  if (savedLocationsStore.length > 50) {
    savedLocationsStore.pop();
  }
  return record;
}

