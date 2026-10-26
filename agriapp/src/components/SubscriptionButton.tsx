import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../constants/theme';

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
}) => {
  const getVariantStyles = (): { btn: ViewStyle; text: TextStyle; subText: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          btn: {
            backgroundColor: '#DCFCE7',
            borderColor: '#86EFAC',
            borderWidth: 1,
          },
          text: { color: '#15803D' },
          subText: { color: '#166534' },
        };
      case 'outline':
        return {
          btn: {
            backgroundColor: '#FFFFFF',
            borderColor: '#15803D',
            borderWidth: 1.5,
          },
          text: { color: '#15803D' },
          subText: { color: '#4B5563' },
        };
      case 'accent':
        return {
          btn: {
            backgroundColor: '#D97706',
            borderColor: '#F59E0B',
            borderWidth: 1,
          },
          text: { color: '#FFFFFF' },
          subText: { color: '#FEF3C7' },
        };
      case 'danger':
        return {
          btn: {
            backgroundColor: '#FEE2E2',
            borderColor: '#FCA5A5',
            borderWidth: 1,
          },
          text: { color: '#DC2626' },
          subText: { color: '#991B1B' },
        };
      case 'primary':
      default:
        return {
          btn: {
            backgroundColor: '#15803D',
            borderColor: '#166534',
            borderWidth: 1,
          },
          text: { color: '#FFFFFF' },
          subText: { color: '#DCFCE7' },
        };
    }
  };

  const getSizeStyles = (): { btn: ViewStyle; titleText: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
          titleText: { fontSize: 12, fontWeight: '700' },
        };
      case 'large':
        return {
          btn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16 },
          titleText: { fontSize: 16, fontWeight: '800' },
        };
      case 'medium':
      default:
        return {
          btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14 },
          titleText: { fontSize: 14, fontWeight: '700' },
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        vStyles.btn,
        sStyles.btn,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.82}
      disabled={disabled || loading}
    >
      {badge && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? '#15803D' : '#FFFFFF'}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <View style={styles.textContainer}>
            <Text style={[vStyles.text, sStyles.titleText, textStyle]}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitleText, vStyles.subText]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.55,
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default SubscriptionButton;
