import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Sprout,
  CheckCircle2,
  XCircle,
  Sparkles,
  Inbox,
} from 'lucide-react-native';

// ── Organic Design Tokens ─────────────────────────────────
export const UI_COLORS = {
  primary: '#07843D',
  primaryDark: '#045A29',
  primaryLight: '#E8F5E9',
  primaryBorder: '#A7F3D0',
  accent: '#F2C500',
  accentLight: '#FEF9C3',
  error: '#DC2626',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',
  success: '#16A34A',
  successBg: '#F0FDF4',
  successBorder: '#BBF7D0',
  surface: '#FFFFFF',
  surfaceSubtle: '#F8FAF8',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
};

// ── 1. LOADING SPINNER (With Organic Glow & Leaf Pulsing) ─
export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  subMessage?: string;
  showLeafIcon?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'small',
  color = UI_COLORS.primary,
  message,
  subMessage,
  showLeafIcon = false,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={[styles.spinnerCenter, style]}>
      {showLeafIcon ? (
        <Animated.View style={[styles.leafGlowCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Sprout size={size === 'large' ? 26 : 18} color={color} strokeWidth={2.3} />
        </Animated.View>
      ) : null}

      <ActivityIndicator size={size} color={color} style={styles.indicatorOffset} />

      {message ? <Text style={styles.spinnerMessage}>{message}</Text> : null}
      {subMessage ? <Text style={styles.spinnerSubMessage}>{subMessage}</Text> : null}
    </View>
  );
};

// ── 2. PAGE LOADER (Full Screen / Container State) ────────
export interface PageLoaderProps {
  message?: string;
  subMessage?: string;
  minHeight?: number;
  transparent?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading organic fresh items...',
  subMessage = 'Fetching the latest updates directly from Mathira farm...',
  minHeight = 260,
  transparent = false,
}) => {
  return (
    <View style={[styles.pageLoaderContainer, { minHeight }, transparent && styles.transparentBg]}>
      <View style={styles.pageLoaderCard}>
        <View style={styles.pageLoaderIconBubble}>
          <Sprout size={28} color={UI_COLORS.primary} strokeWidth={2.4} />
          <View style={styles.sparkleDot}>
            <Sparkles size={12} color="#F59E0B" fill="#F59E0B" />
          </View>
        </View>

        <ActivityIndicator size="small" color={UI_COLORS.primary} style={{ marginTop: 12, marginBottom: 8 }} />

        <Text style={styles.pageLoaderTitle}>{message}</Text>
        <Text style={styles.pageLoaderSub}>{subMessage}</Text>
      </View>
    </View>
  );
};

