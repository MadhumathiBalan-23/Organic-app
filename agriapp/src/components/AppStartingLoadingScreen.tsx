import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export interface AppStartingLoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export const AppStartingLoadingScreen: React.FC<AppStartingLoadingScreenProps> = ({
  message = 'Loading farm fresh harvest...',
  subMessage,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Full-Screen Centered GIF Animation (No card, no borders, seamlessly blending with screen) */}
      <Animated.View style={[styles.gifContainer, { opacity: fadeAnim }]}>
        <Image
          source={require('../../asset/gif.gif')}
          style={styles.fullScreenGif}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Subtle Bottom Loading Progress */}
      <Animated.View style={[styles.bottomContainer, { opacity: fadeAnim }]}>
        <ActivityIndicator size="small" color="#059669" style={styles.spinner} />
        <Text style={styles.loadingText}>{message}</Text>
        {subMessage ? <Text style={styles.subText}>{subMessage}</Text> : null}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  gifContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  fullScreenGif: {
    width: width,
    height: Math.min(height * 0.75, width * 1.15),
    maxWidth: 500,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  spinner: {
    marginBottom: 6,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subText: {
    fontSize: 11,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 2,
  },
});
