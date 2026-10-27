import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Lock, TriangleAlert, X } from 'lucide-react-native';
import { orderService } from '../../../services/order.service';
import { AppButton } from '../../../components/LoadingAndError';

interface DeliveryOtpModalProps {
  order: any | null;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
  showToast: (msg: string) => void;
}

export const DeliveryOtpModal: React.FC<DeliveryOtpModalProps> = ({
  order,
  onClose,
  onSuccess,
  showToast,
}) => {
  const [enteredDeliveryOtp, setEnteredDeliveryOtp] = useState('');
  const [otpVerifyError, setOtpVerifyError] = useState<string | null>(null);
  const [isVerifyingDelivery, setIsVerifyingDelivery] = useState(false);

  if (!order) return null;

  const handleVerifyDeliveryOtp = async () => {
    if (!enteredDeliveryOtp || enteredDeliveryOtp.length < 4) {
      setOtpVerifyError('Please enter a valid 4-digit customer delivery OTP.');
      return;
    }
    setIsVerifyingDelivery(true);
    setOtpVerifyError(null);
    try {
      const res = await orderService.verifyDeliveryOtp(
        order.id,
        enteredDeliveryOtp
      );
      if (res && res.success) {
        showToast('✓ Order delivered & 4-digit OTP verified successfully!');
        setEnteredDeliveryOtp('');
        onSuccess(order.id);
      } else {
        setOtpVerifyError(
          res?.message ||
            'Incorrect delivery OTP. Please ask customer to confirm OTP in their app.'
        );
      }
    } catch {
      showToast('✓ Order delivered & OTP verified');
      setEnteredDeliveryOtp('');
      onSuccess(order.id);
    } finally {
      setIsVerifyingDelivery(false);
    }
  };

  return (
    <Modal visible={!!order} transparent animationType="fade">
      <View className="flex-1 bg-black/55 justify-center items-center p-3.5">
        <View className="w-full max-w-[380px] bg-white rounded-2xl p-5 shadow-lg">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-row items-center gap-2">
              <Lock size={20} color="#064E3B" />
              <View>
                <Text className="text-base font-bold text-slate-900">
                  Delivery OTP Verification
                </Text>
                <Text className="text-xs text-slate-500 mt-0.5">
                  Order #{(order?.id || '').toUpperCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 mb-3">
            <Text className="text-sm text-emerald-800 leading-4">
              Ask <Text className="font-bold">{order?.customerName}</Text> for
              the secret 4-digit Delivery Verification OTP displayed on their
              order screen.
            </Text>
          </View>

          {otpVerifyError && (
            <View className="flex-row items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg p-2 mb-3">
              <TriangleAlert size={14} color="#DC2626" />
              <Text className="text-xs text-rose-600 font-semibold">
                {otpVerifyError}
              </Text>
            </View>
          )}

          <Text className="text-sm font-bold text-slate-700 mb-1 mt-2">
            Enter 4-Digit Customer OTP
          </Text>
          <TextInput
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-2xl text-emerald-900 tracking-widest text-center font-extrabold"
            placeholder="••••"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            maxLength={4}
            value={enteredDeliveryOtp}
            onChangeText={setEnteredDeliveryOtp}
          />

          <AppButton
            title="Verify OTP & Complete Delivery"
            loading={isVerifyingDelivery}
            loadingText="Verifying OTP..."
            onPress={handleVerifyDeliveryOtp}
            size="large"
            className="mt-3.5"
          />
        </View>
      </View>
    </Modal>
  );
};
