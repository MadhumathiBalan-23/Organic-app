import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { CircleCheck, X } from 'lucide-react-native';

interface AcceptOrderModalProps {
  order: any | null;
  onClose: () => void;
  onConfirm: (orderId: string, prepTime: string) => void;
}

export const AcceptOrderModal: React.FC<AcceptOrderModalProps> = ({
  order,
  onClose,
  onConfirm,
}) => {
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('30');

  if (!order) return null;

  return (
    <Modal visible={!!order} transparent animationType="fade">
      <View className="flex-1 bg-black/55 justify-center items-center p-3.5">
        <View className="w-full max-w-[380px] bg-white rounded-2xl p-5 shadow-lg">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-row items-center gap-2">
              <CircleCheck size={20} color="#064E3B" />
              <View>
                <Text className="text-base font-bold text-slate-900">
                  Accept Order
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

          <Text className="text-sm text-slate-700 mb-3">
            Confirm estimated preparation time for{' '}
            <Text className="font-bold">{order?.customerName}</Text>:
          </Text>

          <View className="flex-row gap-2 mb-4">
            {['15', '30', '45', '60'].map((mins) => (
              <TouchableOpacity
                key={mins}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  prepTimeMinutes === mins
                    ? 'bg-emerald-900 border-emerald-900'
                    : 'bg-slate-100 border-slate-200'
                }`}
                onPress={() => setPrepTimeMinutes(mins)}
              >
                <Text
                  className={`text-sm font-bold ${
                    prepTimeMinutes === mins ? 'text-white' : 'text-slate-700'
                  }`}
                >
                  {mins}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            className="bg-emerald-700 rounded-xl py-3 items-center shadow-sm"
            onPress={() => onConfirm(order.id, prepTimeMinutes)}
            activeOpacity={0.85}
          >
            <Text className="text-white text-sm font-bold">
              Confirm & Start Preparing
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
