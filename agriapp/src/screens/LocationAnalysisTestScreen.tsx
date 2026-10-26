import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>GPS Location Diagnostics</Text>
          <Text style={styles.headerSubtitle}>Hardware Latitude & Longitude Analysis</Text>
        </View>
        <TouchableOpacity
          onPress={runGpsDiagnostics}
          style={styles.refreshBtn}
          disabled={loading}
          activeOpacity={0.7}
        >
          <RotateCcw size={16} color="#15803D" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator size="small" color="#15803D" />
            <Text style={styles.loadingText}>Reading physical GPS hardware coordinates...</Text>
          </View>
        )}

        {/* Error Alert */}
        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* 1. Hardware Coordinates Card */}
        {coords && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Navigation size={18} color="#15803D" />
              <Text style={styles.cardTitle}>Device Hardware Coordinates</Text>
              <View style={styles.liveTag}>
                <Radio size={10} color="#15803D" />
                <Text style={styles.liveTagText}>LIVE FIX</Text>
              </View>
            </View>

            <View style={styles.coordRow}>
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>LATITUDE</Text>
                <Text style={styles.coordValue}>{coords.latitude.toFixed(6)}°</Text>
                <Text style={styles.coordSub}>{coords.latitude >= 0 ? 'North' : 'South'}</Text>
              </View>

              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>LONGITUDE</Text>
                <Text style={styles.coordValue}>{coords.longitude.toFixed(6)}°</Text>
                <Text style={styles.coordSub}>{coords.longitude >= 0 ? 'East' : 'West'}</Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Accuracy</Text>
                <Text style={styles.metricVal}>
                  {coords.accuracy ? `±${coords.accuracy.toFixed(1)} m` : 'N/A'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Altitude</Text>
                <Text style={styles.metricVal}>
                  {coords.altitude ? `${coords.altitude.toFixed(1)} m` : 'N/A'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Speed</Text>
                <Text style={styles.metricVal}>
                  {coords.speed ? `${coords.speed.toFixed(1)} m/s` : '0 m/s'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 2. Reverse Geocoding Results */}
        {(expoAddress || osmAddress) && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MapPin size={18} color="#15803D" />
              <Text style={styles.cardTitle}>Reverse Geocoding Breakdown</Text>
            </View>

            {osmAddress?.display_name && (
              <View style={styles.fullAddressBox}>
                <Text style={styles.fullAddressLabel}>Resolved Physical Address:</Text>
                <Text style={styles.fullAddressText}>{osmAddress.display_name}</Text>
              </View>
            )}

            <View style={styles.addressTable}>
              <View style={styles.tableRow}>
                <Text style={styles.tableKey}>Locality / Area</Text>
                <Text style={styles.tableVal}>
                  {expoAddress?.district || osmAddress?.address?.suburb || osmAddress?.address?.neighbourhood || 'N/A'}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableKey}>City / Town</Text>
                <Text style={styles.tableVal}>
                  {expoAddress?.city || osmAddress?.address?.city || osmAddress?.address?.town || 'N/A'}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableKey}>District</Text>
                <Text style={styles.tableVal}>
                  {expoAddress?.subregion || osmAddress?.address?.state_district || osmAddress?.address?.county || 'N/A'}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableKey}>State</Text>
                <Text style={styles.tableVal}>
                  {expoAddress?.region || osmAddress?.address?.state || 'N/A'}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableKey}>Postal Code (PIN)</Text>
                <Text style={styles.tableVal}>
                  {expoAddress?.postalCode || osmAddress?.address?.postcode || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 3. Farm & Vendor Hub Proximity */}
        {hubDistances.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Building size={18} color="#15803D" />
              <Text style={styles.cardTitle}>Vendor Hub Proximity</Text>
            </View>

            {hubDistances.map((hub, idx) => (
              <View key={hub.name} style={[styles.hubRow, idx !== hubDistances.length - 1 && styles.hubRowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hubName}>{hub.name}</Text>
                  <Text style={styles.hubDistance}>{hub.distanceKm.toFixed(2)} km away</Text>
                </View>
                <View style={[styles.statusBadge, hub.isDeliverable ? styles.statusSuccess : styles.statusFailed]}>
                  <Text style={hub.isDeliverable ? styles.statusSuccessText : styles.statusFailedText}>
                    {hub.isDeliverable ? `✓ ${hub.estCharge}` : 'Out of range'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 4. Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={runGpsDiagnostics}
            disabled={loading}
            activeOpacity={0.8}
          >
            <RotateCcw size={16} color="#FFFFFF" />
            <Text style={styles.primaryActionBtnText}>Re-run GPS Test</Text>
          </TouchableOpacity>

          {!!rawJson && (
            <TouchableOpacity
              style={styles.secondaryActionBtn}
              onPress={handleShareResults}
              activeOpacity={0.8}
            >
              <Share2 size={16} color="#15803D" />
              <Text style={styles.secondaryActionBtnText}>Export JSON</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 5. Raw JSON Dump */}
        {!!rawJson && (
          <View style={styles.rawJsonCard}>
            <Text style={styles.rawJsonTitle}>RAW DIAGNOSTIC OUTPUT (JSON):</Text>
            <Text style={styles.rawJsonText}>{rawJson}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  liveTagText: {
    fontSize: 9,
    color: '#15803D',
    fontWeight: '800',
  },
  coordRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  coordBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
  },
  coordLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  coordValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  coordSub: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 10,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  fullAddressBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  fullAddressLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  fullAddressText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 17,
  },
  addressTable: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableKey: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  tableVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  hubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  hubRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  hubName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  hubDistance: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusSuccess: {
    backgroundColor: '#DCFCE7',
  },
  statusSuccessText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
  },
  statusFailed: {
    backgroundColor: '#F1F5F9',
  },
  statusFailedText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803D',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  secondaryActionBtnText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
  },
  rawJsonCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
  },
  rawJsonTitle: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 8,
  },
  rawJsonText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: '#34D399',
    lineHeight: 14,
  },
});

export default LocationAnalysisTestScreen;
