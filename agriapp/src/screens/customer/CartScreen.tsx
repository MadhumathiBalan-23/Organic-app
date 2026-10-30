import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ShoppingCart, Trash, MapPin, Plus, Minus, Store, Info } from 'lucide-react-native';
import { CartItem, LocationData } from './types';
import { Product } from '../../constants/mockData';
import { EmptyState, AppButton } from '../../components/LoadingAndError';
import { safeCategory } from '../../services/api.client';
import { theme } from '../../theme';

export interface CartScreenProps {
  cart: CartItem[];
  onRemoveFromCart: (id: string) => void;
  onUpdateQty?: (product: Product, delta: number) => void;
  onBrowseProducts: () => void;
  selectedLocation: LocationData | null;
  profileLocation: string;
  onChangeLocation?: () => void;
  isPlacingOrder: boolean;
  onPlaceOrder: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  cart,
  onRemoveFromCart,
  onUpdateQty,
  onBrowseProducts,
  selectedLocation,
  profileLocation,
  onChangeLocation,
  isPlacingOrder,
  onPlaceOrder,
}) => {
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const deliveryFee = 20;
  const totalPayable = cartTotal + deliveryFee;

  // Group cart items strictly by VendorID
  const vendorGroups = useMemo(() => {
    const groups: Record<string, {
      vendorId: string;
      vendorName: string;
      vendorAddress?: string;
      items: CartItem[];
      subtotal: number;
    }> = {};

    for (const item of cart) {
      const vId = item.product?.vendorId || (item as any).vendorId || item.product?.vendor?.id || 'v-default';
      const vName = item.product?.vendor?.businessName || item.product?.vendorName || (item as any).vendorName || item.product?.brand || 'Organic Partner';
      const vAddress = item.product?.vendor?.address || item.product?.vendorAddress || '';

      if (!groups[vId]) {
        groups[vId] = {
          vendorId: vId,
          vendorName: vName,
          vendorAddress: vAddress,
          items: [],
          subtotal: 0,
        };
      }
      groups[vId].items.push(item);
      groups[vId].subtotal += item.product.price * item.qty;
    }

    return Object.values(groups);
  }, [cart]);

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <ScrollView contentContainerClassName="p-4 pb-12" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <ShoppingCart size={22} color={theme.colors.textPrimary} />
            <Text className="text-xl font-extrabold text-slate-900">My Cart</Text>
          </View>
          {cartCount > 0 && (
            <View className="bg-emerald-100 px-2.5 py-1 rounded-full">
              <Text className="text-xs font-bold text-emerald-800">
                {vendorGroups.length} {vendorGroups.length === 1 ? 'Farm' : 'Farms'}
              </Text>
            </View>
          )}
        </View>

        {cart.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={48} color={theme.colors.textMuted} />}
            title="Your cart is empty"
            description="Explore fresh organic milk, ghee, fruits, and vegetables from local organic farms."
            actionLabel="Browse Products"
            onAction={onBrowseProducts}
          />
        ) : (
          <>
            {/* Multi-Vendor Notice Banner */}
            {vendorGroups.length > 1 && (
              <View className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 mb-3 flex-row items-start gap-2.5">
                <Info size={16} color="#047857" style={{ marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="text-xs font-bold text-emerald-950">
                    Multi-Vendor Order ({vendorGroups.length} Organic Partners)
                  </Text>
                  <Text className="text-2xs text-emerald-800 mt-0.5 leading-4">
                    Items are sourced directly from separate farms. Separate delivery orders will be created automatically for each partner farm during checkout.
                  </Text>
                </View>
              </View>
            )}

            {/* Vendor-Grouped Cart Items */}
            {vendorGroups.map((group) => (
              <View key={group.vendorId} className="bg-white rounded-2xl border border-slate-200 p-3.5 mb-3.5 shadow-xs">
                {/* Vendor Header */}
                <View className="flex-row items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
                  <View className="flex-row items-center gap-2 flex-1">
                    <View className="w-7 h-7 rounded-full bg-emerald-100 items-center justify-center">
                      <Store size={14} color="#047857" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-black text-slate-900" numberOfLines={1}>
                        {group.vendorName}
                      </Text>
                      {group.vendorAddress ? (
                        <Text className="text-3xs text-slate-400" numberOfLines={1}>
                          📍 {group.vendorAddress}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View className="bg-slate-100 px-2 py-0.5 rounded-md">
                    <Text className="text-3xs font-extrabold text-slate-600">
                      Subtotal: ₹{group.subtotal}
                    </Text>
                  </View>
                </View>

                {/* Items under this Vendor */}
                {group.items.map((item) => (
                  <View
                    key={item.product.id}
                    className="flex-row items-center py-2 border-b border-slate-50 last:border-b-0"
                  >
                    <Image
                      source={{ uri: item.product.imageUrl }}
                      className="w-14 h-14 rounded-xl bg-slate-100"
                      resizeMode="cover"
                    />
                    <View className="flex-1 ml-3">
                      <Text className="text-xs font-bold text-slate-900" numberOfLines={1}>
                        {item.product.name}
                      </Text>
                      <Text className="text-2xs text-slate-400 mt-0.5">
                        {item.product.unit || safeCategory(item.product.category)}
                      </Text>
                      <Text className="text-xs text-slate-700 mt-0.5">
                        ₹{item.product.price} × {item.qty} ={' '}
                        <Text className="text-emerald-700 font-extrabold">
                          ₹{item.product.price * item.qty}
                        </Text>
                      </Text>
                    </View>
                    {onUpdateQty && (
                      <View className="flex-row items-center border border-emerald-600 rounded-lg overflow-hidden bg-emerald-50 mr-2">
                        <TouchableOpacity
                          className="px-2 py-1"
                          onPress={() => onUpdateQty(item.product, -1)}
                        >
                          <Minus size={12} color="#047857" />
                        </TouchableOpacity>
                        <Text className="px-1.5 font-bold text-xs text-emerald-950">{item.qty}</Text>
                        <TouchableOpacity
                          className="px-2 py-1"
                          onPress={() => onUpdateQty(item.product, 1)}
                        >
                          <Plus size={12} color="#047857" />
                        </TouchableOpacity>
                      </View>
                    )}
                    <TouchableOpacity
                      className="w-8 h-8 rounded-full bg-red-50 items-center justify-center border border-red-200"
                      onPress={() => onRemoveFromCart(item.product.id)}
                    >
                      <Trash size={14} color={theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}

            {/* Delivery Address Card with Change option */}
            <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-200">
              <View className="flex-row justify-between items-center mb-1.5">
                <View className="flex-row items-center gap-1.5">
                  <MapPin size={16} color={theme.colors.light} />
                  <Text className="text-sm font-extrabold text-slate-900">Delivery Address</Text>
                </View>
                {onChangeLocation && (
                  <TouchableOpacity onPress={onChangeLocation} activeOpacity={0.7}>
                    <Text className="text-xs font-extrabold text-emerald-700">Change</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text className="text-xs text-slate-600 leading-4">
                {selectedLocation?.address || profileLocation}
              </Text>
              <Text className="text-2xs text-emerald-700 font-bold mt-1.5">
                ✓ Within eligible partner delivery radiuses
              </Text>
            </View>

            {/* Bill Summary Breakdown */}
            <View className="bg-white p-4 rounded-2xl border border-slate-200 mb-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-600 text-xs">Items Subtotal ({cartCount} items)</Text>
                <Text className="font-bold text-xs text-slate-900">₹{cartTotal}</Text>
              </View>

              {vendorGroups.length > 1 && (
                <View className="py-1 mb-1 border-t border-b border-slate-100">
                  {vendorGroups.map((g) => (
                    <View key={g.vendorId} className="flex-row justify-between py-0.5">
                      <Text className="text-2xs text-slate-500">• {g.vendorName}</Text>
                      <Text className="text-2xs font-semibold text-slate-700">₹{g.subtotal}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View className="flex-row justify-between mb-2">
                <View>
                  <Text className="text-slate-600 text-xs">Standard Farm Delivery</Text>
                  <Text className="text-slate-400 text-3xs">Direct from local farms</Text>
                </View>
                <Text className="font-bold text-xs text-slate-900">₹{deliveryFee}</Text>
              </View>
              <View className="h-[1px] bg-slate-100 my-1.5" />
              <View className="flex-row justify-between mt-1">
                <Text className="text-slate-900 font-black text-base">Total Payable</Text>
                <Text className="text-emerald-700 font-black text-lg">₹{totalPayable}</Text>
              </View>
            </View>

            <AppButton
              title={
                vendorGroups.length > 1
                  ? `Confirm & Place ${vendorGroups.length} Orders · ₹${totalPayable}`
                  : `Place Order · ₹${totalPayable}`
              }
              loading={isPlacingOrder}
              loadingText="Placing Partner Orders..."
              onPress={onPlaceOrder}
              size="large"
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};
