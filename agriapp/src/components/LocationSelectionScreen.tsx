import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
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
    <View className="flex-1 bg-white relative overflow-hidden">
      {/* Decorative Botanical Leaf Backgrounds */}
      <TopLeftLeaves size={170} />
      <TopRightLeaves size={140} />
      <BottomLandscape width={windowWidth} height={130} />

      {/* Optional Cancel/Close Button for Address Change modal */}
      {isChangingAddress && onCancel && (
        <TouchableOpacity
          onPress={onCancel}
          style={{ top: Math.max(insets.top + 6, 16) }}
          className="absolute right-4 z-20 w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
          activeOpacity={0.7}
        >
          <X size={18} color="#475569" />
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 16, 32),
          paddingBottom: Math.max(insets.bottom + 24, 40),
        }}
        contentContainerClassName="px-5 items-stretch z-10"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Centered Hero Pin Illustration */}
        <View className="items-center justify-center mt-1.5 mb-3">
          <View className="w-[106px] h-[106px] rounded-full bg-emerald-50 border border-emerald-500/20 items-center justify-center">
            <View className="w-[72px] h-[72px] rounded-full bg-white shadow-md items-center justify-center">
              <MapPin size={34} color="#059669" fill="#059669" strokeWidth={1.5} />
            </View>
          </View>
        </View>

        {/* Heading & Subtitle */}
        <View className="items-center mb-5">
          <Text className="text-2xl font-extrabold text-slate-900 text-center tracking-tight">Choose Your Location</Text>
          <Text className="text-xs text-slate-500 text-center mt-1 leading-5 max-w-xs">
            Find fresh organic products and nearby vendors in your area.
          </Text>
        </View>

        {/* Segmented Switch Tabs (Current GPS vs Enter Manually) */}
        <View className="flex-row bg-slate-100 p-1 rounded-xl mb-4">
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg gap-2 ${mode === 'GPS' ? 'bg-white shadow-sm' : ''}`}
            onPress={handleSwitchToGps}
            activeOpacity={0.85}
          >
            <Navigation
              size={15}
              color={mode === 'GPS' ? '#047857' : '#64748B'}
              strokeWidth={2.4}
            />
            <Text
              className={`text-xs font-semibold ${mode === 'GPS' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
            >
              Current GPS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg gap-2 ${mode === 'MANUAL' ? 'bg-white shadow-sm' : ''}`}
            onPress={handleSwitchToManual}
            activeOpacity={0.85}
          >
            <Search
              size={15}
              color={mode === 'MANUAL' ? '#047857' : '#64748B'}
              strokeWidth={2.2}
            />
            <Text
              className={`text-xs font-semibold ${mode === 'MANUAL' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
            >
              Enter Manually
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Alert Banner */}
        {errorMessage && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3.5">
            <View className="flex-row items-start gap-2.5">
              <AlertCircle size={16} color="#DC2626" style={{ marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-xs font-semibold text-red-700 leading-4">{errorMessage}</Text>
                {settingsRequired && (
                  <View className="flex-row items-center gap-2 mt-2">
                    <TouchableOpacity
                      className="flex-row items-center bg-red-600 px-2.5 py-1.5 rounded-lg gap-1"
                      onPress={handleOpenSettings}
                      activeOpacity={0.8}
                    >
                      <Settings size={14} color="#FFFFFF" />
                      <Text className="text-white text-xs font-bold">Open Phone Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center bg-white border border-emerald-700 px-2.5 py-1.5 rounded-lg gap-1"
                      onPress={handleUseCurrentLocation}
                      activeOpacity={0.8}
                    >
                      <RotateCcw size={14} color="#047857" />
                      <Text className="text-emerald-700 text-xs font-bold">Retry GPS</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ─── FLOW A: CURRENT GPS ─── */}
        {mode === 'GPS' && (
          <View className="mb-5">
            {/* State 1: Initial Screen (No address shown, user hasn't clicked yet) */}
            {!selectedArea && !isLocating && (
              <TouchableOpacity
                className="flex-row items-center bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 gap-3.5"
                onPress={handleUseCurrentLocation}
                activeOpacity={0.85}
              >
                <View className="w-12 h-12 rounded-xl bg-white border border-emerald-200 items-center justify-center shadow-sm">
                  <Navigation size={22} color="#059669" strokeWidth={2.4} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">Use Precise GPS Location</Text>
                  <Text className="text-xs text-slate-500 mt-0.5 leading-4">
                    Tap to auto-detect your area and find nearby organic vendors
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* State 2: GPS Detecting */}
            {isLocating && (
              <View className="bg-slate-50 border border-slate-200 rounded-2xl p-6 items-center">
                <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center relative mb-3">
                  <Navigation
                    size={28}
                    color="#059669"
                    strokeWidth={2.4}
                    style={{ transform: [{ rotate: '45deg' }] }}
                  />
                  <ActivityIndicator
                    size="large"
                    color="#059669"
                    className="absolute inset-0"
                  />
                </View>
                <Text className="text-sm font-bold text-slate-900 text-center">Detecting your location...</Text>
                <Text className="text-xs text-slate-500 text-center mt-1">
                  Please allow location access for better service.
                </Text>
              </View>
            )}

            {/* State 3: GPS Address (Address shown after detection) */}
            {selectedArea && !isLocating && (
              <TouchableOpacity
                className="flex-row items-center bg-emerald-50 border-2 border-emerald-600 rounded-2xl p-3.5 gap-3"
                onPress={handleUseCurrentLocation}
                activeOpacity={0.9}
              >
                <View className="w-11 h-11 rounded-xl bg-white border border-emerald-200 items-center justify-center shadow-sm">
                  <MapPin size={22} color="#059669" fill="#059669" strokeWidth={1.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-2xs font-extrabold text-emerald-800 uppercase tracking-wider">YOUR CURRENT AREA</Text>
                  <Text className="text-sm font-bold text-slate-900 mt-0.5 leading-5" numberOfLines={2}>
                    {selectedArea.areaLabel}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ─── FLOW B: MANUAL ENTRY ─── */}
        {mode === 'MANUAL' && (
          <View className="mb-5">
            {/* State 4: Search input box */}
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 mb-2">
              <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                ref={searchInputRef}
                className="flex-1 text-sm font-semibold text-slate-900 py-1"
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
              <View className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-3 shadow-sm">
                {suggestions.map((item, index) => {
                  const isFirst = index === 0;
                  return (
                    <TouchableOpacity
                      key={item.id || `${item.title}_${index}`}
                      className={`flex-row items-center p-3 border-b border-slate-100 gap-3 ${isFirst ? 'bg-emerald-50/60' : ''}`}
                      onPress={() => handleSelectSuggestion(item)}
                      activeOpacity={0.8}
                    >
                      <View className="w-8 h-8 rounded-lg bg-slate-100 items-center justify-center">
                        <MapPin
                          size={18}
                          color={isFirst ? '#059669' : '#64748B'}
                          strokeWidth={2}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`text-sm ${isFirst ? 'text-emerald-800 font-bold' : 'text-slate-900 font-semibold'}`}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        {!!item.subtitle && (
                          <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
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
              <View className="flex-row items-center bg-emerald-50 border-2 border-emerald-600 rounded-2xl p-3.5 gap-3 mt-1">
                <View className="w-11 h-11 rounded-xl bg-white border border-emerald-200 items-center justify-center shadow-sm">
                  <MapPin size={22} color="#059669" fill="#059669" strokeWidth={1.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-2xs font-extrabold text-emerald-800 uppercase tracking-wider">SELECTED AREA</Text>
                  <Text className="text-sm font-bold text-slate-900 mt-0.5 leading-5" numberOfLines={2}>
                    {selectedArea.areaLabel}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity
          className={`flex-row items-center justify-center py-3.5 px-6 rounded-2xl gap-2 shadow-md ${isContinueEnabled ? 'bg-emerald-700' : 'bg-slate-200 shadow-none'}`}
          onPress={handleContinue}
          disabled={!isContinueEnabled}
          activeOpacity={0.88}
        >
          <Text
            className={`text-base ${isContinueEnabled ? 'text-white font-bold' : 'text-slate-400 font-semibold'}`}
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
