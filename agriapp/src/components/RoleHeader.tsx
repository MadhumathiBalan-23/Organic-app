import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, Image } from 'react-native';
import { MapPin, User, Menu as MenuIcon, Store, MonitorCog, Sprout, Settings } from 'lucide-react-native';

export type UserRole = 'customer' | 'admin' | 'vendor' | null;

interface RoleHeaderProps {
  role: UserRole;
  onSelectRole: (role: 'customer' | 'admin' | 'vendor') => void;
  onOpenMenu: () => void;
  onOpenProfile?: () => void;
  onSwitchToCustomer?: () => void;
  customerScreen?: string;
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

// Role-specific theme colours (Unified Mathira Organic Green Palette)
const roleTheme = {
  customer: { bg: '#0D2B1D', sub: '#15803D', accent: '#22c55e', label: 'DELIVERING TO', labelColor: '#86efac' },
  vendor:   { bg: '#064E3B', sub: '#047857', accent: '#10B981', label: 'FARMER PORTAL', labelColor: '#A7F3D0' },
  admin:    { bg: '#14532D', sub: '#166534', accent: '#4ADE80', label: 'SUPER ADMIN', labelColor: '#BBF7D0' },
};

export const RoleHeader: React.FC<RoleHeaderProps> = ({
  role, onSelectRole, onOpenMenu, onOpenProfile, onSwitchToCustomer, customerScreen = 'HOME',
}) => {
  const theme = role ? roleTheme[role] : roleTheme.customer;

  const getMainTitle = () => {
    return 'Mathira Organic Farming';
  };

  const getSubTitle = () => {
    switch (role) {
      case 'customer': return 'Indiranagar, Bangalore';
      case 'vendor':   return 'Farmer Console';
      case 'admin':    return 'Super Admin Console';
      default:         return 'Fresh & Pure Direct from Farm';
    }
  };

  const renderSubIcon = () => {
    switch (role) {
      case 'customer': return <MapPin size={11} color={theme.labelColor} style={{ marginRight: 3 }} />;
      case 'vendor':   return <Sprout size={11} color={theme.labelColor} style={{ marginRight: 3 }} />;
      case 'admin':    return <Settings size={11} color={theme.labelColor} style={{ marginRight: 3 }} />;
      default:         return <Sprout size={11} color={theme.labelColor} style={{ marginRight: 3 }} />;
    }
  };

  return (
    <View style={[styles.header, { backgroundColor: theme.sub, paddingTop: Platform.OS === 'web' ? 16 : STATUSBAR_HEIGHT + 12 }]}>
      {/* Left Menu Hamburger Toggle + Logo + Brand */}
      <View style={styles.logoRow}>
        <TouchableOpacity style={styles.menuToggleBtn} onPress={onOpenMenu} activeOpacity={0.7}>
          <MenuIcon size={20} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }} onPress={onOpenMenu} activeOpacity={0.8}>
          <Image
            source={require('../../asset/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={{ flex: 1, paddingRight: 4 }}>
            <Text style={styles.titleText} numberOfLines={1}>{getMainTitle()}</Text>
            <View style={styles.labelRow}>
              {renderSubIcon()}
              <Text style={[styles.labelText, { color: theme.labelColor }]} numberOfLines={1}>{getSubTitle()}</Text>
              {role === 'admin' && (
                <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>LIVE</Text></View>
              )}
            </View>
          </View>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  labelText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  titleText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  rightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  customerSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  customerSwitchBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
