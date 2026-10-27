import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Navigation,
  MapPin,
  Compass,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Share2,
  ArrowLeft,
  ShieldCheck,
  Building,
  Radio,
} from 'lucide-react-native';
import * as Location from 'expo-location';

interface HubDistance {
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
  distanceKm: number;
  isDeliverable: boolean;
  estCharge: string;
}

const HUBS = [
  { name: 'Salem Farm Hub, Tamil Nadu', lat: 11.6643, lng: 78.1460, radiusKm: 35 },
  { name: 'Dharmapuri Central Hub, Tamil Nadu', lat: 12.1211, lng: 78.1582, radiusKm: 30 },
  { name: 'Indiranagar Hub, Bengaluru', lat: 12.9784, lng: 77.6408, radiusKm: 25 },
  { name: 'Koramangala Hub, Bengaluru', lat: 12.9352, lng: 77.6245, radiusKm: 25 },
  { name: 'Whitefield Hub, Bengaluru', lat: 12.9698, lng: 77.7500, radiusKm: 20 },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const LocationAnalysisTestScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Diagnostic states
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
    altitude: number | null;
    heading: number | null;
    speed: number | null;
    timestamp: number;
  } | null>(null);

  const [expoAddress, setExpoAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const [osmAddress, setOsmAddress] = useState<any | null>(null);
  const [hubDistances, setHubDistances] = useState<HubDistance[]>([]);
  const [rawJson, setRawJson] = useState<string>('');

  const runGpsDiagnostics = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Service check
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled && Platform.OS === 'android') {
        try {
          await Location.enableNetworkProviderAsync();
        } catch {}
      }

      // 2. Permission check
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const req = await Location.requestForegroundPermissionsAsync();
        status = req.status;
      }

      if (status !== 'granted') {
        throw new Error('Location permission denied. Please enable permission in device settings.');
      }

      // 3. Multi-tier GPS coordinate acquisition
      let loc: Location.LocationObject | null = null;

      // Tier 1: Balanced accuracy (instant, works indoors/outdoors)
      try {
        loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          mayShowUserSettingsDialog: true,
        });
      } catch (e1) {
        // Tier 2: Last known hardware position
        try {
          loc = await Location.getLastKnownPositionAsync();
        } catch (e2) {
          // Tier 3: High accuracy satellite fix
          loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            mayShowUserSettingsDialog: true,
          });
        }
      }

      if (!loc || !loc.coords) {
        throw new Error('Could not acquire location fix from device hardware.');
      }

      const c = loc.coords;
      setCoords({
        latitude: c.latitude,
        longitude: c.longitude,
        accuracy: c.accuracy ?? null,
        altitude: c.altitude ?? null,
        heading: c.heading ?? null,
        speed: c.speed ?? null,
        timestamp: loc.timestamp,
      });

      // 4. Native Expo Reverse Geocoding
      let expoAddr: Location.LocationGeocodedAddress | null = null;
      if (Platform.OS !== 'web') {
        try {
          const reverseList = await Location.reverseGeocodeAsync({
            latitude: c.latitude,
            longitude: c.longitude,
          });
          if (reverseList && reverseList.length > 0) {
            expoAddr = reverseList[0];
            setExpoAddress(expoAddr);
          }
        } catch {}
      }

      // 5. OpenStreetMap Nominatim Reverse Geocoding
      let osmData: any = null;
      try {
        const osmRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${c.latitude}&lon=${c.longitude}&zoom=16&addressdetails=1`,
          { headers: { 'User-Agent': 'MathiraLocationAnalyzer/1.0' } }
        );
        osmData = await osmRes.json();
        setOsmAddress(osmData);
      } catch {}

      // 6. Vendor & Hub Proximity calculations
      const calculatedHubs: HubDistance[] = HUBS.map(hub => {
        const dist = calculateDistance(c.latitude, c.longitude, hub.lat, hub.lng);
        const isDeliverable = dist <= hub.radiusKm;
        const estCharge = isDeliverable ? (dist <= 5 ? 'FREE' : `₹${Math.round(30 + Math.max(0, dist - 15) * 5)}`) : 'Out of range';
        return {
          ...hub,
          distanceKm: dist,
          isDeliverable,
          estCharge,
        };
      }).sort((a, b) => a.distanceKm - b.distanceKm);

      setHubDistances(calculatedHubs);

      // 7. Store Raw JSON
      const fullDiagnosticDump = {
        deviceCoordinates: {
          latitude: c.latitude,
          longitude: c.longitude,
          accuracyMeters: c.accuracy,
          altitudeMeters: c.altitude,
          headingDegrees: c.heading,
          speedMps: c.speed,
          timestamp: new Date(loc.timestamp).toISOString(),
        },
        expoReverseGeocoding: expoAddr,
        openStreetMapReverseGeocoding: osmData?.address || null,
        hubProximityDistances: calculatedHubs,
      };
      setRawJson(JSON.stringify(fullDiagnosticDump, null, 2));

    } catch (err: any) {
      setError(err?.message || 'Error occurred during location diagnostics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runGpsDiagnostics();
  }, []);

  const handleShareResults = async () => {
    if (!rawJson) return;
    try {
      await Share.share({
        title: 'Mathira GPS Location Analysis',
        message: rawJson,
      });
    } catch {}
  };

  return (
    <View
      className="flex-1 bg-slate-50"
      style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16) }}
    >
      {/* Top Header */}
      <View className="flex-row items-center px-5 pb-3 border-b border-slate-200 bg-white gap-3">
        {onBack && (
          <TouchableOpacity onPress={onBack} className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center" activeOpacity={0.7}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Text className="text-[17px] font-extrabold text-slate-900">GPS Location Diagnostics</Text>
          <Text className="text-xs text-slate-500 font-semibold">Hardware Latitude & Longitude Analysis</Text>
        </View>
        <TouchableOpacity
          onPress={runGpsDiagnostics}
          className="w-9 h-9 rounded-full bg-emerald-100 items-center justify-center"
          disabled={loading}
          activeOpacity={0.7}
        >
          <RotateCcw size={16} color="#15803D" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-4" showsVerticalScrollIndicator={false}>
        {/* Loading Indicator */}
        {loading && (
          <View className="flex-row items-center bg-emerald-50 border border-emerald-200 rounded-xl p-3 gap-2.5">
            <ActivityIndicator size="small" color="#15803D" />
            <Text className="text-xs text-emerald-800 font-semibold">Reading physical GPS hardware coordinates...</Text>
          </View>
        )}

        {/* Error Alert */}
        {error && (
          <View className="flex-row items-center bg-rose-50 border border-rose-200 rounded-xl p-3 gap-2.5">
            <AlertCircle size={18} color="#DC2626" />
            <Text className="flex-1 text-xs text-rose-700 font-medium">{error}</Text>
          </View>
        )}

        {/* 1. Hardware Coordinates Card */}
        {coords && (
          <View className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <View className="flex-row items-center gap-2 mb-3.5">
              <Navigation size={18} color="#15803D" />
              <Text className="text-sm font-extrabold text-slate-900">Device Hardware Coordinates</Text>
              <View className="flex-row items-center gap-1 bg-emerald-100 px-1.5 py-0.5 rounded-md ml-auto">
                <Radio size={10} color="#15803D" />
                <Text className="text-2xs text-emerald-700 font-extrabold">LIVE FIX</Text>
              </View>
            </View>

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <Text className="text-2xs text-slate-500 font-bold">LATITUDE</Text>
                <Text className="text-base font-extrabold text-slate-900 my-1 font-mono">{coords.latitude.toFixed(6)}°</Text>
                <Text className="text-xs text-emerald-700 font-semibold">{coords.latitude >= 0 ? 'North' : 'South'}</Text>
              </View>

              <View className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <Text className="text-2xs text-slate-500 font-bold">LONGITUDE</Text>
                <Text className="text-base font-extrabold text-slate-900 my-1 font-mono">{coords.longitude.toFixed(6)}°</Text>
                <Text className="text-xs text-emerald-700 font-semibold">{coords.longitude >= 0 ? 'East' : 'West'}</Text>
              </View>
            </View>

            <View className="flex-row bg-slate-100 rounded-xl p-2.5">
              <View className="flex-1 items-center">
                <Text className="text-2xs text-slate-500 font-semibold">Accuracy</Text>
                <Text className="text-xs font-bold text-slate-900 mt-0.5">
                  {coords.accuracy ? `±${coords.accuracy.toFixed(1)} m` : 'N/A'}
                </Text>
              </View>

              <View className="flex-1 items-center">
                <Text className="text-2xs text-slate-500 font-semibold">Altitude</Text>
                <Text className="text-xs font-bold text-slate-900 mt-0.5">
                  {coords.altitude ? `${coords.altitude.toFixed(1)} m` : 'N/A'}
                </Text>
              </View>

              <View className="flex-1 items-center">
                <Text className="text-2xs text-slate-500 font-semibold">Speed</Text>
                <Text className="text-xs font-bold text-slate-900 mt-0.5">
                  {coords.speed ? `${coords.speed.toFixed(1)} m/s` : '0 m/s'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 2. Reverse Geocoding Results */}
        {(expoAddress || osmAddress) && (
          <View className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <View className="flex-row items-center gap-2 mb-3.5">
              <MapPin size={18} color="#15803D" />
              <Text className="text-sm font-extrabold text-slate-900">Reverse Geocoding Breakdown</Text>
            </View>

            {osmAddress?.display_name && (
              <View className="bg-slate-50 rounded-lg p-2.5 mb-3">
                <Text className="text-2xs text-slate-500 font-bold uppercase">Resolved Physical Address:</Text>
                <Text className="text-xs text-slate-900 font-semibold mt-1 leading-[17px]">{osmAddress.display_name}</Text>
              </View>
            )}

            <View className="border-t border-slate-100">
              <View className="flex-row justify-between py-1.5 border-b border-slate-100">
                <Text className="text-xs text-slate-500 font-medium">Locality / Area</Text>
                <Text className="text-xs text-slate-900 font-bold">
                  {expoAddress?.district || osmAddress?.address?.suburb || osmAddress?.address?.neighbourhood || 'N/A'}
                </Text>
              </View>

              <View className="flex-row justify-between py-1.5 border-b border-slate-100">
                <Text className="text-xs text-slate-500 font-medium">City / Town</Text>
                <Text className="text-xs text-slate-900 font-bold">
                  {expoAddress?.city || osmAddress?.address?.city || osmAddress?.address?.town || 'N/A'}
                </Text>
              </View>

              <View className="flex-row justify-between py-1.5 border-b border-slate-100">
                <Text className="text-xs text-slate-500 font-medium">District</Text>
                <Text className="text-xs text-slate-900 font-bold">
                  {expoAddress?.subregion || osmAddress?.address?.state_district || osmAddress?.address?.county || 'N/A'}
                </Text>
              </View>

              <View className="flex-row justify-between py-1.5 border-b border-slate-100">
                <Text className="text-xs text-slate-500 font-medium">State</Text>
                <Text className="text-xs text-slate-900 font-bold">
                  {expoAddress?.region || osmAddress?.address?.state || 'N/A'}
                </Text>
              </View>

              <View className="flex-row justify-between py-1.5 border-b border-slate-100">
                <Text className="text-xs text-slate-500 font-medium">Postal Code (PIN)</Text>
                <Text className="text-xs text-slate-900 font-bold">
                  {expoAddress?.postalCode || osmAddress?.address?.postcode || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 3. Farm & Vendor Hub Proximity */}
        {hubDistances.length > 0 && (
          <View className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <View className="flex-row items-center gap-2 mb-3.5">
              <Building size={18} color="#15803D" />
              <Text className="text-sm font-extrabold text-slate-900">Vendor Hub Proximity</Text>
            </View>

            {hubDistances.map((hub, idx) => (
              <View
                key={hub.name}
                className={`flex-row items-center justify-between py-2.5 ${idx !== hubDistances.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <View className="flex-1 mr-2">
                  <Text className="text-xs font-bold text-slate-900">{hub.name}</Text>
                  <Text className="text-xs text-slate-500 mt-0.5">{hub.distanceKm.toFixed(2)} km away</Text>
                </View>
                <View className={`px-2 py-1 rounded-md ${hub.isDeliverable ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  <Text className={`text-2xs ${hub.isDeliverable ? 'text-emerald-700 font-bold' : 'text-slate-500 font-semibold'}`}>
                    {hub.isDeliverable ? `✓ ${hub.estCharge}` : 'Out of range'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 4. Action Buttons */}
        <View className="flex-row gap-2.5">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center bg-emerald-700 rounded-xl py-3 gap-2"
            onPress={runGpsDiagnostics}
            disabled={loading}
            activeOpacity={0.8}
          >
            <RotateCcw size={16} color="#FFFFFF" />
            <Text className="text-white text-xs font-bold">Re-run GPS Test</Text>
          </TouchableOpacity>

          {!!rawJson && (
            <TouchableOpacity
              className="flex-row items-center justify-center bg-emerald-100 border border-emerald-300 rounded-xl px-4 py-3 gap-1.5"
              onPress={handleShareResults}
              activeOpacity={0.8}
            >
              <Share2 size={16} color="#15803D" />
              <Text className="text-emerald-700 text-xs font-bold">Export JSON</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 5. Raw JSON Dump */}
        {!!rawJson && (
          <View className="bg-slate-900 rounded-xl p-3">
            <Text className="text-2xs text-slate-400 font-bold mb-2">RAW DIAGNOSTIC OUTPUT (JSON):</Text>
            <Text className="font-mono text-2xs text-emerald-400 leading-3.5">{rawJson}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default LocationAnalysisTestScreen;
