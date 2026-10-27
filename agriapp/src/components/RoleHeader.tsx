import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform, Image } from 'react-native';
import { MapPin, User, Menu as MenuIcon, Store, Sprout, Settings, ChevronDown } from 'lucide-react-native';

export type UserRole = 'customer' | 'admin' | 'vendor' | null;

interface RoleHeaderProps {
  role: UserRole;
  onSelectRole: (role: 'customer' | 'admin' | 'vendor') => void;
  onOpenMenu: () => void;
  onOpenProfile?: () => void;
  onSwitchToCustomer?: () => void;
  customerScreen?: string;
  selectedLocation?: { address: string; city?: string; isGpsVerified?: boolean } | null;
  onChangeLocation?: () => void;
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

// Role-specific theme colours (Unified Mathira Organic Green Palette)
const roleTheme = {
  customer: { bg: '#0D2B1D', sub: '#15803D', accent: '#22c55e', label: 'DELIVERING TO', labelColor: '#86efac' },
  vendor:   { bg: '#064E3B', sub: '#047857', accent: '#10B981', label: 'FARMER PORTAL', labelColor: '#A7F3D0' },
  admin:    { bg: '#14532D', sub: '#166534', accent: '#4ADE80', label: 'SUPER ADMIN', labelColor: '#BBF7D0' },
};

export const RoleHeader: React.FC<RoleHeaderProps> = ({
  role,
  onOpenMenu,
  onOpenProfile,
  onSwitchToCustomer,
  selectedLocation,
  onChangeLocation,
}) => {
  const theme = role ? roleTheme[role] : roleTheme.customer;

  const getMainTitle = () => 'Mathira Organic Farming';

  const getSubTitle = () => {
    switch (role) {
      case 'customer':
        if (selectedLocation?.address) {
          return selectedLocation.address.length > 28
            ? `${selectedLocation.address.substring(0, 26)}...`
            : selectedLocation.address;
        }
        return 'Select Location';
      case 'vendor':
        return 'Farmer Console';
      case 'admin':
        return 'Super Admin Console';
      default:
        return 'Fresh & Pure Direct from Farm';
    }
  };

  const renderSubIcon = () => {
    switch (role) {
      case 'customer': return <MapPin size={12} color={theme.labelColor} style={{ marginRight: 3 }} />;
      case 'vendor':   return <Sprout size={12} color={theme.labelColor} style={{ marginRight: 3 }} />;
      case 'admin':    return <Settings size={12} color={theme.labelColor} style={{ marginRight: 3 }} />;
      default:         return <Sprout size={12} color={theme.labelColor} style={{ marginRight: 3 }} />;
    }
  };

  return (
    <View 
      className="pb-3.5 px-4 flex-row items-center justify-between"
      style={{ backgroundColor: theme.sub, paddingTop: Platform.OS === 'web' ? 16 : STATUSBAR_HEIGHT + 12 }}
    >
      {/* Left Menu Hamburger Toggle + Logo + Brand */}
      <View className="flex-1 flex-row items-center gap-2.5">
        <TouchableOpacity 
          className="w-9 h-9 rounded-xl bg-white/20 items-center justify-center"
          onPress={onOpenMenu} 
          activeOpacity={0.7}
        >
          <MenuIcon size={20} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center gap-2.5">
          <Image
            source={require('../../asset/logo.jpeg')}
            className="w-10 h-10 rounded-xl bg-white"
            resizeMode="contain"
          />
          <View className="flex-1 pr-1">
            <Text className="text-base font-extrabold text-white tracking-tight" numberOfLines={1}>
              {getMainTitle()}
            </Text>

            {role === 'customer' && onChangeLocation ? (
              <TouchableOpacity
                className="flex-row items-center bg-white/20 px-2 py-0.5 rounded-lg mt-0.5 self-start max-w-[92%]"
                onPress={onChangeLocation}
                activeOpacity={0.8}
              >
                {renderSubIcon()}
                <Text className="text-xs font-bold text-white" numberOfLines={1}>
                  {getSubTitle()}
                </Text>
                <ChevronDown size={12} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center mt-0.5">
                {renderSubIcon()}
                <Text className="text-xs font-bold" style={{ color: theme.labelColor }} numberOfLines={1}>
                  {getSubTitle()}
                </Text>
                {role === 'admin' && (
                  <View className="bg-red-600 rounded-md px-1.5 py-0.5 ml-1.5">
                    <Text className="text-white text-2xs font-bold">LIVE</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Right actions */}
      <View className="flex-row items-center gap-2 ml-1.5">
        {role === 'customer' && onOpenProfile && (
          <TouchableOpacity 
            className="w-9 h-9 rounded-xl bg-white/20 items-center justify-center"
            onPress={onOpenProfile} 
            activeOpacity={0.7}
          >
            <User size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
        {role === 'vendor' && onSwitchToCustomer && (
          <TouchableOpacity 
            className="flex-row items-center gap-1.5 bg-white/20 px-2.5 py-1.5 rounded-xl"
            onPress={onSwitchToCustomer} 
            activeOpacity={0.8}
          >
            <Store size={15} color="#fff" strokeWidth={2.2} />
            <Text className="text-white text-xs font-bold">Store</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default RoleHeader;
