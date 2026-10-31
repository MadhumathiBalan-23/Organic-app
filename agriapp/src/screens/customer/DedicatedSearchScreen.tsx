import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  ArrowLeft,
  X,
  Sprout,
  Star,
  ChevronRight,
  TrendingUp,
  Tag,
} from 'lucide-react-native';
import { Product } from '../../constants/mockData';
import { customerService, productService } from '../../services';
import { CustomerCategoryItem } from '../../services/customer.service';

export interface DedicatedSearchScreenProps {
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (categoryId: string, categoryName: string) => void;
  onAddToCart?: (product: Product) => void;
}

export const DedicatedSearchScreen: React.FC<DedicatedSearchScreenProps> = ({
  onBack,
  onSelectProduct,
  onSelectCategory,
  onAddToCart,
}) => {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<CustomerCategoryItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load live dynamic categories & products on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      customerService.getCategories().catch(() => []),
      productService.getProducts().catch(() => []),
    ]).then(([cats, prods]) => {
      if (!isMounted) return;
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(prods)) setAllProducts(prods);
      setIsLoading(false);
    });

    // Auto focus search input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);

    return () => {
      isMounted = false;
    };
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  // Filter categories matching query
  const matchingCategories = cleanQuery.length > 0
    ? categories.filter(c => c.name.toLowerCase().includes(cleanQuery))
    : [];

  // Filter products matching name, category, or description
  const matchingProducts = cleanQuery.length > 0
    ? allProducts.filter(p => {
        const nameMatch = p.name?.toLowerCase().includes(cleanQuery);
        const catMatch = (p.category || '').toLowerCase().includes(cleanQuery);
        const vendorMatch = (p.vendorName || p.brand || '').toLowerCase().includes(cleanQuery);
        const descMatch = (p.description || '').toLowerCase().includes(cleanQuery);
        return nameMatch || catMatch || vendorMatch || descMatch;
      })
    : [];

  const topSuggestions = [
    'Carrot',
    'A2 Milk',
    'Country Ghee',
    'Fresh Tomatoes',
    'Cold-pressed Sesame Oil',
    'Greens & Spinach',
  ];

  return (
    <View className="flex-1 bg-[#F9FAF9]">
      {/* Top Search Bar Header */}
      <View
        className="bg-white border-b border-slate-200 px-3 pb-3 shadow-xs"
        style={{
          paddingTop: Platform.OS === 'web' ? 12 : Math.max(insets.top, 16) + 4,
        }}
      >
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={onBack}
            className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center shrink-0"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={20} color="#1E293B" />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center bg-slate-100 rounded-2xl px-3.5 h-11 border border-slate-200">
            <Search size={18} color="#07843D" />
            <TextInput
              ref={inputRef}
              className="flex-1 text-sm text-slate-800 ml-2.5 font-medium"
              placeholder="Search products, crops, categories..."
              placeholderTextColor="#94A3B8"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="p-1"
              >
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Main Content Body */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center p-8">
          <ActivityIndicator size="large" color="#07843D" />
          <Text className="text-xs font-bold text-slate-500 mt-2">Searching organic catalog...</Text>
        </View>
      ) : cleanQuery.length === 0 ? (
        /* Empty State: Trending Searches & Dynamic Category Pills */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        >
          <View className="flex-row items-center gap-1.5 mb-2.5">
            <TrendingUp size={16} color="#07843D" />
            <Text className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Popular Organic Searches
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {topSuggestions.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setQuery(item)}
                className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl active:bg-slate-50"
              >
                <Text className="text-xs font-semibold text-slate-700">{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row items-center gap-1.5 mb-2.5">
            <Tag size={16} color="#07843D" />
            <Text className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Explore By Category
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => onSelectCategory(cat.id, cat.name)}
                className="flex-row items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl active:bg-emerald-100"
              >
                <Sprout size={14} color="#07843D" />
                <Text className="text-xs font-bold text-emerald-900">{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : matchingCategories.length === 0 && matchingProducts.length === 0 ? (
        /* No Results Found */
        <View className="flex-1 items-center justify-center p-8">
          <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-3">
            <Search size={28} color="#94A3B8" />
          </View>
          <Text className="text-base font-extrabold text-slate-800">No results found</Text>
          <Text className="text-xs text-slate-500 text-center mt-1">
            No crops or categories match "{query}". Try checking spelling or search a different keyword.
          </Text>
        </View>
      ) : (
        /* Live Search Results: Matching Categories on top, Matching Products below */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 14, paddingBottom: 80 }}
          keyboardShouldPersistTaps="always"
        >
          {/* Matching Categories Section */}
          {matchingCategories.length > 0 && (
            <View className="mb-4">
              <Text className="text-2xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Matching Categories ({matchingCategories.length})
              </Text>
              {matchingCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => onSelectCategory(cat.id, cat.name)}
                  className="flex-row items-center justify-between bg-white border border-slate-200 p-3 rounded-xl mb-2 active:bg-slate-50"
                >
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-8 h-8 rounded-lg bg-emerald-50 items-center justify-center border border-emerald-200">
                      <Sprout size={16} color="#07843D" />
                    </View>
                    <Text className="text-sm font-bold text-slate-800">{cat.name}</Text>
                  </View>
                  <ChevronRight size={16} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Matching Products Section */}
          {matchingProducts.length > 0 && (
            <View>
              <Text className="text-2xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Matching Products ({matchingProducts.length})
              </Text>
              {matchingProducts.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => onSelectProduct(p)}
                  className="flex-row items-center bg-white border border-slate-200 p-3 rounded-2xl mb-2.5 active:bg-slate-50 shadow-xs"
                >
                  <Image
                    source={{
                      uri:
                        p.imageUrl ||
                        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=300',
                    }}
                    className="w-16 h-16 rounded-xl bg-slate-100 mr-3"
                    resizeMode="cover"
                  />
                  <View className="flex-1 justify-center">
                    <View className="flex-row items-center gap-1.5 mb-0.5">
                      <Text className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 self-start">
                        {p.category || 'Organic'}
                      </Text>
                    </View>
                    <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text className="text-[11px] text-slate-500 font-medium">
                      ₹{p.price} / {p.unit || 'Kg'}
                    </Text>
                  </View>

                  {onAddToCart && (
                    <TouchableOpacity
                      onPress={() => onAddToCart(p)}
                      className="bg-[#07843D] px-3 py-1.5 rounded-xl ml-2 active:bg-[#046A31]"
                    >
                      <Text className="text-white text-xs font-bold">ADD</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default DedicatedSearchScreen;
