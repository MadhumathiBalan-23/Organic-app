import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ShoppingCart, Trash, MapPin } from 'lucide-react-native';
import { CartItem, LocationData } from './types';
import { EmptyState, AppButton } from '../../components/LoadingAndError';
import { safeCategory } from '../../services/api.client';
import { theme } from '../../theme';

export interface CartScreenProps {
  cart: CartItem[];
  onRemoveFromCart: (id: string) => void;
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

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <ScrollView contentContainerClassName="p-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-2 mb-3">
          <ShoppingCart size={22} color={theme.colors.textPrimary} />
          <Text className="text-xl font-extrabold text-slate-900">My Cart</Text>
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
            {cart.map(item => (
              <View
                key={item.product.id}
                className="flex-row items-center bg-white p-3.5 rounded-2xl border border-slate-200 mb-2.5"
              >
                <Image
                  source={{ uri: item.product.imageUrl }}
                  className="w-16 h-16 rounded-xl bg-slate-100"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-0.5">
                    {safeCategory(item.product.category)}
                  </Text>
                  <Text className="text-sm text-slate-700 mt-1">
                    ₹{item.product.price} × {item.qty} ={' '}
                    <Text className="text-emerald-700 font-extrabold">
                      ₹{item.product.price * item.qty}
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity
                  className="w-9 h-9 rounded-full bg-red-50 items-center justify-center border border-red-200 ml-2"
                  onPress={() => onRemoveFromCart(item.product.id)}
                >
                  <Trash size={16} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Delivery Address Card with Change option */}
            <View className="bg-white rounded-2xl p-4 mt-3 mb-2.5 border border-slate-200">
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
              <Text className="text-sm text-slate-600 leading-5">
                {selectedLocation?.address || profileLocation}
              </Text>
              <Text className="text-xs text-emerald-700 font-bold mt-1.5">
                ✓ Distance to farm: 2.4 km (Within vendor delivery radius)
              </Text>
            </View>

            {/* Bill Summary Breakdown */}
            <View className="bg-white p-4 rounded-2xl border border-slate-200 mt-3">
              <View className="flex-row justify-between mb-2.5">
                <Text className="text-slate-600 text-sm">Items Subtotal ({cartCount} items)</Text>
                <Text className="font-bold text-sm text-slate-900">₹{cartTotal}</Text>
              </View>
              <View className="flex-row justify-between mb-2.5">
                <View>
                  <Text className="text-slate-600 text-sm">Delivery Charge (2.4 km)</Text>
                  <Text className="text-slate-400 text-xs">Base ₹15 + Distance fee ₹5</Text>
                </View>
                <Text className="font-bold text-sm text-slate-900">₹{deliveryFee}</Text>
              </View>
              <View className="h-[1px] bg-slate-100 my-2" />
              <View className="flex-row justify-between mt-2">
                <Text className="text-slate-900 font-black text-lg">Total Payable</Text>
                <Text className="text-emerald-700 font-black text-xl">₹{totalPayable}</Text>
              </View>
            </View>

            <AppButton
              title={`Place Order · ₹${totalPayable}`}
              loading={isPlacingOrder}
              loadingText="Placing Order..."
              onPress={onPlaceOrder}
              size="large"
              className="mt-3.5"
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};
