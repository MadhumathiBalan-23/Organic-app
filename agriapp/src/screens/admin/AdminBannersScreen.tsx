import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Sparkles,
  Pencil,
  Trash2,
  Upload,
  Camera,
  Check,
  Palette,
  X,
  CheckCircle2,
  ChevronRight,
  Pipette,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { bannerService } from '../../services';
import { getGradientTheme } from '../../components/HomeHeader';
import { AppButton, EmptyState } from '../../components/LoadingAndError';
import { C, SectionHeader } from './types';

// Color Space Helpers (HSV <-> HEX)
export const hsvToHex = (h: number, s: number, v: number): string => {
  const f = (n: number, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  const r = Math.round(f(5) * 255);
  const g = Math.round(f(3) * 255);
  const b = Math.round(f(1) * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

export const hexToHsv = (hex?: string): { h: number; s: number; v: number } => {
  if (!hex || typeof hex !== 'string') return { h: 140, s: 0.9, v: 0.25 };
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return { h: 140, s: 0.9, v: 0.25 };
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  if (isNaN(r) || isNaN(g) || isNaN(b)) return { h: 140, s: 0.9, v: 0.25 };

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : delta / max;
  const v = max;
  return { h, s, v };
};

// 14 Curated Touch-Friendly Swatches (matching Image 2)
export const PICKER_SWATCHES = [
  '#02381A', '#07843D', '#10B981', '#0284C7', '#4F46E5', '#9333EA',
  '#EF4444', '#EA580C', '#F59E0B', '#EAB308', '#D4A373', '#64748B', '#CBD5E1', '#FFFFFF',
];

// Curated 12 Clean Banner Colors
export const BANNER_COLORS = [
  { name: 'Farm Green', hex: '#07843D', top: '#02381A', bottom: '#15803D' },
  { name: 'Forest Dark', hex: '#02381A', top: '#01200F', bottom: '#07843D' },
  { name: 'Fresh Mint', hex: '#10B981', top: '#064E3B', bottom: '#10B981' },
  { name: 'Sunset Orange', hex: '#EA580C', top: '#7C2D12', bottom: '#EA580C' },
  { name: 'Warm Amber', hex: '#F59E0B', top: '#78350F', bottom: '#F59E0B' },
  { name: 'Golden Sun', hex: '#EAB308', top: '#713F12', bottom: '#EAB308' },
  { name: 'Deep Ocean', hex: '#0284C7', top: '#0C4A6E', bottom: '#0284C7' },
  { name: 'Pacific Teal', hex: '#0F766E', top: '#042F2E', bottom: '#0F766E' },
  { name: 'Wild Berry', hex: '#E11D48', top: '#500724', bottom: '#E11D48' },
  { name: 'Ruby Wine', hex: '#991B1B', top: '#450A0A', bottom: '#DC2626' },
  { name: 'Royal Purple', hex: '#7E22CE', top: '#3B0764', bottom: '#9333EA' },
  { name: 'Midnight Slate', hex: '#0F172A', top: '#020617', bottom: '#334155' },
];

// Dual-Tone Gradient Duos (Top & Bottom Harmonious Pairs)
export const GRADIENT_PRESETS = [
  { name: 'Organic Farm', top: '#02381A', bottom: '#15803D' },
  { name: 'Forest Mist', top: '#064E3B', bottom: '#10B981' },
  { name: 'Sage Garden', top: '#0F766E', bottom: '#9AADA6' },
  { name: 'Fresh Herbal', top: '#065F46', bottom: '#34D399' },
  { name: 'Golden Harvest', top: '#78350F', bottom: '#F59E0B' },
  { name: 'Sunset Amber', top: '#7C2D12', bottom: '#EA580C' },
  { name: 'Warm Sun', top: '#713F12', bottom: '#EAB308' },
  { name: 'Deep Ocean', top: '#0C4A6E', bottom: '#0284C7' },
  { name: 'Lush Teal', top: '#042F2E', bottom: '#0D9488' },
  { name: 'Wild Berry', top: '#500724', bottom: '#E11D48' },
  { name: 'Ruby Wine', top: '#450A0A', bottom: '#DC2626' },
  { name: 'Royal Grape', top: '#3B0764', bottom: '#9333EA' },
  { name: 'Midnight Slate', top: '#020617', bottom: '#334155' },
  { name: 'Earth Clay', top: '#451A03', bottom: '#9A3412' },
];

// Rich Color Palette categorized into 5 families
export const COLOR_PALETTE_CATEGORIES = [
  {
    name: '🌿 Greens & Sage',
    colors: [
      { name: 'Deep Moss', hex: '#02381A' },
      { name: 'Forest Dark', hex: '#045A29' },
      { name: 'Farm Green', hex: '#07843D' },
      { name: 'Emerald', hex: '#059669' },
      { name: 'Fresh Mint', hex: '#10B981' },
      { name: 'Leaf Green', hex: '#16A34A' },
      { name: 'Lime', hex: '#22C55E' },
      { name: 'Soft Sage', hex: '#9AADA6' },
      { name: 'Pale Mint', hex: '#A7F3D0' },
      { name: 'Herbal White', hex: '#E8F5E9' },
    ],
  },
  {
    name: '🌾 Gold & Earth',
    colors: [
      { name: 'Deep Bark', hex: '#451A03' },
      { name: 'Rich Timber', hex: '#78350F' },
      { name: 'Terra Cotta', hex: '#9A3412' },
      { name: 'Warm Amber', hex: '#B45309' },
      { name: 'Golden Honey', hex: '#D97706' },
      { name: 'Sun Amber', hex: '#F59E0B' },
      { name: 'Accent Gold', hex: '#F2C500' },
      { name: 'Bright Yellow', hex: '#EAB308' },
      { name: 'Soft Butter', hex: '#FDE047' },
      { name: 'Pale Sun', hex: '#FEF9C3' },
    ],
  },
  {
    name: '🍊 Warm & Coral',
    colors: [
      { name: 'Burgundy', hex: '#450A0A' },
      { name: 'Burnt Ochre', hex: '#7C2D12' },
      { name: 'Ripe Tomato', hex: '#991B1B' },
      { name: 'Ruby Red', hex: '#DC2626' },
      { name: 'Harvest Orange', hex: '#EA580C' },
      { name: 'Tangerine', hex: '#F97316' },
      { name: 'Warm Coral', hex: '#FB923C' },
      { name: 'Wild Berry', hex: '#E11D48' },
      { name: 'Pink Guava', hex: '#F43F5E' },
      { name: 'Blush Rose', hex: '#FECACA' },
    ],
  },
  {
    name: '💧 Ocean & Teal',
    colors: [
      { name: 'Abyss', hex: '#042F2E' },
      { name: 'Midnight Navy', hex: '#0C4A6E' },
      { name: 'Pacific Teal', hex: '#0F766E' },
      { name: 'Deep Sea', hex: '#0369A1' },
      { name: 'Marine Teal', hex: '#0D9488' },
      { name: 'Cerulean', hex: '#0284C7' },
      { name: 'Aqua Lagoon', hex: '#14B8A6' },
      { name: 'Cyan Spring', hex: '#06B6D4' },
      { name: 'Sky Blue', hex: '#38BDF8' },
      { name: 'Pale Breeze', hex: '#E0F2FE' },
    ],
  },
  {
    name: '🍇 Vineyard & Slate',
    colors: [
      { name: 'Black Currant', hex: '#3B0764' },
      { name: 'Deep Plum', hex: '#500724' },
      { name: 'Royal Grape', hex: '#6B21A8' },
      { name: 'Amethyst', hex: '#7E22CE' },
      { name: 'Vibrant Violet', hex: '#9333EA' },
      { name: 'Deep Slate', hex: '#020617' },
      { name: 'Midnight', hex: '#0F172A' },
      { name: 'Charcoal', hex: '#1E293B' },
      { name: 'Steel Gray', hex: '#334155' },
      { name: 'Cool Slate', hex: '#64748B' },
    ],
  },
];

// Quick Sample Photos
export const SAMPLE_PHOTOS = [
  { name: '🥦 Veggies', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800' },
  { name: '🍓 Fruits', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800' },
  { name: '🥛 Dairy', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800' },
  { name: '🌾 Farm', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800' },
];

export const AdminBannersScreen: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Active Color Tab: 'top' | 'bottom' (Smooth tab switching with Ref for zero-delay closures)
  const [activeColorTab, setActiveColorTab] = useState<'top' | 'bottom'>('top');
  const activeColorTabRef = useRef<'top' | 'bottom'>('top');

  // HSV state for 2D color picker
  const [hueVal, setHueVal] = useState<number>(147);
  const [satVal, setSatVal] = useState<number>(0.96);
  const [valVal, setValVal] = useState<number>(0.22);

  // Sync HSV when color changes
  const syncHsvFromHex = (hex?: string) => {
    const hsv = hexToHsv(hex || '#02381A');
    setHueVal(hsv.h);
    setSatVal(hsv.s);
    setValVal(hsv.v);
  };

  // Switch between Top and Bottom color tabs reliably
  const handleSelectTab = (tab: 'top' | 'bottom') => {
    activeColorTabRef.current = tab;
    setActiveColorTab(tab);
    const color = tab === 'top' ? (form.topColor || '#02381A') : (form.bottomColor || '#EA580C');
    syncHsvFromHex(color);
  };

  // Update current active color (top or bottom) in real time
  const updateCurrentColor = (hex: string) => {
    const clean = hex.trim().startsWith('#') ? hex.trim() : `#${hex.trim()}`;
    const currentTab = activeColorTabRef.current;
    if (currentTab === 'top') {
      setForm(prev => ({
        ...prev,
        topColor: clean,
        backgroundColor: `${clean}|${prev.bottomColor || '#EA580C'}`,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        bottomColor: clean,
        backgroundColor: `${prev.topColor || '#02381A'}|${clean}`,
      }));
    }
  };

  // Apply swatch click
  const handleSwatchPress = (hex: string) => {
    updateCurrentColor(hex);
    syncHsvFromHex(hex);
  };

  // 2D Saturation / Value Canvas touch handler
  const handleCanvasTouch = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    const clampedX = Math.max(0, Math.min(220, locationX));
    const clampedY = Math.max(0, Math.min(176, locationY));
    const newSat = Math.max(0, Math.min(1, clampedX / 220));
    const newVal = Math.max(0, Math.min(1, 1 - clampedY / 176));
    setSatVal(newSat);
    setValVal(newVal);
    const newHex = hsvToHex(hueVal, newSat, newVal);
    updateCurrentColor(newHex);
  };

  // Hue Slider touch handler
  const handleHueTouch = (evt: any) => {
    const { locationY } = evt.nativeEvent;
    const clampedY = Math.max(0, Math.min(176, locationY));
    const newHue = Math.round((clampedY / 176) * 360);
    setHueVal(newHue);
    const newHex = hsvToHex(newHue, satVal, valVal);
    updateCurrentColor(newHex);
  };

  // Brightness/Value Slider touch handler
  const handleBrightTouch = (evt: any) => {
    const { locationY } = evt.nativeEvent;
    const clampedY = Math.max(0, Math.min(176, locationY));
    const newVal = Math.max(0, Math.min(1, 1 - clampedY / 176));
    setValVal(newVal);
    const newHex = hsvToHex(hueVal, satVal, newVal);
    updateCurrentColor(newHex);
  };

  // Direct HEX Text Input handler
  const handleHexInput = (text: string) => {
    const clean = text.trim();
    const hex = clean.startsWith('#') ? clean : `#${clean}`;
    updateCurrentColor(hex);
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
      syncHsvFromHex(hex);
    }
  };

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Clean form state
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800',
    topColor: '#02381A',
    bottomColor: '#EA580C',
    backgroundColor: '#02381A|#EA580C',
    textColor: '#FFFFFF',
    buttonColor: '#FDE047',
    buttonTextColor: '#78350F',
    buttonText: 'Shop Now →',
    targetType: 'ALL_PRODUCTS',
    targetId: 'ALL_PRODUCTS',
    displayOrder: '1',
    isActive: true,
  });

  const loadBanners = async () => {
    try {
      const list = await bannerService.getAllAdminBanners();
      setBanners(list);
    } catch {
      try {
        const list2 = await bannerService.getActiveBanners();
        setBanners(list2);
      } catch {}
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // Image upload via device gallery
  const handlePickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please allow gallery permission to pick a banner photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: Platform.OS !== 'web',
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const dataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

        // Set image locally immediately so user sees it right away!
        setForm(prev => ({ ...prev, imageUrl: dataUri }));
        setIsUploading(true);

        try {
          const uploadedUrl = await bannerService.uploadImage(dataUri, `banner-${Date.now()}.jpg`);
          if (uploadedUrl && typeof uploadedUrl === 'string') {
            setForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
          }
        } catch (uploadErr) {
          console.warn('Remote upload failed, local URI kept:', uploadErr);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (err: any) {
      console.warn('Gallery pick error:', err);
      Alert.alert('Gallery Error', err.message || 'Could not pick image.');
    } finally {
      setIsUploading(false);
    }
  };

  // Image capture via device camera
  const handleTakePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please allow camera permission to take a banner photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: Platform.OS !== 'web',
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const dataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

        setForm(prev => ({ ...prev, imageUrl: dataUri }));
        setIsUploading(true);

        try {
          const uploadedUrl = await bannerService.uploadImage(dataUri, `banner-cam-${Date.now()}.jpg`);
          if (uploadedUrl && typeof uploadedUrl === 'string') {
            setForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
          }
        } catch (uploadErr) {
          console.warn('Remote upload failed, local URI kept:', uploadErr);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      Alert.alert('Camera Error', err.message || 'Could not take photo.');
    } finally {
      setIsUploading(false);
    }
  };

  // Open modal in Add mode
  const openAdd = () => {
    setForm({
      title: 'Organic Promotional Banner',
      subtitle: '',
      imageUrl: SAMPLE_PHOTOS[0].url,
      topColor: '#02381A',
      bottomColor: '#EA580C',
      backgroundColor: '#02381A|#EA580C',
      textColor: '#FFFFFF',
      buttonColor: '#FDE047',
      buttonTextColor: '#78350F',
      buttonText: 'Shop Now →',
      targetType: 'ALL_PRODUCTS',
      targetId: 'ALL_PRODUCTS',
      displayOrder: String(banners.length + 1),
      isActive: true,
    });
    activeColorTabRef.current = 'top';
    setActiveColorTab('top');
    syncHsvFromHex('#02381A');
    setEditId(null);
    setModal('add');
  };

  // Open modal in Edit mode
  const openEdit = (b: any) => {
    const rawBg = b.backgroundColor || '#02381A|#EA580C';
    let top = '#02381A';
    let bottom = '#EA580C';

    if (rawBg.includes('|')) {
      const parts = rawBg.split('|').map((s: string) => s.trim()).filter(Boolean);
      top = parts[0] || '#02381A';
      bottom = parts[1] || parts[0] || '#EA580C';
    } else {
      const bGrad = getGradientTheme(rawBg);
      top = bGrad.dark;
      bottom = bGrad.light;
    }

    setForm({
      title: b.title || 'Organic Promotional Banner',
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl || '',
      topColor: top,
      bottomColor: bottom,
      backgroundColor: rawBg,
      textColor: b.textColor || '#FFFFFF',
      buttonColor: b.buttonColor || '#FDE047',
      buttonTextColor: b.buttonTextColor || '#78350F',
      buttonText: b.buttonText || 'Shop Now →',
      targetType: b.targetType || 'ALL_PRODUCTS',
      targetId: b.targetId || 'ALL_PRODUCTS',
      displayOrder: String(b.displayOrder || 1),
      isActive: b.isActive !== undefined ? b.isActive : true,
    });
    activeColorTabRef.current = 'top';
    setActiveColorTab('top');
    syncHsvFromHex(top);
    setEditId(b.id);
    setModal('edit');
  };

  // Save banner
  const handleSave = async () => {
    const finalBg =
      form.topColor && form.bottomColor
        ? `${form.topColor.trim()}|${form.bottomColor.trim()}`
        : form.backgroundColor || '#02381A|#EA580C';

    const bannerTitle = form.title?.trim() || 'Organic Promotional Banner';

    const payload = {
      title: bannerTitle,
      subtitle: form.subtitle?.trim() || undefined,
      imageUrl: form.imageUrl?.trim() || undefined,
      backgroundColor: finalBg,
      textColor: form.textColor || '#FFFFFF',
      buttonColor: form.buttonColor || '#FDE047',
      buttonTextColor: form.buttonTextColor || '#78350F',
      buttonText: form.buttonText || 'Shop Now →',
      targetType: form.targetType || 'ALL_PRODUCTS',
      targetId: form.targetId || 'ALL_PRODUCTS',
      displayOrder: parseInt(form.displayOrder, 10) || 1,
      isActive: form.isActive !== undefined ? form.isActive : true,
    };

    setIsSaving(true);
    try {
      if (editId) {
        await bannerService.updateBanner(editId, payload);
      } else {
        await bannerService.createBanner(payload);
      }
      setModal(null);
      await loadBanners();
      Alert.alert('Success', editId ? 'Banner updated successfully!' : 'Banner created successfully!');
    } catch (e: any) {
      Alert.alert('Save Failed', `Could not save banner: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete banner
  const handleDelete = (id: string) => {
    Alert.alert('Delete Banner', 'Are you sure you want to remove this promotional banner?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await bannerService.deleteBanner(id);
            Alert.alert('Deleted', 'Banner removed.');
            await loadBanners();
          } catch (e: any) {
            Alert.alert('Delete Failed', e.message);
          }
        },
      },
    ]);
  };

  // Toggle active status
  const handleToggleActive = async (banner: any) => {
    try {
      await bannerService.updateBanner(banner.id, { isActive: !banner.isActive });
      await loadBanners();
    } catch (e: any) {
      Alert.alert('Toggle Failed', e.message);
    }
  };

  return (
    <View className="flex-1">
      <SectionHeader
        title={`Promotional Banners (${banners.length})`}
        action={{ label: '+ Add Banner', onPress: openAdd }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {banners.map(b => {
          const bGrad = getGradientTheme(b.backgroundColor || '#07843D');
          return (
            <View
              key={b.id}
              className="bg-white rounded-2xl p-4 mb-3 border border-[#E2EBE6] shadow-sm"
              style={{ borderLeftWidth: 4, borderLeftColor: bGrad.mid }}
            >
              <View className="flex-row justify-between items-start mb-2.5">
                <View className="flex-1 mr-2.5">
                  <View className="flex-row items-center gap-1.5">
                    <Sparkles size={16} color={C.primary} strokeWidth={2.2} />
                    <Text className="text-base font-extrabold text-[#0D2B1D]" numberOfLines={1}>
                      {b.title || `Banner #${b.displayOrder || 1}`}
                    </Text>
                    <View className="flex-row gap-1 ml-1.5">
                      <View
                        className="w-2.5 h-2.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: bGrad.dark }}
                      />
                      <View
                        className="w-2.5 h-2.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: bGrad.light }}
                      />
                    </View>
                  </View>
                  {b.subtitle ? (
                    <Text className="text-xs text-[#5a6a63] mt-1" numberOfLines={1}>
                      {b.subtitle}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() => handleToggleActive(b)}
                  className={`py-1 px-2.5 rounded-full border ${
                    b.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                  }`}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-2xs font-extrabold ${
                      b.isActive ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {b.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Banner Card Preview in List */}
              <View
                className="h-28 rounded-2xl overflow-hidden relative shadow-sm"
                style={{ backgroundColor: bGrad.dark }}
              >
                {b.imageUrl ? (
                  <Image
                    source={{ uri: b.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full p-3 justify-between">
                    <View className="absolute inset-0" pointerEvents="none">
                      <Svg width="100%" height="100%">
                        <Defs>
                          <SvgLinearGradient id={`cardGrad_${b.id}`} x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0%" stopColor={bGrad.dark} stopOpacity="1" />
                            <Stop offset="100%" stopColor={bGrad.light} stopOpacity="1" />
                          </SvgLinearGradient>
                        </Defs>
                        <Rect width="100%" height="100%" fill={`url(#cardGrad_${b.id})`} />
                      </Svg>
                    </View>
                    <View className="z-10">
                      <Text className="text-sm font-black text-white" numberOfLines={1}>
                        {b.title}
                      </Text>
                      {b.subtitle ? (
                        <Text className="text-xs text-white/85 mt-0.5" numberOfLines={1}>
                          {b.subtitle}
                        </Text>
                      ) : null}
                    </View>
                    <View className="self-start px-2 py-0.5 rounded bg-white/20 z-10">
                      <Text className="text-2xs font-bold text-white">
                        {b.buttonText || 'Shop Now →'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View className="flex-row justify-between items-center pt-2 mt-2 border-t border-slate-100">
                <Text className="text-2xs text-slate-500 font-semibold">
                  Order: #{b.displayOrder || 1} • Links to: {b.targetType || 'ALL'}
                </Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    className="flex-row items-center gap-1.5 py-1 px-3 rounded-lg bg-[#F7FAF8] border border-[#E2EBE6]"
                    onPress={() => openEdit(b)}
                    activeOpacity={0.7}
                  >
                    <Pencil size={13} color={C.textSec} />
                    <Text className="text-xs text-[#5a6a63] font-bold">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="py-1 px-2.5 rounded-lg bg-red-50 border border-red-200"
                    onPress={() => handleDelete(b.id)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={13} color={C.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {banners.length === 0 && (
          <EmptyState
            icon={<Sparkles size={36} color={C.textMuted} strokeWidth={1.5} />}
            title="No promotional banners"
            description="Create your first festival banner with simple color picker and photo upload."
            actionLabel="+ Add New Banner"
            onAction={openAdd}
          />
        )}
      </ScrollView>

      {/* ─── NEAT & SIMPLE BANNER ADD / EDIT MODAL ─── */}
      <Modal visible={!!modal} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <View className="flex-1 bg-black/50 justify-end">
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModal(null)}
          />
          <View className="bg-white rounded-t-3xl p-5 pb-8 max-h-[92%] z-10">
            {/* Top Handle Bar */}
            <View className="w-10 h-1 bg-[#E2EBE6] rounded-full self-center mb-3" />

            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center">
                  <Sparkles size={16} color="#047857" strokeWidth={2.5} />
                </View>
                <Text className="text-lg font-extrabold text-[#1a1a2e]">
                  {modal === 'add' ? 'Add Promotional Banner' : 'Edit Banner'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                activeOpacity={0.7}
              >
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* ─── 1. REALTIME LIVE PREVIEW CARD (Visible Color & Photo) ─── */}
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider">
                    Live Banner Preview
                  </Text>
                  <View className="flex-row items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <View className="w-2 h-2 rounded-full bg-emerald-600" />
                    <Text className="text-2xs font-extrabold text-emerald-800">REALTIME COLOR & PHOTO</Text>
                  </View>
                </View>

                {/* Banner Container with Dynamic Background Color */}
                <View
                  className="h-36 rounded-2xl overflow-hidden relative shadow-sm border border-slate-300"
                  style={{ backgroundColor: form.topColor || '#02381A' }}
                >
                  {form.imageUrl ? (
                    <Image
                      source={{ uri: form.imageUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <>
                      {/* SVG Gradient Background Layer */}
                      <View className="absolute inset-0" pointerEvents="none">
                        <Svg width="100%" height="100%">
                          <Defs>
                            <SvgLinearGradient id="neatLiveGrad" x1="0" y1="0" x2="1" y2="1">
                              <Stop offset="0%" stopColor={form.topColor || '#02381A'} stopOpacity="1" />
                              <Stop offset="100%" stopColor={form.bottomColor || '#15803D'} stopOpacity="1" />
                            </SvgLinearGradient>
                          </Defs>
                          <Rect width="100%" height="100%" fill="url(#neatLiveGrad)" />
                        </Svg>
                      </View>

                      {/* Headline & Button */}
                      <View className="flex-1 p-3.5 justify-between z-10">
                        <View>
                          <View className="self-start bg-white/20 px-2 py-0.5 rounded mb-1">
                            <Text className="text-2xs font-black text-white uppercase tracking-wider">
                              {form.isActive ? '🌿 CERTIFIED ORGANIC' : 'HIDDEN DRAFT'}
                            </Text>
                          </View>
                          <Text className="text-base font-black text-white shadow-sm" numberOfLines={1}>
                            {form.title || 'Banner Title Goes Here 🌿'}
                          </Text>
                          {form.subtitle ? (
                            <Text className="text-xs text-white/90 font-medium mt-0.5" numberOfLines={1}>
                              {form.subtitle}
                            </Text>
                          ) : null}
                        </View>

                        <View className="self-start px-3 py-1.5 rounded-lg bg-[#FDE047] shadow-sm">
                          <Text className="text-xs font-black text-[#78350F]">
                            {form.buttonText || 'Shop Now →'}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* ─── 2. TOP & BOTTOM COLOR SELECTOR (IMAGE 2 DESIGN) ─── */}
              <View className="mb-4">
                {/* Side-by-Side Dual Color Cards: Top Color & Bottom Color */}
                <View className="flex-row items-center gap-2.5">
                  {/* Top Color Button */}
                  <Pressable
                    onPress={() => handleSelectTab('top')}
                    hitSlop={8}
                    className={`flex-1 p-3 rounded-2xl border flex-row items-center justify-between ${
                      activeColorTab === 'top'
                        ? 'bg-emerald-50/50 border-2 border-emerald-600 shadow-sm'
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    <View className="flex-row items-center gap-2.5" pointerEvents="none">
                      <View
                        className="w-10 h-10 rounded-xl border border-slate-200 shadow-xs"
                        style={{ backgroundColor: form.topColor || '#02381A' }}
                      />
                      <View>
                        <Text className="text-xs font-semibold text-slate-800">Top Color</Text>
                        <Text className="text-sm font-black text-slate-900">{form.topColor || '#02381A'}</Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={activeColorTab === 'top' ? '#059669' : '#94A3B8'} pointerEvents="none" />
                  </Pressable>

                  {/* Swap Colors Button */}
                  <Pressable
                    onPress={() => {
                      const curTop = form.topColor || '#02381A';
                      const curBottom = form.bottomColor || '#EA580C';
                      setForm(prev => ({
                        ...prev,
                        topColor: curBottom,
                        bottomColor: curTop,
                        backgroundColor: `${curBottom}|${curTop}`,
                      }));
                      const newColor = activeColorTabRef.current === 'top' ? curBottom : curTop;
                      syncHsvFromHex(newColor);
                    }}
                    hitSlop={8}
                    className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 items-center justify-center active:bg-slate-200"
                  >
                    <Text className="text-emerald-700 font-black text-sm">⇄</Text>
                  </Pressable>

                  {/* Bottom Color Button */}
                  <Pressable
                    onPress={() => handleSelectTab('bottom')}
                    hitSlop={8}
                    className={`flex-1 p-3 rounded-2xl border flex-row items-center justify-between ${
                      activeColorTab === 'bottom'
                        ? 'bg-emerald-50/50 border-2 border-emerald-600 shadow-sm'
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    <View className="flex-row items-center gap-2.5" pointerEvents="none">
                      <View
                        className="w-10 h-10 rounded-xl border border-slate-200 shadow-xs"
                        style={{ backgroundColor: form.bottomColor || '#EA580C' }}
                      />
                      <View>
                        <Text className="text-xs font-semibold text-slate-800">Bottom Color</Text>
                        <Text className="text-sm font-black text-slate-900">{form.bottomColor || '#EA580C'}</Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={activeColorTab === 'bottom' ? '#059669' : '#94A3B8'} pointerEvents="none" />
                  </Pressable>
                </View>

                {/* Arrow Pointer under active card */}
                <View
                  pointerEvents="none"
                  style={{
                    marginLeft: activeColorTab === 'top' ? '20%' : '75%',
                    width: 0,
                    height: 0,
                    borderLeftWidth: 8,
                    borderRightWidth: 8,
                    borderBottomWidth: 8,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderBottomColor: '#FFFFFF',
                    marginBottom: -1,
                  }}
                />

                {/* ─── "SELECT COLOR" CARD (ALWAYS ACTIVE & RELIABLE) ─── */}
                <View className="bg-white rounded-3xl border border-slate-200 p-4 mt-1 mb-2 shadow-lg">
                  {/* Header with Direct Top / Bottom Switch Pills */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-base font-extrabold text-slate-900">
                      Select {activeColorTab === 'top' ? 'Top Color' : 'Bottom Color'}
                    </Text>

                    {/* Direct Segmented Switch: [ TOP ] [ BOTTOM ] */}
                    <View className="flex-row items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <Pressable
                        onPress={() => handleSelectTab('top')}
                        hitSlop={6}
                        className={`px-3 py-1 rounded-lg ${
                          activeColorTab === 'top' ? 'bg-emerald-700 shadow-xs' : 'bg-transparent'
                        }`}
                      >
                        <Text
                          className={`text-2xs font-extrabold ${
                            activeColorTab === 'top' ? 'text-white' : 'text-slate-600'
                          }`}
                        >
                          TOP
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleSelectTab('bottom')}
                        hitSlop={6}
                        className={`px-3 py-1 rounded-lg ${
                          activeColorTab === 'bottom' ? 'bg-emerald-700 shadow-xs' : 'bg-transparent'
                        }`}
                      >
                        <Text
                          className={`text-2xs font-extrabold ${
                            activeColorTab === 'bottom' ? 'text-white' : 'text-slate-600'
                          }`}
                        >
                          BOTTOM
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* 2D Saturation / Value Box + Hue & Brightness Sliders */}
                  <View className="flex-row gap-2.5 mb-3.5">
                    {/* 2D Canvas */}
                    <View
                      className="flex-1 h-44 rounded-2xl overflow-hidden relative border border-slate-200"
                      onStartShouldSetResponder={() => true}
                      onMoveShouldSetResponder={() => true}
                      onResponderGrant={handleCanvasTouch}
                      onResponderMove={handleCanvasTouch}
                      onResponderRelease={() => {}}
                      onResponderTerminate={() => {}}
                      onResponderTerminationRequest={() => true}
                    >
                      <Svg width="100%" height="100%">
                        <Defs>
                          <SvgLinearGradient id="hsvSatGrad" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                            <Stop offset="100%" stopColor={hsvToHex(hueVal, 1, 1)} stopOpacity="1" />
                          </SvgLinearGradient>
                          <SvgLinearGradient id="hsvValGrad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
                            <Stop offset="100%" stopColor="#000000" stopOpacity="1" />
                          </SvgLinearGradient>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#hsvSatGrad)" />
                        <Rect width="100%" height="100%" fill="url(#hsvValGrad)" />
                      </Svg>
                      {/* Interactive Selector Thumb */}
                      <View
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          left: `${Math.max(0, Math.min(100, satVal * 100))}%`,
                          top: `${Math.max(0, Math.min(100, (1 - valVal) * 100))}%`,
                          transform: [{ translateX: -10 }, { translateY: -10 }],
                        }}
                        className="w-5 h-5 rounded-full border-2 border-white shadow-md bg-transparent"
                      />
                    </View>

                    {/* Vertical Hue Slider */}
                    <View
                      className="w-6 h-44 rounded-full overflow-hidden relative border border-slate-200"
                      onStartShouldSetResponder={() => true}
                      onMoveShouldSetResponder={() => true}
                      onResponderGrant={handleHueTouch}
                      onResponderMove={handleHueTouch}
                      onResponderRelease={() => {}}
                      onResponderTerminate={() => {}}
                      onResponderTerminationRequest={() => true}
                    >
                      <Svg width="100%" height="100%">
                        <Defs>
                          <SvgLinearGradient id="hsvHueGrad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor="#FF0000" />
                            <Stop offset="17%" stopColor="#FFFF00" />
                            <Stop offset="33%" stopColor="#00FF00" />
                            <Stop offset="50%" stopColor="#00FFFF" />
                            <Stop offset="67%" stopColor="#0000FF" />
                            <Stop offset="83%" stopColor="#FF00FF" />
                            <Stop offset="100%" stopColor="#FF0000" />
                          </SvgLinearGradient>
                        </Defs>
                        <Rect width="100%" height="100%" rx={12} fill="url(#hsvHueGrad)" />
                      </Svg>
                      {/* Hue Thumb */}
                      <View
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          top: `${Math.max(0, Math.min(100, (hueVal / 360) * 100))}%`,
                          transform: [{ translateY: -10 }],
                        }}
                        className="w-5 h-5 rounded-full border-2 border-white shadow-md bg-white/40 self-center"
                      />
                    </View>

                    {/* Vertical Brightness / Shade Slider */}
                    <View
                      className="w-6 h-44 rounded-full overflow-hidden relative border border-slate-200"
                      onStartShouldSetResponder={() => true}
                      onMoveShouldSetResponder={() => true}
                      onResponderGrant={handleBrightTouch}
                      onResponderMove={handleBrightTouch}
                      onResponderRelease={() => {}}
                      onResponderTerminate={() => {}}
                      onResponderTerminationRequest={() => true}
                    >
                      <Svg width="100%" height="100%">
                        <Defs>
                          <SvgLinearGradient id="hsvBrightGrad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor={hsvToHex(hueVal, 1, 1)} stopOpacity="1" />
                            <Stop offset="100%" stopColor="#000000" stopOpacity="1" />
                          </SvgLinearGradient>
                        </Defs>
                        <Rect width="100%" height="100%" rx={12} fill="url(#hsvBrightGrad)" />
                      </Svg>
                      {/* Brightness Thumb */}
                      <View
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          top: `${Math.max(0, Math.min(100, (1 - valVal) * 100))}%`,
                          transform: [{ translateY: -10 }],
                        }}
                        className="w-5 h-5 rounded-full border-2 border-white shadow-md bg-white/40 self-center"
                      />
                    </View>
                  </View>

                  {/* 14 Curated Color Dots (2 Rows of 7) */}
                  <View className="flex-row flex-wrap justify-between gap-y-2.5 mb-3.5">
                    {PICKER_SWATCHES.map(hex => {
                      const currentActiveHex = activeColorTab === 'top' ? form.topColor : form.bottomColor;
                      const isMatch = (currentActiveHex || '').toUpperCase() === hex.toUpperCase();
                      return (
                        <Pressable
                          key={hex}
                          onPress={() => handleSwatchPress(hex)}
                          hitSlop={4}
                          style={{ backgroundColor: hex }}
                          className={`w-9 h-9 rounded-full items-center justify-center border shadow-xs ${
                            isMatch
                              ? 'border-[3px] border-white ring-2 ring-emerald-600 scale-110'
                              : 'border-slate-300'
                          }`}
                        >
                          {isMatch && (
                            <Check
                              size={14}
                              color={hex === '#FFFFFF' ? '#047857' : '#FFFFFF'}
                              strokeWidth={3.5}
                            />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* HEX Input Row with Eyedropper */}
                  <View className="flex-row items-center gap-2">
                    <View
                      className="w-10 h-10 rounded-xl border border-slate-300 shadow-xs"
                      style={{
                        backgroundColor:
                          activeColorTab === 'top' ? form.topColor || '#02381A' : form.bottomColor || '#EA580C',
                      }}
                    />
                    <View className="flex-1 flex-row items-center bg-[#F8FAF8] border border-slate-200 rounded-xl px-3 h-11">
                      <TextInput
                        className="flex-1 text-sm font-black text-slate-800 py-0"
                        value={activeColorTab === 'top' ? form.topColor : form.bottomColor}
                        onChangeText={handleHexInput}
                        placeholder="#02381A"
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="characters"
                      />
                      <TouchableOpacity
                        onPress={() => {
                          const favs = ['#02381A', '#07843D', '#9AADA6', '#EA580C', '#F2C500', '#0284C7'];
                          const cur = (activeColorTab === 'top' ? form.topColor : form.bottomColor) || '';
                          const idx = favs.indexOf(cur.toUpperCase());
                          const next = favs[(idx + 1) % favs.length];
                          handleSwatchPress(next);
                        }}
                        className="p-1 rounded-lg bg-slate-100"
                        activeOpacity={0.7}
                      >
                        <Pipette size={18} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* ─── 3. BANNER PHOTO (GALLERY, CAMERA, SAMPLE PHOTOS) ─── */}
              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-1.5">
                  <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider">
                    Banner Photo (Optional)
                  </Text>
                  {isUploading ? (
                    <View className="flex-row items-center gap-1">
                      <ActivityIndicator size="small" color="#047857" />
                      <Text className="text-2xs font-bold text-emerald-700">Uploading...</Text>
                    </View>
                  ) : form.imageUrl ? (
                    <TouchableOpacity onPress={() => setForm(prev => ({ ...prev, imageUrl: '' }))}>
                      <Text className="text-2xs font-bold text-red-600">✕ Remove Photo</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Gallery & Camera Buttons */}
                <View className="flex-row gap-2 mb-2">
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]"
                    onPress={handlePickFromGallery}
                    disabled={isUploading}
                    activeOpacity={0.8}
                  >
                    <Upload size={15} color="#047857" />
                    <Text className="text-xs font-bold text-[#047857]">Choose from Gallery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD]"
                    onPress={handleTakePhoto}
                    disabled={isUploading}
                    activeOpacity={0.8}
                  >
                    <Camera size={15} color="#0284C7" />
                    <Text className="text-xs font-bold text-[#0284C7]">Take Camera Photo</Text>
                  </TouchableOpacity>
                </View>

                {/* 4 Quick Sample Photos */}
                <View className="flex-row gap-2">
                  {SAMPLE_PHOTOS.map(sample => {
                    const isSelected = form.imageUrl === sample.url;
                    return (
                      <TouchableOpacity
                        key={sample.name}
                        onPress={() => setForm(prev => ({ ...prev, imageUrl: sample.url }))}
                        className={`flex-1 py-1.5 rounded-xl border items-center ${
                          isSelected ? 'bg-emerald-50 border-emerald-600' : 'bg-[#F8FAF8] border-[#E2EBE6]'
                        }`}
                        activeOpacity={0.8}
                      >
                        <Text className={`text-2xs font-bold ${isSelected ? 'text-emerald-800' : 'text-slate-700'}`}>
                          {sample.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* ─── 4. CUSTOMER TABS (WHEN CUSTOMER TAPS BANNER) ─── */}
              <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1">
                When Customer Taps Banner:
              </Text>
              <View className="flex-row gap-2 mb-3.5">
                {[
                  { id: 'ALL_PRODUCTS', label: 'All Products 🛒' },
                  { id: 'CATEGORY', label: 'Categories 📦' },
                  { id: 'SUBSCRIPTION', label: 'Daily Milk 🥛' },
                  { id: 'SCREEN', label: 'Vendor Hub 🌾' },
                ].map(t => {
                  const isTypeSelected = form.targetType === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setForm({ ...form, targetType: t.id, targetId: t.id })}
                      className={`flex-1 py-2 px-1 rounded-xl border items-center justify-center ${
                        isTypeSelected ? 'bg-emerald-700 border-emerald-700' : 'bg-[#F7FAF8] border-[#E2EBE6]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-2xs text-center font-bold ${
                          isTypeSelected ? 'text-white' : 'text-slate-700'
                        }`}
                        numberOfLines={1}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ─── 8. STATUS SWITCH ─── */}
              <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1">
                Banner Status
              </Text>
              <TouchableOpacity
                onPress={() => setForm({ ...form, isActive: !form.isActive })}
                className={`h-11 rounded-xl border-2 justify-center items-center flex-row gap-1.5 mb-4 ${
                  form.isActive
                    ? 'bg-emerald-50 border-emerald-400'
                    : 'bg-red-50 border-red-300'
                }`}
                activeOpacity={0.8}
              >
                <Check size={15} color={form.isActive ? '#15803D' : '#DC2626'} strokeWidth={3} />
                <Text
                  className={`text-xs font-extrabold ${
                    form.isActive ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {form.isActive ? 'ACTIVE IN CUSTOMER APP' : 'HIDDEN DRAFT'}
                </Text>
              </TouchableOpacity>

              {/* ─── 9. SAVE & CANCEL ACTIONS ─── */}
              <View className="flex-row gap-2.5 mt-1 mb-4">
                <AppButton
                  variant="outline"
                  title="Cancel"
                  onPress={() => setModal(null)}
                  style={{ flex: 1 }}
                />
                <AppButton
                  variant="primary"
                  title={isSaving ? 'Saving...' : editId ? 'Update Banner' : 'Publish Banner'}
                  onPress={handleSave}
                  disabled={isSaving}
                  style={{ flex: 1.5 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};
