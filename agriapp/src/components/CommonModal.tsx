import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';

export interface CommonModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  showCloseButton?: boolean;
  maxHeight?: number | string;
  scrollable?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  footer?: React.ReactNode;
  children: React.ReactNode;
  type?: 'bottom' | 'center';
  animationType?: 'slide' | 'fade' | 'none';
  contentStyle?: StyleProp<ViewStyle>;
}

export const CommonModal: React.FC<CommonModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  headerRight,
  showCloseButton = true,
  maxHeight = '92%',
  scrollable = true,
  keyboardShouldPersistTaps = 'handled',
  footer,
  children,
  type = 'bottom',
  animationType,
  contentStyle,
}) => {
  const isBottom = type === 'bottom';
  const resolvedAnimation = animationType || (isBottom ? 'slide' : 'fade');

  return (
    <Modal
      visible={visible}
      transparent
      animationType={resolvedAnimation}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        pointerEvents="box-none"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: isBottom ? 'flex-end' : 'center',
            alignItems: isBottom ? 'stretch' : 'center',
            padding: isBottom ? 0 : 20,
          }}
          pointerEvents="box-none"
        >
          {/* Top Backdrop Touchable (Never overlaps modal content) */}
          <Pressable
            style={isBottom ? { flex: 1 } : { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            onPress={onClose}
          />

          {/* Modal Content Sheet / Dialog */}
          <View
            style={[
              {
                backgroundColor: '#FFFFFF',
                elevation: 25,
                zIndex: 20,
              },
              isBottom
                ? {
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    paddingHorizontal: 20,
                    paddingTop: 12,
                    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
                    maxHeight: maxHeight as any,
                    width: '100%',
                  }
                : {
                    borderRadius: 24,
                    padding: 20,
                    width: '100%',
                    maxWidth: 420,
                    maxHeight: maxHeight as any,
                  },
              contentStyle,
            ]}
          >
            {/* Top Handle Bar for Bottom Sheet */}
            {isBottom && (
              <View className="w-10 h-1 bg-[#E2EBE6] rounded-full self-center mb-3" />
            )}

            {/* Modal Header */}
            {(title || icon || showCloseButton || headerRight) && (
              <View className="flex-row items-center justify-between mb-3.5">
                <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                  {icon ? (
                    <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center">
                      {icon}
                    </View>
                  ) : null}
                  <View className="flex-1">
                    {title ? (
                      <Text
                        className="text-base font-extrabold text-[#1a1a2e]"
                        numberOfLines={1}
                      >
                        {title}
                      </Text>
                    ) : null}
                    {subtitle ? (
                      <Text className="text-2xs text-slate-500 font-medium" numberOfLines={1}>
                        {subtitle}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Right Action / Close Button */}
                <View className="flex-row items-center gap-2">
                  {headerRight}
                  {showCloseButton ? (
                    <Pressable
                      onPress={onClose}
                      hitSlop={8}
                      className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
                    >
                      <X size={16} color="#64748B" />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            )}

            {/* Modal Body */}
            {scrollable ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                style={{ flexShrink: 1 }}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
              >
                {children}
              </ScrollView>
            ) : (
              <View style={{ flexShrink: 1 }}>{children}</View>
            )}

            {/* Optional Sticky Footer */}
            {footer ? <View className="mt-2">{footer}</View> : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

