import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Plus,
  CircleCheck,
  TriangleAlert,
  X,
  Camera,
  Upload,
  Sprout,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Product, Categories } from '../../../constants/mockData';
import { API_ENDPOINTS, uploadImageFile } from '../../../services';
import { AppButton } from '../../../components/LoadingAndError';
import {
  VC,
  IMAGE_PRESETS,
  AVAILABLE_UNITS,
  BENEFIT_OPTIONS,
} from '../types';

interface AddCropModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (crop: Product) => void;
  showToast: (msg: string) => void;
}

export const AddCropModal: React.FC<AddCropModalProps> = ({
  visible,
  onClose,
  onSuccess,
  showToast,
}) => {
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState(Categories[0] || 'Vegetables');
  const [pPrice, setPPrice] = useState('');
  const [pStock, setPStock] = useState('50');
  const [pMinStock, setPMinStock] = useState('10');
  const [pUnit, setPUnit] = useState('Kg');
  const [pDescription, setPDescription] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const toggleBenefit = (b: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
  };

  const handlePickFromGallery = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant photo gallery permission to choose product photos.'
        );
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
        const dataUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        const uploadedUrl = await uploadImageFile(
          dataUri,
          `crop-gal-${Date.now()}.jpg`
        );
        setPImageUrl(uploadedUrl);
        showToast('Photo chosen from gallery successfully!');
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
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant camera permission to snap fresh crop photos.'
        );
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
        const dataUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        const uploadedUrl = await uploadImageFile(
          dataUri,
          `crop-cam-${Date.now()}.jpg`
        );
        setPImageUrl(uploadedUrl);
        showToast('Fresh camera photo captured and saved!');
      }
    } catch (err: any) {
      console.warn('Camera capture error:', err);
      Alert.alert('Camera Error', 'Could not open camera.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePublishCrop = async () => {
    setModalError(null);
    if (!pName.trim()) {
      setModalError('Please enter the crop / product name.');
      return;
    }
    const numPrice = parseFloat(pPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setModalError('Please enter a valid price in ₹.');
      return;
    }
    const numStock = parseInt(pStock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setModalError('Please enter a valid stock quantity.');
      return;
    }

    setIsPublishing(true);

    const newCrop: Product = {
      id: 'c_' + Date.now(),
      name: pName.trim(),
      category: pCategory,
      price: numPrice,
      unit: pUnit,
      rating: 4.9,
      stock: numStock,
      minStock: parseInt(pMinStock, 10) || 10,
      availabilityStart: '06:00 AM',
      availabilityEnd: '09:00 PM',
      description:
        pDescription.trim() || 'Fresh organic harvest direct from farmer.',
      benefits:
        selectedBenefits.length > 0
          ? selectedBenefits
          : ['100% Pesticide Free'],
      imageUrl: pImageUrl.trim() || IMAGE_PRESETS[0].url,
      subscriptionAllowed: true,
      oneTimeAllowed: true,
      organicCertified: true,
    };

    try {
      await fetch(API_ENDPOINTS.products, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCrop.name,
          categoryName: newCrop.category,
          price: newCrop.price,
          unit: newCrop.unit,
          stock: newCrop.stock,
          minStock: newCrop.minStock,
          description: newCrop.description,
          benefits: newCrop.benefits,
          imageUrl: newCrop.imageUrl,
          organicCertified: true,
        }),
      });
    } catch {
      // Offline fallback
    }

    setIsPublishing(false);
    setPName('');
    setPPrice('');
    setPStock('50');
    setModalError(null);
    onSuccess(newCrop);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/55 justify-center items-center p-3.5">
        <View className="w-full max-w-[440px] bg-white rounded-2xl p-5 shadow-lg">
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <Text className="text-base font-bold text-slate-900">
                Publish New Organic Crop
              </Text>
              <Text className="text-xs text-slate-500 mt-0.5">
                Saves to Prisma DB & syncs to store
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="max-h-[460px]"
          >
            {modalError && (
              <View className="flex-row items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg p-2 mb-2.5">
                <TriangleAlert size={14} color="#DC2626" />
                <Text className="text-xs text-rose-600 font-semibold">
                  {modalError}
                </Text>
              </View>
            )}

            {/* Crop Name */}
            <Text className="text-xs font-bold text-slate-700 mb-1 mt-2">
              Crop / Product Name *
            </Text>
            <TextInput
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
              placeholder="e.g. Organic Red Bell Peppers"
              placeholderTextColor="#94A3B8"
              value={pName}
              onChangeText={setPName}
            />

            {/* Price & Unit */}
            <View className="flex-row gap-2.5">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 mb-1 mt-2">
                  Price (₹) *
                </Text>
                <TextInput
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  placeholder="75"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={pPrice}
                  onChangeText={setPPrice}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 mb-1 mt-2">
                  Unit
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row mt-0.5"
                >
                  {AVAILABLE_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      className={`px-2.5 py-2 rounded-lg border mr-1.5 ${
                        pUnit === u
                          ? 'bg-emerald-700 border-emerald-700'
                          : 'bg-slate-100 border-slate-200'
                      }`}
                      onPress={() => setPUnit(u)}
                    >
                      <Text
                        className={`text-xs ${
                          pUnit === u
                            ? 'text-white font-bold'
                            : 'text-slate-600 font-semibold'
                        }`}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Stock Quantity & Min Safety Stock */}
            <View className="flex-row gap-2.5">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 mb-1 mt-2">
                  Initial Stock Qty
                </Text>
                <TextInput
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  placeholder="50"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={pStock}
                  onChangeText={setPStock}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 mb-1 mt-2">
                  Min Alert Threshold
                </Text>
                <TextInput
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  placeholder="10"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={pMinStock}
                  onChangeText={setPMinStock}
                />
              </View>
            </View>

            {/* Category Selector */}
            <Text className="text-xs font-bold text-slate-700 mb-1 mt-2">
              Category *
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row my-1"
            >
              {Categories.filter((c) => c !== 'All').map((c) => {
                const isSelected = pCategory === c;
                return (
                  <TouchableOpacity
                    key={c}
                    className={`px-3 py-1.5 rounded-full mr-2 border ${
                      isSelected
                        ? 'bg-emerald-700 border-emerald-700'
                        : 'bg-slate-100 border-slate-200'
                    }`}
                    onPress={() => setPCategory(c)}
                  >
                    <Text
                      className={`text-xs ${
                        isSelected
                          ? 'text-white font-bold'
                          : 'text-slate-600 font-semibold'
                      }`}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Product Photo Selection & Live Preview */}
            <View className="flex-row justify-between items-center mt-3 mb-1">
              <Text className="text-xs font-bold text-slate-700">
                Product Photo (Gallery / Camera)
              </Text>
              {isUploadingImage ? (
                <View className="flex-row items-center gap-1">
                  <ActivityIndicator size="small" color={VC.primary} />
                  <Text className="text-2xs text-emerald-900 font-bold">
                    Uploading...
                  </Text>
                </View>
              ) : (
                <Text className="text-xs text-emerald-700 font-bold">
                  ✓ Verified Food-Grade
                </Text>
              )}
            </View>

            {/* Gallery & Camera Upload Buttons */}
            <View className="flex-row gap-2 my-1.5">
              <TouchableOpacity
                className="flex-1 flex-row items-center gap-2 px-2.5 py-2.5 rounded-xl border-[1.5px] bg-emerald-50 border-emerald-300"
                onPress={handlePickFromGallery}
                disabled={isUploadingImage}
                activeOpacity={0.8}
              >
                <Upload size={16} color={VC.primary} />
                <View className="flex-1">
                  <Text className="text-xs font-bold text-emerald-900">
                    Choose from Gallery
                  </Text>
                  <Text className="text-2xs text-slate-500 mt-0.5">
                    Pick from phone photos
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 flex-row items-center gap-2 px-2.5 py-2.5 rounded-xl border-[1.5px] bg-sky-50 border-sky-300"
                onPress={handleTakePhoto}
                disabled={isUploadingImage}
                activeOpacity={0.8}
              >
                <Camera size={16} color="#0284C7" />
                <View className="flex-1">
                  <Text className="text-xs font-bold text-sky-600">
                    Take Camera Photo
                  </Text>
                  <Text className="text-2xs text-slate-500 mt-0.5">
                    Snap fresh harvest
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Live Image Preview Card */}
            <View className="h-[125px] rounded-xl overflow-hidden bg-slate-100 border border-slate-300 my-2 relative justify-center items-center">
              <Image
                source={{
                  uri:
                    pImageUrl.trim() ||
                    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
                }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View className="absolute bottom-2 left-2 bg-[#064E3B]/85 px-2 py-1 rounded flex-row items-center gap-1">
                <Sprout size={11} color="#A7F3D0" />
                <Text className="text-white text-2xs font-bold">
                  Live Preview (Stored in DB)
                </Text>
              </View>
            </View>

            {/* Photo Presets Horizontal Row */}
            <Text className="text-xs text-slate-500 mb-1 font-semibold">
              Or Select from Organic Presets:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row my-1.5"
            >
              {IMAGE_PRESETS.map((item) => {
                const isSelected = pImageUrl === item.url;
                const isMatchCat = item.category === pCategory;
                return (
                  <TouchableOpacity
                    key={item.label}
                    className={`flex-row items-center border rounded-xl px-2 py-1.5 mr-2 gap-1.5 ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50'
                        : isMatchCat
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'bg-slate-50 border-slate-300'
                    }`}
                    onPress={() => setPImageUrl(item.url)}
                  >
                    <Image
                      source={{ uri: item.url }}
                      className="w-[22px] h-[22px] rounded-full"
                    />
                    <Text
                      className={`text-xs ${
                        isSelected
                          ? 'text-emerald-700 font-bold'
                          : 'text-slate-700 font-semibold'
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
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 mt-1 mb-3"
              value={pImageUrl}
              onChangeText={setPImageUrl}
              placeholder="Or paste custom image link (https://...)"
              placeholderTextColor="#94A3B8"
            />

            {/* Key Organic Benefits */}
            <Text className="text-xs font-bold text-slate-700 mb-1 mt-2">
              Key Organic Benefits
            </Text>
            <View className="flex-row flex-wrap gap-1.5 my-1">
              {BENEFIT_OPTIONS.map((b) => {
                const isChecked = selectedBenefits.includes(b);
                return (
                  <TouchableOpacity
                    key={b}
                    className={`px-2.5 py-1 rounded-full border flex-row items-center gap-1 ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-slate-100 border-slate-200'
                    }`}
                    onPress={() => toggleBenefit(b)}
                  >
                    {isChecked ? (
                      <CircleCheck size={11} color={VC.primary} />
                    ) : (
                      <Plus size={11} color={VC.textMuted} />
                    )}
                    <Text
                      className={`text-2xs ${
                        isChecked
                          ? 'text-emerald-700 font-bold'
                          : 'text-slate-500 font-semibold'
                      }`}
                    >
                      {b}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description */}
            <Text className="text-xs font-bold text-slate-700 mb-1 mt-2">
              Farm Description
            </Text>
            <TextInput
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 h-[60px]"
              placeholder="Harvested fresh from organic soil."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={2}
              value={pDescription}
              onChangeText={setPDescription}
            />
          </ScrollView>

          <AppButton
            title="Publish Crop to Market & DB"
            loading={isPublishing}
            loadingText="Publishing crop..."
            onPress={handlePublishCrop}
            size="large"
            className="mt-3.5"
          />
        </View>
      </View>
    </Modal>
  );
};
