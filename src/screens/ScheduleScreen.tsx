import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { WeekCalendarStrip } from '../components/WeekCalendarStrip';
import { ModeSwitch } from '../components/ModeSwitch';
import { CourseCard } from '../components/CourseCard';
import { QuickAccessGrid } from '../components/QuickAccessGrid';
import { ImportModal } from '../components/ImportModal';
import { BottomNavBar } from '../components/BottomNavBar';
import { Course, ViewMode } from '../types/schedule';
import { MOCK_IMPORTED_COURSES } from '../services/jwParser';

export const ScheduleScreen: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState('2026-06-22');
  const [activeTab, setActiveTab] = useState('schedule');
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [courses, setCourses] = useState<Course[]>(MOCK_IMPORTED_COURSES);

  const handleImportSuccess = (importedCourses: Course[]) => {
    setCourses(importedCourses);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <View style={styles.container}>
        <ScrollView
          style={styles.mainScrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* 1. 顶部生机草木绿流体区域 (Hero Fluid Header) */}
          <View style={styles.heroHeader}>
            {/* 用户状态条 */}
            <View style={styles.userInfoRow}>
              <View style={styles.userProfile}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarEmoji}>🦖</Text>
                </View>
                <View style={styles.userMeta}>
                  <Text style={styles.greetingText}>哈娜宝贝本宝 ✏️</Text>
                  <Text style={styles.subGreetingText}>陪伴成长每一份好奇</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.checkinBadge} activeOpacity={0.8}>
                <Ionicons name="gift-outline" size={13} color="#FFFFFF" />
                <Text style={styles.checkinText}>签到有礼</Text>
              </TouchableOpacity>
            </View>

            {/* 统计指标卡片胶囊 */}
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>16</Text>
                <Text style={styles.statLabel}>剩余1v1</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>16</Text>
                <Text style={styles.statLabel}>剩余小班课</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>21</Text>
                <Text style={styles.statLabel}>剩余大班课</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>剩余公开课</Text>
              </View>
            </View>

            {/* 模式切换 (教师模式 / 日历模式) 与导入入口 */}
            <ModeSwitch
              currentMode={currentMode}
              onModeChange={setCurrentMode}
              onOpenImport={() => setIsImportModalVisible(true)}
            />

            {/* 一周 7 天横向日历滑动轴 */}
            {currentMode === 'calendar' && (
              <WeekCalendarStrip
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}
          </View>

          {/* 2. 常用工具金刚区 (含教务一键导入快捷入口) */}
          <View style={styles.quickGridWrapper}>
            <QuickAccessGrid
              onOpenImport={() => setIsImportModalVisible(true)}
            />
          </View>

          {/* 3. 课程表与随堂笔记流 (Schedule & Note Stream) */}
          <View style={styles.scheduleSection}>
            <View style={styles.scheduleHeaderRow}>
              <View style={styles.scheduleTitleGroup}>
                <Text style={styles.scheduleSectionTitle}>今日课程安排</Text>
                <View style={styles.courseCountBadge}>
                  <Text style={styles.courseCountText}>{courses.length} 节</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.importHintPill}
                onPress={() => setIsImportModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="sync-outline" size={12} color={Colors.primary} />
                <Text style={styles.importHintText}>教务同步</Text>
              </TouchableOpacity>
            </View>

            {/* 时间轴与课程卡片 */}
            <View style={styles.timelineList}>
              {courses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isLast={index === courses.length - 1}
                />
              ))}
            </View>
          </View>

          {/* 底部留白，防止被 TabBar 遮挡 */}
          <View style={{ height: 24 }} />
        </ScrollView>

        {/* 底部 5 标签导航栏 */}
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* 教务导入弹窗 */}
        <ImportModal
          visible={isImportModalVisible}
          onClose={() => setIsImportModalVisible(false)}
          onImportSuccess={handleImportSuccess}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainScrollView: {
    flex: 1,
  },
  heroHeader: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  userMeta: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subGreetingText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  checkinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
  },
  checkinText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickGridWrapper: {
    marginTop: 16,
  },
  scheduleSection: {
    paddingTop: 4,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scheduleTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  courseCountBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Rounded.pill,
  },
  courseCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  importHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Rounded.pill,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  importHintText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  timelineList: {
    paddingLeft: 4,
  },
});
