import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Plus,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  Eye,
  Activity,
  LayoutDashboard,
  Sparkles,
  Package,
  Tags,
  UserCheck,
  Award,
  Users,
  ShoppingCart,
  FileText,
} from 'lucide-react-native';
import { theme } from '../../theme';

// ── Colour tokens ───────────────────────────────────────
export const C = {
  primary: '#0D2B1D',
  primaryLight: '#2D6A4F',
  accent: '#D4AC0D',
  accentLight: '#F0C940',
  bg: '#F0F4F1',
  surface: '#FFFFFF',
  surface2: '#F7FAF8',
  border: '#E2EBE6',
  textPrimary: '#1a1a2e',
  textSec: '#5a6a63',
  textMuted: '#9aada6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#a855f7',
};

// ── Tab config ───────────────────────────────────────────
export const ADMIN_TABS = [
  { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { key: 'banners', label: 'Banners', Icon: Sparkles },
  { key: 'products', label: 'Products', Icon: Package },
  { key: 'categories', label: 'Categories', Icon: Tags },
  { key: 'vendorRequests', label: 'Vendor Approvals', Icon: UserCheck },
  { key: 'brands', label: 'Brands', Icon: Award },
  { key: 'customers', label: 'Customers', Icon: Users },
  { key: 'orders', label: 'Orders', Icon: ShoppingCart },
  { key: 'logs', label: 'Logs', Icon: FileText },
] as const;

export type AdminTabKey = typeof ADMIN_TABS[number]['key'];

export interface VendorReqItem {
  id: string;
  userName: string;
  phoneNumber: string;
  email?: string;
  farmName: string;
  farmLocation: string;
  cropCategories: string;
  experienceYears?: string;
  certificateNo?: string;
  gstNumber?: string;
  logoUrl?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note?: string;
  createdAt: string;
}

export interface AdminPortalScreensProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

// ── Helpers ──────────────────────────────────────────────
export const statusColor = (s: string) => {
  switch (s) {
    case 'Delivered':
    case 'Active':
      return C.success;
    case 'Processing':
      return C.info;
    case 'Pending':
      return C.warning;
    case 'Cancelled':
    case 'Inactive':
      return C.danger;
    case 'VIP':
      return C.purple;
    case 'Low Stock':
      return C.warning;
    default:
      return C.textMuted;
  }
};

export const TypeIcon: React.FC<{ type: string; size?: number; color?: string }> = ({
  type,
  size = 12,
  color = C.textSec,
}) => {
  switch (type) {
    case 'create':
      return <Plus size={size} color={color} strokeWidth={2.5} />;
    case 'update':
      return <Pencil size={size} color={color} strokeWidth={2.5} />;
    case 'delete':
      return <Trash2 size={size} color={color} strokeWidth={2.5} />;
    case 'login':
      return <LogIn size={size} color={color} strokeWidth={2.5} />;
    case 'logout':
      return <LogOut size={size} color={color} strokeWidth={2.5} />;
    case 'view':
      return <Eye size={size} color={color} strokeWidth={2.5} />;
    default:
      return <Activity size={size} color={color} strokeWidth={2.5} />;
  }
};

export const fmtDate = (d: string) =>
  new Date(d.replace('T', ' ')).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

// ── Reusable Sub-components ───
export const Chip: React.FC<{ label: string; color: string; small?: boolean }> = ({
  label,
  color,
  small,
}) => (
  <View
    className="py-1 px-2.5 rounded-full border"
    style={{ backgroundColor: color + '22', borderColor: color + '44' }}
  >
    <Text className={`font-bold ${small ? 'text-2xs' : 'text-xs'}`} style={{ color }}>
      {label}
    </Text>
  </View>
);

export const SectionHeader: React.FC<{
  title: string;
  sub?: string;
  action?: { label: string; onPress: () => void };
}> = ({ title, sub, action }) => (
  <View className="flex-row items-center mb-2.5">
    <View className="flex-1">
      <Text className="text-lg font-bold text-[#1a1a2e]">{title}</Text>
      {sub ? <Text className="text-xs text-[#9aada6] mt-0.5">{sub}</Text> : null}
    </View>
    {action && (
      <TouchableOpacity
        className="bg-[#0D2B1D] py-1.5 px-3.5 rounded-full"
        onPress={action.onPress}
      >
        <Text className="text-white text-xs font-bold">{action.label}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const Card: React.FC<{
  children: React.ReactNode;
  style?: object;
  className?: string;
}> = ({ children, style, className = '' }) => (
  <View
    className={`bg-white rounded-2xl p-4 mb-3 border border-[#E2EBE6] shadow-sm ${className}`}
    style={style}
  >
    {children}
  </View>
);

export const KPICard: React.FC<{
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  value: string;
  sub: string;
  accentColor: string;
}> = ({ Icon, label, value, sub, accentColor }) => (
  <View
    className="w-[47%] bg-white rounded-xl p-3.5 border border-[#E2EBE6] border-t-4 shadow-sm"
    style={{ borderTopColor: accentColor }}
  >
    <View
      className="w-10 h-10 rounded-xl items-center justify-center mb-1.5"
      style={{ backgroundColor: accentColor + '20' }}
    >
      <Icon size={19} color={accentColor} strokeWidth={2.2} />
    </View>
    <Text className="text-xs text-[#9aada6] font-semibold uppercase tracking-wider">
      {label}
    </Text>
    <Text className="text-2xl font-black text-[#1a1a2e] mt-0.5">{value}</Text>
    <Text className="text-xs font-semibold mt-0.5" style={{ color: accentColor }}>
      {sub}
    </Text>
  </View>
);
