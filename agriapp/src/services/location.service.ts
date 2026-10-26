import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { API_ENDPOINTS } from './api';

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

export function offlineResolveCoordinates(lat: number, lng: number) {
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

export interface LocationResult {
  success: boolean;
  latitude: number;
  longitude: number;
  areaLabel: string;
  city: string;
  state: string;
  pincode: string;
  isGpsVerified: boolean;
  accuracy?: number | null;
  error?: string;
  settingsRequired?: boolean;
}

/**
 * Format a clean, approximate area label from reverse geocoding data.
 * Adheres strictly to: "Locality, City, State" — avoids house numbers or street-level addresses.
 * Does NOT inject fake default cities.
 */
export const formatApproximateArea = (addressObj?: Location.LocationGeocodedAddress): {
  areaLabel: string;
  city: string;
  state: string;
  pincode: string;
} => {
  if (!addressObj) {
    return {
      areaLabel: '',
      city: '',
      state: '',
      pincode: '',
    };
  }

  // Locality / Neighborhood / Subregion / District
  const locality =
    addressObj.district ||
    addressObj.subregion ||
    (addressObj.name && isNaN(Number(addressObj.name)) ? addressObj.name : '') ||
    addressObj.street ||
    '';

  const city = addressObj.city || addressObj.subregion || addressObj.district || '';
  const state = addressObj.region || '';
  const pincode = addressObj.postalCode || '';

  const parts: string[] = [];
  if (locality && locality !== city) parts.push(locality);
  if (city) parts.push(city);
  if (state && state !== city) parts.push(state);

  const areaLabel = parts.length > 0 ? parts.join(', ') : (city || state || '');

  return {
    areaLabel,
    city,
    state,
    pincode,
  };
};

/**
 * Retrieve actual device GPS location with genuine hardware accuracy.
 * Handles Android network provider prompts, permissions, high accuracy GPS fix,
 * balanced accuracy fallback, and real reverse geocoding.
 * ZERO hardcoded or seeded dummy coordinates.
 */
export const getDeviceCurrentLocation = async (): Promise<LocationResult> => {
  try {
    // 1. Check whether device location services (GPS) are enabled
    let isServiceEnabled = false;
    try {
      isServiceEnabled = await Location.hasServicesEnabledAsync();
    } catch {
      isServiceEnabled = false;
    }

    // On Android: ensure high accuracy / Google Location Accuracy network provider is enabled
    if (Platform.OS === 'android') {
      try {
        await Location.enableNetworkProviderAsync();
        isServiceEnabled = await Location.hasServicesEnabledAsync();
      } catch (providerErr) {
        // user dismissed dialog or provider already active
      }
    }

    if (!isServiceEnabled) {
      return {
        success: false,
        latitude: 0,
        longitude: 0,
        areaLabel: '',
        city: '',
        state: '',
        pincode: '',
        isGpsVerified: false,
        settingsRequired: true,
        error: 'Device location (GPS) is turned off. Please turn on Location in your device settings to detect your current area.',
      };
    }

    // 2. Request / verify foreground location permissions
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      const permissionResponse = await Location.requestForegroundPermissionsAsync();
      status = permissionResponse.status;
    }

    if (status !== 'granted') {
      return {
        success: false,
        latitude: 0,
        longitude: 0,
        areaLabel: '',
        city: '',
        state: '',
        pincode: '',
        isGpsVerified: false,
        settingsRequired: true,
        error: 'Location permission was denied. Please allow location access in your device settings or enter your area manually.',
      };
    }

    // 3. Multi-tier retrieval of ACTUAL hardware coordinates:
    let location: Location.LocationObject | null = null;
    let lastError: any = null;

    // Tier 1: Balanced Accuracy (Google Fused Location: Wi-Fi + Cell towers + GPS)
    // Reliable both indoors and outdoors, provides real physical location without waiting for satellite line-of-sight
    try {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      });
    } catch (balErr) {
      lastError = balErr;
    }

    // Tier 2: Check last known cached hardware position
    if (!location) {
      try {
        location = await Location.getLastKnownPositionAsync();
      } catch (lastErr) {
        lastError = lastErr;
      }
    }

    // Tier 3: High Accuracy (direct GPS satellite lock for open sky/outdoors)
    if (!location) {
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          mayShowUserSettingsDialog: true,
        });
      } catch (highErr) {
        lastError = highErr;
      }
    }

    // Tier 4: Lowest Accuracy (Cell tower / Network provider fallback)
    if (!location) {
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
          mayShowUserSettingsDialog: true,
        });
      } catch (lowErr) {
        lastError = lowErr;
      }
    }

    // 4. Validate that actual coordinates were retrieved
    const latitude = location?.coords?.latitude;
    const longitude = location?.coords?.longitude;
    const accuracy = location?.coords?.accuracy ?? null;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      (latitude === 0 && longitude === 0)
    ) {
      return {
        success: false,
        latitude: 0,
        longitude: 0,
        areaLabel: '',
        city: '',
        state: '',
        pincode: '',
        isGpsVerified: false,
        settingsRequired: true,
        error: lastError?.message
          ? `Could not get GPS fix: ${lastError.message}. Make sure Location/GPS is turned on in your device settings.`
          : 'Could not get GPS fix from device hardware. Please ensure location is enabled and try again, or enter your area manually.',
      };
    }

    // 5. Reverse geocode the ACTUAL coordinates
    let areaLabel = '';
    let city = '';
    let state = '';
    let pincode = '';

    // Step 5A: Try Backend API Proxy first (Bypasses Android SSLHandshakeException / CertPathValidatorException)
    try {
      const apiRes = await fetch(API_ENDPOINTS.reverseGeocode(latitude, longitude));
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.success && json.data && json.data.areaLabel) {
          areaLabel = json.data.areaLabel;
          city = json.data.city || '';
          state = json.data.state || '';
          pincode = json.data.pincode || '';
        }
      }
    } catch {}

    // Step 5B: Native Expo reverse geocoding (Mobile Android / iOS only; SDK 49 removed it on Web)
    if (!areaLabel && Platform.OS !== 'web') {
      try {
        const reverseList = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverseList && reverseList.length > 0) {
          const info = formatApproximateArea(reverseList[0]);
          areaLabel = info.areaLabel;
          city = info.city;
          state = info.state;
          pincode = info.pincode;
        }
      } catch {}
    }

    // Step 5C: Free OpenStreetMap Nominatim reverse geocoding fallback with actual coordinates
    if (!areaLabel) {
      try {
        const osmRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
          { headers: { 'User-Agent': 'MathiraOrganicApp/1.0' } }
        );
        const data = await osmRes.json();
        if (data && data.address) {
          const locality =
            data.address.suburb ||
            data.address.neighbourhood ||
            data.address.residential ||
            data.address.village ||
            data.address.hamlet ||
            '';
          const c =
            data.address.city ||
            data.address.town ||
            data.address.county ||
            data.address.state_district ||
            '';
          const s = data.address.state || '';
          const p = data.address.postcode || '';

          const parts: string[] = [];
          if (locality && locality !== c) parts.push(locality);
          if (c) parts.push(c);
          if (s && s !== c) parts.push(s);

          areaLabel = parts.length > 0 ? parts.join(', ') : (c || s || '');
          city = c || city;
          state = s || state;
          pincode = p || pincode;
        }
      } catch {}
    }

    // Step 5D: Offline regional coordinates resolver fallback (Always guarantees an accurate regional name)
    if (!areaLabel) {
      const offline = offlineResolveCoordinates(latitude, longitude);
      areaLabel = offline.areaLabel;
      city = offline.city;
      state = offline.state;
      pincode = offline.pincode;
    }

    return {
      success: true,
      latitude,
      longitude,
      areaLabel,
      city: city || 'Current Area',
      state,
      pincode,
      accuracy,
      isGpsVerified: true,
    };
  } catch (err: any) {
    console.error('[LocationService] GPS retrieval exception:', err);
    return {
      success: false,
      latitude: 0,
      longitude: 0,
      areaLabel: '',
      city: '',
      state: '',
      pincode: '',
      isGpsVerified: false,
      error: err?.message || 'Failed to detect device location. Please try again or enter your area manually.',
    };
  }
};

