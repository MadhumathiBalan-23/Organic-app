// Centralized Theme Export Barrel
export * from './colors';
export * from './typography';
import { ThemeColors } from './colors';
import { FontFamily, FontSizes, TypographyClasses, GlobalFontSize } from './typography';

export const Theme = {
  colors: ThemeColors,
  fonts: FontFamily,
  fontSizes: FontSizes,
  globalFontSize: GlobalFontSize,
  typography: TypographyClasses,
};

export const theme = Theme;
export default Theme;
