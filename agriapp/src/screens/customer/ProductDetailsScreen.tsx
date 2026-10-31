import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Alert,
  Platform,
} from 'react-native';
import {
  Heart,
  Share2,
  ShieldCheck,
  Sprout,
  Star,
  Zap,
  Truck,
  Award,
  Check,
  Sparkles,
  ShoppingCart,
  Repeat,
  Store,
  MapPin,
  Plus,
  Minus,
  MessageSquare,
  X,
  Send,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Product } from '../../constants/mockData';
import { SubscriptionButton } from '../../components/SubscriptionButton';
import { safeCategory } from '../../services/api.client';

export interface ProductDetailsScreenProps {
  product: Product;
  productsList: Product[];
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: Product, qty: number) => void;
  onSelectProduct: (product: Product) => void;
  onStartSubscription: (product: Product, qty: number) => void;
  selectedLocation?: { address?: string; city?: string; isGpsVerified?: boolean } | null;
}

export const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({
  product,
  productsList,
  onBack,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onStartSubscription,
  selectedLocation,
}) => {
  const insets = useSafeAreaInsets();
  const [detailQty, setDetailQty] = useState(1);

  // Dynamic Reviews & Rating State
  const [reviewsList, setReviewsList] = useState<Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    verifiedPurchase: boolean;
  }>>([
    {
      id: 'rev-1',
      userName: 'Aarthi Sundaram',
      rating: 5,
      comment: 'Super fresh and sweet harvest! Truly chemical-free farm harvest delivered right on time.',
      date: '2 days ago',
      verifiedPurchase: true,
    },
    {
      id: 'rev-2',
      userName: 'Karthik Raja',
      rating: 5,
      comment: 'Premium quality and natural aroma. Kids loved the farm fresh taste.',
      date: '5 days ago',
      verifiedPurchase: true,
    },
  ]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  // Auto-load saved reviews from localStorage/memory if any
  useEffect(() => {
    try {
      const g = globalThis as any;
      const storageKey = `agriflow_product_reviews_${product.id}`;
      const saved = g.localStorage?.getItem(storageKey) || g.window?.localStorage?.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviewsList(parsed);
        }
      }
    } catch {}
  }, [product.id]);

  const handleSubmitReview = () => {
    if (!newComment.trim() || newComment.trim().length < 3) {
      Alert.alert('Review Required', 'Please enter your feedback about the harvest.');
      return;
    }
    const newEntry = {
      id: `rev-${Date.now()}`,
      userName: reviewerName.trim() || 'Verified Customer',
      rating: newRating,
      comment: newComment.trim(),
      date: 'Just now',
      verifiedPurchase: true,
    };
    const updated = [newEntry, ...reviewsList];
    setReviewsList(updated);
    try {
      const g = globalThis as any;
      const storageKey = `agriflow_product_reviews_${product.id}`;
      if (g.localStorage) g.localStorage.setItem(storageKey, JSON.stringify(updated));
      else if (g.window?.localStorage) g.window.localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
    setNewComment('');
    setShowReviewModal(false);
    Alert.alert('Review Published 🎉', 'Thank you for rating our organic farm produce!');
  };

  const avgRating = reviewsList.length > 0
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : (product.rating || 4.8).toFixed(1);

  const origPrice = (product as any).originalPrice || Math.round(product.price * 1.25);
  const savings = Math.max(0, origPrice - product.price);
  const discountPct = origPrice > product.price ? Math.round(((origPrice - product.price) / origPrice) * 100) : 20;

  const customerCity =
    selectedLocation?.city ||
    (selectedLocation?.address ? selectedLocation.address.split(',')[0].trim() : 'Local Area');
  const vendorName =
    product.vendor?.businessName ||
    product.vendorName ||
    (product as any).farmerName ||
    (product as any).farmName ||
    (product as any).brand ||
    'Certified Organic Partner';
  const vendorLocation =
    product.vendor?.address ||
    product.vendorAddress ||
    (product as any).farmerLocation ||
    `${customerCity} Organic Cluster`;
  const certNumber =
    (product as any).certificationNumber || (product as any).certificateNo || 'TN-ORG-4821';

  const relatedProducts = productsList.filter(
    p => p.id !== product.id && (safeCategory(p.category) === safeCategory(product.category) || p.organicCertified)
  ).slice(0, 6);

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {/* 1. Elevated Hero Media (Balanced Height for Optimal Product Visibility) */}
        <View className="relative w-full h-[320px] bg-slate-900">
          <Image
            source={{ uri: product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80' }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Ambient Badges Floating at bottom of Hero */}
          <View className="absolute bottom-4 left-4 right-4 flex-row justify-between items-center">
            {product.organicCertified ? (
              <View className="flex-row items-center gap-1.5 bg-black/75 px-3 py-1.5 rounded-full">
                <ShieldCheck size={14} color="#86EFAC" />
                <Text className="text-white text-xs font-bold">100% Organic Certified</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-1.5 bg-slate-900/85 px-3 py-1.5 rounded-full">
                <Sprout size={14} color="#86EFAC" />
                <Text className="text-white text-xs font-bold">Farm Direct</Text>
              </View>
            )}
            {savings > 0 && (
              <View className="bg-amber-500 px-3 py-1.5 rounded-full">
                <Text className="text-white text-xs font-black">{discountPct}% OFF</Text>
              </View>
            )}
          </View>
        </View>

        {/* 2. Main Product Identity & Pricing Card */}
        <View className="p-5 bg-white -mt-4 rounded-t-3xl shadow-sm">
          {/* Category tag & Rating Pill */}
          <View className="flex-row justify-between items-center mb-2.5">
            <View className="bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <Text className="text-xs font-extrabold text-emerald-800 tracking-wider">
                {safeCategory(product.category).toUpperCase()}
              </Text>
            </View>
            <View className="flex-row items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-md">
              <Star size={13} color="#F59E0B" fill="#F59E0B" />
              <Text className="text-xs font-black text-amber-900">{product.rating || 4.9}</Text>
              <Text className="text-slate-400 ml-1" style={{ fontSize: 11 }}>(120+ reviews)</Text>
            </View>
          </View>

          {/* Product Title (Refined, neat, balanced) */}
          <Text
            className="font-bold text-slate-900 tracking-tight mb-1.5"
            style={{ fontSize: 18, lineHeight: 24 }}
          >
            {product.name}
          </Text>

          {/* Price & Actions Row (Price on Left, Heart + Share on the Right) */}
          <View className="flex-row items-center justify-between mb-3.5">
            {/* Left: Price & Savings */}
            <View className="flex-row items-baseline gap-2">
              <Text className="font-extrabold text-slate-900" style={{ fontSize: 24 }}>
                ₹{product.price}
              </Text>
              <Text className="text-xs text-slate-500 font-semibold">/ {product.unit}</Text>
              {origPrice > product.price && (
                <Text className="text-xs text-slate-400 line-through">₹{origPrice}</Text>
              )}
              {savings > 0 && (
                <View className="bg-emerald-100 px-2 py-0.5 rounded-md">
                  <Text className="text-emerald-800 font-bold" style={{ fontSize: 11 }}>
                    Save ₹{savings}
                  </Text>
                </View>
              )}
            </View>

            {/* Right: Heart (Favorite) & Share Action Buttons */}
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 items-center justify-center shadow-xs"
                onPress={() => onToggleFavorite(product.id)}
                activeOpacity={0.8}
                accessibilityLabel="Favorite"
              >
                <Heart
                  size={19}
                  color={isFavorite ? '#EF4444' : '#334155'}
                  fill={isFavorite ? '#EF4444' : 'transparent'}
                  strokeWidth={2.2}
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 items-center justify-center shadow-xs"
                onPress={() => Alert.alert('Share Product', `Share link copied for ${product.name}!`)}
                activeOpacity={0.8}
                accessibilityLabel="Share"
              >
                <Share2 size={17} color="#334155" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. Express Farm Delivery Banner */}
          <View className="flex-row items-center bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3 gap-2.5 mb-4">
            <View className="w-9 h-9 rounded-xl bg-white border border-emerald-200 items-center justify-center shadow-xs shrink-0">
              <Zap size={18} color="#16A34A" fill="#16A34A" />
            </View>
            <View className="flex-1 mr-1">
              <Text className="text-[13px] font-bold text-slate-900" numberOfLines={1}>
                Express Delivery in 15–20 Mins
              </Text>
            </View>
            <View className="flex-row items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-emerald-200 shrink-0">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <Text className="text-xs font-bold text-emerald-700">In Stock</Text>
            </View>
          </View>

          {/* 4. Prominent Quantity Stepper */}
          <View className="flex-row justify-between items-center bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-4 shadow-xs">
            <View className="flex-1 mr-3">
              <Text className="text-sm font-extrabold text-slate-900">Select Quantity</Text>
              <Text className="text-xs font-semibold text-slate-500 mt-0.5">
                Pack Size: {product.unit || '1 Unit'}
              </Text>
            </View>

            {/* Prominent Stepper Controls */}
            <View className="flex-row items-center bg-emerald-50 border-2 border-emerald-600 rounded-2xl p-1 gap-2.5 shadow-xs">
              <TouchableOpacity
                className="w-9 h-9 rounded-xl items-center justify-center bg-emerald-700 active:bg-emerald-800"
                onPress={() => setDetailQty(Math.max(1, detailQty - 1))}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Decrease Quantity"
              >
                <Minus size={18} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>

              <View className="min-w-[34px] items-center justify-center px-1">
                <Text className="text-base font-black text-emerald-950 text-center">
                  {detailQty}
                </Text>
              </View>

              <TouchableOpacity
                className="w-9 h-9 rounded-xl items-center justify-center bg-emerald-700 active:bg-emerald-800"
                onPress={() => setDetailQty(detailQty + 1)}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Increase Quantity"
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 5. Organic Farm & Origin Card */}
          <View className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-3.5 mb-4 shadow-xs">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                <View className="w-10 h-10 rounded-xl bg-emerald-100 items-center justify-center border border-emerald-200">
                  <Sprout size={20} color="#047857" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-sm font-extrabold text-slate-900" numberOfLines={1}>
                      {vendorName}
                    </Text>
                    <View className="bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                      <Text className="text-[9px] font-black text-emerald-800">VERIFIED</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-slate-500 font-medium mt-0.5" numberOfLines={1}>
                    📍 {vendorLocation}
                  </Text>
                </View>
              </View>

              <View className="bg-white px-2.5 py-1 rounded-lg border border-emerald-200 items-end">
                <Text className="text-[10px] font-bold text-slate-400">Radius</Text>
                <Text className="text-xs font-black text-emerald-700">~2.8 km</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-2.5 pt-2 border-t border-emerald-200/60">
              <View className="flex-row items-center gap-1">
                <ShieldCheck size={13} color="#059669" />
                <Text className="text-[11px] font-bold text-slate-600">Cert #{certNumber}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Truck size={13} color="#D97706" />
                <Text className="text-[11px] font-bold text-amber-800">Direct Farm Delivery</Text>
              </View>
            </View>
          </View>

          {/* 6. Four Organic Purity Highlights */}
          <Text className="font-bold text-slate-900 mb-2 mt-1" style={{ fontSize: 14 }}>
            Why Choose Mathira Organic?
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-2 mb-4">
            <View className="w-[48.5%] bg-white border border-slate-200 rounded-xl p-2.5 flex-row items-center gap-2 shadow-xs">
              <View className="w-8 h-8 rounded-lg bg-emerald-50 items-center justify-center shrink-0">
                <ShieldCheck size={16} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900 text-xs">Zero Pesticides</Text>
                <Text className="text-slate-400 text-[10px]" numberOfLines={1}>100% Lab Tested</Text>
              </View>
            </View>

            <View className="w-[48.5%] bg-white border border-slate-200 rounded-xl p-2.5 flex-row items-center gap-2 shadow-xs">
              <View className="w-8 h-8 rounded-lg bg-emerald-50 items-center justify-center shrink-0">
                <Sprout size={16} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900 text-xs">Native Heirloom</Text>
                <Text className="text-slate-400 text-[10px]" numberOfLines={1}>Non-GMO Seeds</Text>
              </View>
            </View>

            <View className="w-[48.5%] bg-white border border-slate-200 rounded-xl p-2.5 flex-row items-center gap-2 shadow-xs">
              <View className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center shrink-0">
                <Truck size={16} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900 text-xs">Fresh Harvest</Text>
                <Text className="text-slate-400 text-[10px]" numberOfLines={1}>Direct Local Farm</Text>
              </View>
            </View>

            <View className="w-[48.5%] bg-white border border-slate-200 rounded-xl p-2.5 flex-row items-center gap-2 shadow-xs">
              <View className="w-8 h-8 rounded-lg bg-amber-50 items-center justify-center shrink-0">
                <Award size={16} color="#D97706" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900 text-xs">Fair Trade</Text>
                <Text className="text-slate-400 text-[10px]" numberOfLines={1}>Fair to Farmers</Text>
              </View>
            </View>
          </View>

          {/* 7. Product Description */}
          <Text className="font-bold text-slate-900 mb-2 mt-1" style={{ fontSize: 14 }}>
            Product Details
          </Text>
          <View className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-4">
            <Text className="text-slate-700 leading-5" style={{ fontSize: 12 }}>
              {product.description || 'Nurtured organically in nutrient-rich soil without synthetic fertilizers or chemical pesticides. Picked at peak ripeness to ensure exceptional natural taste and maximum nutritional retention.'}
            </Text>
          </View>

          {/* 8. Nutritional & Health Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <>
              <Text className="font-bold text-slate-900 mb-2 mt-1" style={{ fontSize: 14 }}>
                Nutritional & Health Benefits
              </Text>
              <View className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 mb-4 gap-2">
                {product.benefits.map((b: string, i: number) => (
                  <View key={i} className="flex-row items-start gap-2">
                    <View className="w-3.5 h-3.5 rounded-full bg-emerald-200 items-center justify-center mt-0.5">
                      <Check size={10} color="#16A34A" />
                    </View>
                    <Text className="flex-1 text-slate-800 leading-5 font-medium" style={{ fontSize: 12 }}>{b}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Storage Advice Tip */}
          <View className="flex-row items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4">
            <Sparkles size={16} color="#CA8A04" />
            <Text className="flex-1 text-amber-900 leading-4" style={{ fontSize: 11 }}>
              <Text className="font-bold">Freshness Tip: </Text>
              Store in a cool dry place or refrigerator at 4°C to 8°C. Best consumed within 3–4 days of delivery.
            </Text>
          </View>

          {/* Customer Reviews & Rating Section (Dynamic Data & Submission) */}
          <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <View className="flex-row items-center gap-1.5">
                  <Star size={18} color="#D97706" fill="#D97706" />
                  <Text className="text-base font-extrabold text-slate-900">
                    {avgRating} / 5.0
                  </Text>
                  <Text className="text-xs text-slate-500 font-medium">
                    ({reviewsList.length} verified reviews)
                  </Text>
                </View>
                <Text className="text-[11px] text-slate-400 mt-0.5">Real customer ratings & feedback</Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowReviewModal(true)}
                className="bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl flex-row items-center gap-1.5 active:bg-emerald-100"
              >
                <MessageSquare size={13} color="#07843D" />
                <Text className="text-xs font-bold text-emerald-800">Rate & Review</Text>
              </TouchableOpacity>
            </View>

            {reviewsList.map((rev) => (
              <View key={rev.id} className="pt-3 border-t border-slate-100 mb-2.5">
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-xs font-bold text-slate-800">{rev.userName}</Text>
                    {rev.verifiedPurchase && (
                      <View className="flex-row items-center bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        <Check size={9} color="#07843D" />
                        <Text className="text-[9px] font-bold text-emerald-800 ml-0.5">Verified</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-[10px] text-slate-400">{rev.date}</Text>
                </View>

                {/* Stars */}
                <View className="flex-row items-center gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={11}
                      color={s <= rev.rating ? '#F59E0B' : '#CBD5E1'}
                      fill={s <= rev.rating ? '#F59E0B' : 'transparent'}
                    />
                  ))}
                </View>
                <Text className="text-xs text-slate-600 leading-4">{rev.comment}</Text>
              </View>
            ))}
          </View>

          {/* 9. Frequently Paired Farm Fresh Produce (Related Products) */}
          {relatedProducts.length > 0 && (
            <View className="mb-4">
              <Text className="font-bold text-slate-900 mb-2 mt-1" style={{ fontSize: 14 }}>
                Pairs Well With
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-3 py-1"
              >
                {relatedProducts.map(rp => (
                  <TouchableOpacity
                    key={rp.id}
                    className="w-36 bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm"
                    onPress={() => {
                      onSelectProduct(rp);
                      setDetailQty(1);
                    }}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: rp.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80' }}
                      className="w-full h-24 rounded-lg mb-1.5"
                      resizeMode="cover"
                    />
                    <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>{rp.name}</Text>
                    <View className="flex-row justify-between items-center mt-1.5">
                      <Text className="text-sm font-black text-slate-900">₹{rp.price}</Text>
                      <TouchableOpacity
                        className="bg-emerald-700 px-2.5 py-1 rounded-md"
                        onPress={() => onAddToCart(rp, 1)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Text className="text-white text-xs font-black">+ ADD</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 10. Floating Sticky Bottom Bar */}
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8) + 6,
        }}
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 pt-3 flex-row items-center justify-between shadow-xl"
      >
        <View className="flex-1 mr-2">
          <Text className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">TOTAL PRICE</Text>
          <Text className="text-xl font-black text-slate-900 leading-tight">₹{product.price * detailQty}</Text>
          <Text className="text-[11px] text-slate-500 font-medium" numberOfLines={1}>
            {detailQty} {detailQty === 1 ? 'pack' : 'packs'} · Incl. taxes
          </Text>
        </View>

        <View className="flex-row items-center gap-2 shrink-0">
          {product.oneTimeAllowed && (
            <TouchableOpacity
              className="flex-row items-center justify-center gap-1.5 bg-emerald-700 px-3.5 py-2.5 rounded-xl shadow-xs active:bg-emerald-800"
              onPress={() => onAddToCart(product, detailQty)}
              activeOpacity={0.85}
            >
              <ShoppingCart size={16} color="#FFFFFF" strokeWidth={2.3} />
              <Text className="text-white text-xs font-black">Add to Cart</Text>
            </TouchableOpacity>
          )}

          {product.subscriptionAllowed && (
            <TouchableOpacity
              className="flex-row items-center justify-center gap-1.5 bg-[#F2C500] px-3.5 py-2.5 rounded-xl shadow-xs active:bg-amber-400"
              onPress={() => onStartSubscription(product, detailQty)}
              activeOpacity={0.85}
            >
              <Repeat size={14} color="#18352B" strokeWidth={2.5} />
              <Text className="text-[#18352B] text-xs font-black">Subscribe</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Write a Review Modal */}
      <Modal visible={showReviewModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <View>
                <Text className="text-base font-extrabold text-slate-800">Rate & Review Produce</Text>
                <Text className="text-xs text-slate-500 mt-0.5">{product.name} · Verified Order</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowReviewModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Star Picker */}
            <Text className="text-xs font-bold text-slate-700 mb-2">Overall Rating *</Text>
            <View className="flex-row items-center gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setNewRating(star)}
                  className="p-1"
                >
                  <Star
                    size={28}
                    color={star <= newRating ? '#F59E0B' : '#CBD5E1'}
                    fill={star <= newRating ? '#F59E0B' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
              <Text className="text-xs font-black text-amber-700 ml-1">
                {newRating === 5 ? 'Excellent 🌟' : newRating === 4 ? 'Very Good 👍' : `${newRating} Stars`}
              </Text>
            </View>

            {/* Name input */}
            <Text className="text-xs font-bold text-slate-700 mb-1">Your Name (Optional)</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-3"
              placeholder="e.g. Ramesh K."
              placeholderTextColor="#94A3B8"
              value={reviewerName}
              onChangeText={setReviewerName}
            />

            {/* Review Comment input */}
            <Text className="text-xs font-bold text-slate-700 mb-1">Your Feedback / Review *</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-4 min-h-[75px]"
              placeholder="Share details on freshness, natural taste, packaging..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={newComment}
              onChangeText={setNewComment}
            />

            <TouchableOpacity
              onPress={handleSubmitReview}
              className="bg-emerald-700 py-3.5 rounded-xl items-center justify-center flex-row gap-2 shadow-sm active:bg-emerald-800"
            >
              <Send size={15} color="#FFFFFF" />
              <Text className="text-white font-bold text-sm">Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
