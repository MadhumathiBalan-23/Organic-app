import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Sprout,
  Plus,
  Search,
  X,
  Lock,
  Trash,
  ShieldAlert,
} from 'lucide-react-native';
import { Product, Categories } from '../../constants/mockData';
import { getCategoryName } from './types';

interface VendorCropsScreenProps {
  productList: Product[];
  onOpenAddModal: () => void;
  onRequestDeleteCrop: (id: string, name: string) => void;
  onStockAdjust: (id: string, delta: number) => void;
  onToggleStockStatus: (id: string) => void;
}

export const VendorCropsScreen: React.FC<VendorCropsScreenProps> = ({
  productList,
  onOpenAddModal,
  onRequestDeleteCrop,
  onStockAdjust,
  onToggleStockStatus,
}) => {
  const [cropSearch, setCropSearch] = useState('');
  const [selectedCropCategory, setSelectedCropCategory] = useState('All');

  const filteredCrops = productList.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(cropSearch.toLowerCase());
    const itemCat = getCategoryName(item.category);
    const matchesCat =
      selectedCropCategory === 'All' || itemCat === selectedCropCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <ScrollView
      contentContainerClassName="p-3.5 pb-10"
      showsVerticalScrollIndicator={false}
    >
      {/* Header Row */}
      <View className="flex-row justify-between items-center mb-2.5">
        <View>
          <Text className="text-base font-bold text-slate-900">
            Crop Inventory
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            {productList.length} products listed in database
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-1 bg-emerald-700 rounded-full px-3 py-1.5"
          onPress={onOpenAddModal}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={3} />
          <Text className="text-white text-xs font-bold">+ Add Crop</Text>
        </TouchableOpacity>
      </View>

      {/* Policy Banner: Deletion Restricted to Admin */}
      <View className="flex-row items-center bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-3 gap-2">
        <ShieldAlert size={15} color="#B45309" />
        <Text className="text-xs text-amber-900 flex-1 leading-4">
          <Text className="font-bold">Catalog Security Policy:</Text> Permanent
          deletion of crops is restricted to Admin. Vendors can pause customer
          orders anytime by toggling stock to "Out of Stock".
        </Text>
      </View>

      {/* Search Box */}
      <View className="flex-row items-center bg-white border border-slate-300 rounded-xl px-3 h-10 mb-2.5 gap-2">
        <Search size={16} color="#94A3B8" />
        <TextInput
          className="flex-1 text-sm text-slate-900"
          placeholder="Search your listed crops..."
          placeholderTextColor="#94A3B8"
          value={cropSearch}
          onChangeText={setCropSearch}
        />
        {cropSearch.length > 0 && (
          <TouchableOpacity onPress={() => setCropSearch('')}>
            <X size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row mb-3"
      >
        {['All', ...Categories.filter((c) => c !== 'All')].map((cat) => {
          const isSelected = selectedCropCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              className={`px-3 py-1.5 rounded-full border mr-2 ${
                isSelected
                  ? 'bg-emerald-700 border-emerald-700'
                  : 'bg-white border-slate-300'
              }`}
              onPress={() => setSelectedCropCategory(cat)}
            >
              <Text
                className={`text-xs ${
                  isSelected
                    ? 'text-white font-bold'
                    : 'text-slate-600 font-semibold'
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Crops List */}
      <View className="gap-2.5">
        {filteredCrops.length === 0 ? (
          <View className="bg-white rounded-2xl p-7 items-center justify-center border border-slate-200 gap-2.5">
            <Sprout size={36} color="#94A3B8" />
            <Text className="text-xs text-slate-500 text-center">
              No crops match your search or filter
            </Text>
            <TouchableOpacity
              className="bg-emerald-700 rounded-xl px-4 py-2 mt-1"
              onPress={onOpenAddModal}
            >
              <Text className="text-white text-xs font-bold">
                + Add a New Crop
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredCrops.map((item) => {
            const isLowStock = item.stock <= item.minStock;
            const isOutOfStock = item.stock === 0;

            return (
              <View
                key={item.id}
                className="flex-row bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-[90px] h-[105px] bg-slate-100"
                  resizeMode="cover"
                />

                <View className="flex-1 p-2.5 justify-between">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-1.5">
                      <Text
                        className="text-xs font-bold text-slate-900"
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text className="text-xs text-slate-500 mt-0.5">
                        {getCategoryName(item.category)} ·{' '}
                        <Text className="text-emerald-700 font-bold">
                          ₹{item.price}/{item.unit}
                        </Text>
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => onRequestDeleteCrop(item.id, item.name)}
                      className="flex-row items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200"
                      activeOpacity={0.7}
                    >
                      <Lock size={10} color="#DC2626" />
                      <Trash size={11} color="#DC2626" />
                      <Text className="text-2xs font-bold text-rose-600">
                        Admin Only
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Stock Alert Badge */}
                  <View className="my-1">
                    <Text
                      className={`text-xs font-bold ${
                        isOutOfStock
                          ? 'text-rose-600'
                          : isLowStock
                          ? 'text-amber-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {isOutOfStock
                        ? '● Out of Stock'
                        : isLowStock
                        ? `● Low Stock (${item.stock} left)`
                        : `● Stock: ${item.stock} ${item.unit}s`}
                    </Text>
                  </View>

                  {/* Actions Row: Stepper + Status Toggle */}
                  <View className="flex-row items-center justify-between mt-1">
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        className="w-6 h-6 rounded-full bg-slate-100 items-center justify-center border border-slate-300"
                        onPress={() => onStockAdjust(item.id, -1)}
                        activeOpacity={0.7}
                      >
                        <Text className="text-sm font-bold text-slate-900">
                          −
                        </Text>
                      </TouchableOpacity>
                      <Text className="text-sm font-bold text-slate-900 min-w-[20px] text-center">
                        {item.stock}
                      </Text>
                      <TouchableOpacity
                        className="w-6 h-6 rounded-full bg-slate-100 items-center justify-center border border-slate-300"
                        onPress={() => onStockAdjust(item.id, 1)}
                        activeOpacity={0.7}
                      >
                        <Text className="text-sm font-bold text-slate-900">
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      className={`px-2.5 py-1 rounded-full ${
                        item.stock > 0 ? 'bg-emerald-100' : 'bg-rose-100'
                      }`}
                      onPress={() => onToggleStockStatus(item.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-2xs font-bold ${
                          item.stock > 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {item.stock > 0 ? 'Active' : 'Restock'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};
