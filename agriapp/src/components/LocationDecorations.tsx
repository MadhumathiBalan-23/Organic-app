import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

/**
 * Top-Left Botanical Leaf Branch
 * Organic leaves extending into the top-left corner
 */
export const TopLeftLeaves: React.FC<{ size?: number }> = ({ size = 180 }) => {
  return (
    <View style={styles.topLeftContainer} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 180 180" fill="none">
        <Defs>
          <LinearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#86EFAC" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#16A34A" stopOpacity="0.95" />
          </LinearGradient>
          <LinearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4ADE80" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#15803D" stopOpacity="0.95" />
          </LinearGradient>
          <LinearGradient id="leafGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
          </LinearGradient>
          <LinearGradient id="leafGradSoft" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#BBF7D0" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#22C55E" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {/* Stem 1 */}
        <Path
          d="M -10 -10 C 20 40, 60 70, 110 90"
          stroke="#4D7C0F"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />

        {/* Large leaf pointing down-right */}
        <Path
          d="M 60 70 C 80 50, 115 55, 140 85 C 120 100, 85 95, 60 70 Z"
          fill="url(#leafGrad1)"
        />
        {/* Vein */}
        <Path
          d="M 60 70 Q 100 75 140 85"
          stroke="#166534"
          strokeWidth="1.2"
          strokeOpacity="0.4"
        />

        {/* Leaf 2 pointing right */}
        <Path
          d="M 35 45 C 55 25, 95 30, 115 50 C 95 70, 55 65, 35 45 Z"
          fill="url(#leafGrad2)"
        />
        <Path
          d="M 35 45 Q 75 48 115 50"
          stroke="#14532D"
          strokeWidth="1.2"
          strokeOpacity="0.4"
        />

        {/* Leaf 3 pointing downward */}
        <Path
          d="M 20 30 C 5 55, 10 90, 30 115 C 45 95, 40 60, 20 30 Z"
          fill="url(#leafGrad3)"
        />
        <Path
          d="M 20 30 Q 25 72 30 115"
          stroke="#065F46"
          strokeWidth="1.2"
          strokeOpacity="0.4"
        />

        {/* Leaf 4 small top sprout */}
        <Path
          d="M 10 10 C 25 -5, 55 -5, 70 12 C 55 25, 25 25, 10 10 Z"
          fill="url(#leafGrad1)"
        />

        {/* Leaf 5 far tip leaf */}
        <Path
          d="M 110 90 C 130 85, 155 95, 170 115 C 148 125, 125 110, 110 90 Z"
          fill="url(#leafGrad2)"
        />

        {/* Soft background ghost leaf */}
        <Path
          d="M 0 60 C -10 90, 5 125, 25 140 C 35 115, 20 85, 0 60 Z"
          fill="url(#leafGradSoft)"
        />
      </Svg>
    </View>
  );
};

/**
 * Top-Right Translucent Watercolor Leaf Accent
 */
export const TopRightLeaves: React.FC<{ size?: number }> = ({ size = 150 }) => {
  return (
    <View style={styles.topRightContainer} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 150 150" fill="none">
        <Defs>
          <LinearGradient id="trGrad1" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#86EFAC" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#22C55E" stopOpacity="0.25" />
          </LinearGradient>
          <LinearGradient id="trGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
          </LinearGradient>
        </Defs>

        {/* Stem */}
        <Path
          d="M 160 -10 C 130 30, 95 60, 50 85"
          stroke="#86EFAC"
          strokeWidth="1.8"
          strokeOpacity="0.3"
        />

        {/* Soft leaves */}
        <Path
          d="M 110 40 C 90 20, 55 25, 35 48 C 55 65, 90 60, 110 40 Z"
          fill="url(#trGrad1)"
        />
        <Path
          d="M 75 65 C 60 50, 30 55, 15 75 C 30 90, 60 85, 75 65 Z"
          fill="url(#trGrad2)"
        />
        <Path
          d="M 135 15 C 115 0, 85 5, 70 25 C 85 40, 115 35, 135 15 Z"
          fill="url(#trGrad1)"
        />
      </Svg>
    </View>
  );
};

/**
 * Bottom Rolling Waves and Organic Leaves
 */
export const BottomLandscape: React.FC<{ width?: number; height?: number }> = ({
  width = 390,
  height = 140,
}) => {
  return (
    <View style={styles.bottomContainer} pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 0 ${width} 140`} fill="none" preserveAspectRatio="none">
        <Defs>
          {/* Back Wave Gradient */}
          <LinearGradient id="backWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#E6F7EC" stopOpacity="0.7" />
            <Stop offset="50%" stopColor="#F0FDF4" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#E2F5E9" stopOpacity="0.75" />
          </LinearGradient>

          {/* Front Wave Gradient */}
          <LinearGradient id="frontWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#D8F3E2" stopOpacity="0.85" />
            <Stop offset="50%" stopColor="#EAF8EE" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#D4F0DF" stopOpacity="0.85" />
          </LinearGradient>

          {/* Leaf Gradients */}
          <LinearGradient id="botLeafGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#15803D" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#4ADE80" stopOpacity="0.9" />
          </LinearGradient>
          <LinearGradient id="botLeafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#166534" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#22C55E" stopOpacity="0.85" />
          </LinearGradient>
        </Defs>

        {/* Back Wave */}
        <Path
          d={`M 0 55 Q ${width * 0.25} 30, ${width * 0.5} 50 T ${width} 40 L ${width} 140 L 0 140 Z`}
          fill="url(#backWaveGrad)"
        />

        {/* Front Wave */}
        <Path
          d={`M 0 75 C ${width * 0.3} 60, ${width * 0.6} 85, ${width} 65 L ${width} 140 L 0 140 Z`}
          fill="url(#frontWaveGrad)"
        />

        {/* Bottom Left Leaves Sprouting Up */}
        <G transform="translate(-10, 60)">
          {/* Main Leaf */}
          <Path
            d="M 10 75 C 15 45, 40 25, 65 20 C 60 50, 40 70, 10 75 Z"
            fill="url(#botLeafGrad1)"
          />
          <Path
            d="M 10 75 Q 38 48 65 20"
            stroke="#14532D"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />

          {/* Secondary Leaf */}
          <Path
            d="M 30 75 C 45 55, 75 45, 95 50 C 80 70, 55 80, 30 75 Z"
            fill="url(#botLeafGrad2)"
          />

          {/* Little Sprout */}
          <Path
            d="M 0 70 C 0 50, 15 35, 30 35 C 25 55, 15 65, 0 70 Z"
            fill="url(#botLeafGrad1)"
          />
        </G>

        {/* Bottom Right Leaves Sprouting Up */}
        <G transform={`translate(${width - 90}, 65)`}>
          {/* Main Leaf */}
          <Path
            d="M 85 70 C 80 40, 55 20, 30 18 C 35 48, 55 65, 85 70 Z"
            fill="url(#botLeafGrad1)"
          />
          <Path
            d="M 85 70 Q 58 44 30 18"
            stroke="#14532D"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />

          {/* Secondary Leaf */}
          <Path
            d="M 65 72 C 50 52, 20 45, 0 50 C 15 68, 40 78, 65 72 Z"
            fill="url(#botLeafGrad2)"
          />

          {/* Little Sprout */}
          <Path
            d="M 95 65 C 95 48, 80 32, 65 32 C 70 52, 80 62, 95 65 Z"
            fill="url(#botLeafGrad1)"
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  topLeftContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  topRightContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});
