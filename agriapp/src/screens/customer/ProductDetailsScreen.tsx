import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
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
} from 'lucide-react-native';
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
  const [detailQty, setDetailQty] = useState(1);

  const origPrice = (product as any).originalPrice || Math.round(product.price * 1.25);
  const savings = Math.max(0, origPrice - product.price);
  const discountPct = origPrice > product.price ? Math.round(((origPrice - product.price) / origPrice) * 100) : 20;

  const customerCity =
    selectedLocation?.city ||
    (selectedLocation?.address ? selectedLocation.address.split(',')[0].trim() : 'Local Area');
  const vendorName =
    (product as any).farmerName ||
    (product as any).farmName ||
    (product as any).brand ||
    'Jeena Organic Farm';
  const vendorLocation =
    (product as any).farmerLocation || `${customerCity} Organic Cluster`;
  const certNumber =
    (product as any).certificationNumber || (product as any).certificateNo || 'TN-ORG-4821';

  const relatedProducts = productsList.filter(
    p => p.id !== product.id && (safeCategory(p.category) === safeCategory(product.category) || p.organicCertified)
  ).slice(0, 6);

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* 1. Elevated Hero Media & Floating Actions */}
        <View className="relative w-full h-80 bg-slate-900">
          <Image
            source={{ uri: product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80' }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Top Floating Action Buttons (Favorite & Share on top-right) */}
          <View className="absolute top-3.5 right-3.5 flex-row gap-2 z-10">
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-white/90 items-center justify-center shadow-sm"
              onPress={() => onToggleFavorite(product.id)}
              activeOpacity={0.8}
              accessibilityLabel="Favorite"
            >
              <Heart
                size={18}
                color={isFavorite ? '#EF4444' : '#0F172A'}
                fill={isFavorite ? '#EF4444' : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-white/90 items-center justify-center shadow-sm"
              onPress={() => Alert.alert('Share Product', `Share link copied for ${product.name}!`)}
              activeOpacity={0.8}
              accessibilityLabel="Share"
            >
              <Share2 size={16} color="#0F172A" />
            </TouchableOpacity>
          </View>

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
        <View className="p-5 bg-white -mt-6 rounded-t-3xl shadow-sm">
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

          {/* Price & Savings Row */}
          <View className="flex-row items-baseline gap-2 mb-3.5">
            <Text className="font-extrabold text-slate-900" style={{ fontSize: 22 }}>
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

          {/* 3. Express Farm Delivery Banner */}
          <View className="flex-row items-center bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 gap-3 mb-4">
            <View className="w-10 h-10 rounded-xl bg-white border border-emerald-200 items-center justify-center shadow-sm">
              <Zap size={20} color="#16A34A" fill="#16A34A" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-slate-900">Express Delivery in 15–20 Mins</Text>
              <Text className="text-xs text-slate-500 mt-0.5">Direct cold-chain transit · Harvested fresh daily</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <Text className="text-xs font-bold text-emerald-700">In Stock</Text>
            </View>
          </View>

          {/* 4. Quantity Stepper */}
          <View className="flex-row justify-between items-center bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5">
            <View>
              <Text className="text-sm font-bold text-slate-900">Quantity</Text>
              <Text className="text-xs text-slate-500 mt-0.5">
                Total: ₹{product.price * detailQty} for {detailQty} {product.unit}
              </Text>
            </View>
            <View className="flex-row items-center bg-white border border-slate-300 rounded-xl px-2 py-1 gap-3">
              <TouchableOpacity
                className="w-7 h-7 rounded items-center justify-center bg-emerald-700"
                onPress={() => setDetailQty(Math.max(1, detailQty - 1))}
                activeOpacity={0.7}
              >
                <Text className="text-white text-sm font-black">−</Text>
              </TouchableOpacity>
              <Text className="text-sm font-black text-slate-900">{detailQty} {product.unit}</Text>
              <TouchableOpacity
                className="w-7 h-7 rounded items-center justify-center bg-emerald-700"
                onPress={() => setDetailQty(detailQty + 1)}
                activeOpacity={0.7}
              >
                <Text className="text-white text-sm font-black">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 5. Customer Nearby Organic Vendor Card */}
          <View className="bg-[#08281A] border border-emerald-800/80 rounded-2xl p-4 mb-4 shadow-sm">
            {/* Top row: Nearby Tag + Proximity Distance */}
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center gap-1.5 bg-emerald-900/80 border border-emerald-600/50 px-2.5 py-1 rounded-full">
                <Store size={12} color="#86EFAC" />
                <Text className="text-emerald-300 font-extrabold uppercase tracking-wider" style={{ fontSize: 10 }}>
                  Nearby Organic Vendor
                </Text>
              </View>
              <View className="flex-row items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md border border-emerald-900/60">
                <MapPin size={11} color="#34D399" />
                <Text className="text-emerald-300 font-bold" style={{ fontSize: 11 }}>
                  ~2.8 km away
                </Text>
              </View>
            </View>

            {/* Middle: Vendor/Farmer Identity */}
            <View className="flex-row items-center gap-3">
              <View className="w-11 h-11 rounded-full bg-emerald-900/90 items-center justify-center border border-emerald-600/70 shadow-xs">
                <Sprout size={20} color="#86EFAC" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-white font-extrabold tracking-tight" style={{ fontSize: 15 }}>
                    {vendorName}
                  </Text>
                  <View className="bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    <Text className="text-emerald-300 font-bold" style={{ fontSize: 9 }}>VERIFIED</Text>
                  </View>
                </View>
                <Text className="text-emerald-200/90 font-medium mt-0.5" style={{ fontSize: 12 }}>
                  📍 Near {vendorLocation}
                </Text>
              </View>
            </View>

            {/* Bottom: Freshness & Certification */}
            <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-emerald-900/70">
              <View className="flex-row items-center gap-1">
                <ShieldCheck size={12} color="#34D399" />
                <Text className="text-emerald-300/90 font-medium" style={{ fontSize: 11 }}>
                  Cert #{certNumber}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Truck size={12} color="#FDE047" />
                <Text className="text-amber-200 font-bold" style={{ fontSize: 11 }}>
                  Direct Farm Delivery
                </Text>
              </View>
            </View>
          </View>

          {/* 6. Four Organic Purity Highlights */}
          <Text className="font-bold text-slate-900 mb-2 mt-1" style={{ fontSize: 14 }}>
            Why Choose Mathira Organic?
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-2.5 mb-4">
            <View className="w-[48%] bg-slate-50 border border-slate-200 rounded-xl p-3">
              <ShieldCheck size={16} color="#16A34A" />
              <Text className="font-bold text-slate-900 mt-1" style={{ fontSize: 12 }}>Zero Pesticides</Text>
              <Text className="text-slate-500 mt-0.5 leading-4" style={{ fontSize: 11 }}>Lab tested for 120+ chemical residues</Text>
            </View>
            <View className="w-[48%] bg-slate-50 border border-slate-200 rounded-xl p-3">
              <Sprout size={16} color="#059669" />
              <Text className="font-bold text-slate-900 mt-1" style={{ fontSize: 12 }}>Native Seeds</Text>
              <Text className="text-slate-500 mt-0.5 leading-4" style={{ fontSize: 11 }}>Non-GMO traditional heirloom crops</Text>
            </View>
            <View className="w-[48%] bg-slate-50 border border-slate-200 rounded-xl p-3">
              <Truck size={16} color="#2563EB" />
              <Text className="font-bold text-slate-900 mt-1" style={{ fontSize: 12 }}>Direct Cold Chain</Text>
              <Text className="text-slate-500 mt-0.5 leading-4" style={{ fontSize: 11 }}>From farm to doorstep in under 12 hours</Text>
            </View>
            <View className="w-[48%] bg-slate-50 border border-slate-200 rounded-xl p-3">
              <Award size={16} color="#D97706" />
              <Text className="font-bold text-slate-900 mt-1" style={{ fontSize: 12 }}>Fair Trade</Text>
              <Text className="text-slate-500 mt-0.5 leading-4" style={{ fontSize: 11 }}>100% fair payout to organic vendors</Text>
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
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex-row items-center justify-between shadow-lg">
        <View className="flex-1">
          <Text className="text-xs font-black text-emerald-800 uppercase tracking-wider">TOTAL PRICE</Text>
          <Text className="text-xl font-black text-slate-900">₹{product.price * detailQty}</Text>
          <Text className="text-xs text-slate-500">for {detailQty} {product.unit} · Incl. all taxes</Text>
        </View>
        <View className="flex-row gap-2">
          {product.oneTimeAllowed && (
            <TouchableOpacity
              className="flex-row items-center gap-1.5 bg-emerald-700 px-4 py-2.5 rounded-xl"
              onPress={() => onAddToCart(product, detailQty)}
              activeOpacity={0.85}
            >
              <ShoppingCart size={17} color="#FFFFFF" />
              <Text className="text-white text-sm font-black">Add to Cart</Text>
            </TouchableOpacity>
          )}
          {product.subscriptionAllowed && (
            <SubscriptionButton
              title="Subscribe"
              icon={<Repeat size={14} color="#FFFFFF" />}
              variant="primary"
              size="small"
              onPress={() => onStartSubscription(product, detailQty)}
            />
          )}
        </View>
      </View>
    </View>
  );
};
