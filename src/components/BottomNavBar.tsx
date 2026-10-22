import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type MainTabType = 'schedule' | 'notes' | 'tools' | 'profile';

interface BottomNavBarProps {
  activeTab: MainTabType;
  onTabChange: (tabId: MainTabType) => void;
}

const TABS: { id: MainTabType; icon: string; activeIcon: string }[] = [
  { id: 'schedule', icon: 'home-outline', activeIcon: 'home' },
  { id: 'notes', icon: 'calendar-outline', activeIcon: 'calendar' },
  { id: 'tools', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  { id: 'profile', icon: 'person-outline', activeIcon: 'person' },
];

const CAPSULE_WIDTH = 276;
const PADDING_H = 8;
const TAB_WIDTH = (CAPSULE_WIDTH - PADDING_H * 2) / TABS.length; // 65px
const CIRCLE_SIZE = 46;
const CIRCLE_OFFSET = (TAB_WIDTH - CIRCLE_SIZE) / 2; // 9.5px

const getTabX = (tabId: MainTabType) => {
  const index = TABS.findIndex((t) => t.id === tabId);
  const idx = index !== -1 ? index : 0;
  return PADDING_H + idx * TAB_WIDTH + CIRCLE_OFFSET;
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();
  const bottomOffset = insets.bottom > 0 ? insets.bottom + 6 : 16;

  // 悬浮指示球水平滑动动效 (translateX) 与微弹性形变动效 (scale)
  const slideAnim = useRef(new Animated.Value(getTabX(activeTab))).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const targetX = getTabX(activeTab);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: targetX,
        tension: 72,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [activeTab]);

  return (
    <View style={[styles.outerWrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.floatingCapsule}>
        {/* 动态平移滑动的浅绿色圆圈底衬（严格对齐用户图片与移动动画） */}
        <Animated.View
          style={[
            styles.activeIndicatorCircle,
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
                color={isActive ? '#15803D' : '#5A6578'}
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
    height: 58,
    borderRadius: 29,
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
  activeIndicatorCircle: {
    position: 'absolute',
    left: 0,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#EDFAEF', // 淡浅绿高光圆底（参考图）
  },
  tabButton: {
    width: TAB_WIDTH,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
