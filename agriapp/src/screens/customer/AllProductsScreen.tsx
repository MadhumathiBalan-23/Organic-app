import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Search } from 'lucide-react-native';
import { Product } from '../../constants/mockData';

interface AllProductsScreenProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categories: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  getCategoryIcon: (cat: string, color: string) => React.ReactNode;
  filteredProducts: Product[];
  renderProductCard: (p: Product) => React.ReactNode;
  onBack: () => void;
}

export const AllProductsScreen: React.FC<AllProductsScreenProps> = ({
  searchQuery,
  setSearchQuery,
  categories,
  activeCategory,
  setActiveCategory,
  getCategoryIcon,
  filteredProducts,
  renderProductCard,
  onBack,
}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="p-4 pb-28" className="flex-1 bg-[#FDFBF7]">
      {/* Search Input */}
      <View className="flex-row items-center bg-white rounded-full px-4 py-2.5 border border-slate-200 mb-3.5 shadow-sm">
        <View className="mr-2.5">
          <Search size={18} color="#9aada6" />
        </View>
        <TextInput
          className="flex-1 text-sm text-slate-800"
          placeholder="Search organic crops, vegetables, grains..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9aada6"
        />
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3.5">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              className={`flex-row items-center gap-1.5 rounded-full py-2 px-3.5 mr-2 border shadow-sm ${
                isActive ? 'bg-emerald-700 border-emerald-700' : 'bg-white border-slate-200'
              }`}
              onPress={() => setActiveCategory(cat)}
            >
              {getCategoryIcon(cat, isActive ? '#FFFFFF' : '#07843D')}
              <Text className={`text-sm font-semibold ${isActive ? 'text-white font-bold' : 'text-slate-600'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <View className="items-center py-12">
          <Text className="text-sm font-semibold text-slate-500">No products found matching "{searchQuery}"</Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {filteredProducts.map((p) => renderProductCard(p))}
        </View>
      )}
    </ScrollView>
  );
};

export default AllProductsScreen;
