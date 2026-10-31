import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  Platform,
} from 'react-native';
import {
  Zap,
  Repeat,
  Plus,
  ShieldCheck,
  Sprout,
  Heart,
  ShoppingCart,
  Check,
  Sunrise,
  Clock,
  CheckCircle2,
} from 'lucide-react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { Product } from '../../constants/mockData';
import { LoadingSpinner } from '../../components/LoadingAndError';
import { getGradientTheme } from '../../components/HomeHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = Math.min(SCREEN_WIDTH - 24, 380);

interface CustomerHomeScreenProps {
  headerGrad: any;
  isLoadingBanners: boolean;
  bannersList: any[];
  bannerScrollRef: React.RefObject<ScrollView | null>;
  activeBannerIdx: number;
  handleBannerChange: (idx: number) => void;
  handleBannerPress: (banner: any) => void;
  isLoadingCategories: boolean;
  dbCategories: any[];
  categories: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  getCategoryIcon: (cat: string, color: string) => React.ReactNode;
  products: Product[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  cartItems: { product: Product; qty: number }[];
  addToCart: (p: Product) => void;
  updateCartQty: (id: string, delta: number) => void;
  onOpenDetails: (p: Product) => void;
  onSubscribe: (p: Product) => void;
  setCustomerScreen: (screen: string) => void;
  onOpenCategory?: (categoryId: string, categoryName: string) => void;
  onOpenVendorDiscovery?: (categoryId?: string) => void;
  isApprovedVendor?: boolean;
  setShowAddProductModal?: (open: boolean) => void;
  renderProductCard: (p: Product) => React.ReactNode;
  scrollY?: any;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  headerGrad,
  isLoadingBanners,
  bannersList,
  bannerScrollRef,
  scrollY,
  activeBannerIdx,
  handleBannerChange,
  handleBannerPress,
  isLoadingCategories,
  dbCategories,
  categories,
  activeCategory,
  setActiveCategory,
  getCategoryIcon,
  products,
  favorites,
  toggleFavorite,
  cartItems,
  addToCart,
  updateCartQty,
  onOpenDetails,
  onSubscribe,
  setCustomerScreen,
  onOpenCategory,
  onOpenVendorDiscovery,
  isApprovedVendor,
  setShowAddProductModal,
  renderProductCard,
}) => {
  const getCategoryPhoto = (catName: string): string => {
    const match = (dbCategories || []).find(
      (c: any) => c.name?.toLowerCase() === catName?.toLowerCase()
    );
    if (match?.imageUrl) return match.imageUrl;

    const cLower = (catName || '').toLowerCase();
    if (cLower === 'all')
      return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300';
    if (cLower.includes('dairy') || cLower.includes('milk') || cLower.includes('ghee'))
      return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300';
    if (cLower.includes('veg'))
      return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=300';
    if (cLower.includes('fruit'))
      return 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=300';
    if (cLower.includes('groc') || cLower.includes('grain'))
      return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300';
    if (cLower.includes('oil'))
      return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=300';
    if (cLower.includes('dry') || cLower.includes('snack'))
      return 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=300';
    if (cLower.includes('honey'))
      return 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=300';
    if (cLower.includes('egg') || cLower.includes('poul'))
      return 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=300';
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300';
  };

  return (
    <View className="flex-1 bg-[#F0F7F2]">
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-[130px]"
        decelerationRate="normal"
        overScrollMode="never"
        bounces={Platform.OS === 'ios'}
        nestedScrollEnabled={true}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onScroll={
          scrollY
            ? Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                useNativeDriver: false,
              })
            : undefined
        }
        scrollEventThrottle={16}
      >
        {/* Seamless Half-Banner Gradient Backdrop matching header theme */}
        <View className="absolute top-0 left-0 right-0 h-[140px] overflow-hidden" pointerEvents="none">
          <Svg width="100%" height="100%" key={`home_backdrop_${headerGrad.light}`}>
            <Defs>
              <SvgLinearGradient id="homeHalfBannerGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={headerGrad.light} stopOpacity="1" />
                <Stop offset="55%" stopColor={headerGrad.light} stopOpacity="0.85" />
                <Stop offset="100%" stopColor="#F0F7F2" stopOpacity="0" />
              </SvgLinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#homeHalfBannerGrad)" />
          </Svg>
        </View>

        {/* 1. Dynamic Promotional Banner Carousel */}
        {isLoadingBanners ? (
          <View className="h-[165px] mx-3 mt-3 rounded-[20px] bg-[#EBF6EE] justify-center items-center">
            <LoadingSpinner size="small" message="Loading festive banners..." showLeafIcon />
          </View>
        ) : bannersList.length > 0 ? (
          <View className="mt-3">
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              nestedScrollEnabled={true}
              pagingEnabled={false}
              snapToInterval={BANNER_WIDTH + 12}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="px-3"
              onMomentumScrollEnd={(e) => {
                const offsetX = e.nativeEvent.contentOffset.x;
                const idx = Math.min(Math.max(0, Math.round(offsetX / (BANNER_WIDTH + 12))), bannersList.length - 1);
                handleBannerChange(idx);
              }}
              onScrollEndDrag={(e) => {
                const offsetX = e.nativeEvent.contentOffset.x;
                const idx = Math.min(Math.max(0, Math.round(offsetX / (BANNER_WIDTH + 12))), bannersList.length - 1);
                handleBannerChange(idx);
              }}
            >
              {bannersList.map((banner) => {
                const grad = getGradientTheme(banner.backgroundColor);
                const bannerGradId = `bannerGrad_${banner.id}_${(grad.dark + grad.light).replace(/[^a-zA-Z0-9]/g, '')}`;
                const hasImage = Boolean(banner.imageUrl && banner.imageUrl.trim());

                return (
                  <TouchableOpacity
                    key={banner.id}
                    activeOpacity={0.92}
                    onPress={() => handleBannerPress(banner)}
                    style={{
                      backgroundColor: grad.dark,
                      width: BANNER_WIDTH,
                    }}
                    className="h-[165px] rounded-[22px] overflow-hidden relative mr-3 shadow-md"
                  >
                    {hasImage ? (
                      /* Full Banner Image ONLY: Clean, full-bleed promotional banner image */
                      <Image
                        source={{ uri: banner.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      /* Fallback only when banner has no image */
                      <View className="w-full h-full flex-row items-center justify-between">
                        {/* Dark-to-Light Linear Gradient Background */}
                        <View className="absolute inset-0" pointerEvents="none">
                          <Svg width="100%" height="100%" key={bannerGradId}>
                            <Defs>
                              <SvgLinearGradient id={bannerGradId} x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0%" stopColor={grad.dark} stopOpacity="1" />
                                <Stop offset="50%" stopColor={grad.mid} stopOpacity="1" />
                                <Stop offset="100%" stopColor={grad.light} stopOpacity="1" />
                              </SvgLinearGradient>
                            </Defs>
                            <Rect width="100%" height="100%" rx="22" ry="22" fill={`url(#${bannerGradId})`} />
                          </Svg>
                        </View>

                        {/* Left Column: Badge, Title, Subtitle, CTA Button */}
                        <View className="flex-1 p-4 justify-between h-full z-10">
                          <View>
                            <View className="self-start bg-white/20 px-2.5 py-0.5 rounded-full mb-1.5">
                              <Text className="text-2xs font-black text-white uppercase tracking-wider">
                                🌿 100% ORGANIC
                              </Text>
                            </View>
                            <Text className="text-base font-black text-white shadow-sm leading-tight" numberOfLines={2}>
                              {banner.title || 'Pure Organic Farm Harvest 🌿'}
                            </Text>
                            {banner.subtitle ? (
                              <Text className="text-xs text-white/90 font-medium mt-1 leading-normal" numberOfLines={1}>
                                {banner.subtitle}
                              </Text>
                            ) : null}
                          </View>

                          <View
                            className="self-start px-3.5 py-1.5 rounded-xl shadow-sm"
                            style={{ backgroundColor: banner.buttonColor || '#FDE047' }}
                          >
                            <Text
                              className="text-xs font-black"
                              style={{ color: banner.buttonTextColor || '#78350F' }}
                            >
                              {banner.buttonText || 'Shop Now →'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Interactive Pagination Dots with Theme Color Sync */}
            {bannersList.length > 1 && (
              <View className="flex-row justify-center items-center mt-2.5 gap-1.5">
                {bannersList.map((b, i) => {
                  const isActive = i === activeBannerIdx;
                  return (
                    <TouchableOpacity
                      key={b.id || i}
                      onPress={() => {
                        bannerScrollRef.current?.scrollTo({ x: i * (BANNER_WIDTH + 12), animated: true });
                        handleBannerChange(i);
                      }}
                      style={isActive ? { backgroundColor: headerGrad.light || headerGrad.mid } : undefined}
                      className={`h-2 rounded-full ${isActive ? 'w-5' : 'w-2 bg-slate-300'}`}
                      activeOpacity={0.7}
                    />
                  );
                })}
              </View>
            )}
          </View>
        ) : null}

        {/* 2. Blinkit-Style Product Categories with Images & Neat Typography */}
        {isLoadingCategories ? (
          <View className="h-24 justify-center items-center">
            <ActivityIndicator size="small" color="#07843D" />
          </View>
        ) : (
          <View className="mt-3.5 px-3">
            {/* Section Header: Categories & Quick Discovery Toggle */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-black text-slate-900 tracking-tight">
                Shop by Category
              </Text>
              {onOpenVendorDiscovery ? (
                <TouchableOpacity
                  onPress={() => onOpenVendorDiscovery(activeCategory !== 'All' ? activeCategory : undefined)}
                  className="flex-row items-center bg-[#E7F5EB] px-2.5 py-1 rounded-lg"
                >
                  <Text className="text-2xs font-extrabold text-[#07843D] mr-1">Browse Farms →</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerClassName="py-1 gap-2.5"
            >
              {categories
                .filter((cat) => cat !== 'All' && cat?.toLowerCase() !== 'all')
                .map((cat) => {
                  const photoUrl = getCategoryPhoto(cat);
                  const match = (dbCategories || []).find(
                    (c: any) => c.name?.toLowerCase() === cat?.toLowerCase()
                  );
                  const catId = match?.id || cat;

                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        if (onOpenCategory) {
                          onOpenCategory(catId, cat);
                        } else {
                          setCustomerScreen('CATEGORY_PRODUCTS');
                        }
                      }}
                      className="items-center"
                      style={{ width: 72 }}
                      activeOpacity={0.8}
                      accessibilityLabel={cat}
                    >
                      {/* Blinkit-Style Square Card Image Container */}
                      <View className="w-[66px] h-[66px] rounded-2xl overflow-hidden items-center justify-center border border-[#DFE9E1] bg-white shadow-xs">
                        <Image
                          source={{ uri: photoUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>

                      {/* Neat Typography */}
                      <Text 
                        className="mt-1.5 text-center text-slate-800 font-bold"
                        style={{ fontSize: 11, lineHeight: 14 }}
                        numberOfLines={2}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
        )}

        {/* 3. Morning Delivery Hub - Premium Organic Hero Card */}
        <View className="mx-3 mt-3.5 rounded-3xl overflow-hidden shadow-lg border border-emerald-500/30 relative">
          {/* Rich Dual-Tone Emerald & Forest Gradient Background */}
          <View className="absolute inset-0" pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <SvgLinearGradient id="morningHubGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#0A5C36" stopOpacity="1" />
                  <Stop offset="55%" stopColor="#064426" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#032B18" stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#morningHubGrad)" />
            </Svg>
          </View>

          {/* Decorative Subtle Ambient Glow Orbs */}
          <View 
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-amber-400/15" 
            pointerEvents="none" 
          />
          <View 
            className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-300/10" 
            pointerEvents="none" 
          />

          <View className="p-3.5 relative z-10">
            {/* Header Badge Row */}
            <View className="flex-row items-center justify-between mb-1.5">
              <View className="flex-row items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 border border-white/20">
                <Sunrise size={12} color="#FDE047" strokeWidth={2.4} />
                <Text className="text-[10px] font-black text-amber-300 tracking-wider uppercase">
                  Daily Delivery Hub
                </Text>
              </View>

              {/* Status Indicator Pill */}
              <View className="flex-row items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-400/30">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <Text className="text-[10px] font-extrabold text-emerald-200">
                  6:30 AM Drop
                </Text>
              </View>
            </View>

            {/* Headline and Description */}
            <Text className="text-sm font-black text-white leading-tight">
              Fresh Harvest Ready for Tomorrow
            </Text>
            <Text className="text-[11px] text-emerald-100/90 font-medium mt-0.5 leading-3.5">
              Punctual morning farm drop at your doorstep • Pause or skip anytime with 1-click
            </Text>

            {/* Bottom Row: Feature Badges & High-Contrast Golden Action Button */}
            <View className="flex-row items-center justify-between mt-2.5 pt-2 border-t border-white/15">
              <View className="flex-row items-center gap-2">
                <View className="flex-row items-center gap-1">
                  <CheckCircle2 size={12} color="#6EE7B7" strokeWidth={2.5} />
                  <Text className="text-[10px] font-bold text-emerald-100">100% Organic</Text>
                </View>
                <Text className="text-white/30">•</Text>
                <View className="flex-row items-center gap-1">
                  <Clock size={12} color="#FDE047" strokeWidth={2.5} />
                  <Text className="text-[10px] font-bold text-amber-200">Daily Punctual</Text>
                </View>
              </View>

              <TouchableOpacity
                className="bg-[#F2C500] px-3 py-1.5 rounded-xl flex-row items-center gap-1.5 shadow-md active:bg-[#D9B200]"
                onPress={() => setCustomerScreen('MY_SUBSCRIPTIONS')}
                activeOpacity={0.85}
              >
                <Repeat size={13} color="#18352B" strokeWidth={2.5} />
                <Text className="text-[#18352B] text-xs font-black">Manage Plan →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 4. Verified Farm Products Section */}
        <View className="mt-4 px-3">
          <View className="flex-row justify-between items-center mb-2.5">
            <View>
              <Text className="font-bold text-slate-800" style={{ fontSize: 14, lineHeight: 18 }}>
                100% Organic Harvest
              </Text>
              <Text className="text-slate-400 font-medium mt-0.5" style={{ fontSize: 11, lineHeight: 15 }}>
                Harvested fresh · Certified chemical-free
              </Text>
            </View>
            <TouchableOpacity onPress={() => setCustomerScreen('ALL_PRODUCTS')} activeOpacity={0.7}>
              <Text className="font-bold text-emerald-700" style={{ fontSize: 12 }}>
                View All ({products.length}) →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Product Cards Grid */}
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {products.slice(0, 8).map((product) => renderProductCard(product))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default CustomerHomeScreen;
