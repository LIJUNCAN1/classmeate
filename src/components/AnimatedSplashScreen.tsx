import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onFinish: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const floatAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    // 1. 浮现出场（渐显 + 微缩放弹性浮起）
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
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
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. 驻留 1.2 秒后平滑渐隐退场
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 450,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onFinish();
        });
      }, 1200);

      return () => clearTimeout(timeout);
    });
  }, [fadeAnim, scaleAnim, floatAnim, onFinish]);

  // 计算小怪兽居中展示的最佳比例尺寸（原图宽高比 1024 x 809）
  const monsterWidth = Math.min(width * 0.72, 300);
  const monsterHeight = monsterWidth * (809 / 1024);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            width: monsterWidth,
            height: monsterHeight,
            transform: [{ scale: scaleAnim }, { translateY: floatAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/dancing-monster.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
});
