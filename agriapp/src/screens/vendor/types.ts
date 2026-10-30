import { ORGANIC_PRODUCT_PRESETS } from '../../constants/mockData';

// ── Theme Palette (Mathira Organic Farmer / Vendor Portal) ──
export const VC = {
  primary: '#064E3B',
  sub: '#047857',
  accent: '#10B981',
  accentLight: '#ECFDF5',
  bg: '#F8FAFC',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  borderGreen: '#A7F3D0',
  textPrimary: '#0F172A',
  textSub: '#334155',
  textMuted: '#64748B',
  success: '#10B981',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#0284C7',
  infoLight: '#E0F2FE',
};

// Safe helper to extract category string regardless of whether backend returns string or object
export const getCategoryName = (cat: any): string => {
  if (!cat) return 'Organic';
  if (typeof cat === 'string') return cat;
  if (typeof cat === 'object' && cat.name) return String(cat.name);
  return String(cat);
};

// Preset images for realistic organic crops
export const IMAGE_PRESETS = ORGANIC_PRODUCT_PRESETS;

export const AVAILABLE_UNITS = [
  'Kg',
  'Litre',
  '500g',
  '250g',
  'Bunch',
  'Jar',
  'Dozen',
  'Crate',
];

export const BENEFIT_OPTIONS = [
  '100% Pesticide Free',
  'Daily Farm Fresh Harvest',
  'Non-GMO & Natural',
  'Rich in Nutrients',
  'Certified Organic',
];

export type VendorTabKey =
  | 'dashboard'
  | 'crops'
  | 'orders'
  | 'harvests'
  | 'payouts';

export interface VendorScreensProps {
  triggerRefresh: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onSwitchToCustomer?: () => void;
  showAddModal?: boolean;
  setShowAddModal?: (show: boolean) => void;
  userPhone?: string;
}

export interface VendorProfile {
  id?: string;
  businessName?: string;
  farmName?: string;
  farmLocation?: string;
  cropCategories?: string;
  userName?: string;
  phoneNumber?: string;
  address?: string;
  rating?: number;
}

export interface VendorHarvestItem {
  id: string;
  crop: string;
  expectedYield: string;
  harvestDate: string;
  status: string;
  badgeColor: string;
}
