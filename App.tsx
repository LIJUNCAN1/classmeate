import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { CoursesScreen } from './src/screens/CoursesScreen';
import { BottomNavBar } from './src/components/BottomNavBar';
import { Colors } from './src/constants/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'growth' | 'courses' | 'profile'>('schedule');

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <View style={styles.content}>
          {activeTab === 'schedule' || activeTab === 'home' ? (
            <ScheduleScreen />
          ) : activeTab === 'courses' ? (
            <CoursesScreen />
          ) : (
            <ScheduleScreen />
          )}
        </View>

        {/* 底部 5 标签导航栏 */}
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as any)}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});
