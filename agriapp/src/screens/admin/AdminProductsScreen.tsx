import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { Search, Plus, Pencil, Trash2, Sprout, Upload, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Product, Categories, ORGANIC_PRODUCT_PRESETS } from '../../constants/mockData';
import { productService, bannerService } from '../../services';
import { AppButton } from '../../components/LoadingAndError';
import { C, SectionHeader, Chip, statusColor } from './types';

export const AdminProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Dairy & Pure Ghee',
    unit: 'Kg',
    emoji: '',
    imageUrl:
      ORGANIC_PRODUCT_PRESETS[0]?.url ||
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600',
  });
  const [editId, setEditId] = useState<string | null>(null);

  const handlePickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant photo gallery permission to choose product photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUploadingImage(true);
        const dataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        const uploadedUrl = await bannerService.uploadImage(dataUri, `admin-gal-${Date.now()}.jpg`);
        setForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
      }
    } catch (err: any) {
      console.warn('Gallery pick error:', err);
      Alert.alert('Gallery Error', 'Could not open device photo gallery.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant camera permission to take product photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUploadingImage(true);
        const dataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        const uploadedUrl = await bannerService.uploadImage(dataUri, `admin-cam-${Date.now()}.jpg`);
        setForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
      }
    } catch (err: any) {
      console.warn('Camera capture error:', err);
      Alert.alert('Camera Error', 'Could not access device camera.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const loadProducts = () => {
    productService
      .getProducts()
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter(p => {
    const catName =
      typeof p.category === 'object' && p.category !== null
        ? (p.category as any).name
        : String(p.category || '');
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      catName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const openAdd = () => {
    setForm({
      name: '',
      price: '',
      stock: '',
      category: 'Dairy & Pure Ghee',
      unit: 'Kg',
      emoji: '',
      imageUrl:
        ORGANIC_PRODUCT_PRESETS[0]?.url ||
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600',
    });
    setEditId(null);
    setModal('add');
  };

  const openEdit = (p: Product) => {
    const catName =
      typeof p.category === 'object' && p.category !== null
        ? (p.category as any).name
        : String(p.category || 'Dairy & Pure Ghee');
    setForm({
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      category: catName,
      unit: p.unit,
      emoji: '',
      imageUrl:
        p.imageUrl ||
        ORGANIC_PRODUCT_PRESETS[0]?.url ||
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600',
    });
    setEditId(p.id);
    setModal('edit');
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.price) {
      Alert.alert('Error', 'Name and price are required.');
      return;
    }
    setIsSaving(true);
    if (editId) {
      try {
        await productService.updateProduct(editId, {
          name: form.name,
          price: parseFloat(form.price),
          stock: parseInt(form.stock || '0'),
          category: form.category,
          unit: form.unit,
          imageUrl: form.imageUrl,
        });
      } catch {}
    } else {
      try {
        await productService.createProduct({
          name: form.name,
          category: form.category,
          price: parseFloat(form.price),
          stock: parseInt(form.stock || '0'),
          unit: form.unit,
          description: `Fresh organic ${form.name}`,
          imageUrl:
            form.imageUrl ||
            ORGANIC_PRODUCT_PRESETS[0]?.url ||
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
        });
      } catch {}
    }
    setIsSaving(false);
    setModal(null);
    loadProducts();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Product', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await productService.deleteProduct(id);
          } catch {}
          loadProducts();
        },
      },
    ]);
  };

  return (
    <View className="flex-1">
      <SectionHeader title={`Products (${products.length})`} action={{ label: '+ Add', onPress: openAdd }} />
      <View className="flex-row items-center bg-white rounded-xl border border-[#E2EBE6] px-3 mb-2.5 h-10">
        <Search size={15} color={C.textMuted} />
        <TextInput
          className="flex-1 text-[13px] text-[#1a1a2e] ml-2"
          placeholder="Search products…"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={C.textMuted}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(p => (
          <View
            key={p.id}
            className="bg-white rounded-xl p-3 mb-2 flex-row items-center border border-[#E2EBE6] shadow-sm"
          >
            <Image
              source={{
                uri:
                  p.imageUrl ||
                  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
              }}
              className="w-12 h-12 rounded-xl mr-2.5 bg-[#E2EBE6]"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-sm font-bold text-[#1a1a2e]" numberOfLines={1}>
                {p.name}
              </Text>
              <Text className="text-xs text-[#5a6a63] mt-0.5">
                {typeof p.category === 'object' && p.category !== null
                  ? (p.category as any).name
                  : String(p.category || 'Organic')}
              </Text>
              <View className="flex-row gap-2 mt-1">
                <Text className="text-sm font-bold text-[#2D6A4F]">₹{p.price}</Text>
                <Text
                  className={`text-xs font-semibold ${
                    p.stock <= p.minStock ? 'text-[#ef4444]' : 'text-[#22c55e]'
                  }`}
                >
                  {p.stock} {p.unit}
                </Text>
              </View>
            </View>
            <View className="items-end gap-1.5">
              <Chip
                label={p.stock === 0 ? 'Inactive' : p.stock <= p.minStock ? 'Low Stock' : 'Active'}
                color={statusColor(
                  p.stock === 0 ? 'Inactive' : p.stock <= p.minStock ? 'Low Stock' : 'Active'
                )}
              />
              <View className="flex-row gap-1.5">
                <TouchableOpacity
                  className="p-1 px-2.5 rounded-lg bg-[#F7FAF8] border border-[#E2EBE6]"
                  onPress={() => openEdit(p)}
                >
                  <Pencil size={13} color={C.textSec} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-1 px-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]"
                  onPress={() => handleDelete(p.id)}
                >
                  <Trash2 size={13} color={C.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        {filtered.length === 0 && (
          <Text className="text-center text-[#9aada6] text-sm py-10">No products found</Text>
        )}
        <View className="h-5" />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={!!modal} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setModal(null)}
        >
          <View
            className="bg-white rounded-t-3xl p-5 pb-8 max-h-[85%]"
            onStartShouldSetResponder={() => true}
          >
            <View className="w-9 h-1 bg-[#E2EBE6] rounded-full self-center mb-4" />
            <View className="flex-row items-center gap-2 mb-4">
              {modal === 'add' ? (
                <Plus size={18} color={C.primary} strokeWidth={2.5} />
              ) : (
                <Pencil size={18} color={C.primary} strokeWidth={2.5} />
              )}
              <Text className="text-base font-extrabold text-[#1a1a2e]">
                {modal === 'add' ? 'Add Product' : 'Edit Product'}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
                Product Name *
              </Text>
              <TextInput
                className="border border-[#E2EBE6] rounded-xl px-3 h-11 text-sm text-[#1a1a2e] bg-[#F7FAF8]"
                value={form.name}
                onChangeText={v => setForm({ ...form, name: v })}
                placeholder="e.g. Organic A2 Cow Milk"
                placeholderTextColor={C.textMuted}
              />
              <View className="flex-row gap-2.5">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
                    Price (₹) *
                  </Text>
                  <TextInput
                    className="border border-[#E2EBE6] rounded-xl px-3 h-11 text-sm text-[#1a1a2e] bg-[#F7FAF8]"
                    value={form.price}
                    onChangeText={v => setForm({ ...form, price: v })}
                    keyboardType="numeric"
                    placeholder="120"
                    placeholderTextColor={C.textMuted}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
                    Stock
                  </Text>
                  <TextInput
                    className="border border-[#E2EBE6] rounded-xl px-3 h-11 text-sm text-[#1a1a2e] bg-[#F7FAF8]"
                    value={form.stock}
                    onChangeText={v => setForm({ ...form, stock: v })}
                    keyboardType="numeric"
                    placeholder="50"
                    placeholderTextColor={C.textMuted}
                  />
                </View>
              </View>
              <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
                Unit
              </Text>
              <TextInput
                className="border border-[#E2EBE6] rounded-xl px-3 h-11 text-sm text-[#1a1a2e] bg-[#F7FAF8]"
                value={form.unit}
                onChangeText={v => setForm({ ...form, unit: v })}
                placeholder="Kg / Litre / Jar"
                placeholderTextColor={C.textMuted}
              />
              <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                {Categories.filter(c => c !== 'All').map(c => (
                  <TouchableOpacity
                    key={c}
                    className={`py-1.5 px-3 rounded-xl border mr-1.5 ${
                      form.category === c ? 'bg-[#0D2B1D] border-[#0D2B1D]' : 'bg-white border-[#E2EBE6]'
                    }`}
                    onPress={() => setForm({ ...form, category: c })}
                  >
                    <Text
                      className={`text-xs ${
                        form.category === c ? 'text-white font-bold' : 'text-[#5a6a63]'
                      }`}
                      numberOfLines={1}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Product Photo Selection & Live Preview */}
              <View className="flex-row justify-between items-center mt-2.5 mb-1">
                <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider">
                  Product Photo (Gallery or Camera)
                </Text>
                {isUploadingImage ? (
                  <Text className="text-2xs text-[#2D6A4F] font-bold">Uploading...</Text>
                ) : (
                  <Text className="text-xs text-[#2D6A4F] font-bold">✓ Verified Food-Grade</Text>
                )}
              </View>

              {/* Gallery & Camera Upload Buttons */}
              <View className="flex-row gap-2 mb-2">
                <TouchableOpacity
                  className="flex-1 flex-row items-center gap-1.5 px-2 py-2 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]"
                  onPress={handlePickFromGallery}
                  disabled={isUploadingImage}
                  activeOpacity={0.8}
                >
                  <Upload size={14} color={C.primaryLight} />
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-[#2D6A4F]">Choose from Gallery</Text>
                    <Text className="text-2xs text-[#9aada6]">Pick from photos</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 flex-row items-center gap-1.5 px-2 py-2 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD]"
                  onPress={handleTakePhoto}
                  disabled={isUploadingImage}
                  activeOpacity={0.8}
                >
                  <Camera size={14} color="#0284C7" />
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-[#0284C7]">Take Camera Photo</Text>
                    <Text className="text-2xs text-[#9aada6]">Snap fresh produce</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Live Image Preview Card */}
              <View className="h-32 rounded-xl overflow-hidden bg-[#F1F5F9] border border-[#E2EBE6] mb-2 relative">
                <Image
                  source={{
                    uri:
                      form.imageUrl ||
                      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute bottom-1.5 left-1.5 bg-[#0D2B1D]/85 px-2 py-1 rounded-md flex-row items-center gap-1">
                  <Sprout size={10} color="#A7F3D0" />
                  <Text className="text-white text-2xs font-bold">Live HD Food Photo Preview</Text>
                </View>
              </View>

              {/* Quick Presets Row */}
              <Text className="text-xs text-[#9aada6] mb-1 font-semibold">
                Select Curated Organic Preset:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                {ORGANIC_PRODUCT_PRESETS.map(item => {
                  const isSelected = form.imageUrl === item.url;
                  const isMatchCat = item.category === form.category;
                  return (
                    <TouchableOpacity
                      key={item.label}
                      className={`flex-row items-center gap-1.5 px-2 py-1.5 rounded-xl border mr-2 ${
                        isSelected
                          ? 'border-[#2D6A4F] bg-[#E8F5E9]'
                          : isMatchCat
                          ? 'border-[#A7F3D0] bg-[#F0FDF4]'
                          : 'border-[#E2EBE6] bg-white'
                      }`}
                      onPress={() => setForm({ ...form, imageUrl: item.url })}
                    >
                      <Image source={{ uri: item.url }} className="w-5 h-5 rounded-full" />
                      <Text
                        className={`text-xs ${
                          isSelected ? 'text-[#2D6A4F] font-bold' : 'text-[#1a1a2e] font-medium'
                        }`}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Custom Image URL Option */}
              <TextInput
                className="border border-[#E2EBE6] rounded-xl px-3 h-11 text-xs text-[#1a1a2e] bg-[#F7FAF8] mb-3"
                value={form.imageUrl}
                onChangeText={v => setForm({ ...form, imageUrl: v })}
                placeholder="Or paste custom image link (https://...)"
                placeholderTextColor={C.textMuted}
              />

              <View className="flex-row gap-2.5 mt-3">
                <AppButton variant="outline" title="Cancel" onPress={() => setModal(null)} style={{ flex: 1 }} />
                <AppButton
                  variant="primary"
                  title="Save Product"
                  loading={isSaving}
                  loadingText="Saving..."
                  onPress={handleSave}
                  style={{ flex: 1.5 }}
                />
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