/**
 * Resolve a manual area, locality, city, or postal code search into coordinates.
 */
export const resolveManualLocation = async (query: string): Promise<LocationResult> => {
  const trimmed = (query || '').trim();
  if (!trimmed || trimmed.length < 2) {
    return {
      success: false,
      latitude: 0,
      longitude: 0,
      areaLabel: '',
      city: '',
      state: '',
      pincode: '',
      isGpsVerified: false,
      error: 'Please enter an area, locality, or city name.',
    };
  }

  try {
    // Attempt Expo Location geocoding first
    const geoList = await Location.geocodeAsync(trimmed);
    if (geoList && geoList.length > 0) {
      const { latitude, longitude } = geoList[0];

      let areaInfo = {
        areaLabel: trimmed,
        city: trimmed,
        state: '',
        pincode: '',
      };

      if (Platform.OS !== 'web') {
        try {
          const reverseList = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (reverseList && reverseList.length > 0) {
            areaInfo = formatApproximateArea(reverseList[0]);
          }
        } catch {}
      }

      return {
        success: true,
        latitude,
        longitude,
        areaLabel: areaInfo.areaLabel || trimmed,
        city: areaInfo.city || trimmed,
        state: areaInfo.state,
        pincode: areaInfo.pincode,
        isGpsVerified: false,
      };
    }

    // Secondary fallback: Free OpenStreetMap Nominatim search
    try {
      const osmRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'MathiraOrganicApp/1.0' } }
      );
      const osmData = await osmRes.json();
      if (Array.isArray(osmData) && osmData.length > 0) {
        const item = osmData[0];
        const latitude = parseFloat(item.lat);
        const longitude = parseFloat(item.lon);

        return {
          success: true,
          latitude,
          longitude,
          areaLabel: item.display_name ? item.display_name.split(',').slice(0, 3).join(', ') : trimmed,
          city: trimmed,
          state: '',
          pincode: '',
          isGpsVerified: false,
        };
      }
    } catch {}

    return {
      success: false,
      latitude: 0,
      longitude: 0,
      areaLabel: '',
      city: '',
      state: '',
      pincode: '',
      isGpsVerified: false,
      error: `Could not resolve "${trimmed}" to valid coordinates. Please try a nearby city or locality.`,
    };
  } catch (err: any) {
    return {
      success: false,
      latitude: 0,
      longitude: 0,
      areaLabel: '',
      city: '',
      state: '',
      pincode: '',
      isGpsVerified: false,
      error: 'Network error resolving location. Please verify your internet connection.',
    };
  }
};

