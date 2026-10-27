import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Sprout } from 'lucide-react-native';
import { VC, VendorHarvestItem } from './types';

interface VendorHarvestScreenProps {
  harvests: VendorHarvestItem[];
}

export const VendorHarvestScreen: React.FC<VendorHarvestScreenProps> = ({
  harvests,
}) => {
  return (
    <ScrollView
      contentContainerClassName="p-3.5 pb-10"
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-2.5">
        <View className="flex-row items-center gap-2">
          <Sprout size={20} color={VC.primary} />
          <Text className="text-base font-bold text-slate-900">
            Crop Harvest Tracker
          </Text>
        </View>
        <Text className="text-xs text-slate-500 mt-0.5">
          Track planned field yields and harvest dates
        </Text>
      </View>

      <View className="gap-2.5">
        {harvests.map((h) => (
          <View
            key={h.id}
            className="bg-white rounded-xl p-3.5 border border-slate-200"
          >
            <View className="flex-row justify-between items-center mb-2.5">
              <Text className="text-sm font-bold text-slate-900">{h.crop}</Text>
              <View className="px-2 py-0.5 rounded-full bg-emerald-50">
                <Text
                  className="text-2xs font-bold"
                  style={{ color: h.badgeColor }}
                >
                  {h.status}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between bg-slate-50 p-2.5 rounded-lg">
              <View className="flex-1">
                <Text className="text-2xs font-extrabold text-slate-400">
                  EXPECTED YIELD
                </Text>
                <Text className="text-xs font-bold text-slate-900 mt-0.5">
                  {h.expectedYield}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xs font-extrabold text-slate-400">
                  HARVEST DATE
                </Text>
                <Text className="text-xs font-bold text-slate-900 mt-0.5">
                  {h.harvestDate}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
