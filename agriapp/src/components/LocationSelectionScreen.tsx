import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MapPin,
  Navigation,
  Search,
  AlertCircle,
  X,
  ArrowRight,
  Settings,
  RotateCcw,
} from 'lucide-react-native';
import {
  getDeviceCurrentLocation,
  resolveManualLocation,
  fetchLocationSuggestions,
  saveLocationToBackend,
  LocationResult,
  LocationSuggestionItem,
} from '../services/location.service';
import {
  TopLeftLeaves,
  TopRightLeaves,
  BottomLandscape,
} from './LocationDecorations';

export interface SelectedLocation {
  address: string;
  latitude: number;
  longitude: number;
  isGpsVerified: boolean;
  city: string;
  pincode: string;
  instructions?: string;
}

interface LocationSelectionScreenProps {
  onLocationConfirmed: (location: SelectedLocation) => void;
  initialLocation?: SelectedLocation | null;
  onCancel?: () => void;
  isChangingAddress?: boolean;
}

export const LocationSelectionScreen: React.FC<LocationSelectionScreenProps> = ({
  onLocationConfirmed,
  initialLocation,
  onCancel,
  isChangingAddress = false,
}) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const searchInputRef = useRef<TextInput>(null);
  const searchTimerRef = useRef<any>(null);

  const [mode, setMode] = useState<'GPS' | 'MANUAL'>('GPS');
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [settingsRequired, setSettingsRequired] = useState(false);

  // Selected Area State (GPS or Manual)
  const [selectedArea, setSelectedArea] = useState<LocationResult | null>(() => {
    if (initialLocation && initialLocation.address && !isChangingAddress) {
      return {
        success: true,
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        areaLabel: initialLocation.address,
        city: initialLocation.city || '',
        state: '',
        pincode: initialLocation.pincode || '',
        isGpsVerified: initialLocation.isGpsVerified,
      };
    }
    return null;
  });

  // Manual Search Input State
  const [searchQuery, setSearchQuery] = useState(
    initialLocation && !initialLocation.isGpsVerified && !isChangingAddress ? initialLocation.address : ''
  );
  const [suggestions, setSuggestions] = useState<LocationSuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  // 1. Trigger GPS Location Detection (State 2 -> State 3)
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setErrorMessage(null);
    setSettingsRequired(false);

    try {
      const result = await getDeviceCurrentLocation();
      setIsLocating(false);

      if (result.success) {
        setSelectedArea(result);
      } else {
        setErrorMessage(
          result.error || 'Failed to detect real GPS location. Please turn on Location in settings.'
        );
        setSettingsRequired(!!result.settingsRequired);
      }
    } catch {
      setIsLocating(false);
      setErrorMessage('Location service error. Please try again.');
    }
  };

  // Open native system device settings
  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (e) {
      console.warn('Cannot open device settings:', e);
    }
  };

  // Handle Search Input Text Change with live autocomplete suggestions (State 5)
  const handleSearchTextChange = (text: string) => {
    setSearchQuery(text);
    setErrorMessage(null);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!text.trim() || text.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearchingSuggestions(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await fetchLocationSuggestions(text);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        // quiet fallback
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 220);
  };

  // 2. Select Suggestion from dropdown (State 5 -> State 6)
  const handleSelectSuggestion = (item: LocationSuggestionItem) => {
    setSearchQuery(item.title);
    setShowSuggestions(false);
    setErrorMessage(null);

    setSelectedArea({
      success: true,
      latitude: item.latitude,
      longitude: item.longitude,
      areaLabel: item.fullAddress || `${item.title}, ${item.subtitle}`,
      city: item.city || item.title,
      state: item.state || '',
      pincode: item.pincode || '',
      isGpsVerified: false,
    });
  };

  // 3. Manual Location Resolution if user hits Enter/Search
  const handleManualSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);

    setIsSearchingSuggestions(true);
    setErrorMessage(null);

    try {
      const result = await resolveManualLocation(searchQuery);
      setIsSearchingSuggestions(false);

      if (result.success) {
        setSelectedArea(result);
      } else {
        setErrorMessage(result.error || 'Area could not be found. Please try a nearby locality.');
      }
    } catch {
      setIsSearchingSuggestions(false);
      setErrorMessage('Search error. Please try again.');
    }
  };

  // Switch to Manual Tab (State 4)
  const handleSwitchToManual = () => {
    setMode('MANUAL');
    setErrorMessage(null);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 120);
  };

  // Switch to GPS Tab (State 1 or Trigger State 2)
  const handleSwitchToGps = () => {
    setMode('GPS');
    setErrorMessage(null);
    setShowSuggestions(false);
    // If not already detected, trigger detection on tab tap
    if (!selectedArea || !selectedArea.isGpsVerified) {
      handleUseCurrentLocation();
    }
  };

  // Clear search query
  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (mode === 'MANUAL') {
      setSelectedArea(null);
    }
  };

  // 4. Continue to Login / Application (State 3 or 6 -> Save to API & Proceed)
  const handleContinue = async () => {
    if (!selectedArea) return;

    // Persist properly to backend API
    saveLocationToBackend({
      address: selectedArea.areaLabel,
      latitude: selectedArea.latitude,
      longitude: selectedArea.longitude,
      city: selectedArea.city || '',
      pincode: selectedArea.pincode || '',
      isGpsVerified: selectedArea.isGpsVerified,
    }).catch((err) => console.warn('Location save API error:', err));

    onLocationConfirmed({
      address: selectedArea.areaLabel,
      latitude: selectedArea.latitude,
      longitude: selectedArea.longitude,
      isGpsVerified: selectedArea.isGpsVerified,
      city: selectedArea.city || '',
      pincode: selectedArea.pincode || '',
    });
  };

  // Determine if Continue CTA should be enabled
  const isContinueEnabled = !!selectedArea && !isLocating;

  return (
    <View style={styles.rootContainer}>
      {/* Decorative Botanical Leaf Backgrounds */}
      <TopLeftLeaves size={170} />
      <TopRightLeaves size={140} />
      <BottomLandscape width={windowWidth} height={130} />

      {/* Optional Cancel/Close Button for Address Change modal */}
      {isChangingAddress && onCancel && (
        <TouchableOpacity
          onPress={onCancel}
          style={[styles.closeBtn, { top: Math.max(insets.top + 6, 16) }]}
          activeOpacity={0.7}
        >
          <X size={18} color="#475569" />
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 16, 32),
            paddingBottom: Math.max(insets.bottom + 24, 40),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Centered Hero Pin Illustration */}
        <View style={styles.heroPinWrapper}>
          <View style={styles.pinOuterGlowRing}>
            <View style={styles.pinInnerCircle}>
              <MapPin size={34} color="#059669" fill="#059669" strokeWidth={1.5} />
            </View>
          </View>
        </View>

        {/* Heading & Subtitle */}
        <View style={styles.headerTextGroup}>
          <Text style={styles.mainTitle}>Choose Your Location</Text>
          <Text style={styles.subtitle}>
            Find fresh organic products and nearby vendors in your area.
          </Text>
        </View>

        {/* Segmented Switch Tabs (Current GPS vs Enter Manually) */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            style={[styles.tabButton, mode === 'GPS' && styles.tabButtonActive]}
            onPress={handleSwitchToGps}
            activeOpacity={0.85}
          >
            <Navigation
              size={15}
              color={mode === 'GPS' ? '#047857' : '#64748B'}
              strokeWidth={2.4}
            />
            <Text
              style={[
                styles.tabButtonText,
                mode === 'GPS' && styles.tabButtonTextActive,
              ]}
            >
              Current GPS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, mode === 'MANUAL' && styles.tabButtonActive]}
            onPress={handleSwitchToManual}
            activeOpacity={0.85}
          >
            <Search
              size={15}
              color={mode === 'MANUAL' ? '#047857' : '#64748B'}
              strokeWidth={2.2}
            />
            <Text
              style={[
                styles.tabButtonText,
                mode === 'MANUAL' && styles.tabButtonTextActive,
              ]}
            >
              Enter Manually
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Alert Banner */}
        {errorMessage && (
          <View style={styles.errorAlertCard}>
            <View style={styles.errorRow}>
              <AlertCircle size={16} color="#DC2626" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
                {settingsRequired && (
                  <View style={styles.errorActionsRow}>
                    <TouchableOpacity
                      style={styles.openSettingsBtn}
                      onPress={handleOpenSettings}
                      activeOpacity={0.8}
                    >
                      <Settings size={12} color="#FFFFFF" />
                      <Text style={styles.openSettingsBtnText}>Open Phone Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.retryGpsBtn}
                      onPress={handleUseCurrentLocation}
                      activeOpacity={0.8}
                    >
                      <RotateCcw size={12} color="#047857" />
                      <Text style={styles.retryGpsBtnText}>Retry GPS</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ─── FLOW A: CURRENT GPS ─── */}
        {mode === 'GPS' && (
          <View style={styles.stateContainer}>
            {/* State 1: Initial Screen (No address shown, user hasn't clicked yet) */}
            {!selectedArea && !isLocating && (
              <TouchableOpacity
                style={styles.initialGpsPromptCard}
                onPress={handleUseCurrentLocation}
                activeOpacity={0.85}
              >
                <View style={styles.initialGpsPromptIconBadge}>
                  <Navigation size={22} color="#059669" strokeWidth={2.4} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.initialGpsPromptTitle}>Use Precise GPS Location</Text>
                  <Text style={styles.initialGpsPromptSub}>
                    Tap to auto-detect your area and find nearby organic vendors
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* State 2: GPS Detecting */}
            {isLocating && (
              <View style={styles.detectingContainer}>
                <View style={styles.detectingBadge}>
                  <Navigation
                    size={28}
                    color="#059669"
                    strokeWidth={2.4}
                    style={{ transform: [{ rotate: '45deg' }] }}
                  />
                  <ActivityIndicator
                    size="large"
                    color="#059669"
                    style={StyleSheet.absoluteFill}
                  />
                </View>
                <Text style={styles.detectingTitle}>Detecting your location...</Text>
                <Text style={styles.detectingSubtitle}>
                  Please allow location access for better service.
                </Text>
              </View>
            )}

            {/* State 3: GPS Address (Address shown after detection) */}
            {selectedArea && !isLocating && (
              <TouchableOpacity
                style={styles.currentAreaCard}
                onPress={handleUseCurrentLocation}
                activeOpacity={0.9}
              >
                <View style={styles.currentAreaIconBadge}>
                  <MapPin size={22} color="#059669" fill="#059669" strokeWidth={1.5} />
                </View>
                <View style={styles.currentAreaContent}>
                  <Text style={styles.currentAreaLabel}>YOUR CURRENT AREA</Text>
                  <Text style={styles.currentAreaName} numberOfLines={2}>
                    {selectedArea.areaLabel}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ─── FLOW B: MANUAL ENTRY ─── */}
        {mode === 'MANUAL' && (
          <View style={styles.stateContainer}>
            {/* State 4: Search input box */}
            <View style={styles.searchInputWrapper}>
              <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchTextInput}
                placeholder="Search area, city or pincode"
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={handleSearchTextChange}
                onSubmitEditing={handleManualSearchSubmit}
                returnKeyType="search"
                autoCapitalize="words"
              />
              {isSearchingSuggestions ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : searchQuery.length > 0 ? (
                <TouchableOpacity onPress={handleClearSearch} style={{ padding: 4 }}>
                  <X size={16} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* State 5: Autocomplete Suggestions Dropdown List */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((item, index) => {
                  const isFirst = index === 0;
                  return (
                    <TouchableOpacity
                      key={item.id || `${item.title}_${index}`}
                      style={[styles.suggestionItem, isFirst && styles.suggestionItemActive]}
                      onPress={() => handleSelectSuggestion(item)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.suggestionIconBox}>
                        <MapPin
                          size={18}
                          color={isFirst ? '#059669' : '#64748B'}
                          strokeWidth={2}
                        />
                      </View>
                      <View style={styles.suggestionTextCol}>
                        <Text
                          style={[
                            styles.suggestionTitle,
                            isFirst && styles.suggestionTitleActive,
                          ]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        {!!item.subtitle && (
                          <Text style={styles.suggestionSubtitle} numberOfLines={1}>
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* State 6: Manual Address (Address card shown after selection) */}
            {selectedArea && !showSuggestions && (
              <View style={styles.selectedAreaCard}>
                <View style={styles.currentAreaIconBadge}>
                  <MapPin size={22} color="#059669" fill="#059669" strokeWidth={1.5} />
                </View>
                <View style={styles.currentAreaContent}>
                  <Text style={styles.currentAreaLabel}>SELECTED AREA</Text>
                  <Text style={styles.currentAreaName} numberOfLines={2}>
                    {selectedArea.areaLabel}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Continue Button (Disabled in State 1, 2, 4; Active solid green in State 3, 6) */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isContinueEnabled && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isContinueEnabled}
          activeOpacity={0.88}
        >
          <Text
            style={[
              styles.continueButtonText,
              !isContinueEnabled && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
          <ArrowRight
            size={20}
            color={isContinueEnabled ? '#FFFFFF' : '#94A3B8'}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    right: 18,
    zIndex: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'stretch',
    zIndex: 10,
  },
  heroPinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  pinOuterGlowRing: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: '#E8F8EE',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinInnerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  headerTextGroup: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#EDF7EE',
    borderRadius: 24,
    height: 48,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    gap: 6,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#10B981',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#047857',
    fontWeight: '700',
  },
  stateContainer: {
    minHeight: 110,
    justifyContent: 'center',
  },
  initialGpsPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FCF8',
    borderWidth: 1.5,
    borderColor: '#DCFCE7',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  initialGpsPromptIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialGpsPromptTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
  },
  initialGpsPromptSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  detectingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  detectingBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F8EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  detectingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  detectingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  currentAreaCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#34D399',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedAreaCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#34D399',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  currentAreaIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentAreaContent: {
    flex: 1,
  },
  currentAreaLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.6,
  },
  currentAreaName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 21,
    marginTop: 2,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  suggestionItemActive: {
    backgroundColor: '#ECFDF5',
  },
  suggestionIconBox: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTextCol: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  suggestionTitleActive: {
    color: '#047857',
    fontWeight: '700',
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  errorAlertCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  errorAlertText: {
    fontSize: 12,
    color: '#DC2626',
    lineHeight: 17,
    fontWeight: '500',
  },
  errorActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  openSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  openSettingsBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  retryGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  retryGpsBtnText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: '#047857',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  continueButtonTextDisabled: {
    color: '#94A3B8',
  },
});

export default LocationSelectionScreen;
