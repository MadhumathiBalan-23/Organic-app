import React, { useState, useEffect } from 'react';
import { View, Platform, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Sprout, Smartphone, Monitor } from 'lucide-react-native';

interface MobileFrameWrapperProps {
  children: React.ReactNode;
}

export const MobileFrameWrapper: React.FC<MobileFrameWrapperProps> = ({ children }) => {
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const [frameEnabled, setFrameEnabled] = useState(true);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const isWebDesktop = Platform.OS === 'web' && windowWidth > 600;

  if (isWebDesktop && frameEnabled) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center py-3 min-h-screen">
        {/* Top Control Bar for Web Simulator */}
        <View className="w-full max-w-4xl flex-row items-center justify-between px-5 py-2.5 mb-2.5 bg-slate-800 rounded-2xl border border-slate-700">
          <View className="flex-row items-center gap-2">
            <View className="mr-1.5">
              <Sprout size={18} color="#16a34a" />
            </View>
            <Text className="text-slate-50 text-base font-bold">OrganicFlow AI Mobile Web Simulator</Text>
            <View className="bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500">
              <Text className="text-emerald-400 text-xs font-bold">● Expo Live</Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity 
              className="px-3.5 py-1.5 rounded-full bg-emerald-500 flex-row items-center gap-1.5" 
              onPress={() => setFrameEnabled(true)}
            >
              <Smartphone size={15} color="#FFFFFF" />
              <Text className="text-white text-xs font-bold">Mobile View</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="px-3.5 py-1.5 rounded-full bg-white/10 flex-row items-center gap-1.5" 
              onPress={() => setFrameEnabled(false)}
            >
              <Monitor size={15} color="#94A3B8" />
              <Text className="text-slate-300 text-xs font-semibold">Full Web View</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mobile Phone Mockup Frame */}
        <View className="w-[425px] h-[870px] max-w-[95vw] bg-[#1E1E1E] rounded-[48px] p-3 border-4 border-[#333333] relative shadow-2xl">
          {/* Side Buttons Mockup */}
          <View className="absolute -left-2 top-28 w-1 h-10 bg-[#333333] rounded-l-sm" />
          <View className="absolute -left-2 top-40 w-1 h-10 bg-[#333333] rounded-l-sm" />
          <View className="absolute -right-2 top-36 w-1 h-14 bg-[#333333] rounded-r-sm" />

          {/* Inner Phone Screen */}
          <View className="flex-1 bg-[#FCFBF9] rounded-[38px] overflow-hidden relative">
            {/* Dynamic Island / Notch */}
            <View className="absolute top-1.5 self-center w-[120px] h-6 bg-black rounded-2xl z-50 flex-row items-center justify-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <View className="w-[35px] h-1 rounded-sm bg-gray-800" />
            </View>

            {/* App Screen Content */}
            <View className="flex-1 pt-2.5">
              {children}
            </View>

            {/* Bottom Home Indicator Line */}
            <View className="h-4 bg-black items-center justify-center">
              <View className="w-28 h-1 rounded-sm bg-white" />
            </View>
          </View>
        </View>

        <Text className="text-slate-400 text-xs mt-2.5 italic">
          Tip: Test role switching (Customer / Farmer / Admin) and AI features inside the mobile viewport.
        </Text>
      </View>
    );
  }

  // Native iOS/Android or small web viewports
  return (
    <View className="flex-1 bg-[#FCFBF9]">
      {children}
    </View>
  );
};
