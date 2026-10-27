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
  isApprovedVendor?: boolean;
  setShowAddProductModal?: (open: boolean) => void;
  renderProductCard: (p: Product) => React.ReactNode;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  headerGrad,
  isLoadingBanners,
  bannersList,
  bannerScrollRef,
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-[130px]">
        {/* Half-Banner Gradient Backdrop */}
        <View className="absolute top-0 left-0 right-0 h-[104px] overflow-hidden" pointerEvents="none">
          <Svg width="100%" height="100%" key={`home_backdrop_${headerGrad.light}`}>
            <Defs>
              <SvgLinearGradient id="homeHalfBannerGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={headerGrad.light} stopOpacity="1" />
                <Stop offset="70%" stopColor={headerGrad.light} stopOpacity="0.75" />
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

                return (
                  <TouchableOpacity
                    key={banner.id}
                    activeOpacity={0.92}
                    onPress={() => handleBannerPress(banner)}
                    style={{
                      backgroundColor: grad.dark,
                      width: BANNER_WIDTH,
                    }}
                    className="h-[165px] rounded-[22px] overflow-hidden relative mr-3 shadow-md flex-row items-center justify-between"
                  >
                    {/* Dark-to-Light Linear Gradient Background */}
                    <View className="absolute inset-0" pointerEvents="none">
                      <Svg width="100%" height="100%" key={bannerGradId}>
                        <Defs>
                          <SvgLinearGradient id={bannerGradId} x1="0" y1="0" x2="1" y2="1">
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

                    {/* Right Column: Featured Produce / Photo (if any) */}
                    {banner.imageUrl ? (
                      <View className="w-36 h-full p-2.5 z-10 justify-center">
                        <Image
                          source={{ uri: banner.imageUrl }}
                          className="w-full h-full rounded-2xl border border-white/40 shadow-sm"
                          resizeMode="cover"
                        />
                      </View>
                    ) : null}
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
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerClassName="py-1 gap-2.5"
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                const photoUrl = getCategoryPhoto(cat);

                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setActiveCategory(cat)}
                    className="items-center"
                    style={{ width: 72 }}
                    activeOpacity={0.8}
                    accessibilityLabel={cat}
                  >
                    {/* Blinkit-Style Square Card Image Container */}
                    <View 
                      className={`w-[66px] h-[66px] rounded-2xl overflow-hidden items-center justify-center relative ${
                        isActive 
                          ? 'border-2 border-[#07843D] bg-[#E7F5EB] shadow-sm' 
                          : 'border border-[#DFE9E1] bg-white'
                      }`}
                    >
                      <Image
                        source={{ uri: photoUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      {isActive && (
                        <View className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#07843D] items-center justify-center border border-white">
                          <Check size={9} color="#FFFFFF" strokeWidth={3.5} />
                        </View>
                      )}
                    </View>

                    {/* Neat Blinkit-Style Typography */}
                    <Text 
                      className={`mt-1.5 text-center ${
                        isActive ? 'text-[#07843D] font-extrabold' : 'text-slate-700 font-semibold'
                      }`}
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

        {/* 3. Daily Confirmation & AI Assistant Card */}
        <View className="mx-3 mt-3.5 p-4 rounded-2xl bg-white border border-[#DFE9E1] shadow-sm flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Zap size={15} color="#07843D" />
              <Text className="text-sm font-extrabold text-[#07843D]">MORNING DELIVERY HUB</Text>
            </View>
            <Text className="text-sm font-bold text-slate-800">Fresh harvest ready for tomorrow morning 6:30 AM</Text>
            <Text className="text-xs text-slate-500 mt-0.5">Pause or skip anytime with 1-click</Text>
          </View>
          <TouchableOpacity
            className="bg-emerald-700 px-4 py-2.5 rounded-xl flex-row items-center gap-1.5 shadow-sm active:bg-emerald-800"
            onPress={() => setCustomerScreen('MY_SUBSCRIPTIONS')}
            activeOpacity={0.8}
          >
            <Repeat size={14} color="#FFFFFF" />
            <Text className="text-white text-sm font-bold">Manage Plan</Text>
          </TouchableOpacity>
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
      </ScrollView>
    </View>
  );
};

export default CustomerHomeScreen;
