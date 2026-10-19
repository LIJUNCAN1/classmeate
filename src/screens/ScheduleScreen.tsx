import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { WeekCalendarStrip } from '../components/WeekCalendarStrip';
import { CourseCard } from '../components/CourseCard';
import { QuickAccessGrid } from '../components/QuickAccessGrid';
import { ImportModal } from '../components/ImportModal';
import { Course } from '../types/schedule';
import { MOCK_IMPORTED_COURSES } from '../services/jwParser';

interface ScheduleScreenProps {
  onOpenImport?: () => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = () => {
  const insets = useSafeAreaInsets();
  // 留出手机顶部状态栏/刘海屏安全距离 (适配 iOS 刘海/灵动岛、Android 状态栏及 Web 预览)
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44
  );

  const [selectedDate, setSelectedDate] = useState('2026-06-22');
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [courses, setCourses] = useState<Course[]>(MOCK_IMPORTED_COURSES);

  // 计算本日剩余课数量（未上课或上课中）
  const remainingCount = courses.filter((c) => c.status !== 'completed').length;

  const handleImportSuccess = (importedCourses: Course[]) => {
    setCourses(importedCourses);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* 1. 顶部生机草木绿流体区域 (Hero Fluid Header，已安全留出通知栏高位) */}
        <View style={[styles.heroHeader, { paddingTop: topPadding + 8 }]}>
          {/* 用户状态栏 (已移除签到有礼) */}
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

            {/* 右侧快捷教务导入按钮 */}
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => setIsImportModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="cloud-download-outline" size={16} color="#FFFFFF" />
              <Text style={styles.headerActionText}>教务导入</Text>
            </TouchableOpacity>
          </View>

          {/* 2. 唯一定制卡片：本日剩余课 (已完全移除原先分散的1v1/小班/公开课等多列) */}
          <View style={styles.todayRemainingCard}>
            <View style={styles.todayRemainingLeft}>
              <View style={styles.remainingIconCircle}>
                <Ionicons name="time" size={16} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.todayRemainingLabel}>本日剩余课</Text>
                <Text style={styles.todayRemainingSub}>按日程准时提醒 · 自动挂载随堂笔记</Text>
              </View>
            </View>

            <View style={styles.todayRemainingRight}>
              <Text style={styles.todayRemainingNumber}>{remainingCount}</Text>
              <Text style={styles.todayRemainingUnit}>节</Text>
            </View>
          </View>

          {/* 3. 专注日程课表：一周 7 天横向日历滑动轴 (无需教师模式，纯粹专注课表) */}
          <WeekCalendarStrip
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </View>

        {/* 4. 常用工具金刚区 */}
        <View style={styles.quickGridWrapper}>
          <QuickAccessGrid
            onOpenImport={() => setIsImportModalVisible(true)}
          />
        </View>

        {/* 5. 课程表与随堂笔记垂直时间轴 */}
        <View style={styles.scheduleSection}>
          <View style={styles.scheduleHeaderRow}>
            <View style={styles.scheduleTitleGroup}>
              <Text style={styles.scheduleSectionTitle}>今日课表日程</Text>
              <View style={styles.courseCountBadge}>
                <Text style={styles.courseCountText}>{courses.length} 门课程</Text>
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

          {/* 时间轴与大圆角课程卡片 */}
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

        {/* 底部安全留白 */}
        <View style={{ height: 28 }} />
      </ScrollView>

      {/* 教务导入弹窗 */}
      <ImportModal
        visible={isImportModalVisible}
        onClose={() => setIsImportModalVisible(false)}
        onImportSuccess={handleImportSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 16,
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
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 2,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
  },
  headerActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  todayRemainingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginHorizontal: 16,
    borderRadius: Rounded.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  todayRemainingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  remainingIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayRemainingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  todayRemainingSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  todayRemainingRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  todayRemainingNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  todayRemainingUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
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
