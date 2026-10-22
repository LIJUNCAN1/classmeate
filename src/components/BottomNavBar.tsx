import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type MainTabType = 'schedule' | 'notes' | 'tools';

interface BottomNavBarProps {
  activeTab: MainTabType;
  onTabChange: (tabId: MainTabType) => void;
}

const TABS: { id: MainTabType; icon: string; activeIcon: string }[] = [
  { id: 'schedule', icon: 'home-outline', activeIcon: 'home' },
  { id: 'notes', icon: 'calendar-outline', activeIcon: 'calendar' },
  { id: 'tools', icon: 'grid-outline', activeIcon: 'grid' },
];

const CAPSULE_WIDTH = 216;
const PADDING_H = 8;
const TAB_WIDTH = (CAPSULE_WIDTH - PADDING_H * 2) / TABS.length; // 66.7px
const DOT_SIZE = 4;
const DOT_OFFSET = (TAB_WIDTH - DOT_SIZE) / 2;

const getDotX = (tabId: MainTabType) => {
  const index = TABS.findIndex((t) => t.id === tabId);
  const idx = index !== -1 ? index : 0;
  return PADDING_H + idx * TAB_WIDTH + DOT_OFFSET;
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();
  const bottomOffset = insets.bottom > 0 ? insets.bottom + 6 : 16;

  // 底部指示圆点水平滑动动效 (translateX) 与微弹性形变动效 (scale)
  const slideAnim = useRef(new Animated.Value(getDotX(activeTab))).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const targetX = getDotX(activeTab);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: targetX,
        tension: 80,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.6,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 90,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [activeTab]);

  return (
    <View style={[styles.outerWrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.floatingCapsule}>
        {/* 用户要求：选中的时候和之前一样填色icon和下面一个点（带平滑滑动动画） */}
        <Animated.View
          style={[
            styles.activeIndicatorDot,
            {
              transform: [
                { translateX: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        />

        {/* 4 个图标按钮 */}
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isActive ? tab.activeIcon : tab.icon) as any}
                size={23}
                color={isActive ? '#16A34A' : '#64748B'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  floatingCapsule: {
    width: CAPSULE_WIDTH,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING_H,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  activeIndicatorDot: {
    position: 'absolute',
    left: 0,
    bottom: 9,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#16A34A', // 经典草木绿指示圆点
  },
  tabButton: {
    width: TAB_WIDTH,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
    zIndex: 2,
  },
});
