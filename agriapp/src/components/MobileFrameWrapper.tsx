import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity, Dimensions } from 'react-native';

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
      <View style={styles.webDesktopBackground}>
        {/* Top Control Bar for Web Simulator */}
        <View style={styles.simulatorTopBar}>
          <View style={styles.simBrand}>
            <Text style={styles.simBrandIcon}>🌱</Text>
            <Text style={styles.simBrandTitle}>OrganicFlow AI Mobile Web Simulator</Text>
            <View style={styles.liveTag}><Text style={styles.liveTagText}>● Expo 54 Live</Text></View>
          </View>
          <View style={styles.simControls}>
            <TouchableOpacity 
              style={[styles.simBtn, styles.simBtnActive]} 
              onPress={() => setFrameEnabled(true)}
            >
              <Text style={styles.simBtnTextActive}>📱 Mobile View</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.simBtn} 
              onPress={() => setFrameEnabled(false)}
            >
              <Text style={styles.simBtnText}>🖥️ Full Web View</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mobile Phone Mockup Frame */}
        <View style={styles.phoneOuterFrame}>
          {/* Side Buttons Mockup */}
          <View style={styles.volumeUpBtn} />
          <View style={styles.volumeDownBtn} />
          <View style={styles.powerBtn} />

          {/* Inner Phone Screen */}
          <View style={styles.phoneInnerScreen}>
            {/* Dynamic Island / Notch */}
            <View style={styles.phoneNotchContainer}>
              <View style={styles.phoneCameraLens} />
              <View style={styles.phoneSpeakerGrille} />
            </View>

            {/* App Screen Content */}
            <View style={styles.appContentBox}>
              {children}
            </View>

            {/* Bottom Home Indicator Line */}
            <View style={styles.homeIndicatorBar}>
              <View style={styles.homeIndicatorPill} />
            </View>
          </View>
        </View>

        <Text style={styles.simFooterText}>
          Tip: Test role switching (Customer / Farmer / Admin) and AI features inside the mobile viewport.
        </Text>
      </View>
    );
  }

  // Native iOS/Android or small web viewports
  return (
    <View style={styles.nativeContainer}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: '#FCFBF9',
  },
  webDesktopBackground: {
    flex: 1,
    backgroundColor: '#0F172A', // Sleek dark slate background
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    minHeight: Dimensions.get('window').height,
  },
  simulatorTopBar: {
    width: '100%',
    maxWidth: 900,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  simBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simBrandIcon: {
    fontSize: 20,
  },
  simBrandTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  liveTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  liveTagText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: 'bold',
  },
  simControls: {
    flexDirection: 'row',
    gap: 8,
  },
  simBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  simBtnActive: {
    backgroundColor: '#22C55E',
  },
  simBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  simBtnTextActive: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  phoneOuterFrame: {
    width: 390,
    height: 800,
    backgroundColor: '#1E1E1E',
    borderRadius: 48,
    padding: 12,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 25px 35px rgba(0, 0, 0, 0.5)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 25 },
          shadowOpacity: 0.5,
          shadowRadius: 35,
          elevation: 20,
        }),
    borderWidth: 4,
    borderColor: '#333333',
    position: 'relative',
  },
  volumeUpBtn: {
    position: 'absolute',
    left: -8,
    top: 110,
    width: 4,
    height: 40,
    backgroundColor: '#333333',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  volumeDownBtn: {
    position: 'absolute',
    left: -8,
    top: 165,
    width: 4,
    height: 40,
    backgroundColor: '#333333',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  powerBtn: {
    position: 'absolute',
    right: -8,
    top: 140,
    width: 4,
    height: 55,
    backgroundColor: '#333333',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  phoneInnerScreen: {
    flex: 1,
    backgroundColor: '#FCFBF9',
    borderRadius: 38,
    overflow: 'hidden',
    position: 'relative',
  },
  phoneNotchContainer: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    width: 120,
    height: 24,
    backgroundColor: '#000000',
    borderRadius: 14,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  phoneCameraLens: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  phoneSpeakerGrille: {
    width: 35,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1F2937',
  },
  appContentBox: {
    flex: 1,
    paddingTop: 10,
  },
  homeIndicatorBar: {
    height: 16,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicatorPill: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  simFooterText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 10,
    fontStyle: 'italic',
  },
});
