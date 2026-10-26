import { Platform, TextStyle } from 'react-native';

export const Colors = {
  primary: '#15803D',      // Rich Forest Green
  primaryDark: '#0D2B1D',  // Deep Organic Hunter Green
  primaryLight: '#DCFCE7', // Crisp Mint Highlight
  secondary: '#22C55E',    // Vivid Emerald
  background: '#FDFBF7',   // Organic Soft Warm Cream
  surface: '#FFFFFF',
  cardBackground: '#F4F1EA', // Warm sand light beige
  cardBorder: '#E2E8F0',
  textDark: '#1E293B',     // Slate Charcoal (high contrast)
  textLight: '#64748B',    // Muted slate
  divider: '#E2E8F0',
  accent: '#D97706',       // Warm Amber Gold
  accentLight: '#FEF3C7',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  shadow: '#0F172A',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

// Font family fallbacks compatible across Android & iOS native and web
const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

// Centralized readable typography system with enhanced, comfortable font sizes
export const Typography: Record<string, TextStyle> = {
  h1: {
    fontFamily,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    color: Colors.textDark,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    color: Colors.textDark,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 25,
    color: Colors.textDark,
  },
  h4: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 23,
    color: Colors.textDark,
  },
  body: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: Colors.textDark,
  },
  bodyMedium: {
    fontFamily,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    color: Colors.textDark,
  },
  bodyBold: {
    fontFamily,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    color: Colors.textDark,
  },
  bodySmall: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: Colors.textLight,
  },
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: Colors.textLight,
    letterSpacing: 0.2,
  },
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  price: {
    fontFamily,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    color: Colors.primaryDark,
  },
  navLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
};

export const Fonts = {
  regular: fontFamily,
  medium: fontFamily,
  bold: fontFamily,
};
