import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
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

// ── 1. LOADING SPINNER ─
export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  subMessage?: string;
  showLeafIcon?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'small',
  color = UI_COLORS.primary,
  message,
  subMessage,
  showLeafIcon = false,
  style,
  className = '',
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
    <View style={style} className={`items-center justify-center p-4 ${className}`}>
      {showLeafIcon ? (
        <Animated.View
          style={{ transform: [{ scale: pulseAnim }] }}
          className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center mb-2"
        >
          <Sprout size={size === 'large' ? 26 : 18} color={color} strokeWidth={2.3} />
        </Animated.View>
      ) : null}

      <ActivityIndicator size={size} color={color} className="my-1.5" />

      {message ? <Text className="text-xs font-bold text-slate-900 mt-1.5 text-center">{message}</Text> : null}
      {subMessage ? <Text className="text-xs text-slate-400 mt-0.5 text-center">{subMessage}</Text> : null}
    </View>
  );
};

// ── 2. PAGE LOADER ────────
export interface PageLoaderProps {
  message?: string;
  subMessage?: string;
  minHeight?: number;
  transparent?: boolean;
  className?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading organic fresh items...',
  subMessage = 'Fetching the latest updates directly from Mathira farm...',
  minHeight = 260,
  transparent = false,
  className = '',
}) => {
  return (
    <View
      style={{ minHeight }}
      className={`flex-1 items-center justify-center p-6 ${transparent ? 'bg-transparent' : 'bg-slate-50'} ${className}`}
    >
      <View className="bg-white px-7 py-6 rounded-2xl items-center border border-slate-200 shadow-sm max-w-xs w-full">
        <View className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 items-center justify-center relative">
          <Sprout size={28} color={UI_COLORS.primary} strokeWidth={2.4} />
          <View className="absolute -top-1 -right-1 bg-amber-100 rounded-full p-1 border border-amber-200">
            <Sparkles size={12} color="#F59E0B" fill="#F59E0B" />
          </View>
        </View>

        <ActivityIndicator size="small" color={UI_COLORS.primary} className="mt-3 mb-2" />

        <Text className="text-[15px] font-extrabold text-slate-900 text-center tracking-tight">{message}</Text>
        <Text className="text-xs text-slate-500 text-center mt-1 leading-4">{subMessage}</Text>
      </View>
    </View>
  );
};

