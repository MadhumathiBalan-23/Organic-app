import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, ScrollView } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = Math.min(SCREEN_WIDTH - 24, 380);
const BANNER_HEIGHT = 195;

export const ShimmerItem: React.FC<{
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
  className?: string;
}> = ({ width, height, borderRadius = 8, style, className = '' }) => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      className={className}
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#D1E7DD',
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

export const LandingPageSkeleton: React.FC = () => {
  return (
    <View className="flex-1 bg-[#F0F7F2] pt-3">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* 1. Promotional Banner Skeleton (Height matches new 195px increased banner) */}
        <View className="items-center px-3">
          <View
            style={{
              width: BANNER_WIDTH,
              height: BANNER_HEIGHT,
              borderRadius: 22,
              backgroundColor: '#E2F0D9',
              overflow: 'hidden',
              padding: 16,
              justifyContent: 'space-between',
            }}
            className="shadow-sm border border-emerald-100"
          >
            <View>
              <ShimmerItem width={90} height={18} borderRadius={10} style={{ marginBottom: 12 }} />
              <ShimmerItem width={220} height={22} borderRadius={6} style={{ marginBottom: 8 }} />
              <ShimmerItem width={160} height={14} borderRadius={4} />
            </View>
            <View className="flex-row justify-between items-end">
              <ShimmerItem width={100} height={32} borderRadius={12} />
              <ShimmerItem width={50} height={12} borderRadius={6} />
            </View>
          </View>

          {/* Dots skeleton */}
          <View className="flex-row justify-center items-center mt-3 gap-1.5">
            <ShimmerItem width={20} height={6} borderRadius={3} />
            <ShimmerItem width={6} height={6} borderRadius={3} />
            <ShimmerItem width={6} height={6} borderRadius={3} />
          </View>
        </View>

        {/* 2. Categories Row Skeleton */}
        <View className="mt-4 px-3">
          <View className="flex-row justify-between items-center mb-2.5">
            <ShimmerItem width={130} height={18} borderRadius={6} />
            <ShimmerItem width={80} height={18} borderRadius={6} />
          </View>

          <View className="flex-row gap-3">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="items-center" style={{ width: 72 }}>
                <ShimmerItem width={66} height={66} borderRadius={16} style={{ marginBottom: 6 }} />
                <ShimmerItem width={52} height={10} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>

        {/* 3. Daily Delivery Hub Skeleton */}
        <View className="mx-3 mt-4 rounded-3xl p-4 bg-[#0A5C36]/20 border border-emerald-600/20">
          <View className="flex-row justify-between items-center mb-3">
            <ShimmerItem width={120} height={18} borderRadius={10} style={{ backgroundColor: '#A7F3D0' }} />
            <ShimmerItem width={70} height={18} borderRadius={10} style={{ backgroundColor: '#A7F3D0' }} />
          </View>
          <ShimmerItem width={200} height={16} borderRadius={4} style={{ marginBottom: 6, backgroundColor: '#A7F3D0' }} />
          <ShimmerItem width={250} height={12} borderRadius={4} style={{ marginBottom: 12, backgroundColor: '#A7F3D0' }} />
          <View className="flex-row justify-between items-center pt-2 border-t border-emerald-900/10">
            <ShimmerItem width={110} height={14} borderRadius={4} style={{ backgroundColor: '#A7F3D0' }} />
            <ShimmerItem width={95} height={28} borderRadius={10} style={{ backgroundColor: '#FDE047' }} />
          </View>
        </View>

        {/* 4. Organic Products Skeleton */}
        <View className="mt-4 px-3">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <ShimmerItem width={140} height={18} borderRadius={4} style={{ marginBottom: 4 }} />
              <ShimmerItem width={180} height={12} borderRadius={4} />
            </View>
            <ShimmerItem width={60} height={14} borderRadius={4} />
          </View>

          <View className="flex-row justify-between gap-3">
            {[1, 2].map((i) => (
              <View
                key={i}
                className="flex-1 bg-white rounded-2xl p-3 border border-emerald-50 shadow-xs"
              >
                <ShimmerItem width="100%" height={110} borderRadius={12} style={{ marginBottom: 8 }} />
                <ShimmerItem width={90} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
                <ShimmerItem width={60} height={12} borderRadius={4} style={{ marginBottom: 10 }} />
                <View className="flex-row justify-between items-center">
                  <ShimmerItem width={50} height={16} borderRadius={4} />
                  <ShimmerItem width={55} height={26} borderRadius={8} style={{ backgroundColor: '#07843D' }} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

