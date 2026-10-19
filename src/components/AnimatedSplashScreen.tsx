import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Text, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onFinish: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.78)).current;
  const floatAnim = useRef(new Animated.Value(24)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. 浮现出场（渐显 + 微缩放弹性浮起）
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(floatAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 文字随之显现
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();

      // 2. 驻留 1.3 秒后平滑渐隐退场
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.08,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(textFadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onFinish();
        });
      }, 1300);

      return () => clearTimeout(timeout);
    });
  }, [fadeAnim, scaleAnim, floatAnim, textFadeAnim, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            transform: [{ scale: scaleAnim }, { translateY: floatAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/splash-monster.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={[styles.titleWrapper, { opacity: textFadeAnim }]}>
        <Text style={styles.brandTitle}>Classmeate</Text>
        <Text style={styles.brandSubtitle}>课表驱动知识流 · 随堂全景学习</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: Math.min(width * 0.65, 260),
    height: Math.min(width * 0.65, 260),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  titleWrapper: {
    alignItems: 'center',
    marginTop: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  footerNote: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
