// Centralized Global Typography System for Mathira Organic Mobile App
import { Platform } from 'react-native';

export const FontFamily = {
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'Courier',
    android: 'monospace',
    default: 'monospace',
  }),
};

export const FontSizes = {
  min: 13,
  xs: 14,
  sm: 15.5,
  base: 17,
  md: 18.5,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 42,
};

// Global font size scale presets for readable mobile typography
export const GlobalFontSize = {
  caption: 13.5,
  small: 14,
  body: 15.5,
  medium: 17,
  large: 19,
  title: 22,
  heading: 26,
};

export const TypographyClasses = {
  // Headings
  h1: 'text-2xl md:text-3xl font-black text-slate-900 tracking-tight',
  h2: 'text-xl md:text-2xl font-bold text-slate-900',
  h3: 'text-lg font-bold text-slate-800',
  h4: 'text-base font-semibold text-slate-800',

  // Body
  body: 'text-base text-slate-700',
  bodyBold: 'text-base font-bold text-slate-900',
  bodySecondary: 'text-sm text-slate-500',
  caption: 'text-xs text-slate-500 font-medium',

  // Badges & Pills
  badgeText: 'text-xs font-extrabold uppercase tracking-wider',
  priceText: 'text-lg font-black text-slate-900',
  priceSub: 'text-xs text-slate-500 font-medium',
};

export default {
  FontFamily,
  FontSizes,
  TypographyClasses,
};
