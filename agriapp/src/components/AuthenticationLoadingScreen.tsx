import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { ShieldCheck, Sprout } from 'lucide-react-native';

interface AuthenticationLoadingScreenProps {
  message?: string;
}

export const AuthenticationLoadingScreen: React.FC<AuthenticationLoadingScreenProps> = ({
  message = 'Securing session & verifying trusted device...',
}) => {
  return (
    <View className="flex-1 bg-[#0A2618] items-center justify-center px-6">
      <View className="w-20 h-20 rounded-3xl bg-emerald-800/40 border border-emerald-500/30 items-center justify-center mb-6 shadow-2xl">
        <Sprout size={40} color="#86EFAC" />
      </View>

      <Text className="text-xl font-black text-white text-center tracking-tight">
        Mathira Organic Farming
      </Text>
      <Text className="text-xs text-emerald-300/80 font-semibold uppercase tracking-widest mt-1">
        Direct From Organic Farmers
      </Text>

      <View className="mt-8 flex-row items-center gap-2.5 bg-emerald-950/60 border border-emerald-800/60 px-4 py-2.5 rounded-2xl">
        <ActivityIndicator size="small" color="#22C55E" />
        <Text className="text-xs font-semibold text-emerald-200">
          {message}
        </Text>
      </View>

      <View className="absolute bottom-10 flex-row items-center gap-1.5 opacity-60">
        <ShieldCheck size={14} color="#86EFAC" />
        <Text className="text-[11px] font-medium text-emerald-200">
          Encrypted Device-Bound Token Security
        </Text>
      </View>
    </View>
  );
};
