import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { NotesScreen } from './src/screens/NotesScreen';
import { ToolsScreen } from './src/screens/ToolsScreen';
import { BottomNavBar, MainTabType } from './src/components/BottomNavBar';
import { Colors } from './src/constants/theme';

export default function App() {
  // 底部三个精简页面：课程表、笔记、工具
  const [activeTab, setActiveTab] = useState<MainTabType>('schedule');
  const [pendingNoteCourse, setPendingNoteCourse] = useState<string | undefined>(undefined);

  const handleNavigateToNotes = (courseName: string) => {
    setPendingNoteCourse(courseName);
    setActiveTab('notes');
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
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

        {/* 底部 3 标签导航栏 (课程表 / 笔记 / 工具) */}
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId)}
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
