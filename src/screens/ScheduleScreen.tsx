import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { WeekCalendarStrip } from '../components/WeekCalendarStrip';
import { CourseCard } from '../components/CourseCard';
import { WeekGridView } from '../components/WeekGridView';
import { Course } from '../types/schedule';
import { AutoScheduleService, AutoDetectStatus } from '../services/autoScheduleDetector';

interface ScheduleScreenProps {
  onNavigateToNotesTab?: (courseName: string) => void;
}

// 包含周一至周日完整一周的课程排期数据
const FULL_WEEK_COURSES: Course[] = [
  // 周一 (dayOfWeek = 1)
  {
    id: 'c-1',
    name: '高等数学 (AI 与数据方向)',
    teacher: '张晓华 教授',
    location: '第一教学楼 A204',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:35',
    stageTag: '必修大课 · 48课时 · 周一1-2节',
    status: 'in_progress',
    notesCount: 2,
  },
  {
    id: 'c-2',
    name: '计算机系统结构',
    teacher: '王工 讲师',
    location: '信息实验楼 301实验室',
    dayOfWeek: 1,
    startTime: '14:00',
    endTime: '15:35',
    stageTag: '核心基础 · 32课时 · 周一5-6节',
    status: 'pending',
    notesCount: 1,
  },

  // 周二 (dayOfWeek = 2)
  {
    id: 'c-3',
    name: '大学英语写作与思辨',
    teacher: 'Sarah 外教',
    location: '外国语学院 405研讨室',
    dayOfWeek: 2,
    startTime: '10:00',
    endTime: '11:35',
    stageTag: '通识核心 · 32课时 · 周二3-4节',
    status: 'pending',
    notesCount: 0,
  },

  // 周三 (dayOfWeek = 3)
  {
    id: 'c-4',
    name: '成人商务韩语谈判',
    teacher: 'Jennifer 老师',
    location: '国际交流中心 302',
    dayOfWeek: 3,
    startTime: '09:00',
    endTime: '10:35',
    stageTag: '进阶阶段 · 36课时 · 高阶',
    status: 'pending',
    notesCount: 3,
  },
  {
    id: 'c-5',
    name: 'TOPIK备考（留学专攻）',
    teacher: 'Stefanee 讲师',
    location: '同声传译实训室 401',
    dayOfWeek: 3,
    startTime: '13:30',
    endTime: '15:05',
    stageTag: '强化阶段 · 32课时 · 周三5-6节',
    status: 'pending',
    notesCount: 1,
  },
  {
    id: 'c-6',
    name: '韩语口语突破1v1',
    teacher: 'Cipher 老师',
    location: '在线协同音视频 2室',
    dayOfWeek: 3,
    startTime: '16:30',
    endTime: '17:45',
    stageTag: '培养阶段 · 24课时 · 入门',
    status: 'pending',
    notesCount: 0,
  },

  // 周四 (dayOfWeek = 4)
  {
    id: 'c-7',
    name: '数据结构与算法',
    teacher: '李院长',
    location: '软件工程学院 208机房',
    dayOfWeek: 4,
    startTime: '08:00',
    endTime: '09:35',
    stageTag: '核心专业 · 48课时 · 周四1-2节',
    status: 'pending',
    notesCount: 4,
  },

  // 周五 (dayOfWeek = 5)
  {
    id: 'c-8',
    name: '交互设计与UI艺术',
    teacher: '陈总监',
    location: '创新设计工坊 102艺术厅',
    dayOfWeek: 5,
    startTime: '10:00',
    endTime: '12:25',
    stageTag: '专业选修 · 36课时 · 周五3-5节',
    status: 'pending',
    notesCount: 2,
  },
];

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  onNavigateToNotesTab,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44
  );

  // 获取今日真实日期与星期
  const getTodayInfo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    // getDay() 0是周日，对应星期数字 7，其它1-6
    const dNum = now.getDay() === 0 ? 7 : now.getDay();
    return { dateStr, dayOfWeek: dNum };
  };

  // 模式：【今日】 vs 【周课表】（按要求将“日视图”改名为“今日”）
  const [scheduleViewMode, setScheduleViewMode] = useState<'day' | 'week'>('day');

  // 当前选中日期与对应星期几 (默认自动严格锁定今天的真实日期)
  const [selectedDate, setSelectedDate] = useState(() => getTodayInfo().dateStr);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(() => getTodayInfo().dayOfWeek);

  // 悬浮提醒 Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 页面向下平滑出现的淡入向下动画 (Downward Entrance Animation)
  const dropAnim = useRef(new Animated.Value(-18)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const triggerEntranceAnimation = () => {
    dropAnim.setValue(-18);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(dropAnim, {
        toValue: 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 页面初次加载时触发向下出现动画
  useEffect(() => {
    triggerEntranceAnimation();
  }, [scheduleViewMode]);

  // 1. 每天 0:00 自动切换日期的机制
  useEffect(() => {
    const updateToRealToday = () => {
      const today = getTodayInfo();
      setSelectedDate(today.dateStr);
      setSelectedDayOfWeek(today.dayOfWeek);
    };

    updateToRealToday();

    // 计算距离明日凌晨 00:00:01 的倒计时
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    const msToMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      updateToRealToday();
      const dailyTimer = setInterval(updateToRealToday, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyTimer);
    }, msToMidnight);

    return () => clearTimeout(midnightTimer);
  }, []);

  // 2. 切换日期处理函数（点击日历轴任意一天，立刻切换过滤出该天的课表）
  const handleSelectDate = (dateStr: string, dayOfWeek: number) => {
    setSelectedDate(dateStr);
    setSelectedDayOfWeek(dayOfWeek);
    triggerEntranceAnimation();
  };

  // 3. 点击切换回“今日”模式时，自动复位到今天的日期
  const handleSwitchToToday = () => {
    setScheduleViewMode('day');
    const today = getTodayInfo();
    setSelectedDate(today.dateStr);
    setSelectedDayOfWeek(today.dayOfWeek);
    triggerEntranceAnimation();
  };

  // 4. 根据当前选中的星期几过滤出对应课程
  const dayCourses = FULL_WEEK_COURSES.filter((c) => c.dayOfWeek === selectedDayOfWeek);

  // 5. 点击接入系统提醒事项
  const handleToggleReminder = (course: Course, enabled: boolean) => {
    const msg = enabled
      ? `🔔 已接入系统提醒事项：将在【${course.name}】课前15分钟提醒`
      : `🔕 已关闭【${course.name}】上课提醒`;
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 顶部生机草木绿流体区域 */}
      <View style={[styles.heroHeader, { paddingTop: topPadding + 6 }]}>
        {/* 用户信息与 【今日 | 周课表】 切换 */}
        <View style={styles.userInfoRow}>
          <View style={styles.userProfile}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>🦖</Text>
            </View>
            <View style={styles.userMeta}>
              <Text style={styles.greetingText}>哈娜宝贝本宝 ✏️</Text>
            </View>
          </View>

          {/* 模式切换：今日 vs 周课表 (已将“日视图”按要求改为“今日”) */}
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              style={[
                styles.modeBtn,
                scheduleViewMode === 'day' && styles.modeBtnActive,
              ]}
              onPress={handleSwitchToToday}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  scheduleViewMode === 'day' ? styles.modeBtnTextActive : styles.modeBtnTextInactive,
                ]}
              >
                今日
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

        {/* 仅保留：本日剩余课（已彻底去除副标题文案） */}
        {scheduleViewMode === 'day' && (
          <View style={styles.todayRemainingCard}>
            <View style={styles.todayRemainingLeft}>
              <View style={styles.remainingIconCircle}>
                <Ionicons name="time" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.todayRemainingLabel}>本日剩余课</Text>
            </View>

            <View style={styles.todayRemainingRight}>
              <Text style={styles.todayRemainingNumber}>{dayCourses.length}</Text>
              <Text style={styles.todayRemainingUnit}>节</Text>
            </View>
          </View>
        )}

        {/* 7 天横滑日历轴 (支持休假标识，自动定位高亮真实今日) */}
        {scheduleViewMode === 'day' && (
          <WeekCalendarStrip
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        )}
      </View>

      {/* 提醒事项 Toast 浮条 */}
      {toastMessage && (
        <View style={styles.toastFloatBar}>
          <Ionicons name="information-circle" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* 核心内容区（带向下出现的平滑动画） */}
      <Animated.View
        style={[
          styles.animatedContentWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: dropAnim }],
          },
        ]}
      >
        {scheduleViewMode === 'day' ? (
          <ScrollView
            style={styles.dayScrollArea}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <View style={styles.scheduleSection}>
              <View style={styles.scheduleHeaderRow}>
                <View style={styles.scheduleTitleGroup}>
                  <Text style={styles.scheduleSectionTitle}>
                    {selectedDayOfWeek === getTodayInfo().dayOfWeek ? '今日课表安排' : '当日课表安排'}
                  </Text>
                  <View style={styles.courseCountBadge}>
                    <Text style={styles.courseCountText}>{dayCourses.length} 门课</Text>
                  </View>
                </View>

                <View style={styles.syncStatusBadge}>
                  <Ionicons name="flash" size={12} color={Colors.primary} />
                  <Text style={styles.syncStatusText}>教务已自动同步</Text>
                </View>
              </View>

              {/* 当天课程列表：随选中日期动态切换 */}
              {dayCourses.length === 0 ? (
                <View style={[styles.weekendRestCard, Shadows.card]}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>🏖️</Text>
                  <Text style={styles.restTitle}>本日无课程安排</Text>
                  <Text style={styles.restSub}>
                    尽情享受休假时光，或者去知识库回顾本周随堂笔记
                  </Text>
                </View>
              ) : (
                <View style={styles.timelineList}>
                  {dayCourses.map((course, index) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isLast={index === dayCourses.length - 1}
                      onNavigateToNotes={(c) => {
                        if (onNavigateToNotesTab) {
                          onNavigateToNotesTab(c.name);
                        }
                      }}
                      onToggleReminder={handleToggleReminder}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={{ height: 32 }} />
          </ScrollView>
        ) : (
          /* 周课表全景网格视图 */
          <View style={styles.weekGridWrapper}>
            <WeekGridView
              onOpenNote={(courseName) => {
                if (onNavigateToNotesTab) {
                  onNavigateToNotesTab(courseName);
                }
              }}
            />
          </View>
        )}
      </Animated.View>
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
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: Rounded.pill,
    padding: 3,
  },
  modeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
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
  todayRemainingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginHorizontal: 16,
    borderRadius: Rounded.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
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
  toastFloatBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Rounded.pill,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  animatedContentWrapper: {
    flex: 1,
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
  weekendRestCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: Rounded.xl,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  restSub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  weekGridWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
