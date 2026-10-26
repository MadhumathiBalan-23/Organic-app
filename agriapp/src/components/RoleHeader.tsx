import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, Image } from 'react-native';
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
    <View style={[styles.header, { backgroundColor: theme.sub, paddingTop: Platform.OS === 'web' ? 16 : STATUSBAR_HEIGHT + 12 }]}>
      {/* Left Menu Hamburger Toggle + Logo + Brand */}
      <View style={styles.logoRow}>
        <TouchableOpacity style={styles.menuToggleBtn} onPress={onOpenMenu} activeOpacity={0.7}>
          <MenuIcon size={20} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image
            source={require('../../asset/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={{ flex: 1, paddingRight: 4 }}>
            <Text style={styles.titleText} numberOfLines={1}>{getMainTitle()}</Text>

            {role === 'customer' && onChangeLocation ? (
              <TouchableOpacity
                style={styles.locationPill}
                onPress={onChangeLocation}
                activeOpacity={0.8}
              >
                {renderSubIcon()}
                <Text style={[styles.labelText, { color: '#FFFFFF' }]} numberOfLines={1}>
                  {getSubTitle()}
                </Text>
                <ChevronDown size={12} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            ) : (
              <View style={styles.labelRow}>
                {renderSubIcon()}
                <Text style={[styles.labelText, { color: theme.labelColor }]} numberOfLines={1}>
                  {getSubTitle()}
                </Text>
                {role === 'admin' && (
                  <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>LIVE</Text></View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Right actions */}
      <View style={styles.rightBox}>
        {role === 'customer' && onOpenProfile && (
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenProfile} activeOpacity={0.7}>
            <User size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
        {role === 'vendor' && onSwitchToCustomer && (
          <TouchableOpacity style={styles.customerSwitchBtn} onPress={onSwitchToCustomer} activeOpacity={0.8}>
            <Store size={15} color="#fff" strokeWidth={2.2} />
            <Text style={styles.customerSwitchBtnText}>Store</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 3,
    alignSelf: 'flex-start',
    maxWidth: '92%',
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  liveBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 6,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  rightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 6,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  customerSwitchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
