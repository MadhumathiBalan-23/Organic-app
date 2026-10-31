import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Check,
  Star,
  Heart,
  ChevronLeft,
  Sparkles,
  Store,
  Layers,
  ShoppingBag,
  LayoutGrid,
  Sprout,
} from 'lucide-react-native';
import { Product } from '../../constants/mockData';
import { customerService, ProductQueryParams, PaginationMetadata, CustomerCategoryItem } from '../../services/customer.service';
import { getGradientTheme } from '../../components/HomeHeader';
import { CommonHeader } from '../../components/CommonHeader';
import { CommonModal } from '../../components/CommonModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CARD_WIDTH: any = '48.5%';
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

interface CategoryProductListingScreenProps {
  categoryId?: string;
  categoryName?: string;
  vendorId?: string;
  vendorName?: string;
  cart: { product: Product; qty: number }[];
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  addToCart: (product: Product) => void;
  updateCartQty: (product: Product, delta: number) => void;
  onOpenDetails: (product: Product) => void;
  onOpenVendorStore?: (vendorId: string, vendorName?: string) => void;
  onOpenVendorDiscovery?: (categoryId?: string) => void;
  onBack: () => void;
  onOpenCart?: () => void;
  onOpenPlans?: () => void;
  headerThemeColor?: string;
}

