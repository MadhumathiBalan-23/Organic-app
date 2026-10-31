import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Search,
  ChevronLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Heart,
  Store,
  SlidersHorizontal,
  ArrowUpDown,
  ShoppingBag,
} from 'lucide-react-native';
import { Product } from '../../constants/mockData';
import {
  customerService,
  VendorCatalogResponse,
  PaginationMetadata,
} from '../../services/customer.service';

const CARD_WIDTH: any = '48.5%';

interface VendorStoreScreenProps {
  vendorId: string;
  vendorName?: string;
  initialCategoryId?: string;
  cart: { product: Product; qty: number }[];
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  addToCart: (product: Product) => void;
  updateCartQty: (product: Product, delta: number) => void;
  onOpenDetails: (product: Product) => void;
  onBack: () => void;
}

export const VendorStoreScreen: React.FC<VendorStoreScreenProps> = ({
  vendorId,
  vendorName: initialVendorName,
  initialCategoryId,
  cart,
  favorites,
  toggleFavorite,
  addToCart,
  updateCartQty,
  onOpenDetails,
  onBack,
}) => {
  const [vendorData, setVendorData] = useState<VendorCatalogResponse['vendor'] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'priceLowToHigh' | 'priceHighToLow' | 'highestRated'>('recommended');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationMetadata>({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Fetch Vendor Catalog
  const fetchCatalog = useCallback(
    async (pageNumber = 1) => {
      if (pageNumber === 1) setIsLoading(true);
      const res = await customerService.getVendorProducts(vendorId, {
        categoryId: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: debouncedSearch || undefined,
        sortBy,
        page: pageNumber,
        pageSize: 10,
      });

      if (res && res.success) {
        setVendorData(res.vendor);
        if (pageNumber === 1) {
          setProducts(res.data);
        } else {
          setProducts((prev) => {
            const set = new Set(prev.map((p) => p.id));
            const unique = res.data.filter((p) => !set.has(p.id));
            return [...prev, ...unique];
          });
        }
        setPagination(res.pagination);
      }
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    },
    [vendorId, selectedCategory, debouncedSearch, sortBy]
  );

  useEffect(() => {
    fetchCatalog(1);
  }, [fetchCatalog]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchCatalog(1);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !pagination.hasNextPage || isLoading) return;
    setIsLoadingMore(true);
    fetchCatalog(pagination.currentPage + 1);
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const cartEntry = cart.find((c) => c.product.id === item.id);
    const qty = cartEntry ? cartEntry.qty : 0;
    const isFav = favorites.includes(item.id);

    return (
      <TouchableOpacity
        style={{ width: CARD_WIDTH }}
        className="bg-white rounded-2xl p-2.5 mb-3 border border-[#E2EBE5] shadow-sm relative"
        onPress={() => onOpenDetails(item)}
        activeOpacity={0.88}
      >
        <View className="flex-row items-center justify-between mb-1.5">
          <View className="bg-[#E7F5EB] border border-[#D5E8DC] px-2 py-0.5 rounded-md max-w-[80%]">
            <Text className="text-[10px] font-extrabold uppercase text-[#07843D]" numberOfLines={1}>
              {item.category || 'Harvest'}
            </Text>
          </View>
        </View>

        <View className="w-full h-28 rounded-xl overflow-hidden bg-slate-50 items-center justify-center mb-2">
          <Image
            source={{
              uri:
                item.imageUrl ||
                'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400',
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <Text className="text-sm font-bold text-slate-900 tracking-tight" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-xs font-semibold text-slate-500 mt-0.5" numberOfLines={1}>
          {item.unit || '1 Kg'}
        </Text>

        <View className="flex-row items-center justify-between mt-2 pt-1 border-t border-slate-100">
          <View>
            <Text className="text-base font-black text-slate-900">₹{item.price}</Text>
            {item.originalPrice && item.originalPrice > item.price ? (
              <Text className="text-2xs text-slate-400 line-through">₹{item.originalPrice}</Text>
            ) : null}
          </View>

          {qty > 0 ? (
            <View className="flex-row items-center bg-[#E7F5EB] border border-[#07843D] rounded-lg px-2 py-0.5 gap-2">
              <TouchableOpacity
                className="w-5 h-5 rounded items-center justify-center bg-[#07843D]"
                onPress={() => updateCartQty(item, -1)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text className="text-white text-xs font-black">−</Text>
              </TouchableOpacity>
              <Text className="text-xs font-black text-[#07843D]">{qty}</Text>
              <TouchableOpacity
                className="w-5 h-5 rounded items-center justify-center bg-[#07843D]"
                onPress={() => updateCartQty(item, 1)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text className="text-white text-xs font-black">+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-[#07843D] px-3.5 py-1.5 rounded-lg shadow-sm"
              onPress={() => addToCart(item)}
              activeOpacity={0.8}
            >
              <Text className="text-white text-xs font-black">ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const categories = ['All', ...(vendorData?.categories || [])];

  return (
    <View className="flex-1 bg-[#F0F7F2]">
      {/* ── Top Header ── */}
      <View className="bg-[#07843D] px-4 pt-3 pb-4 shadow-md">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={onBack}
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <View className="flex-1 ml-3">
            <Text className="text-white text-base font-black tracking-tight" numberOfLines={1}>
              {vendorData?.businessName || initialVendorName || 'Partner Farm'}
            </Text>
            <Text className="text-white/80 text-xs font-medium">Direct Farm Catalog</Text>
          </View>
          <View className="flex-row items-center bg-[#FEF9C3] px-2 py-0.5 rounded-lg">
            <Star size={12} color="#D97706" fill="#D97706" />
            <Text className="text-xs font-black text-[#854D0E] ml-1">
              {(vendorData?.rating || 4.8).toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Farm Info Card */}
        <View className="bg-white/10 rounded-2xl p-3 border border-white/20">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-2">
              <MapPin size={14} color="#86EFAC" />
              <Text className="text-xs text-white/90 font-semibold ml-1.5" numberOfLines={1}>
                {vendorData?.address || 'Tamil Nadu, India'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Clock size={14} color="#FDE047" />
              <Text className="text-xs font-black text-[#FDE047] ml-1">30–45 mins</Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-white/10">
            <Text className="text-2xs text-white/80 font-medium">
              Owner: <Text className="font-bold text-white">{vendorData?.ownerName || 'Partner Farmer'}</Text>
            </Text>
            <Text className="text-2xs text-white/80 font-medium">
              Delivery: <Text className="font-bold text-white">Within {vendorData?.deliveryRadiusKm || 15} Km</Text>
            </Text>
          </View>
        </View>

        {/* In-Store Search Bar */}
        <View className="flex-row items-center bg-white rounded-xl px-3.5 py-2 mt-3 shadow-sm">
          <Search size={18} color="#07843D" />
          <TextInput
            className="flex-1 ml-2.5 text-sm text-slate-800"
            placeholder={`Search crops in ${vendorData?.businessName || 'store'}...`}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={(t) => {
              setSearchQuery(t);
              setDebouncedSearch(t.trim());
            }}
          />
        </View>
      </View>

      {/* ── Category Pills Horizontal Bar ── */}
      {categories.length > 1 ? (
        <View className="bg-white border-b border-[#DFE9E1] py-2 px-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full border ${
                    isSelected ? 'bg-[#07843D] border-[#07843D]' : 'bg-white border-slate-200'
                  }`}
                >
                  <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* ── Products List ── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center p-8">
          <ActivityIndicator size="large" color="#07843D" />
          <Text className="text-xs font-bold text-slate-600 mt-2.5">Loading vendor catalog...</Text>
        </View>
      ) : products.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <ShoppingBag size={32} color="#07843D" />
          <Text className="text-sm font-black text-slate-900 mt-2">No Products Available</Text>
          <Text className="text-xs font-semibold text-slate-500 text-center mt-1">
            This vendor currently does not have active crops matching your selection.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ padding: 12, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#07843D']} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#07843D" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default VendorStoreScreen;
