import React, { useState, useRef, useEffect } from 'react';
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
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const CoursesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44);

  // 顶部草木绿区域向下浮现动效
  const headerDropAnim = useRef(new Animated.Value(-28)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    headerDropAnim.setValue(-28);
    headerFadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(headerDropAnim, {
        toValue: 0,
        friction: 7,
        tension: 85,
        useNativeDriver: true,
      }),
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const [activeTab, setActiveTab] = useState<'teachers' | 'myCourses'>('teachers');
  const [courseFilter, setCourseFilter] = useState<'all' | '1v1' | 'small' | 'large'>('all');

  const teachers = [
    {
      id: 't1',
      name: 'Jennifer',
      country: '🇺🇸',
      rating: '5.0',
      experience: '12年教龄',
      completionRate: '98%完课率',
      subject: '成人商务英语 / 口语谈判',
      avatarEmoji: '👩‍🏫',
      status: 'available',
    },
    {
      id: 't2',
      name: 'Anandra',
      country: '🇷🇺',
      rating: '4.8',
      experience: '8年教龄',
      completionRate: '96%完课率',
      subject: '零基础启蒙 / 语音发音',
      avatarEmoji: '👩‍💼',
      status: 'available',
    },
    {
      id: 't3',
      name: 'Stefanee',
      country: '🇨🇦',
      rating: '4.9',
      experience: '6年教龄',
      completionRate: '99%完课率',
      subject: '留学面试 / TOPIK 专攻',
      avatarEmoji: '👩‍🎓',
      status: 'available',
    },
    {
      id: 't4',
      name: 'Zephyr',
      country: '🇺🇸',
      rating: '4.8',
      experience: '10年教龄',
      completionRate: '97%完课率',
      subject: '日常流利说 / 旅游实用',
      avatarEmoji: '👨‍🏫',
      status: 'booked',
    },
  ];

  const myCourses = [
    {
      id: 'mc1',
      title: '零基础韩语口语',
      period: '应用阶段 · 16课时 · 基础',
      progress: 0.65,
      date: '2026-06-08',
      status: '待上课',
    },
    {
      id: 'mc2',
      title: '留学韩语阅读 1V1 精读',
      period: '强化阶段 · 32课时 · 高阶',
      progress: 0.35,
      date: '2026-05-20',
      status: '已预约',
    },
    {
      id: 'mc3',
      title: '考研英语阅读 1V1 精讲',
      period: '冲刺阶段 · 40课时 · 进阶',
      progress: 1.0,
      date: '2026-02-28',
      status: '看回放',
    },
  ];

  return (
    <View style={styles.container}>
      {/* 顶部蓝/绿色渐变导航区（带向下浮现动画） */}
      <Animated.View
        style={[
          styles.headerGradient,
          {
            paddingTop: topPadding + 10,
            opacity: headerFadeAnim,
            transform: [{ translateY: headerDropAnim }],
          },
        ]}
      >
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>课程与名师</Text>
          <TouchableOpacity style={styles.searchIconBtn}>
            <Ionicons name="search" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 顶部双 Tab 切换：教师选课 / 我的课程 */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'teachers' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('teachers')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                activeTab === 'teachers' ? styles.toggleTextActive : styles.toggleTextInactive,
              ]}
            >
              名师预约
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'myCourses' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('myCourses')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                activeTab === 'myCourses' ? styles.toggleTextActive : styles.toggleTextInactive,
              ]}
            >
              我的课程库
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'teachers' ? (
          <View style={styles.sectionContent}>
            <View style={styles.filterPillRow}>
              <TouchableOpacity style={[styles.filterPill, styles.filterPillActive]}>
                <Text style={styles.filterPillTextActive}>全部教师</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterPill}>
                <Text style={styles.filterPillText}>上课时间 ▾</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterPill}>
                <Text style={styles.filterPillText}>母语外教</Text>
              </TouchableOpacity>
            </View>

            {teachers.map((teacher) => (
              <View key={teacher.id} style={[styles.teacherCard, Shadows.card]}>
                <View style={styles.teacherAvatarCircle}>
                  <Text style={{ fontSize: 28 }}>{teacher.avatarEmoji}</Text>
                </View>

                <View style={styles.teacherInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.teacherName}>{teacher.name}</Text>
                    <Text style={styles.countryBadge}>{teacher.country}</Text>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={10} color="#FAAD14" />
                      <Text style={styles.ratingNum}>{teacher.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.experienceText}>
                    {teacher.experience} · {teacher.completionRate}
                  </Text>
                  <Text style={styles.subjectText}>{teacher.subject}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.bookBtn,
                    teacher.status === 'booked' ? styles.bookBtnDisabled : styles.bookBtnActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={
                      teacher.status === 'booked' ? styles.bookTextDisabled : styles.bookTextActive
                    }
                  >
                    {teacher.status === 'booked' ? '已约满' : '预约'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.sectionContent}>
            {/* 课程分类微标签 */}
            <View style={styles.courseFilterRow}>
              <TouchableOpacity
                style={[styles.typePill, courseFilter === 'all' && styles.typePillActive]}
                onPress={() => setCourseFilter('all')}
              >
                <Text
                  style={[
                    styles.typePillText,
                    courseFilter === 'all' && styles.typePillTextActive,
                  ]}
                >
                  全部
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typePill, courseFilter === '1v1' && styles.typePillActive]}
                onPress={() => setCourseFilter('1v1')}
              >
                <Text
                  style={[
                    styles.typePillText,
                    courseFilter === '1v1' && styles.typePillTextActive,
                  ]}
                >
                  一对一
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typePill, courseFilter === 'small' && styles.typePillActive]}
                onPress={() => setCourseFilter('small')}
              >
                <Text
                  style={[
                    styles.typePillText,
                    courseFilter === 'small' && styles.typePillTextActive,
                  ]}
                >
                  小班课
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typePill, courseFilter === 'large' && styles.typePillActive]}
                onPress={() => setCourseFilter('large')}
              >
                <Text
                  style={[
                    styles.typePillText,
                    courseFilter === 'large' && styles.typePillTextActive,
                  ]}
                >
                  公开课
                </Text>
              </TouchableOpacity>
            </View>

            {myCourses.map((course) => (
              <View key={course.id} style={[styles.myCourseCard, Shadows.card]}>
                <View style={styles.courseHeader}>
                  <Text style={styles.myCourseTitle}>{course.title}</Text>
                  <TouchableOpacity
                    style={[
                      styles.actionStatusPill,
                      course.status === '看回放' ? styles.replayPill : styles.livePill,
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionStatusText,
                        course.status === '看回放'
                          ? styles.replayPillText
                          : styles.livePillText,
                      ]}
                    >
                      {course.status}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.myCoursePeriod}>{course.period}</Text>

                {/* 学习进度条 */}
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>
                    已学 {Math.round(course.progress * 100)}%
                  </Text>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${course.progress * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  searchIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: Rounded.pill,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Rounded.pill,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: Colors.primary,
  },
  toggleTextInactive: {
    color: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionContent: {
    gap: 12,
  },
  filterPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  filterPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  filterPillActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryBorder,
  },
  filterPillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterPillTextActive: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  teacherAvatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  teacherInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  teacherName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  countryBadge: {
    fontSize: 13,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentGoldLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Rounded.pill,
    gap: 2,
  },
  ratingNum: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentGold,
  },
  experienceText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  subjectText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  bookBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Rounded.pill,
  },
  bookBtnActive: {
    backgroundColor: Colors.primary,
  },
  bookBtnDisabled: {
    backgroundColor: '#F3F4F6',
  },
  bookTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookTextDisabled: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  courseFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
    backgroundColor: Colors.surface,
  },
  typePillActive: {
    backgroundColor: Colors.primary,
  },
  typePillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  typePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  myCourseCard: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  myCourseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Rounded.pill,
  },
  livePill: {
    backgroundColor: Colors.primary,
  },
  replayPill: {
    backgroundColor: Colors.accentPinkLight,
  },
  actionStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  livePillText: {
    color: '#FFFFFF',
  },
  replayPillText: {
    color: Colors.accentPink,
  },
  myCoursePeriod: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  progressContainer: {
    gap: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
});
