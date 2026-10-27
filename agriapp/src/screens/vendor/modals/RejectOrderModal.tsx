import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { X } from 'lucide-react-native';

interface RejectOrderModalProps {
  order: any | null;
  onClose: () => void;
  onConfirm: (orderId: string, reason: string) => void;
}

export const RejectOrderModal: React.FC<RejectOrderModalProps> = ({
  order,
  onClose,
  onConfirm,
}) => {
  const [rejectReason, setRejectReason] = useState(
    'Out of stock / harvest depleted'
  );

  if (!order) return null;

  return (
    <Modal visible={!!order} transparent animationType="fade">
      <View className="flex-1 bg-black/55 justify-center items-center p-3.5">
        <View className="w-full max-w-[380px] bg-white rounded-2xl p-5 shadow-lg">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-row items-center gap-2">
              <X size={20} color="#DC2626" />
              <View>
                <Text className="text-base font-bold text-slate-900">
                  Reject Order
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

          <Text className="text-sm font-bold text-slate-700 mb-1 mt-2">
            Select Rejection Reason
          </Text>
          {[
            'Out of stock / harvest depleted',
            'Distance beyond delivery radius',
            'Farm kitchen at full capacity',
            'Outside operating delivery hours',
          ].map((reason) => (
            <TouchableOpacity
              key={reason}
              className={`p-2.5 rounded-lg mb-1.5 border ${
                rejectReason === reason
                  ? 'bg-rose-50 border-rose-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
              onPress={() => setRejectReason(reason)}
            >
              <Text
                className={`text-sm ${
                  rejectReason === reason
                    ? 'text-rose-600 font-bold'
                    : 'text-slate-700 font-medium'
                }`}
              >
                {reason}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            className="bg-rose-600 rounded-xl py-3 items-center shadow-sm mt-3"
            onPress={() => onConfirm(order.id, rejectReason)}
            activeOpacity={0.85}
          >
            <Text className="text-white text-sm font-bold">
              Confirm Order Rejection
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
