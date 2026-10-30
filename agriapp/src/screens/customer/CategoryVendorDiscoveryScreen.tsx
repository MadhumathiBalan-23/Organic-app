import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Layers,
  Sprout,
  Plus,
  Minus,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { customerService, CustomerCategoryItem } from '../../services/customer.service';
import { Product } from '../../constants/mockData';
import { CommonHeader } from '../../components/CommonHeader';

export interface CategoryVendorDiscoveryScreenProps {
  initialCategoryId?: string;
  cart?: { product: Product; qty: number }[];
  addToCart?: (product: Product, qty?: number) => void;
  updateCartQty?: (product: Product, delta: number) => void;
  onOpenDetails?: (product: Product) => void;
  onSelectVendorCategory?: (categoryId: string, vendorId: string, categoryName: string, vendorName: string) => void;
  onViewAllCategoryProducts?: (categoryId: string, categoryName: string) => void;
  onBack: () => void;
  onOpenCart?: () => void;
  onOpenPlans?: () => void;
  headerThemeColor?: string;
}

export const CategoryVendorDiscoveryScreen: React.FC<CategoryVendorDiscoveryScreenProps> = ({
  initialCategoryId,
  cart = [],
  addToCart,
  updateCartQty,
  onOpenDetails,
  onSelectVendorCategory,
  onViewAllCategoryProducts,
  onBack,
  onOpenCart,
  onOpenPlans,
  headerThemeColor,
}) => {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<CustomerCategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(initialCategoryId);
  const [selectedCategory, setSelectedCategory] = useState<CustomerCategoryItem | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Cart totals
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Helper to get cart quantity for a product
  const [isCartBarDismissed, setIsCartBarDismissed] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setIsCartBarDismissed(false);
    }
  }, [cartCount]);

  const getCartQty = (productId: string) => {
    const found = cart.find((i) => i.product.id === productId);
    return found ? found.qty : 0;
  };

  // Debounce search query
  const searchTimeoutRef = useRef<any>(null);
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // 1. Separate API: Fetch all categories on mount
  useEffect(() => {
    setIsLoadingCategories(true);
    customerService
      .getCategories()
      .then((cats) => {
        setCategories(cats);
        setIsLoadingCategories(false);

        if (cats.length > 0) {
          const found = initialCategoryId
            ? cats.find((c) => c.id === initialCategoryId || c.name === initialCategoryId)
            : cats[0];
          const target = found || cats[0];
          setSelectedCategoryId(target.id);
          setSelectedCategory(target);
        }
      })
      .catch((err) => {
        console.warn('⚠️ [CategoryVendorDiscovery] Failed to fetch categories:', err);
        setIsLoadingCategories(false);
      });
  }, [initialCategoryId]);

  // 2. Separate API: Fetch products whenever selected category or search changes
  useEffect(() => {
    if (!selectedCategoryId) return;
    setIsLoadingProducts(true);

    customerService
      .getProducts({
        categoryId: selectedCategoryId,
        search: debouncedSearch || undefined,
        pageSize: 50,
      })
      .then((res) => {
        if (res && res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        console.warn('⚠️ [CategoryVendorDiscovery] Failed to fetch products:', err);
        setProducts([]);
      })
      .finally(() => {
        setIsLoadingProducts(false);
      });
  }, [selectedCategoryId, debouncedSearch]);

  const handleCategoryPress = (cat: CustomerCategoryItem) => {
    setSelectedCategoryId(cat.id);
    setSelectedCategory(cat);
  };

  return (
    <View className="flex-1 bg-white">
      {/* ── Top Common Header (Safe Area view adjusted properly, unified theme) ── */}
      <CommonHeader
        showBack={true}
        onBack={onBack}
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={`Search ${selectedCategory?.name || 'organic produce'}...`}
        onOpenPlans={onOpenPlans}
        onOpenCart={onOpenCart}
        cartCount={cartCount}
        headerThemeColor={headerThemeColor}
      />

      {/* ── Split Layout: Left Categories List + Right Products Listing ── */}
      <View className="flex-1 flex-row">
        {/* LEFT COLUMN: Categories Navigation */}
        <View className="w-24 bg-[#F8FAF9] border-r border-[#E2EBE5]">
          {isLoadingCategories ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="small" color="#07843D" />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="py-2">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => handleCategoryPress(cat)}
                    activeOpacity={0.8}
                    className={`py-3 px-1.5 items-center relative border-b border-[#F0F4F2] ${
                      isSelected ? 'bg-white' : 'bg-transparent'
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isSelected && (
                      <View className="absolute left-0 top-0 bottom-0 w-1 bg-[#07843D] rounded-r-full" />
                    )}

                    {/* Category Thumbnail / Emoji */}
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center mb-1.5 overflow-hidden ${
                        isSelected
                          ? 'border-2 border-[#07843D] bg-[#E7F5EB]'
                          : 'border border-slate-200 bg-white'
                      }`}
                    >
                      {cat.imageUrl ? (
                        <Image source={{ uri: cat.imageUrl }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <Text className="text-xl">{cat.emoji || '🌿'}</Text>
                      )}
                    </View>

                    {/* Category Name */}
                    <Text
                      className={`text-[10px] text-center leading-tight ${
                        isSelected ? 'font-black text-[#07843D]' : 'font-semibold text-slate-600'
                      }`}
                      numberOfLines={2}
                    >
                      {cat.name}
                    </Text>

                    {/* Product count */}
                    {cat.productCount > 0 ? (
                      <Text className="text-[9px] font-bold text-slate-400 mt-0.5">
                        {cat.productCount} items
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* RIGHT COLUMN: Products for Selected Category (Vendors are completely removed) */}
        <View className="flex-1 bg-[#F0F7F2]">
          {/* Section Subheader */}
          <View className="bg-white px-3.5 py-2.5 border-b border-[#DFE9E1] flex-row items-center justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-xs font-black text-slate-900" numberOfLines={1}>
                {selectedCategory?.emoji} {selectedCategory?.name || 'Category'}
              </Text>
              <Text className="text-[11px] font-semibold text-slate-500">
                {products.length} {products.length === 1 ? 'Fresh item' : 'Fresh items'} available
              </Text>
            </View>

            {selectedCategory && onViewAllCategoryProducts ? (
              <TouchableOpacity
                onPress={() => onViewAllCategoryProducts(selectedCategory.id, selectedCategory.name)}
                className="flex-row items-center bg-[#E7F5EB] px-2.5 py-1 rounded-lg"
              >
                <Text className="text-[11px] font-black text-[#07843D] mr-0.5">View All</Text>
                <ChevronRight size={13} color="#07843D" strokeWidth={2.5} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Products List */}
          {isLoadingProducts ? (
            <View className="flex-1 items-center justify-center p-8">
              <ActivityIndicator size="large" color="#07843D" />
              <Text className="text-xs font-bold text-slate-500 mt-2.5">
                Harvesting fresh {selectedCategory?.name || 'crops'}...
              </Text>
            </View>
          ) : products.length === 0 ? (
            <View className="flex-1 items-center justify-center p-6">
              <View className="w-16 h-16 rounded-full bg-[#E7F5EB] items-center justify-center mb-2.5">
                <Sprout size={28} color="#07843D" />
              </View>
              <Text className="text-sm font-black text-slate-900">No Products Available</Text>
              <Text className="text-xs font-semibold text-slate-500 text-center mt-1">
                {debouncedSearch
                  ? `No products found matching "${debouncedSearch}" in ${selectedCategory?.name}.`
                  : `Currently all crops in ${selectedCategory?.name || 'this category'} are sold out.`}
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="p-2.5 pb-28 gap-2.5"
            >
              {products.map((product) => {
                const qty = getCartQty(product.id);
                const origPrice = (product as any).originalPrice || Math.round(product.price * 1.25);
                const hasDiscount = origPrice > product.price;

                return (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() => onOpenDetails?.(product)}
                    activeOpacity={0.88}
                    className="bg-white rounded-2xl p-2.5 border border-[#DFE9E1] shadow-xs flex-row"
                  >
                    {/* Product Thumbnail */}
                    <View className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden relative mr-2.5 shrink-0 border border-slate-100">
                      {product.imageUrl ? (
                        <Image
                          source={{ uri: product.imageUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center bg-[#E7F5EB]">
                          <Sprout size={22} color="#07843D" />
                        </View>
                      )}

                      {/* Organic / Quality Pill */}
                      {product.organicCertified ? (
                        <View className="absolute top-1 left-1 bg-[#07843D] px-1 py-0.2 rounded">
                          <Text className="text-[8px] font-black text-white">ORGANIC</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Product Details & Pricing */}
                    <View className="flex-1 justify-between">
                      <View>
                        <Text
                          className="text-xs font-black text-slate-900 leading-tight"
                          numberOfLines={2}
                        >
                          {product.name}
                        </Text>

                        {/* Unit / Pack size */}
                        <Text className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          {product.unit || '1 Pack'}
                        </Text>

                        {/* Farm / Vendor Origin Tag */}
                        {product.vendorName ? (
                          <View className="flex-row items-center mt-1">
                            <Sprout size={10} color="#07843D" />
                            <Text className="text-[10px] font-bold text-slate-600 ml-1" numberOfLines={1}>
                              {product.vendorName}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      {/* Bottom Row: Price & Add to Cart Controls */}
                      <View className="flex-row items-center justify-between mt-2 pt-1 border-t border-slate-100">
                        <View className="flex-row items-baseline gap-1">
                          <Text className="text-sm font-black text-[#07843D]">
                            ₹{product.price}
                          </Text>
                          {hasDiscount && (
                            <Text className="text-[10px] text-slate-400 line-through font-semibold">
                              ₹{origPrice}
                            </Text>
                          )}
                        </View>

                        {/* Cart Actions */}
                        {qty > 0 ? (
                          <View className="flex-row items-center bg-[#E7F5EB] border border-[#07843D] rounded-lg px-1.5 py-0.5 gap-2">
                            <TouchableOpacity
                              className="w-5 h-5 rounded items-center justify-center bg-[#07843D]"
                              onPress={() => updateCartQty?.(product, -1)}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                              activeOpacity={0.8}
                            >
                              <Text className="text-white text-xs font-black leading-none">−</Text>
                            </TouchableOpacity>
                            <Text className="text-xs font-black text-[#07843D]">{qty}</Text>
                            <TouchableOpacity
                              className="w-5 h-5 rounded items-center justify-center bg-[#07843D]"
                              onPress={() => updateCartQty?.(product, 1)}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                              activeOpacity={0.8}
                            >
                              <Text className="text-white text-xs font-black leading-none">+</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            className="bg-[#07843D] px-3 py-1 rounded-lg shadow-xs"
                            onPress={() => addToCart?.(product, 1)}
                            activeOpacity={0.8}
                          >
                            <Text className="text-white text-[11px] font-black">ADD</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>

      {/* ── Persistent Floating Cart Summary Bar ── */}
      {cartCount > 0 && !isCartBarDismissed && (
        <View
          style={{
            bottom: Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8),
          }}
          className="absolute left-3 right-3 z-50"
        >
          <View className="bg-[#02381A] rounded-2xl px-4 py-2.5 shadow-xl flex-row items-center justify-between border border-[#07843D]/50">
            <View className="flex-1 mr-2">
              <Text className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                {cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'} IN CART
              </Text>
              <Text className="text-base font-black text-white">
                ₹{cartTotal} <Text className="text-xs text-emerald-300 font-semibold">• Free Delivery</Text>
              </Text>
            </View>

            <View className="flex-row items-center gap-2 shrink-0">
              <TouchableOpacity
                onPress={onOpenCart}
                className="bg-[#07843D] px-4 py-2 rounded-xl flex-row items-center shadow-sm active:bg-emerald-700"
                activeOpacity={0.85}
              >
                <Text className="text-white text-xs font-black mr-1">View Cart</Text>
                <ChevronRight size={15} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-8 h-8 rounded-full bg-white/20 items-center justify-center active:bg-white/30"
                onPress={() => setIsCartBarDismissed(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Close Cart Bar"
              >
                <X size={15} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CategoryVendorDiscoveryScreen;
