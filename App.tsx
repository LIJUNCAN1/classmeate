import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { NotesScreen } from './src/screens/NotesScreen';
import { ToolsScreen } from './src/screens/ToolsScreen';
import { BottomNavBar, MainTabType } from './src/components/BottomNavBar';
import { Colors } from './src/constants/theme';
import { AnimatedSplashScreen } from './src/components/AnimatedSplashScreen';
import { syncScheduleToNativeWidget } from './src/services/widgetHelper';
import { fetchLatestGitHubRelease, GitHubReleaseInfo } from './src/services/updateService';
import { UpdateModal } from './src/components/UpdateModal';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  // 底部精简页面：课程表、笔记、工具
  const [activeTab, setActiveTab] = useState<MainTabType>('schedule');
  const [pendingNoteCourse, setPendingNoteCourse] = useState<string | undefined>(undefined);

  // 打开软件自动检测更新状态
  const [autoUpdateModalVisible, setAutoUpdateModalVisible] = useState(false);
  const [autoReleaseInfo, setAutoReleaseInfo] = useState<GitHubReleaseInfo | null>(null);

  // 每次应用启动：1. 立即同步全周课表至原生桌面小组件 2. 自动检测最新版本
  useEffect(() => {
    syncScheduleToNativeWidget();

    // 打开软件自动检测更新（静默检测，有新版本才展示弹窗）
    (async () => {
      try {
        const res = await fetchLatestGitHubRelease();
        if (res.success && res.data?.hasUpdate) {
          setAutoReleaseInfo(res.data);
          setAutoUpdateModalVisible(true);
        }
      } catch (e) {
        // 静默失败，不打扰用户
      }
    })();
  }, []);

  const handleNavigateToNotes = (courseName: string) => {
    setPendingNoteCourse(courseName);
    setActiveTab('notes');
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        {showSplash && (
          <AnimatedSplashScreen onFinish={() => setShowSplash(false)} />
        )}
        <View style={styles.content}>
          {activeTab === 'schedule' ? (
            <ScheduleScreen onNavigateToNotesTab={handleNavigateToNotes} />
          ) : activeTab === 'notes' ? (
            <NotesScreen
              initialCourseName={pendingNoteCourse}
              onClearInitialCourse={() => setPendingNoteCourse(undefined)}
            />
          ) : (
            <ToolsScreen />
          )}
        </View>

        {/* 底部悬浮胶囊导航栏（参考图悬浮按钮，带滑动切换动画） */}
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId)}
        />

        {/* 全局打开软件自动更新检测弹窗 */}
        <UpdateModal
          visible={autoUpdateModalVisible}
          onClose={() => setAutoUpdateModalVisible(false)}
          release={autoReleaseInfo}
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