export const CategoryProductListingScreen: React.FC<CategoryProductListingScreenProps> = ({
  categoryId: initialCategoryId,
  categoryName: initialCategoryName,
  vendorId: initialVendorId,
  vendorName: initialVendorName,
  cart,
  favorites,
  toggleFavorite,
  addToCart,
  updateCartQty,
  onOpenDetails,
  onOpenVendorStore,
  onOpenVendorDiscovery,
  onBack,
  onOpenCart,
  onOpenPlans,
  headerThemeColor,
}) => {
  const insets = useSafeAreaInsets();
  const gradient = getGradientTheme(headerThemeColor);
  const gradId = 'catGrad_' + (gradient.dark + gradient.light).replace(/[^a-zA-Z0-9]/g, '');

  const safeTop = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0);
  const headerTopPadding = Platform.OS === 'web' ? 12 : Math.max(safeTop, 16) + 4;

  // ── State ──
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(initialCategoryId);
  const [activeCategoryName, setActiveCategoryName] = useState<string>(initialCategoryName || 'All Products');
  const [categories, setCategories] = useState<CustomerCategoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [availableVendors, setAvailableVendors] = useState<{ id: string; name: string; rating: number }[]>([]);

  // Filter Modal State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<string[]>(initialVendorId ? [initialVendorId] : []);
  const [pricePreset, setPricePreset] = useState<'ALL' | 'UNDER_50' | '50_TO_100' | 'ABOVE_100'>('ALL');
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [subscriptionOnly, setSubscriptionOnly] = useState(false);

  // Debounce search input
  const searchTimeoutRef = useRef<any>(null);
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(text.trim());
    }, 350);
  };

  // Fetch Categories on mount
  useEffect(() => {
    customerService.getCategories().then((list) => {
      setCategories(list);
      if (initialCategoryId && list.length > 0) {
        const match = list.find((c) => c.id === initialCategoryId || c.name === initialCategoryId);
        if (match) {
          setActiveCategoryName(match.name);
        }
      }
    });
  }, [initialCategoryId]);

  // Count active applied filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (selectedVendors.length > 0) count++;
    if (pricePreset !== 'ALL' || minPriceInput || maxPriceInput) count++;
    if (minRating) count++;
    if (discountOnly) count++;
    if (!inStockOnly) count++;
    if (subscriptionOnly) count++;
    return count;
  };

  // Construct query params
  const buildQueryParams = useCallback(
    (pageNumber: number): ProductQueryParams => {
      let minP: number | undefined;
      let maxP: number | undefined;

      if (pricePreset === 'UNDER_50') {
        maxP = 50;
      } else if (pricePreset === '50_TO_100') {
        minP = 50;
        maxP = 100;
      } else if (pricePreset === 'ABOVE_100') {
        minP = 100;
      } else {
        if (minPriceInput) minP = parseFloat(minPriceInput);
        if (maxPriceInput) maxP = parseFloat(maxPriceInput);
      }

      return {
        categoryId: activeCategoryId,
        vendorId: selectedVendors.length > 0 ? selectedVendors.join(',') : undefined,
        minPrice: minP,
        maxPrice: maxP,
        rating: minRating,
        discount: discountOnly ? 'true' : undefined,
        availability: inStockOnly ? 'in_stock' : 'all',
        subscriptionAvailable: subscriptionOnly ? 'subscription' : undefined,
        sortBy: sortBy as any,
        search: debouncedSearch || undefined,
        page: pageNumber,
        pageSize: 10,
      };
    },
    [
      activeCategoryId,
      selectedVendors,
      pricePreset,
      minPriceInput,
      maxPriceInput,
      minRating,
      discountOnly,
      inStockOnly,
      subscriptionOnly,
      sortBy,
      debouncedSearch,
    ]
  );

  // Fetch initial page
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const params = buildQueryParams(1);
    const response = await customerService.getProducts(params);
    setProducts(response.data);
    setPagination(response.pagination);
    if (response.filters?.availableVendors) {
      setAvailableVendors(response.filters.availableVendors);
    }
    setIsLoading(false);
  }, [buildQueryParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Pull to refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    const params = buildQueryParams(1);
    const response = await customerService.getProducts(params);
    setProducts(response.data);
    setPagination(response.pagination);
    setIsRefreshing(false);
  };

  // Infinite Scroll / Load More
  const handleLoadMore = async () => {
    if (isLoadingMore || !pagination.hasNextPage || isLoading) return;
    setIsLoadingMore(true);
    const nextPage = pagination.currentPage + 1;
    const params = buildQueryParams(nextPage);
    const response = await customerService.getProducts(params);
    if (response.data && response.data.length > 0) {
      // Prevent duplicates by checking id
      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newUnique = response.data.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newUnique];
      });
      setPagination(response.pagination);
    }
    setIsLoadingMore(false);
  };

  // Switch category
  const handleSelectCategory = (catId?: string, catName?: string) => {
    setActiveCategoryId(catId);
    setActiveCategoryName(catName || 'All Categories');
  };

  // Reset all filters
  const handleClearFilters = () => {
    setSelectedVendors([]);
    setPricePreset('ALL');
    setMinPriceInput('');
    setMaxPriceInput('');
    setMinRating(undefined);
    setDiscountOnly(false);
    setInStockOnly(true);
    setSubscriptionOnly(false);
    setShowFilterModal(false);
  };

  // Sort labels
  const sortLabels: Record<string, string> = {
    recommended: 'Recommended',
    priceLowToHigh: 'Price: Low to High',
    priceHighToLow: 'Price: High to Low',
    highestRated: 'Highest Rated',
    newest: 'Newest Arrivals',
    highestDiscount: 'Highest Discount',
  };

  // Render individual product card
  const renderProductItem = ({ item }: { item: Product }) => {
    const cartEntry = cart.find((c) => c.product.id === item.id);
    const qty = cartEntry ? cartEntry.qty : 0;
    const isFav = favorites.includes(item.id);
    const isOutOfStock = item.stock !== undefined && item.stock <= 0;

    return (
      <TouchableOpacity
        style={{ width: CARD_WIDTH }}
        className="bg-white rounded-2xl p-2.5 mb-3 border border-[#E2EBE5] shadow-sm relative"
        onPress={() => onOpenDetails(item)}
        activeOpacity={0.88}
      >
        {/* Top Badges: Category Name (Heart icon cleanly removed) */}
        <View className="flex-row items-center justify-between mb-1.5">
          <View className="bg-[#E7F5EB] px-2 py-0.5 rounded-md max-w-[90%]">
            <Text className="text-2xs font-extrabold uppercase text-[#07843D]" numberOfLines={1}>
              {item.category || initialCategoryName || 'Harvest'}
            </Text>
          </View>
        </View>

        {/* Product Image */}
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
          {item.discountPercentage && item.discountPercentage > 0 ? (
            <View className="absolute top-1 left-1 bg-[#F2C500] px-1.5 py-0.5 rounded shadow-sm">
              <Text className="text-[10px] font-black text-[#18352B]">{item.discountPercentage}% OFF</Text>
            </View>
          ) : null}
        </View>

        {/* Product Name & Unit */}
        <Text className="text-sm font-bold text-slate-900 tracking-tight" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-xs font-semibold text-slate-500 mt-0.5" numberOfLines={1}>
          {item.unit || '1 Kg'}
        </Text>

        {/* Vendor Offer Badge (Separate Vendor Card Requirement) */}
        <TouchableOpacity
          className="flex-row items-center mt-1.5 bg-[#F4F9F5] border border-[#D5E8DC] px-2 py-0.5 rounded-lg self-start"
          onPress={() => {
            if (item.vendorId && onOpenVendorStore) {
              onOpenVendorStore(item.vendorId, item.vendorName || (item as any).vendor?.businessName);
            }
          }}
          activeOpacity={0.7}
        >
          <Text className="text-[10px] font-bold text-[#07843D]" numberOfLines={1}>
            🌱 {item.vendorName || (item as any).vendor?.businessName || 'Local Farm'}
          </Text>
        </TouchableOpacity>

        {/* Rating and Stock */}
        <View className="flex-row items-center justify-between mt-1.5">
          <View className="flex-row items-center bg-[#FEF9C3] px-1.5 py-0.5 rounded">
            <Star size={10} color="#D97706" fill="#D97706" />
            <Text className="text-[10px] font-bold text-[#854D0E] ml-1">
              {(item.rating || 4.8).toFixed(1)}
            </Text>
          </View>
          {item.subscriptionAllowed ? (
            <View className="bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
              <Text className="text-[9px] font-bold text-sky-800">Subscription</Text>
            </View>
          ) : null}
        </View>

        {/* Price & Add to Cart Controls */}
        <View className="flex-row items-center justify-between mt-2 pt-1 border-t border-slate-100">
          <View>
            <Text className="text-base font-black text-slate-900">₹{item.price}</Text>
            {item.originalPrice && item.originalPrice > item.price ? (
              <Text className="text-2xs text-slate-400 line-through">₹{item.originalPrice}</Text>
            ) : null}
          </View>

          {isOutOfStock ? (
            <View className="bg-slate-300 px-2.5 py-1 rounded-lg">
              <Text className="text-white text-[11px] font-bold">Out of Stock</Text>
            </View>
          ) : qty > 0 ? (
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

  const activeFilterCount = getActiveFilterCount();

  return (
    <View className="flex-1 bg-[#F0F7F2]">
      {/* 1. Unified Common Header Bar */}
      <CommonHeader
        showBack={true}
        onBack={onBack}
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search crops, vegetables, grains..."
        onOpenPlans={onOpenPlans}
        onOpenCart={onOpenCart}
        cartCount={cart.reduce((s, i) => s + i.qty, 0)}
        headerThemeColor={headerThemeColor}
      />

      {/* 2. Amazon/Flipkart-Style Filter & Sorting Bar */}
      <View className="bg-white border-b border-[#DFE9E1] py-2 px-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          {/* Main Filter Button with active count badge */}
          <TouchableOpacity
            className={`flex-row items-center px-3 py-1.5 rounded-xl border ${
              activeFilterCount > 0 ? 'bg-[#E7F5EB] border-[#07843D]' : 'bg-white border-slate-200'
            }`}
            onPress={() => setShowFilterModal(true)}
          >
            <SlidersHorizontal size={14} color={activeFilterCount > 0 ? '#07843D' : '#64748B'} />
            <Text
              className={`text-xs font-bold ml-1.5 ${
                activeFilterCount > 0 ? 'text-[#07843D]' : 'text-slate-700'
              }`}
            >
              Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>

          {/* Sort Button */}
          <TouchableOpacity
            className="flex-row items-center px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
            onPress={() => setShowSortModal(true)}
          >
            <ArrowUpDown size={14} color="#64748B" />
            <Text className="text-xs font-bold text-slate-700 ml-1.5">
              {sortLabels[sortBy] || 'Sort'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Filter Pill: In Stock or Discount */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1.5 ml-2">
          <TouchableOpacity
            onPress={() => setDiscountOnly((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg border ${
              discountOnly ? 'bg-[#07843D] border-[#07843D]' : 'bg-white border-slate-200'
            }`}
          >
            <Text className={`text-2xs font-bold ${discountOnly ? 'text-white' : 'text-slate-600'}`}>
              % Discount
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSubscriptionOnly((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg border ${
              subscriptionOnly ? 'bg-sky-600 border-sky-600' : 'bg-white border-slate-200'
            }`}
          >
            <Text className={`text-2xs font-bold ${subscriptionOnly ? 'text-white' : 'text-slate-600'}`}>
              Daily Plan
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 3. Split-Pane Layout: Vertical Category Sidebar on Left + Products Grid on Right */}
      <View className="flex-1 flex-row">
        {/* Left Vertical Category Navigation Menu */}
        <View className="w-24 bg-white border-r border-[#DFE9E1]">
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 6 }}>
            {/* "All" Category Pill */}
            <TouchableOpacity
              className={`p-2.5 items-center justify-center border-b border-slate-100 ${
                !activeCategoryId || activeCategoryId === 'All'
                  ? 'bg-emerald-50 border-l-4 border-l-[#07843D]'
                  : 'bg-white'
              }`}
              onPress={() => {
                setActiveCategoryId(undefined);
                setActiveCategoryName('All Products');
              }}
            >
              <View className="w-10 h-10 rounded-xl bg-emerald-100 items-center justify-center mb-1">
                <LayoutGrid size={18} color="#07843D" />
              </View>
              <Text
                className={`text-[10px] text-center leading-3 ${
                  !activeCategoryId || activeCategoryId === 'All'
                    ? 'font-black text-[#07843D]'
                    : 'font-bold text-slate-600'
                }`}
                numberOfLines={2}
              >
                All
              </Text>
            </TouchableOpacity>

            {/* Dynamic Admin Categories */}
            {categories.map((cat) => {
              const isSelected = activeCategoryId === cat.id || activeCategoryName === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  className={`p-2 items-center justify-center border-b border-slate-100 ${
                    isSelected
                      ? 'bg-emerald-50 border-l-4 border-l-[#07843D]'
                      : 'bg-white'
                  }`}
                  onPress={() => {
                    setActiveCategoryId(cat.id);
                    setActiveCategoryName(cat.name);
                  }}
                >
                  <View className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 items-center justify-center mb-1 border border-slate-200">
                    {cat.imageUrl ? (
                      <Image source={{ uri: cat.imageUrl }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Sprout size={18} color={isSelected ? '#07843D' : '#64748B'} />
                    )}
                  </View>
                  <Text
                    className={`text-[9.5px] text-center leading-3 ${
                      isSelected ? 'font-black text-[#07843D]' : 'font-semibold text-slate-600'
                    }`}
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Product Grid Area */}
        <View className="flex-1">
          {isLoading ? (
            <View className="flex-1 items-center justify-center p-8">
              <ActivityIndicator size="large" color="#07843D" />
              <Text className="text-xs font-bold text-slate-600 mt-2">Loading fresh harvest...</Text>
            </View>
          ) : products.length === 0 ? (
            <View className="flex-1 items-center justify-center p-6">
              <View className="w-16 h-16 rounded-full bg-[#E7F5EB] items-center justify-center mb-2.5">
                <ShoppingBag size={28} color="#07843D" />
              </View>
              <Text className="text-sm font-black text-slate-900">No Products in Category</Text>
              <Text className="text-[11px] font-medium text-slate-500 text-center mt-1">
                No crops listed under "{activeCategoryName}".
              </Text>
              <TouchableOpacity
                className="mt-3 bg-[#07843D] px-4 py-2 rounded-xl shadow-xs"
                onPress={handleClearFilters}
              >
                <Text className="text-white text-xs font-bold">Clear Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              contentContainerStyle={{ padding: 8, paddingBottom: 110 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#07843D']} />}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                isLoadingMore ? (
                  <View className="py-3 items-center">
                    <ActivityIndicator size="small" color="#07843D" />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>

      {/* ── 5. SORT BOTTOM SHEET MODAL ── */}
      <CommonModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        title="Sort Products By"
        icon={<ArrowUpDown size={16} color="#07843D" />}
        scrollable={false}
      >
        {Object.keys(sortLabels).map((key) => {
          const isSelected = sortBy === key;
          return (
            <TouchableOpacity
              key={key}
              className={`flex-row items-center justify-between py-3 px-3 rounded-xl mb-1 ${
                isSelected ? 'bg-[#E7F5EB]' : 'bg-transparent'
              }`}
              onPress={() => {
                setSortBy(key);
                setShowSortModal(false);
              }}
            >
              <Text
                className={`text-sm ${
                  isSelected ? 'font-black text-[#07843D]' : 'font-semibold text-slate-700'
                }`}
              >
                {sortLabels[key]}
              </Text>
              {isSelected ? <Check size={18} color="#07843D" strokeWidth={3} /> : null}
            </TouchableOpacity>
          );
        })}
      </CommonModal>

      {/* ── 6. AMAZON / FLIPKART STYLE FILTER MODAL ── */}
      <CommonModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Products"
        subtitle="Refine by price, vendor, ratings & delivery"
        icon={<SlidersHorizontal size={16} color="#07843D" />}
        maxHeight="88%"
        footer={
          <View className="flex-row items-center pt-2 bg-white gap-3">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl border border-slate-200 items-center justify-center"
              onPress={handleClearFilters}
            >
              <Text className="text-xs font-black text-slate-700">Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl bg-[#07843D] items-center justify-center shadow-sm"
              onPress={() => setShowFilterModal(false)}
            >
              <Text className="text-xs font-black text-white">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        }
      >
        {/* Section A: Price Range */}
              <View className="mb-5">
                <Text className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                  Price Range
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {[
                    { key: 'ALL', label: 'All Prices' },
                    { key: 'UNDER_50', label: 'Under ₹50' },
                    { key: '50_TO_100', label: '₹50 – ₹100' },
                    { key: 'ABOVE_100', label: 'Above ₹100' },
                  ].map((p) => (
                    <TouchableOpacity
                      key={p.key}
                      onPress={() => setPricePreset(p.key as any)}
                      className={`px-3.5 py-2 rounded-xl border ${
                        pricePreset === p.key
                          ? 'bg-[#07843D] border-[#07843D]'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          pricePreset === p.key ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom Min / Max Inputs */}
                <View className="flex-row items-center gap-3">
                  <View className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                    <Text className="text-[10px] text-slate-400 font-semibold">Min Price (₹)</Text>
                    <TextInput
                      className="text-sm font-bold text-slate-800"
                      placeholder="0"
                      keyboardType="numeric"
                      value={minPriceInput}
                      onChangeText={(t) => {
                        setMinPriceInput(t);
                        setPricePreset('ALL');
                      }}
                    />
                  </View>
                  <Text className="text-slate-400 font-black">to</Text>
                  <View className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                    <Text className="text-[10px] text-slate-400 font-semibold">Max Price (₹)</Text>
                    <TextInput
                      className="text-sm font-bold text-slate-800"
                      placeholder="200"
                      keyboardType="numeric"
                      value={maxPriceInput}
                      onChangeText={(t) => {
                        setMaxPriceInput(t);
                        setPricePreset('ALL');
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* Section B: Vendors Multi-Select */}
              {availableVendors.length > 0 ? (
                <View className="mb-5">
                  <Text className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                    Partner Organic Farms & Vendors
                  </Text>
                  {availableVendors.map((v) => {
                    const isChecked = selectedVendors.includes(v.id);
                    return (
                      <TouchableOpacity
                        key={v.id}
                        onPress={() => {
                          if (isChecked) {
                            setSelectedVendors((prev) => prev.filter((id) => id !== v.id));
                          } else {
                            setSelectedVendors((prev) => [...prev, v.id]);
                          }
                        }}
                        className={`flex-row items-center justify-between py-2.5 px-3 rounded-xl mb-1.5 border ${
                          isChecked ? 'bg-[#E7F5EB] border-[#07843D]' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <View className="flex-row items-center">
                          <View
                            className={`w-5 h-5 rounded items-center justify-center mr-2.5 border ${
                              isChecked ? 'bg-[#07843D] border-[#07843D]' : 'bg-white border-slate-300'
                            }`}
                          >
                            {isChecked ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : null}
                          </View>
                          <Text className="text-xs font-bold text-slate-800">{v.name}</Text>
                        </View>
                        <View className="flex-row items-center bg-[#FEF9C3] px-1.5 py-0.5 rounded">
                          <Star size={9} color="#D97706" fill="#D97706" />
                          <Text className="text-[10px] font-bold text-[#854D0E] ml-1">{v.rating}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}

              {/* Section C: Customer Rating Filter */}
              <View className="mb-5">
                <Text className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                  Customer Rating
                </Text>
                <View className="flex-row gap-2">
                  {[
                    { label: 'All Ratings', value: undefined },
                    { label: '3.0★ & Above', value: 3 },
                    { label: '4.0★ & Above', value: 4 },
                    { label: '4.5★ & Above', value: 4.5 },
                  ].map((r, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setMinRating(r.value)}
                      className={`px-3 py-2 rounded-xl border ${
                        minRating === r.value
                          ? 'bg-[#07843D] border-[#07843D]'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          minRating === r.value ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Section D: Product Type & Availability */}
              <View className="mb-6">
                <Text className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                  Availability & Ordering Type
                </Text>

                <TouchableOpacity
                  onPress={() => setInStockOnly((prev) => !prev)}
                  className="flex-row items-center justify-between py-2"
                >
                  <Text className="text-xs font-bold text-slate-800">In Stock Products Only</Text>
                  <View
                    className={`w-6 h-6 rounded-md items-center justify-center border ${
                      inStockOnly ? 'bg-[#07843D] border-[#07843D]' : 'bg-white border-slate-300'
                    }`}
                  >
                    {inStockOnly ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDiscountOnly((prev) => !prev)}
                  className="flex-row items-center justify-between py-2"
                >
                  <Text className="text-xs font-bold text-slate-800">Discounted Produce Only</Text>
                  <View
                    className={`w-6 h-6 rounded-md items-center justify-center border ${
                      discountOnly ? 'bg-[#07843D] border-[#07843D]' : 'bg-white border-slate-300'
                    }`}
                  >
                    {discountOnly ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSubscriptionOnly((prev) => !prev)}
                  className="flex-row items-center justify-between py-2"
                >
                  <Text className="text-xs font-bold text-slate-800">Daily Subscription Eligible</Text>
                  <View
                    className={`w-6 h-6 rounded-md items-center justify-center border ${
                      subscriptionOnly ? 'bg-[#07843D] border-[#07843D]' : 'bg-white border-slate-300'
                    }`}
                  >
                    {subscriptionOnly ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
                  </View>
                </TouchableOpacity>
              </View>
      </CommonModal>
    </View>
  );
};

export default CategoryProductListingScreen;