// ── 3. ERROR STATE & CARD (With Retry Action) ─────────────
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  type?: 'error' | 'network' | 'warning';
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not fetch data right now. Please check your network and try again.',
  onRetry,
  retryLabel = 'Try Again',
  isRetrying = false,
  type = 'error',
  compact = false,
  style,
}) => {
  const isNetwork = type === 'network';
  const isWarning = type === 'warning';

  const iconColor = isWarning ? UI_COLORS.warning : isNetwork ? '#3B82F6' : UI_COLORS.error;
  const bgColor = isWarning ? UI_COLORS.warningBg : isNetwork ? '#EFF6FF' : UI_COLORS.errorBg;
  const borderColor = isWarning ? UI_COLORS.warningBorder : isNetwork ? '#BFDBFE' : UI_COLORS.errorBorder;

  const IconComponent = isNetwork ? WifiOff : isWarning ? AlertTriangle : AlertCircle;

  if (compact) {
    return (
      <View style={[styles.compactErrorCard, { backgroundColor: bgColor, borderColor }, style]}>
        <IconComponent size={18} color={iconColor} strokeWidth={2.2} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.compactErrorTitle, { color: iconColor }]}>{title}</Text>
          {message ? <Text style={styles.compactErrorMsg}>{message}</Text> : null}
        </View>
        {onRetry ? (
          <TouchableOpacity
            style={[styles.compactRetryBtn, { borderColor: iconColor }]}
            onPress={onRetry}
            disabled={isRetrying}
            activeOpacity={0.7}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color={iconColor} />
            ) : (
              <RefreshCw size={13} color={iconColor} strokeWidth={2.5} />
            )}
            <Text style={[styles.compactRetryText, { color: iconColor }]}>
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.fullErrorContainer, style]}>
      <View style={[styles.errorCardBox, { backgroundColor: bgColor, borderColor }]}>
        <View style={[styles.errorIconCircle, { backgroundColor: iconColor + '18' }]}>
          <IconComponent size={30} color={iconColor} strokeWidth={2.2} />
        </View>

        <Text style={[styles.errorTitleText, { color: iconColor }]}>{title}</Text>
        <Text style={styles.errorMessageText}>{message}</Text>

        {onRetry ? (
          <TouchableOpacity
            style={[styles.primaryRetryButton, { backgroundColor: iconColor }]}
            onPress={onRetry}
            disabled={isRetrying}
            activeOpacity={0.85}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
            ) : (
              <RefreshCw size={15} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
            )}
            <Text style={styles.primaryRetryButtonText}>
              {isRetrying ? 'Retrying...' : retryLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

// ── 4. INLINE ERROR BANNER (For inputs, modals & forms) ──
export interface InlineErrorProps {
  message?: string | null;
  type?: 'error' | 'warning' | 'success';
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  type = 'error',
  onDismiss,
  style,
}) => {
  if (!message) return null;

  const isWarning = type === 'warning';
  const isSuccess = type === 'success';

  const color = isSuccess ? UI_COLORS.success : isWarning ? UI_COLORS.warning : UI_COLORS.error;
  const bg = isSuccess ? UI_COLORS.successBg : isWarning ? UI_COLORS.warningBg : UI_COLORS.errorBg;
  const border = isSuccess ? UI_COLORS.successBorder : isWarning ? UI_COLORS.warningBorder : UI_COLORS.errorBorder;
  const Icon = isSuccess ? CheckCircle2 : isWarning ? AlertTriangle : AlertCircle;

  return (
    <View style={[styles.inlineErrorRow, { backgroundColor: bg, borderColor: border }, style]}>
      <Icon size={15} color={color} strokeWidth={2.3} />
      <Text style={[styles.inlineErrorText, { color }]}>{message}</Text>
      {onDismiss ? (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <XCircle size={15} color={color} strokeWidth={2} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ── 5. APP BUTTON / LOADING BUTTON (Universal Action Button) ─
export interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'warning' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  loading = false,
  loadingText,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  icon,
  rightIcon,
  fullWidth = true,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          btn: styles.btnSecondary,
          text: styles.btnSecondaryText,
          loaderColor: UI_COLORS.primary,
        };
      case 'outline':
        return {
          btn: styles.btnOutline,
          text: styles.btnOutlineText,
          loaderColor: UI_COLORS.primary,
        };
      case 'danger':
        return {
          btn: styles.btnDanger,
          text: styles.btnDangerText,
          loaderColor: '#FFFFFF',
        };
      case 'warning':
        return {
          btn: styles.btnWarning,
          text: styles.btnWarningText,
          loaderColor: '#FFFFFF',
        };
      case 'ghost':
        return {
          btn: styles.btnGhost,
          text: styles.btnGhostText,
          loaderColor: UI_COLORS.primary,
        };
      default: // primary
        return {
          btn: styles.btnPrimary,
          text: styles.btnPrimaryText,
          loaderColor: '#FFFFFF',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { btn: styles.btnSmall, text: styles.btnSmallText, iconSize: 14 };
      case 'large':
        return { btn: styles.btnLarge, text: styles.btnLargeText, iconSize: 20 };
      default: // medium
        return { btn: styles.btnMedium, text: styles.btnMediumText, iconSize: 16 };
    }
  };

  const v = getVariantStyles();
  const sz = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.btnBase,
        v.btn,
        sz.btn,
        fullWidth && styles.btnFullWidth,
        isDisabled && styles.btnDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <View style={styles.btnRow}>
          <ActivityIndicator size="small" color={v.loaderColor} style={styles.btnLoader} />
          <Text style={[styles.btnTextBase, v.text, sz.text, textStyle]}>
            {loadingText || title}
          </Text>
        </View>
      ) : (
        <View style={styles.btnRow}>
          {icon ? <View style={styles.btnIconLeft}>{icon}</View> : null}
          <Text style={[styles.btnTextBase, v.text, sz.text, textStyle]} numberOfLines={1}>
            {title}
          </Text>
          {rightIcon ? <View style={styles.btnIconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

// ── 6. EMPTY STATE (When no products/orders/banners) ───────
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.emptyContainer, style]}>
      <View style={styles.emptyIconBubble}>
        {icon || <Inbox size={32} color={UI_COLORS.primary} strokeWidth={2} />}
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.emptyDescription}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.emptyActionBtn} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.emptyActionBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Spinner
  spinnerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  indicatorOffset: {
    marginVertical: 6,
  },
  leafGlowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: UI_COLORS.primaryLight,
    borderWidth: 1,
    borderColor: UI_COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  spinnerMessage: {
    fontSize: 13,
    fontWeight: '700',
    color: UI_COLORS.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },
  spinnerSubMessage: {
    fontSize: 11,
    color: UI_COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },

  // Page Loader
  pageLoaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: UI_COLORS.surfaceSubtle,
  },
  transparentBg: {
    backgroundColor: 'transparent',
  },
  pageLoaderCard: {
    backgroundColor: UI_COLORS.surface,
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    shadowColor: '#07843D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    maxWidth: 320,
    width: '100%',
  },
  pageLoaderIconBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: UI_COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: UI_COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkleDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pageLoaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: UI_COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  pageLoaderSub: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },

  // Error States
  fullErrorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  errorCardBox: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  errorIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorTitleText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  errorMessageText: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  primaryRetryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryRetryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Compact Error Card
  compactErrorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    marginVertical: 8,
  },
  compactErrorTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  compactErrorMsg: {
    fontSize: 11,
    color: UI_COLORS.textSecondary,
    marginTop: 1,
  },
  compactRetryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  compactRetryText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Inline Error Banner
  inlineErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 6,
    width: '100%',
  },
  inlineErrorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },

  // Universal AppButton
  btnBase: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFullWidth: {
    width: '100%',
  },
  btnDisabled: {
    opacity: 0.55,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTextBase: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  btnLoader: {
    marginRight: 8,
  },
  btnIconLeft: {
    marginRight: 8,
  },
  btnIconRight: {
    marginLeft: 8,
  },

  // Variant Buttons
  btnPrimary: {
    backgroundColor: UI_COLORS.primary,
    shadowColor: UI_COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.24,
    shadowRadius: 6,
    elevation: 3,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
  },
  btnSecondary: {
    backgroundColor: UI_COLORS.primaryLight,
    borderWidth: 1,
    borderColor: UI_COLORS.primaryBorder,
  },
  btnSecondaryText: {
    color: UI_COLORS.primaryDark,
    fontWeight: '800',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: UI_COLORS.primary,
  },
  btnOutlineText: {
    color: UI_COLORS.primary,
  },
  btnDanger: {
    backgroundColor: UI_COLORS.error,
    shadowColor: UI_COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  btnDangerText: {
    color: '#FFFFFF',
  },
  btnWarning: {
    backgroundColor: UI_COLORS.warning,
  },
  btnWarningText: {
    color: '#FFFFFF',
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnGhostText: {
    color: UI_COLORS.primary,
  },

  // Sizes
  btnSmall: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnSmallText: {
    fontSize: 12,
  },
  btnMedium: {
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  btnMediumText: {
    fontSize: 14,
  },
  btnLarge: {
    height: 54,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  btnLargeText: {
    fontSize: 16,
    fontWeight: '800',
  },

  // Empty State
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBubble: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: UI_COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: UI_COLORS.primaryBorder,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: UI_COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 12,
    color: UI_COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 260,
  },
  emptyActionBtn: {
    marginTop: 16,
    backgroundColor: UI_COLORS.primary,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