// ── 3. ERROR STATE & CARD ─────────────
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  type?: 'error' | 'network' | 'warning';
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
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
  className = '',
}) => {
  const isNetwork = type === 'network';
  const isWarning = type === 'warning';

  const iconColor = isWarning ? UI_COLORS.warning : isNetwork ? '#3B82F6' : UI_COLORS.error;
  const bgColor = isWarning ? 'bg-amber-50' : isNetwork ? 'bg-blue-50' : 'bg-red-50';
  const borderColor = isWarning ? 'border-amber-200' : isNetwork ? 'border-blue-200' : 'border-red-200';
  const textColor = isWarning ? 'text-amber-800' : isNetwork ? 'text-blue-800' : 'text-red-700';

  const IconComponent = isNetwork ? WifiOff : isWarning ? AlertTriangle : AlertCircle;

  if (compact) {
    return (
      <View style={style} className={`flex-row items-center rounded-xl border p-3 gap-2.5 my-2 ${bgColor} ${borderColor} ${className}`}>
        <IconComponent size={18} color={iconColor} strokeWidth={2.2} />
        <View className="flex-1">
          <Text className={`text-xs font-bold ${textColor}`}>{title}</Text>
          {message ? <Text className="text-xs text-slate-500 mt-0.5">{message}</Text> : null}
        </View>
        {onRetry ? (
          <TouchableOpacity
            className="flex-row items-center gap-1 border border-slate-300 py-1 px-2.5 rounded-lg bg-white"
            onPress={onRetry}
            disabled={isRetrying}
            activeOpacity={0.7}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color={iconColor} />
            ) : (
              <RefreshCw size={13} color={iconColor} strokeWidth={2.5} />
            )}
            <Text className={`text-xs font-bold ${textColor}`}>
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={style} className={`p-5 items-center justify-center w-full ${className}`}>
      <View className={`w-full max-w-sm rounded-2xl border p-5 items-center shadow-sm ${bgColor} ${borderColor}`}>
        <View className="w-14 h-14 rounded-full items-center justify-center mb-3 bg-white/70">
          <IconComponent size={30} color={iconColor} strokeWidth={2.2} />
        </View>

        <Text className={`text-base font-extrabold text-center mb-1.5 ${textColor}`}>{title}</Text>
        <Text className="text-xs text-slate-600 text-center leading-5 mb-4 px-2">{message}</Text>

        {onRetry ? (
          <TouchableOpacity
            style={{ backgroundColor: iconColor }}
            className="flex-row items-center justify-center py-2.5 px-5 rounded-xl shadow-sm"
            onPress={onRetry}
            disabled={isRetrying}
            activeOpacity={0.85}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="#FFFFFF" className="mr-1.5" />
            ) : (
              <View className="mr-1.5">
                <RefreshCw size={15} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            )}
            <Text className="text-white text-xs font-bold">
              {isRetrying ? 'Retrying...' : retryLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

// ── 4. INLINE ERROR BANNER ──
export interface InlineErrorProps {
  message?: string | null;
  type?: 'error' | 'warning' | 'success';
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  type = 'error',
  onDismiss,
  style,
  className = '',
}) => {
  if (!message) return null;

  const isWarning = type === 'warning';
  const isSuccess = type === 'success';

  const color = isSuccess ? UI_COLORS.success : isWarning ? UI_COLORS.warning : UI_COLORS.error;
  const bg = isSuccess ? 'bg-emerald-50' : isWarning ? 'bg-amber-50' : 'bg-red-50';
  const border = isSuccess ? 'border-emerald-200' : isWarning ? 'border-amber-200' : 'border-red-200';
  const textColor = isSuccess ? 'text-emerald-700' : isWarning ? 'text-amber-800' : 'text-red-700';
  const Icon = isSuccess ? CheckCircle2 : isWarning ? AlertTriangle : AlertCircle;

  return (
    <View style={style} className={`flex-row items-center gap-2 py-2 px-3 rounded-xl border my-1.5 w-full ${bg} ${border} ${className}`}>
      <Icon size={15} color={color} strokeWidth={2.3} />
      <Text className={`flex-1 text-xs font-semibold ${textColor}`}>{message}</Text>
      {onDismiss ? (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <XCircle size={15} color={color} strokeWidth={2} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ── 5. APP BUTTON ─
export interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'warning' | 'ghost';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  className?: string;
  textClassName?: string;
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
  className = '',
  textClassName = '',
}) => {
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          btn: 'bg-emerald-50 border border-emerald-200',
          text: 'text-emerald-900 font-extrabold',
          loaderColor: UI_COLORS.primary,
        };
      case 'outline':
        return {
          btn: 'bg-transparent border border-emerald-600',
          text: 'text-emerald-700 font-bold',
          loaderColor: UI_COLORS.primary,
        };
      case 'danger':
        return {
          btn: 'bg-red-600 shadow-sm',
          text: 'text-white font-bold',
          loaderColor: '#FFFFFF',
        };
      case 'warning':
        return {
          btn: 'bg-amber-600 shadow-sm',
          text: 'text-white font-bold',
          loaderColor: '#FFFFFF',
        };
      case 'ghost':
        return {
          btn: 'bg-transparent',
          text: 'text-emerald-700 font-bold',
          loaderColor: UI_COLORS.primary,
        };
      default: // primary
        return {
          btn: 'bg-emerald-700 shadow-sm',
          text: 'text-white font-bold',
          loaderColor: '#FFFFFF',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { btn: 'h-9 px-3 rounded-lg', text: 'text-xs' };
      case 'large':
        return { btn: 'min-h-[58px] py-3.5 px-6 rounded-2xl', text: 'text-base font-extrabold' };
      case 'xlarge':
        return { btn: 'min-h-[64px] py-4 px-8 rounded-2xl', text: 'text-lg font-black tracking-wide' };
      default: // medium
        return { btn: 'h-11 px-4 rounded-xl', text: 'text-sm' };
    }
  };

  const v = getVariantStyles();
  const sz = getSizeStyles();

  return (
    <TouchableOpacity
      style={style}
      className={`items-center justify-center ${fullWidth ? 'w-full' : ''} ${v.btn} ${sz.btn} ${isDisabled ? 'opacity-55' : 'active:opacity-90'} ${className}`}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <View className="flex-row items-center justify-center">
          <ActivityIndicator size="small" color={v.loaderColor} className="mr-2" />
          <Text style={textStyle} className={`font-bold tracking-wide ${v.text} ${sz.text} ${textClassName}`}>
            {loadingText || title}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center justify-center">
          {icon ? <View className="mr-2">{icon}</View> : null}
          <Text style={textStyle} className={`font-bold tracking-wide ${v.text} ${sz.text} ${textClassName}`} numberOfLines={1}>
            {title}
          </Text>
          {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

// ── 6. EMPTY STATE ───────
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
  className = '',
}) => {
  return (
    <View style={style} className={`p-8 items-center justify-center ${className}`}>
      <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-3 border border-emerald-200">
        {icon || <Inbox size={32} color={UI_COLORS.primary} strokeWidth={2} />}
      </View>
      <Text className="text-base font-extrabold text-slate-900 text-center">{title}</Text>
      {description ? <Text className="text-xs text-slate-400 text-center mt-1 leading-5 max-w-xs">{description}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity className="mt-4 bg-emerald-700 py-2 px-4 rounded-xl" onPress={onAction} activeOpacity={0.8}>
          <Text className="text-white font-bold text-xs">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
