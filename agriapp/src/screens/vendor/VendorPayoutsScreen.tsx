import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { CircleCheck } from 'lucide-react-native';
import { VC } from './types';

export const VendorPayoutsScreen: React.FC = () => {
  const payoutHistory = [
    {
      date: '2026-10-18',
      amt: '₹18,450',
      status: 'Completed',
      ref: 'PAY_98124',
    },
    {
      date: '2026-10-11',
      amt: '₹15,200',
      status: 'Completed',
      ref: 'PAY_87123',
    },
    {
      date: '2026-10-04',
      amt: '₹12,800',
      status: 'Completed',
      ref: 'PAY_76120',
    },
  ];

  return (
    <ScrollView
      contentContainerClassName="p-3.5 pb-10"
      showsVerticalScrollIndicator={false}
    >
      {/* Payout Hero Card */}
      <View className="bg-emerald-700 rounded-2xl p-5 mb-4">
        <Text className="text-2xs font-extrabold text-white/70 tracking-widest">
          NEXT AUTOMATED PAYOUT
        </Text>
        <Text className="text-3xl font-black text-white my-1">₹14,600</Text>
        <Text className="text-xs text-white/85">
          Scheduled for Monday, Oct 26 · HDFC Bank **** 4892
        </Text>
      </View>

      <Text className="text-base font-bold text-slate-900 mb-2">
        Payout Transfer History
      </Text>
      <View className="gap-2 mt-2.5">
        {payoutHistory.map((p) => (
          <View
            key={p.ref}
            className="flex-row justify-between items-center bg-white rounded-xl p-3.5 border border-slate-200"
          >
            <View>
              <Text className="text-sm font-bold text-slate-900">{p.amt}</Text>
              <Text className="text-xs text-slate-500 mt-0.5">
                Ref: {p.ref} · {p.date}
              </Text>
            </View>
            <View className="px-2 py-0.5 rounded-full bg-emerald-100 flex-row items-center gap-1">
              <CircleCheck size={10} color={VC.success} />
              <Text className="text-2xs font-bold text-emerald-700">
                {p.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