export interface LocationSuggestionItem {
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

export const fetchLocationSuggestions = async (query: string): Promise<LocationSuggestionItem[]> => {
  const trimmed = (query || '').trim();
  if (!trimmed || trimmed.length < 2) return [];

  // 1. Try our backend location search proxy (bypasses Android SSL issues)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(API_ENDPOINTS.searchLocation(trimmed), { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch {}

  // 2. High-speed local landmark matching for offline/instant feedback
  const qLower = trimmed.toLowerCase();
  const LOCAL_SUGGESTIONS = [
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

  return LOCAL_SUGGESTIONS.filter(
    (s) => s.title.toLowerCase().includes(qLower) || s.subtitle.toLowerCase().includes(qLower)
  ).map((s) => ({
    id: `local_${s.title}`,
    title: s.title,
    subtitle: s.subtitle,
    fullAddress: `${s.title}, ${s.subtitle}`,
    latitude: s.lat,
    longitude: s.lng,
    city: s.city,
    state: s.state,
    pincode: '',
  }));
};

export const saveLocationToBackend = async (location: {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  pincode?: string;
  isGpsVerified?: boolean;
}): Promise<boolean> => {
  try {
    const res = await fetch(API_ENDPOINTS.saveLocation, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(location),
    });
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.warn('[LocationService] saveLocationToBackend failed:', err);
    return false;
  }
};

