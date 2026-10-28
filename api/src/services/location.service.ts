export interface ReverseGeocodeResult {
  areaLabel: string;
  city: string;
  state: string;
  pincode: string;
}

export function offlineResolveCoordinates(lat: number, lng: number): ReverseGeocodeResult {
  return {
    areaLabel: `Location (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
    city: '',
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

  // 2. Check locally saved locations for instant matching
  const qLower = trimmed.toLowerCase();
  for (const s of savedLocationsStore) {
    if (s.address.toLowerCase().includes(qLower) || s.city.toLowerCase().includes(qLower)) {
      if (!results.some((r) => r.fullAddress.toLowerCase() === s.address.toLowerCase())) {
        results.push({
          id: s.id,
          title: s.city || s.address.split(',')[0],
          subtitle: s.address,
          fullAddress: s.address,
          latitude: s.latitude,
          longitude: s.longitude,
          city: s.city,
          state: '',
          pincode: s.pincode,
        });
      }
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

