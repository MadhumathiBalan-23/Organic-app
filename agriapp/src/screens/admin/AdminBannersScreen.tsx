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
import { CommonModal } from '../../components/CommonModal';
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

  // Active Color Tab: 'top' | 'bottom'
  const [activeColorTab, setActiveColorTab] = useState<'top' | 'bottom'>('top');
  const [colorModalTarget, setColorModalTarget] = useState<'top' | 'bottom' | null>(null);

  // Switch between Top and Bottom color tabs reliably
  const handleSelectTab = (tab: 'top' | 'bottom') => {
    setActiveColorTab(tab);
    setColorModalTarget(tab);
  };

  // Update color for active or targeted tab in real time
  const handlePickColorForTarget = (hex: string) => {
    const clean = hex.trim().startsWith('#') ? hex.trim() : `#${hex.trim()}`;
    const target = colorModalTarget || activeColorTab;
    if (target === 'top') {
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

  // Swap top and bottom colors
  const handleSwapColors = () => {
    setForm(prev => {
      const top = prev.topColor || '#02381A';
      const bottom = prev.bottomColor || '#EA580C';
      return {
        ...prev,
        topColor: bottom,
        bottomColor: top,
        backgroundColor: `${bottom}|${top}`,
      };
    });
  };

  // Apply gradient preset duo
  const handleApplyDuo = (top: string, bottom: string) => {
    setForm(prev => ({
      ...prev,
      topColor: top,
      bottomColor: bottom,
      backgroundColor: `${top}|${bottom}`,
    }));
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
    setActiveColorTab('top');
    setColorModalTarget(null);
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
    setActiveColorTab('top');
    setColorModalTarget(null);
    setEditId(b.id);
    setModal('edit');
  };

  // Save banner
  const handleSave = async () => {
    // 1. Mandatory Banner Photo Validation
    if (!form.imageUrl || !form.imageUrl.trim()) {
      Alert.alert('Banner Photo Required', 'Banner photo is mandatory. Please choose from gallery, take a photo, or select a sample photo.');
      return;
    }

    const finalBg =
      form.topColor && form.bottomColor
        ? `${form.topColor.trim()}|${form.bottomColor.trim()}`
        : form.backgroundColor || '#02381A|#EA580C';

    const bannerTitle = form.title?.trim() || form.targetId || 'Organic Promotional Banner';

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

      {/* ─── COMMON REUSABLE BANNER ADD / EDIT MODAL ─── */}
      <CommonModal
        visible={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add Promotional Banner' : 'Edit Banner'}
        icon={<Sparkles size={16} color="#047857" strokeWidth={2.5} />}
        maxHeight="92%"
      >
        {/* ─── 1. REALTIME BANNER PREVIEW (CLEAN PHOTO / GRADIENT ONLY - NO TEXT OVERLAY) ─── */}
        <View className="mb-3.5">
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
              <View className="absolute inset-0">
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
            )}
          </View>
        </View>

        {/* ─── 2. TOP & BOTTOM COLOR (ONLY TOP & BOTTOM COLOR SELECTOR) ─── */}
        <View className="mb-4">
          {/* Realtime Gradient Flow Preview Strip */}
          <View className="h-7 rounded-xl overflow-hidden mb-2.5 relative border border-slate-300 shadow-xs">
            <Svg width="100%" height="100%">
              <Defs>
                <SvgLinearGradient id="paletteBarGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor={form.topColor || '#02381A'} stopOpacity="1" />
                  <Stop offset="100%" stopColor={form.bottomColor || '#EA580C'} stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#paletteBarGrad)" />
            </Svg>
            <View className="absolute inset-0 flex-row items-center justify-between px-3">
              <Text className="text-2xs font-extrabold text-white shadow-sm">
                TOP: {form.topColor || '#02381A'}
              </Text>
              <Text className="text-2xs font-black text-white/90">➔ GRADIENT FLOW ➔</Text>
              <Text className="text-2xs font-extrabold text-white shadow-sm">
                BOTTOM: {form.bottomColor || '#EA580C'}
              </Text>
            </View>
          </View>

          {/* Side-by-Side Dual Color Cards: Top Color & Bottom Color + Swap Button */}
          <View className="flex-row items-center gap-2.5">
            {/* Top Color Button */}
            <Pressable
              onPress={() => setColorModalTarget('top')}
              style={({ pressed }) => ({
                flex: 1,
                padding: 12,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#E2E8F0',
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <View className="flex-row items-center gap-2.5" pointerEvents="none">
                <View
                  className="w-10 h-10 rounded-xl border border-slate-200"
                  style={{ backgroundColor: form.topColor || '#02381A' }}
                />
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#1E293B' }}>Top Color</Text>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#0F172A' }}>{form.topColor || '#02381A'}</Text>
                </View>
              </View>
              <Pencil size={15} color="#059669" pointerEvents="none" />
            </Pressable>

            {/* Swap Button */}
            <Pressable
              onPress={handleSwapColors}
              hitSlop={8}
              style={({ pressed }) => ({
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: pressed ? '#E2E8F0' : '#F1F5F9',
                borderWidth: 1,
                borderColor: '#CBD5E1',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Text style={{ color: '#047857', fontWeight: '900', fontSize: 16 }}>⇄</Text>
            </Pressable>

            {/* Bottom Color Button */}
            <Pressable
              onPress={() => setColorModalTarget('bottom')}
              style={({ pressed }) => ({
                flex: 1,
                padding: 12,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#E2E8F0',
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <View className="flex-row items-center gap-2.5" pointerEvents="none">
                <View
                  className="w-10 h-10 rounded-xl border border-slate-200"
                  style={{ backgroundColor: form.bottomColor || '#EA580C' }}
                />
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#1E293B' }}>Bottom Color</Text>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#0F172A' }}>{form.bottomColor || '#EA580C'}</Text>
                </View>
              </View>
              <Pencil size={15} color="#059669" pointerEvents="none" />
            </Pressable>
          </View>
        </View>

        {/* ─── 3. BANNER PHOTO (MANDATORY) ─── */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-1.5">
            <View className="flex-row items-center gap-1">
              <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider">
                Banner Photo
              </Text>
              <Text className="text-xs font-black text-red-500">* (Mandatory)</Text>
            </View>
            {isUploading ? (
              <View className="flex-row items-center gap-1">
                <ActivityIndicator size="small" color="#047857" />
                <Text className="text-2xs font-bold text-emerald-700">Uploading...</Text>
              </View>
            ) : form.imageUrl ? (
              <Pressable onPress={() => setForm(prev => ({ ...prev, imageUrl: '' }))} hitSlop={6}>
                <Text className="text-2xs font-bold text-red-600">✕ Remove Photo</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Gallery & Camera Buttons */}
          <View className="flex-row gap-2 mb-2">
            <Pressable
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: pressed ? '#D1FAE5' : '#ECFDF5',
                borderWidth: 1,
                borderColor: '#A7F3D0',
              })}
              onPress={handlePickFromGallery}
              disabled={isUploading}
            >
              <Upload size={15} color="#047857" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#047857' }}>Choose from Gallery</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: pressed ? '#E0F2FE' : '#F0F9FF',
                borderWidth: 1,
                borderColor: '#BAE6FD',
              })}
              onPress={handleTakePhoto}
              disabled={isUploading}
            >
              <Camera size={15} color="#0284C7" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#0284C7' }}>Take Camera Photo</Text>
            </Pressable>
          </View>

          {/* 4 Quick Sample Photos */}
          <View className="flex-row gap-2">
            {SAMPLE_PHOTOS.map(sample => {
              const isSelected = form.imageUrl === sample.url;
              return (
                <Pressable
                  key={sample.name}
                  onPress={() => setForm(prev => ({ ...prev, imageUrl: sample.url }))}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 6,
                    borderRadius: 12,
                    borderWidth: 1,
                    alignItems: 'center',
                    backgroundColor: isSelected ? '#ECFDF5' : '#F8FAF8',
                    borderColor: isSelected ? '#059669' : '#E2E8F0',
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700', color: isSelected ? '#065F46' : '#334155' }}>
                    {sample.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ─── 4. TARGET CATEGORY SELECTION ─── */}
        <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1.5">
          Target Category:
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {[
            { id: 'ALL_PRODUCTS', label: 'All Products 🛒' },
            { id: 'Dairy & Pure Ghee', label: 'Dairy & Milk 🥛' },
            { id: 'Fresh Vegetables', label: 'Vegetables 🥬' },
            { id: 'Fresh Fruits', label: 'Fruits 🍎' },
            { id: 'Groceries & Grains', label: 'Groceries 🌾' },
            { id: 'Organic Oils', label: 'Oils 🫒' },
            { id: 'Dry Fruits & Snacks', label: 'Dry Fruits 🥜' },
            { id: 'SCREEN', label: 'Vendor Hub 🌾' },
          ].map(t => {
            const isSelected = form.targetId === t.id || (t.id === 'ALL_PRODUCTS' && form.targetType === 'ALL_PRODUCTS');
            return (
              <Pressable
                key={t.id}
                onPress={() => setForm({ ...form, targetType: t.id === 'ALL_PRODUCTS' ? 'ALL_PRODUCTS' : (t.id === 'SCREEN' ? 'SCREEN' : 'CATEGORY'), targetId: t.id })}
                style={({ pressed }) => ({
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  backgroundColor: isSelected ? '#047857' : '#F8FAF8',
                  borderColor: isSelected ? '#047857' : '#E2E8F0',
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: isSelected ? '#FFFFFF' : '#334155',
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ─── 5. STATUS SWITCH ─── */}
        <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1">
          Banner Status
        </Text>
        <Pressable
          onPress={() => setForm({ ...form, isActive: !form.isActive })}
          style={({ pressed }) => ({
            height: 44,
            borderRadius: 12,
            borderWidth: 2,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 6,
            marginBottom: 16,
            backgroundColor: form.isActive ? '#ECFDF5' : '#FEF2F2',
            borderColor: form.isActive ? '#34D399' : '#FCA5A5',
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Check size={15} color={form.isActive ? '#15803D' : '#DC2626'} strokeWidth={3} />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '800',
              color: form.isActive ? '#047857' : '#DC2626',
            }}
          >
            {form.isActive ? 'ACTIVE IN CUSTOMER APP' : 'HIDDEN DRAFT'}
          </Text>
        </Pressable>

        {/* ─── 6. SAVE & CANCEL ACTIONS ─── */}
        <View className="flex-row gap-3 mt-2 mb-6">
          <Pressable
            onPress={() => setModal(null)}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 14,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: '#CBD5E1',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? '#F1F5F9' : '#FFFFFF',
            })}
          >
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#334155' }}>Cancel</Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={({ pressed }) => ({
              flex: 1.6,
              paddingVertical: 14,
              borderRadius: 16,
              backgroundColor: pressed ? '#065F46' : '#047857',
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 2,
            })}
          >
            {isSaving ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF' }}>Saving...</Text>
              </View>
            ) : (
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF' }}>
                {editId ? 'Update Banner' : 'Publish Banner'}
              </Text>
            )}
          </Pressable>
        </View>
      </CommonModal>

      {/* ─── COLOR SELECTOR MODAL (When tapping Top Color or Bottom Color) ─── */}
      <CommonModal
        visible={!!colorModalTarget}
        onClose={() => setColorModalTarget(null)}
        title={colorModalTarget === 'top' ? 'Select Top Color' : 'Select Bottom Color'}
        subtitle="Tap any swatch or enter HEX"
        icon={<Palette size={16} color="#047857" />}
        maxHeight="75%"
      >
        <View className="p-1">
          {/* Active Color Preview & Hex input */}
          <View className="flex-row items-center gap-2 mb-4">
            <View
              className="w-12 h-12 rounded-xl border border-slate-300"
              style={{
                backgroundColor:
                  colorModalTarget === 'top' ? form.topColor || '#02381A' : form.bottomColor || '#EA580C',
              }}
            />
            <View className="flex-1 flex-row items-center bg-[#F8FAF8] border border-slate-200 rounded-xl px-3 h-12">
              <TextInput
                className="flex-1 text-base font-black text-slate-800 py-0"
                value={colorModalTarget === 'top' ? form.topColor : form.bottomColor}
                onChangeText={handlePickColorForTarget}
                placeholder="#02381A"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Curated Swatches Grid */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Curated Swatches
          </Text>
          <View className="flex-row flex-wrap gap-2.5 mb-4">
            {[
              '#02381A', '#045A29', '#07843D', '#059669', '#10B981', '#16A34A',
              '#451A03', '#78350F', '#B45309', '#D97706', '#F59E0B', '#F2C500',
              '#7C2D12', '#C2410C', '#EA580C', '#F97316', '#DC2626', '#E11D48',
              '#042F2E', '#0F766E', '#0284C7', '#38BDF8', '#4F46E5', '#0F172A',
            ].map(hex => {
              const currentHex = colorModalTarget === 'top' ? form.topColor : form.bottomColor;
              const isMatch = (currentHex || '').toUpperCase() === hex.toUpperCase();
              return (
                <Pressable
                  key={hex}
                  onPress={() => handlePickColorForTarget(hex)}
                  hitSlop={4}
                  style={({ pressed }) => ({
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: hex,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: isMatch ? 3.5 : 1,
                    borderColor: isMatch ? '#047857' : '#CBD5E1',
                    transform: [{ scale: isMatch ? 1.1 : (pressed ? 0.95 : 1) }],
                  })}
                >
                  {isMatch && <Check size={18} color="#FFFFFF" strokeWidth={3.5} />}
                </Pressable>
              );
            })}
          </View>

          {/* Quick Presets */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Quick Shades
          </Text>
          <View className="flex-row flex-wrap gap-1.5 mb-5">
            {[
              { label: '🌿 Farm Green', hex: '#07843D' },
              { label: '🌲 Deep Forest', hex: '#02381A' },
              { label: '🍃 Sage Green', hex: '#9AADA6' },
              { label: '🌾 Gold Sun', hex: '#F2C500' },
              { label: '🍊 Sunset', hex: '#EA580C' },
              { label: '🌊 Deep Ocean', hex: '#0284C7' },
            ].map(quick => (
              <Pressable
                key={quick.hex}
                onPress={() => handlePickColorForTarget(quick.hex)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: pressed ? '#F1F5F9' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                })}
              >
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: quick.hex }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#334155' }}>{quick.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Done Button */}
          <Pressable
            onPress={() => setColorModalTarget(null)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#065F46' : '#047857',
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>Done ✓</Text>
          </Pressable>
        </View>
      </CommonModal>
    </View>
  );
};
