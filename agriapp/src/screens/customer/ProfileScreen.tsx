import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  User,
  Check,
  Phone,
  Mail,
  Award,
  MapPin,
  Pencil,
  Package,
  Repeat,
  Star,
  Store,
  Clock,
  ShoppingCart,
  MessageSquare,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { CustomerScreenKey } from './types';
import { theme } from '../../theme';

export interface ProfileScreenProps {
  userPhone?: string;
  profileName: string;
  profileEmail: string;
  profileLocation: string;
  profileStats: { orders: number; subs: number };
  isApprovedVendor: boolean;
  vendorApplicationStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  cartCount: number;
  onNavigateScreen: (screen: CustomerScreenKey) => void;
  onOpenEditProfile: () => void;
  onOpenVendorModal: () => void;
  onRefreshVendorStatus: () => void;
  onSwitchToVendor?: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userPhone,
  profileName,
  profileEmail,
  profileLocation,
  profileStats,
  isApprovedVendor,
  vendorApplicationStatus,
  cartCount,
  onNavigateScreen,
  onOpenEditProfile,
  onOpenVendorModal,
  onRefreshVendorStatus,
  onSwitchToVendor,
  onLogout,
}) => {
  const initial =
    profileName && profileName.trim().length > 0
      ? profileName.trim().charAt(0).toUpperCase()
      : null;

  return (
    <ScrollView
      contentContainerClassName="p-4"
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-[#F6F8F6]"
    >
      {/* ── 1. Hero Profile Card ── */}
      <View className="bg-white rounded-2xl p-4 border border-slate-200/80 mb-3.5 shadow-sm">
        <View className="flex-row items-center">
          {/* Avatar with initial or icon + verified badge */}
          <View className="relative">
            <View className="w-15 h-15 rounded-full bg-emerald-800 items-center justify-center shadow-xs" style={{ width: 60, height: 60 }}>
              {initial ? (
                <Text className="text-2xl font-black text-white">{initial}</Text>
              ) : (
                <User size={28} color="#FFFFFF" />
              )}
            </View>
            <View className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-600 border-2 border-white items-center justify-center">
              <Check size={10} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>

          {/* User Details */}
          <View className="flex-1 ml-3.5">
            <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
              {profileName || 'Customer'}
            </Text>

            <View className="flex-row items-center gap-1.5 mt-1">
              <Phone size={12} color={theme.colors.textSec} />
              <Text className="text-slate-600 font-medium" style={{ fontSize: 12 }}>
                +91 {userPhone || '98765 43210'}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Mail size={12} color={theme.colors.textMuted} />
              <Text className="text-slate-500" style={{ fontSize: 12 }} numberOfLines={1}>
                {profileEmail || 'customer@mathiraorganic.com'}
              </Text>
            </View>

            <View className="bg-emerald-50 px-2.5 py-0.5 rounded-full self-start border border-emerald-200/80 flex-row items-center gap-1 mt-1.5">
              <Award size={11} color="#059669" />
              <Text className="font-semibold text-emerald-800" style={{ fontSize: 10.5 }}>
                Mathira Gold · 100% Organic Club
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Address & In-Card Edit Button */}
        <View className="flex-row items-center justify-between mt-3.5 pt-3 border-t border-slate-100">
          <View className="flex-row items-center gap-2 flex-1 mr-2">
            <View className="w-6 h-6 rounded-full bg-slate-100 items-center justify-center">
              <MapPin size={12} color="#64748B" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 font-bold" style={{ fontSize: 9.5 }}>DEFAULT ADDRESS</Text>
              <Text className="text-slate-700 font-medium" style={{ fontSize: 12 }} numberOfLines={1}>
                {profileLocation || 'Bangalore, Karnataka'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200"
            onPress={onOpenEditProfile}
            activeOpacity={0.7}
          >
            <Pencil size={11} color="#047857" />
            <Text className="font-bold text-emerald-800" style={{ fontSize: 11 }}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 2. Smart Metrics Summary Row ── */}
      <View className="flex-row gap-2.5 mb-3.5">
        <TouchableOpacity
          className="flex-1 bg-white py-3 px-2 rounded-2xl border border-slate-200/80 items-center shadow-xs"
          onPress={() => onNavigateScreen('ORDER_HISTORY')}
          activeOpacity={0.75}
        >
          <Text className="text-lg font-bold text-slate-800">{profileStats.orders}</Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <Package size={12} color="#64748B" />
            <Text className="font-bold text-slate-700" style={{ fontSize: 11 }}>Orders</Text>
          </View>
          <Text className="text-slate-400 mt-0.5" style={{ fontSize: 10 }}>Farm Deliveries</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-white py-3 px-2 rounded-2xl border border-slate-200/80 items-center shadow-xs"
          onPress={() => onNavigateScreen('MY_SUBSCRIPTIONS')}
          activeOpacity={0.75}
        >
          <Text className="text-lg font-bold text-emerald-700">{profileStats.subs}</Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <Repeat size={12} color="#059669" />
            <Text className="font-bold text-slate-700" style={{ fontSize: 11 }}>Plans</Text>
          </View>
          <Text className="text-slate-400 mt-0.5" style={{ fontSize: 10 }}>Daily 6:30 AM</Text>
        </TouchableOpacity>

        <View className="flex-1 bg-white py-3 px-2 rounded-2xl border border-slate-200/80 items-center shadow-xs">
          <Text className="text-lg font-bold text-amber-600">280</Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <Star size={12} color="#D97706" />
            <Text className="font-bold text-slate-700" style={{ fontSize: 11 }}>Eco Points</Text>
          </View>
          <Text className="text-slate-400 mt-0.5" style={{ fontSize: 10 }}>Save ₹280</Text>
        </View>
      </View>

      {/* ── 3. Vendor Registration Section (Only shown for non-vendors) ── */}
      {!isApprovedVendor && vendorApplicationStatus !== 'APPROVED' && (
        <View className="bg-white rounded-2xl p-4 border border-slate-200/80 mb-3.5 shadow-xs">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center border border-emerald-200">
              <Store size={20} color="#047857" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-slate-800">Organic Vendor Hub</Text>
              <Text className="text-slate-500" style={{ fontSize: 11 }}>
                Supply fresh harvest directly to local subscribers
              </Text>
            </View>
          </View>

          {vendorApplicationStatus === 'PENDING' ? (
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Clock size={14} color="#B45309" />
                <Text className="text-xs font-bold text-amber-800">
                  APPLICATION UNDER REVIEW
                </Text>
              </View>
              <Text className="text-slate-600 leading-4 mb-3" style={{ fontSize: 11 }}>
                Your vendor application for +91 {userPhone || '98765 43210'} is being reviewed by Admin. Once approved, the Vendor Console will unlock automatically.
              </Text>
              <TouchableOpacity
                className="bg-white border border-amber-300 py-2 rounded-xl items-center justify-center flex-row gap-1.5"
                onPress={onRefreshVendorStatus}
                activeOpacity={0.7}
              >
                <Repeat size={13} color="#B45309" />
                <Text className="text-xs font-bold text-amber-800">Check Approval Status</Text>
              </TouchableOpacity>
            </View>
          ) : vendorApplicationStatus === 'REJECTED' ? (
            <View className="bg-rose-50 border border-rose-200 rounded-xl p-3.5">
              <Text className="text-xs font-bold text-rose-700">DOCUMENT UPDATE REQUIRED</Text>
              <Text className="text-slate-600 leading-4 mb-3" style={{ fontSize: 11 }}>
                Admin requested an updated organic accreditation. Please review and re-apply.
              </Text>
              <TouchableOpacity
                className="bg-rose-600 py-2 rounded-xl items-center justify-center"
                onPress={onOpenVendorModal}
                activeOpacity={0.8}
              >
                <Text className="text-xs font-bold text-white">Update & Re-apply</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <Text className="text-slate-600 leading-4 mb-3" style={{ fontSize: 11 }}>
                Produce certified organic vegetables, fruits, dairy, or cold-pressed oils? Register as a vendor to sell directly to local customers.
              </Text>
              <TouchableOpacity
                className="bg-emerald-800 py-2.5 rounded-xl items-center justify-center shadow-sm flex-row gap-1.5 active:bg-emerald-900"
                onPress={onOpenVendorModal}
                activeOpacity={0.85}
              >
                <Store size={14} color="#FFFFFF" />
                <Text className="text-white font-bold text-xs">Apply as Vendor</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ── 4. Grouped Menus: Orders & Saved ── */}
      <View className="bg-white rounded-2xl p-4 border border-slate-200/80 mb-3.5 shadow-xs">
        <Text className="text-slate-400 font-bold tracking-wider mb-2" style={{ fontSize: 11 }}>
          ORDERS & SAVED
        </Text>

        <TouchableOpacity
          className="flex-row items-center py-2.5"
          onPress={() => onNavigateScreen('ORDER_HISTORY')}
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mr-3 border border-emerald-100/70">
            <Package size={17} color="#047857" />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-slate-800">My Orders & Receipts</Text>
            <Text className="text-slate-500 mt-0.5" style={{ fontSize: 11 }}>
              Track farm-fresh deliveries & invoices
            </Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>

        <View className="h-px bg-slate-100 my-1" />

        <TouchableOpacity
          className="flex-row items-center py-2.5"
          onPress={() => onNavigateScreen('MY_SUBSCRIPTIONS')}
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mr-3 border border-emerald-100/70">
            <Repeat size={17} color="#047857" />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-slate-800">Morning Subscriptions</Text>
            <Text className="text-slate-500 mt-0.5" style={{ fontSize: 11 }}>
              Pause, skip, or change milk & veggie plans
            </Text>
          </View>
          <View className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mr-2">
            <Text className="font-bold text-emerald-700" style={{ fontSize: 10 }}>Active</Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>

        <View className="h-px bg-slate-100 my-1" />

        <TouchableOpacity
          className="flex-row items-center py-2.5"
          onPress={() => onNavigateScreen('CART')}
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mr-3 border border-emerald-100/70">
            <ShoppingCart size={17} color="#047857" />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-slate-800">My Cart</Text>
            <Text className="text-slate-500 mt-0.5" style={{ fontSize: 11 }}>
              {cartCount > 0 ? `${cartCount} items in basket` : 'View items ready for order'}
            </Text>
          </View>
          {cartCount > 0 && (
            <View className="bg-emerald-700 px-2 py-0.5 rounded-full mr-2">
              <Text className="text-white font-bold" style={{ fontSize: 10 }}>{cartCount}</Text>
            </View>
          )}
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>

        <View className="h-px bg-slate-100 my-1" />

        <TouchableOpacity
          className="flex-row items-center py-2.5"
          onPress={onOpenEditProfile}
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mr-3 border border-emerald-100/70">
            <MapPin size={17} color="#047857" />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-slate-800">Saved Delivery Addresses</Text>
            <Text className="text-slate-500 mt-0.5" style={{ fontSize: 11 }} numberOfLines={1}>
              {profileLocation || 'Manage your home & office addresses'}
            </Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* ── 5. Grouped Menus: Smart Farm Services ── */}
      <View className="bg-white rounded-2xl p-4 border border-slate-200/80 mb-3.5 shadow-xs">
        <Text className="text-slate-400 font-bold tracking-wider mb-2" style={{ fontSize: 11 }}>
          SMART FARM SERVICES
        </Text>

        <TouchableOpacity
          className="flex-row items-center py-2.5"
          onPress={() => onNavigateScreen('WHATSAPP_AI')}
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mr-3 border border-emerald-100/70">
            <MessageSquare size={17} color="#047857" />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-slate-800">WhatsApp AI Assistant</Text>
            <Text className="text-slate-500 mt-0.5" style={{ fontSize: 11 }}>
              Instant order booking & harvest queries
            </Text>
          </View>
          <View className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mr-2">
            <Text className="font-bold text-emerald-800" style={{ fontSize: 10 }}>BOT</Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>

        <View className="h-px bg-slate-100 my-1" />

        <TouchableOpacity
          className="flex-row items-center py-2.5"
          onPress={() => onNavigateScreen('AI_VOICE_CALL')}
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mr-3 border border-emerald-100/70">
            <Phone size={17} color="#047857" />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-slate-800">Voice AI Hotline</Text>
            <Text className="text-slate-500 mt-0.5" style={{ fontSize: 11 }}>
              Speak naturally in your native language
            </Text>
          </View>
          <View className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full mr-2">
            <Text className="font-bold text-blue-600" style={{ fontSize: 10 }}>LIVE</Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* ── 6. Grouped Menus: Quality & Trust ── */}
      <View className="bg-white rounded-2xl p-4 border border-slate-200/80 mb-3.5 shadow-xs">
        <Text className="text-slate-400 font-bold tracking-wider mb-2" style={{ fontSize: 11 }}>
          QUALITY & PREFERENCES
        </Text>

        <View className="flex-row items-center py-2.5">
          <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mr-3 border border-emerald-100/70">
            <ShieldCheck size={17} color="#047857" />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-slate-800">100% Certified Organic</Text>
            <Text className="text-slate-500 mt-0.5" style={{ fontSize: 11 }}>
              NPOP & Jaivik Bharat Accredited
            </Text>
          </View>
          <View className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <Text className="font-bold text-emerald-700" style={{ fontSize: 10 }}>VERIFIED</Text>
          </View>
        </View>

        <View className="h-px bg-slate-100 my-1" />

        <View className="flex-row items-center py-2.5">
          <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mr-3 border border-emerald-100/70">
            <Clock size={17} color="#047857" />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-slate-800">Morning Delivery Window</Text>
            <Text className="text-slate-500 mt-0.5" style={{ fontSize: 11 }}>
              Daily 06:00 AM – 07:00 AM
            </Text>
          </View>
          <View className="bg-slate-100 px-2 py-0.5 rounded-full">
            <Text className="font-medium text-slate-600" style={{ fontSize: 10 }}>Active</Text>
          </View>
        </View>
      </View>

      {/* ── 7. Sign Out Button ── */}
      <TouchableOpacity
        className="bg-white border border-rose-200 py-3.5 rounded-2xl items-center justify-center mb-4 shadow-xs flex-row gap-2 active:bg-rose-50"
        onPress={onLogout}
        activeOpacity={0.8}
      >
        <LogOut size={16} color="#EF4444" />
        <Text className="text-sm font-bold text-rose-600">Sign Out of Account</Text>
      </TouchableOpacity>

      {/* ── 8. Footer Branding ── */}
      <View className="items-center py-3 mb-6">
        <Text className="text-slate-400 font-semibold" style={{ fontSize: 11 }}>
          Mathira Organic Farming Pvt Ltd
        </Text>
        <Text className="text-slate-400 mt-0.5" style={{ fontSize: 10 }}>
          100% Jaivik Bharat & NPOP Certified · Version 2.4.0
        </Text>
      </View>

      <View className="h-10" />
    </ScrollView>
  );
};
