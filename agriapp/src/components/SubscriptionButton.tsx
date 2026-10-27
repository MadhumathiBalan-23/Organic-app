import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface SubscriptionButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  badge?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  className?: string;
  textClassName?: string;
}

export const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({
  title,
  subtitle,
  onPress,
  icon,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  badge,
  style,
  textStyle,
  className = '',
  textClassName = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          btn: 'bg-emerald-100 border border-emerald-300',
          text: 'text-emerald-700',
          subText: 'text-emerald-800',
        };
      case 'outline':
        return {
          btn: 'bg-white border-2 border-emerald-700',
          text: 'text-emerald-700',
          subText: 'text-slate-600',
        };
      case 'accent':
        return {
          btn: 'bg-amber-600 border border-amber-500',
          text: 'text-white',
          subText: 'text-amber-100',
        };
      case 'danger':
        return {
          btn: 'bg-red-100 border border-red-300',
          text: 'text-red-600',
          subText: 'text-red-800',
        };
      case 'primary':
      default:
        return {
          btn: 'bg-emerald-700 border border-emerald-800',
          text: 'text-white',
          subText: 'text-emerald-100',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          btn: 'py-2 px-3 rounded-xl',
          titleText: 'text-xs font-bold',
        };
      case 'large':
        return {
          btn: 'py-3.5 px-5 rounded-2xl',
          titleText: 'text-base font-extrabold',
        };
      case 'medium':
      default:
        return {
          btn: 'py-3 px-4 rounded-xl',
          titleText: 'text-sm font-bold',
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={style}
      className={`flex-row items-center justify-center relative shadow-sm ${fullWidth ? 'w-full' : ''} ${vStyles.btn} ${sStyles.btn} ${disabled || loading ? 'opacity-55' : 'active:opacity-90'} ${className}`}
      onPress={onPress}
      activeOpacity={0.82}
      disabled={disabled || loading}
    >
      {badge && (
        <View className="absolute -top-2 right-3 bg-amber-500 px-2 py-0.5 rounded-full shadow-sm">
          <Text className="text-white text-2xs font-black tracking-wider uppercase">{badge}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? '#15803D' : '#FFFFFF'}
        />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon && <View className="items-center justify-center">{icon}</View>}
          <View className="items-center justify-center">
            <Text style={textStyle} className={`${vStyles.text} ${sStyles.titleText} ${textClassName}`}>
              {title}
            </Text>
            {subtitle ? (
              <Text className={`text-2xs font-semibold mt-0.5 text-center ${vStyles.subText}`}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default SubscriptionButton;
