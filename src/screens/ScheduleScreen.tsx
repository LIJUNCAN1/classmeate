import React, { useState, useEffect } from 'react';
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
import { WeekGridView } from '../components/WeekGridView';
import { Course } from '../types/schedule';
import { MOCK_IMPORTED_COURSES } from '../services/jwParser';
import { AutoScheduleService, AutoDetectStatus } from '../services/autoScheduleDetector';

export const ScheduleScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44
  );

  // 视图模式：日视图 (当天时间轴流) vs 周课表 (一整周 7 天全景大网格)
  const [scheduleViewMode, setScheduleViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState('2026-06-22');
  const [courses, setCourses] = useState<Course[]>(MOCK_IMPORTED_COURSES);

  // 自动识别状态
  const [autoStatus, setAutoStatus] = useState<AutoDetectStatus | null>(null);
  const [showAutoBanner, setShowAutoBanner] = useState(false);

  // 页面加载时自动执行静默教务课表识别，无需用户手动点按
  useEffect(() => {
    AutoScheduleService.detectScheduleSilently().then((res) => {
      if (res.success) {
        setCourses(res.data);
        setAutoStatus(res.status);
        setShowAutoBanner(true);
        // 5秒后淡化提示胶囊
        setTimeout(() => setShowAutoBanner(false), 5000);
      }
    });
  }, []);

  // 计算本日剩余课数量
  const remainingCount = courses.filter((c) => c.status !== 'completed').length;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. 顶部生机草木绿流体区域 (安全留出手机通知栏/灵动岛高度) */}
      <View style={[styles.heroHeader, { paddingTop: topPadding + 6 }]}>
        {/* 用户信息栏 & 日/周课表切换器 */}
        <View style={styles.userInfoRow}>
          <View style={styles.userProfile}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>🦖</Text>
            </View>
            <View style={styles.userMeta}>
              <Text style={styles.greetingText}>哈娜宝贝本宝 ✏️</Text>
              <Text style={styles.subGreetingText}>第 14 周 · 夏学期</Text>
            </View>
          </View>

          {/* 日视图 / 周课表 模式切换胶囊 */}
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              style={[
                styles.modeBtn,
                scheduleViewMode === 'day' && styles.modeBtnActive,
              ]}
              onPress={() => setScheduleViewMode('day')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  scheduleViewMode === 'day' ? styles.modeBtnTextActive : styles.modeBtnTextInactive,
                ]}
              >
                日视图
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeBtn,
                scheduleViewMode === 'week' && styles.modeBtnActive,
              ]}
              onPress={() => setScheduleViewMode('week')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  scheduleViewMode === 'week' ? styles.modeBtnTextActive : styles.modeBtnTextInactive,
                ]}
              >
                周课表
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 自动识别成功状态胶囊提示 */}
        {showAutoBanner && autoStatus && (
          <View style={styles.autoDetectedBanner}>
            <View style={styles.autoPulseDot} />
            <Text style={styles.autoDetectedText}>
              已自动识别教务系统课表 ({autoStatus.courseCount} 门课程已同步)
            </Text>
          </View>
        )}

        {/* 本日剩余课卡片 (日视图下高光展示) */}
        {scheduleViewMode === 'day' && (
          <View style={styles.todayRemainingCard}>
            <View style={styles.todayRemainingLeft}>
              <View style={styles.remainingIconCircle}>
                <Ionicons name="time" size={16} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.todayRemainingLabel}>本日剩余课</Text>
                <Text style={styles.todayRemainingSub}>按日程自动提醒 · 联动随堂知识库</Text>
              </View>
            </View>

            <View style={styles.todayRemainingRight}>
              <Text style={styles.todayRemainingNumber}>{remainingCount}</Text>
              <Text style={styles.todayRemainingUnit}>节</Text>
            </View>
          </View>
        )}

        {/* 7 天横滑日历轴 (支持休假标识) */}
        {scheduleViewMode === 'day' && (
          <WeekCalendarStrip
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}
      </View>

      {/* 2. 核心内容区域 (图1的常用工具金刚区已按要求彻底从本页移除，已迁移至“工具”页) */}
      {scheduleViewMode === 'day' ? (
        <ScrollView
          style={styles.dayScrollArea}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={styles.scheduleSection}>
            <View style={styles.scheduleHeaderRow}>
              <View style={styles.scheduleTitleGroup}>
                <Text style={styles.scheduleSectionTitle}>今日课程安排</Text>
                <View style={styles.courseCountBadge}>
                  <Text style={styles.courseCountText}>{courses.length} 门课</Text>
                </View>
              </View>

              <View style={styles.syncStatusBadge}>
                <Ionicons name="checkmark-circle" size={12} color={Colors.primary} />
                <Text style={styles.syncStatusText}>教务已自动同步</Text>
              </View>
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

          <View style={{ height: 28 }} />
        </ScrollView>
      ) : (
        /* 周课表全景大网格视图 (一整周 7 天全部课程) */
        <View style={styles.weekGridWrapper}>
          <WeekGridView />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    marginBottom: 12,
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
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: Rounded.pill,
    padding: 3,
  },
  modeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Rounded.pill,
  },
  modeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  modeBtnTextInactive: {
    color: '#FFFFFF',
  },
  autoDetectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    marginHorizontal: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Rounded.pill,
    marginBottom: 10,
    gap: 6,
  },
  autoPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A7F3D0',
  },
  autoDetectedText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
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
    marginBottom: 8,
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
  dayScrollArea: {
    flex: 1,
  },
  scheduleSection: {
    paddingTop: 16,
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
  syncStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Rounded.pill,
  },
  syncStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  timelineList: {
    paddingLeft: 4,
  },
  weekGridWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
