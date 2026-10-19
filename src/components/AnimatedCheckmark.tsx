import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedCheckmarkProps {
  checked: boolean;
  size?: number;
}

export const AnimatedCheckmark: React.FC<AnimatedCheckmarkProps> = ({
  checked,
  size = 18,
}) => {
  const scaleAnim = useRef(new Animated.Value(checked ? 1 : 0.3)).current;
  const rotateAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    if (checked) {
      scaleAnim.setValue(0.2);
      rotateAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [checked]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-30deg', '0deg'],
  });

  if (!checked) {
    return (
      <View style={[styles.circleEmpty, { width: size, height: size, borderRadius: size / 2 }]} />
    );
  }

  return (
    <Animated.View
      style={[
        styles.checkContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: scaleAnim }, { rotate: spin }],
        },
      ]}
    >
      <Ionicons name="checkmark" size={Math.round(size * 0.72)} color="#FFFFFF" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  circleEmpty: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  checkContainer: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
});
