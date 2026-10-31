import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Plus, Pencil, Trash2, Upload, Check, CheckCircle2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_ENDPOINTS } from '../../services/api.client';
import { bannerService } from '../../services';
import { AppButton } from '../../components/LoadingAndError';
import { CommonModal } from '../../components/CommonModal';
import { C, SectionHeader, Chip } from './types';

const CATEGORY_ACCENT_COLORS = [
  '#07843D',
  '#059669',
  '#15803D',
  '#D97706',
  '#EA580C',
  '#DC2626',
  '#E11D48',
  '#7C3AED',
  '#2563EB',
  '#0284C7',
];

const POPULAR_CATEGORY_EMOJIS = ['🥛', '🥦', '🍎', '🌾', '🫒', '🍯', '🥚', '🥕', '🫘', '🥬', '🍓', '🍇'];

export const AdminCategoriesScreen: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState({
    name: '',
    emoji: '🌱',
    description: '',
    imageUrl: '',
    color: '#07843D',
    displayOrder: '1',
    isActive: true,
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.categories}?all=true`);
      const data = await res.json();
      const list =
        data.success && Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      setItems(
        list.map((c: any) => ({
          id: String(c.id),
          name: c.name || 'Category',
          emoji: c.emoji || '🌱',
          description: c.description || '',
          productCount: c._count?.products || c.productCount || 0,
          color: c.color || '#07843D',
          imageUrl: c.imageUrl,
          displayOrder: c.displayOrder || 1,
          isActive: c.isActive !== undefined ? c.isActive : true,
        }))
      );
    } catch (e) {
      console.warn('Failed to fetch categories:', e);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handlePickCategoryImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please grant photo gallery permission to select category photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUploading(true);
        const dataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        const uploadedUrl = await bannerService.uploadImage(dataUri, `cat-${Date.now()}.jpg`);
        setForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
      }
    } catch (err) {
      console.warn('Category image pick error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const openAdd = () => {
    setForm({
      name: '',
      emoji: '🌱',
      description: '',
      imageUrl: '',
      color: '#07843D',
      displayOrder: String(items.length + 1),
      isActive: true,
    });
    setEditId(null);
    setModal('add');
  };

  const openEdit = (c: any) => {
    setForm({
      name: c.name || '',
      emoji: c.emoji || '🌱',
      description: c.description || '',
      imageUrl: c.imageUrl || '',
      color: c.color || '#07843D',
      displayOrder: String(c.displayOrder || 1),
      isActive: c.isActive !== undefined ? c.isActive : true,
    });
    setEditId(c.id);
    setModal('edit');
  };

  const handleToggleActive = async (cat: any) => {
    try {
      await fetch(`${API_ENDPOINTS.categories}/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      loadCategories();
    } catch (e) {
      console.warn('Failed to toggle category active status:', e);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Category name is required.');
      return;
    }
    const payload = {
      name: form.name.trim(),
      emoji: form.emoji.trim() || '🌱',
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim() || null,
      displayOrder: parseInt(form.displayOrder, 10) || 1,
      isActive: form.isActive !== undefined ? form.isActive : true,
    };
    try {
      if (editId) {
        await fetch(`${API_ENDPOINTS.categories}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(API_ENDPOINTS.categories, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setModal(null);
      loadCategories();
    } catch {
      Alert.alert('Error', 'Failed to save category.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${API_ENDPOINTS.categories}/${id}`, { method: 'DELETE' });
          } catch {}
          loadCategories();
        },
      },
    ]);
  };

  return (
    <View className="flex-1">
      <SectionHeader
        title={`Categories Management (${items.length})`}
        action={{ label: '+ Add Category', onPress: openAdd }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap gap-2.5">
          {items.map(cat => (
            <View
              key={cat.id}
              className="w-[47%] bg-white rounded-xl p-3 items-center gap-1.5 border border-[#E2EBE6] shadow-sm relative border-t-4"
              style={{ borderTopColor: cat.color || '#07843D' }}
            >
              {/* Header: Order & Active Status Toggle */}
              <View className="flex-row justify-between items-center w-full mb-2">
                <View className="py-0.5 px-2 rounded-full border border-slate-200 bg-slate-100">
                  <Text className="text-[9.5px] font-extrabold text-slate-600">#{cat.displayOrder || 1}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleToggleActive(cat)}
                  className={`py-0.5 px-2 rounded-full border ${
                    cat.isActive ? 'bg-[#DCFCE7] border-[#A7F3D0]' : 'bg-[#FEE2E2] border-[#FECACA]'
                  }`}
                >
                  <Text
                    className={`text-[9.5px] font-extrabold ${
                      cat.isActive ? 'text-[#22c55e]' : 'text-[#ef4444]'
                    }`}
                  >
                    {cat.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Icon badge / thumbnail */}
              <View
                className="w-12 h-12 rounded-xl items-center justify-center overflow-hidden"
                style={{ backgroundColor: (cat.color || C.primary) + '15' }}
              >
                {cat.imageUrl ? (
                  <Image source={{ uri: cat.imageUrl }} className="w-12 h-12 rounded-xl" resizeMode="cover" />
                ) : (
                  <Text className="text-2xl">{cat.emoji || '🌱'}</Text>
                )}
              </View>

              <Text className="text-sm font-bold text-[#1a1a2e] text-center" numberOfLines={1}>
                {cat.name}
              </Text>
              {cat.description ? (
                <Text className="text-xs text-[#5a6a63] text-center mt-0.5 mb-1" numberOfLines={2}>
                  {cat.description}
                </Text>
              ) : null}

              <Chip
                label={`${cat.productCount} products`}
                color={cat.productCount > 0 ? C.success : C.textMuted}
                small
              />

              {/* Action buttons */}
              <View className="flex-row gap-1.5 mt-2">
                <TouchableOpacity
                  className="p-1 px-2.5 rounded-lg bg-[#F7FAF8] border border-[#E2EBE6] flex-row items-center gap-1"
                  onPress={() => openEdit(cat)}
                >
                  <Pencil size={11} color={C.textSec} />
                  <Text className="text-xs text-[#5a6a63] font-semibold">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-1 px-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]"
                  onPress={() => handleDelete(cat.id)}
                >
                  <Trash2 size={11} color={C.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <View className="h-8" />
      </ScrollView>

      {/* Add / Edit Category Modal */}
      <CommonModal
        visible={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add Category' : 'Edit Category'}
        icon={
          modal === 'add' ? (
            <Plus size={16} color={C.primary} strokeWidth={2.5} />
          ) : (
            <Pencil size={16} color={C.primary} strokeWidth={2.5} />
          )
        }
        maxHeight="88%"
      >
        {/* LIVE CUSTOMER APP PREVIEW */}
              <View className="mb-3.5">
                <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
                  Customer App Live Icon Preview
                </Text>
                <View className="p-3 bg-[#F8FAF8] rounded-2xl border border-[#E2EBE6] items-center justify-center">
                  <View
                    className="w-16 h-16 rounded-2xl bg-white border-2 items-center justify-center overflow-hidden shadow-sm"
                    style={{ borderColor: form.color || '#07843D' }}
                  >
                    {form.imageUrl ? (
                      <Image
                        source={{ uri: form.imageUrl }}
                        className="w-12 h-12 rounded-xl"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-3xl">{form.emoji || '🌱'}</Text>
                    )}
                  </View>
                  <Text className="text-sm font-extrabold text-[#18352B] mt-1.5">
                    {form.name || 'Category Name'}
                  </Text>
                  {form.description ? (
                    <Text className="text-2xs text-[#718078] mt-0.5 text-center">
                      {form.description}
                    </Text>
                  ) : null}
                </View>
              </View>

              <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
                Category Name *
              </Text>
              <TextInput
                className="border border-[#E2EBE6] rounded-xl px-3 h-11 text-sm text-[#1a1a2e] bg-[#F7FAF8]"
                value={form.name}
                onChangeText={v => setForm({ ...form, name: v })}
                placeholder="e.g. Dairy & Pure Ghee"
                placeholderTextColor={C.textMuted}
              />

              {/* QUICK EMOJI SELECTOR */}
              <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
                Category Emoji Icon
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-2"
                contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
              >
                {POPULAR_CATEGORY_EMOJIS.map(em => (
                  <TouchableOpacity
                    key={em}
                    onPress={() => setForm({ ...form, emoji: em })}
                    className={`w-9 h-9 rounded-xl items-center justify-center border ${
                      form.emoji === em
                        ? 'bg-[#DCFCE7] border-[#15803D] border-2'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text className="text-lg">{em}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TextInput
                className="border border-[#E2EBE6] rounded-xl px-3 h-11 text-sm text-[#1a1a2e] bg-[#F7FAF8] mb-2.5"
                value={form.emoji}
                onChangeText={v => setForm({ ...form, emoji: v })}
                placeholder="Custom emoji (e.g. 🥛)"
                placeholderTextColor={C.textMuted}
              />

              <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
                Tagline / Description
              </Text>
              <TextInput
                className="border border-[#E2EBE6] rounded-xl px-3 h-11 text-sm text-[#1a1a2e] bg-[#F7FAF8]"
                value={form.description}
                onChangeText={v => setForm({ ...form, description: v })}
                placeholder="e.g. Fresh A2 milk, cultured curd and butter"
                placeholderTextColor={C.textMuted}
              />

              {/* ACCENT COLOR SELECTOR */}
              <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
                Category Accent Color
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-2.5"
                contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
              >
                {CATEGORY_ACCENT_COLORS.map(col => {
                  const isSelected = (form.color || '').toUpperCase() === col.toUpperCase();
                  return (
                    <TouchableOpacity
                      key={col}
                      onPress={() => setForm({ ...form, color: col })}
                      className="w-7 h-7 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: col,
                        borderWidth: isSelected ? 3 : 1,
                        borderColor: isSelected ? '#1E293B' : '#E2E8F0',
                      }}
                    >
                      {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* DISPLAY ORDER & ACTIVE TOGGLE ROW */}
              <View className="flex-row gap-2.5 mb-2.5">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
                    Display Order
                  </Text>
                  <TextInput
                    className="border border-[#E2EBE6] rounded-xl px-3 h-11 text-sm text-[#1a1a2e] bg-[#F7FAF8]"
                    value={form.displayOrder}
                    onChangeText={v => setForm({ ...form, displayOrder: v })}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor={C.textMuted}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
                    Status
                  </Text>
                  <TouchableOpacity
                    onPress={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`h-11 rounded-xl items-center justify-center flex-row gap-1.5 border ${
                      form.isActive ? 'bg-[#DCFCE7] border-[#A7F3D0]' : 'bg-[#FEE2E2] border-[#FECACA]'
                    }`}
                  >
                    <CheckCircle2 size={14} color={form.isActive ? '#15803D' : '#DC2626'} />
                    <Text
                      className={`text-xs font-extrabold ${
                        form.isActive ? 'text-[#15803D]' : 'text-[#DC2626]'
                      }`}
                    >
                      {form.isActive ? 'Active on App' : 'Hidden from App'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category Image Upload */}
              <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
                Category Image (Cloudinary Asset)
              </Text>
              <TouchableOpacity
                className="h-10 rounded-full bg-[#07843D] flex-row items-center justify-center gap-1.5 mb-2.5"
                onPress={handlePickCategoryImage}
                disabled={isUploading}
              >
                <Upload size={14} color="#fff" />
                <Text className="text-white text-xs font-bold">
                  {isUploading ? 'Uploading to Cloudinary...' : 'Upload Category Photo'}
                </Text>
              </TouchableOpacity>
              {form.imageUrl ? (
                <View className="flex-row items-center gap-2.5 mb-2.5 bg-slate-50 p-2 rounded-xl">
                  <Image source={{ uri: form.imageUrl }} className="w-12 h-12 rounded-xl" resizeMode="cover" />
                  <View className="flex-1">
                    <Text className="text-xs text-[#5a6a63] font-semibold" numberOfLines={1}>
                      Photo uploaded
                    </Text>
                    <TouchableOpacity onPress={() => setForm({ ...form, imageUrl: '' })}>
                      <Text className="text-xs text-[#ef4444] font-bold mt-0.5">Remove photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              <View className="flex-row gap-2.5 mt-3.5 mb-5">
                <AppButton variant="outline" title="Cancel" onPress={() => setModal(null)} style={{ flex: 1 }} />
                <AppButton variant="primary" title="Save Category" onPress={handleSave} style={{ flex: 1.5 }} />
              </View>
      </CommonModal>
    </View>
  );
};
