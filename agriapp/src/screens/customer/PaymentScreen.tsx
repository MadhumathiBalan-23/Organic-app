import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ShieldCheck,
  Smartphone,
  CreditCard,
  Landmark,
  Briefcase,
  ArrowLeft,
} from 'lucide-react-native';
import { theme } from '../../theme';

export interface PaymentScreenProps {
  amount: number;
  onPaySuccess: () => void;
  onBack: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  amount,
  onPaySuccess,
  onBack,
}) => {
  const [gateway, setGateway] = useState('UPI');

  const paymentMethods = [
    {
      id: 'UPI',
      name: 'UPI (GPay / PhonePe)',
      desc: 'Fastest · Zero fee',
      icon: <Smartphone size={20} color={theme.colors.primaryColor} />,
    },
    {
      id: 'CARD',
      name: 'Credit / Debit Card',
      desc: 'Visa, Mastercard, RuPay',
      icon: <CreditCard size={20} color={theme.colors.primaryColor} />,
    },
    {
      id: 'BANKING',
      name: 'Net Banking',
      desc: 'All major banks',
      icon: <Landmark size={20} color={theme.colors.primaryColor} />,
    },
    {
      id: 'WALLET',
      name: 'Paytm / Wallet',
      desc: 'Quick cashback',
      icon: <Briefcase size={20} color={theme.colors.primaryColor} />,
    },
  ];

  return (
    <View className="flex-1 bg-[#F6F8F6]">
      {/* Top Bar */}
      <View className="px-4 pt-3 flex-row items-center gap-2">
        <TouchableOpacity
          className="w-9 h-9 rounded-full bg-white border border-slate-200 items-center justify-center"
          onPress={onBack}
        >
          <ArrowLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-800">Secure Checkout</Text>
      </View>

      <ScrollView contentContainerClassName="p-4" showsVerticalScrollIndicator={false}>
        {/* Total Amount Card */}
        <View className="bg-emerald-800 rounded-2xl p-5 mb-5 items-center justify-center shadow-sm">
          <Text className="text-xs font-bold text-emerald-200 tracking-wider mb-1">
            AMOUNT TO PAY
          </Text>
          <Text className="text-3xl font-black text-white">₹{amount}</Text>
          <View className="flex-row items-center gap-1 mt-1">
            <ShieldCheck size={13} color="rgba(255,255,255,0.8)" />
            <Text className="text-xs text-emerald-100">Secured via Razorpay</Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-slate-800 mb-3">Select Payment Method</Text>

        {paymentMethods.map(g => (
          <TouchableOpacity
            key={g.id}
            className={`flex-row items-center bg-white p-3.5 rounded-xl border mb-2.5 ${
              gateway === g.id ? 'border-emerald-600 bg-emerald-50/30' : 'border-slate-200'
            }`}
            onPress={() => setGateway(g.id)}
            activeOpacity={0.8}
          >
            <View className="mr-3">{g.icon}</View>
            <View className="flex-1">
              <Text
                className={`text-sm font-bold ${
                  gateway === g.id ? 'text-emerald-800' : 'text-slate-800'
                }`}
              >
                {g.name}
              </Text>
              <Text className="text-xs text-slate-500 mt-0.5">{g.desc}</Text>
            </View>
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ml-2 ${
                gateway === g.id ? 'border-emerald-600' : 'border-slate-300'
              }`}
            >
              {gateway === g.id && <View className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View className="p-4 bg-white border-t border-slate-200">
        <TouchableOpacity
          className="bg-emerald-700 py-3.5 rounded-xl items-center justify-center shadow-md active:bg-emerald-800"
          onPress={onPaySuccess}
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold text-base">Pay ₹{amount} →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
