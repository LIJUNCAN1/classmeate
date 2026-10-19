import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../types/schedule';
import { AnimatedCheckmark } from './AnimatedCheckmark';

interface CourseCardProps {
  course: Course;
  isLast?: boolean;
  onNavigateToNotes?: (course: Course) => void;
  onToggleReminder?: (course: Course, enabled: boolean) => void;
}

// 规范化课程分类：最左侧只允许显示 必修课、选修课、专业课、通识课
const normalizeCategory = (tag?: string): { category: '必修课' | '选修课' | '专业课' | '通识课'; rest: string } => {
  if (!tag) return { category: '必修课', rest: '' };
  const parts = tag.split('·').map((p) => p.trim());
  const rawFirst = parts[0] || '必修课';
  let category: '必修课' | '选修课' | '专业课' | '通识课' = '必修课';

  if (rawFirst.includes('选修')) category = '选修课';
  else if (rawFirst.includes('专业')) category = '专业课';
  else if (rawFirst.includes('通识')) category = '通识课';
  else category = '必修课';

  const rest = parts.slice(1).join(' · ');
  return { category, rest };
};

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isLast = false,
  onNavigateToNotes,
  onToggleReminder,
}) => {
  // 提醒状态（已开启提醒 / 未开启提醒）
  const [reminderActive, setReminderActive] = useState(course.status === 'in_progress');
  const hasNotes = course.notesCount > 0;
  const { category, rest } = normalizeCategory(course.stageTag);

  const handleReminderPress = () => {
    const nextState = !reminderActive;
    setReminderActive(nextState);
    if (onToggleReminder) {
      onToggleReminder(course, nextState);
    }
  };

  return (
    <View style={styles.container}>
      {/* 左侧垂直时间导轨 */}
      <View style={styles.timelineCol}>
        <View style={styles.timeLabelRow}>
          <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.timeText}>{course.startTime}</Text>
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* 右侧悬浮大白卡 */}
      <View style={[styles.cardSurface, Shadows.card]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleArea}>
            <Text style={styles.courseName}>{course.name}</Text>
            
            {/* 图3要求：最左边只显示 必修课、选修课、专业课、通识课 几种 */}
            <View style={styles.stageTagRow}>
              <View
                style={[
                  styles.categoryPill,
                  category === '必修课' && styles.categoryPillRequired,
                  category === '选修课' && styles.categoryPillElective,
                  category === '专业课' && styles.categoryPillMajor,
                  category === '通识课' && styles.categoryPillGeneral,
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    category === '必修课' && styles.categoryTextRequired,
                    category === '选修课' && styles.categoryTextElective,
                    category === '专业课' && styles.categoryTextMajor,
                    category === '通识课' && styles.categoryTextGeneral,
                  ]}
                >
                  {category}
                </Text>
              </View>
              {rest ? <Text style={styles.stageTagRestText}>· {rest}</Text> : null}
            </View>
          </View>

          {/* 状态与接入提醒事项胶囊按钮 */}
          {course.status === 'in_progress' ? (
            <View style={[styles.statusBtn, styles.statusBtnLive]}>
              <View style={styles.livePulseDot} />
              <Text style={styles.statusTextLive}>上课中</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.reminderBtn,
                reminderActive ? styles.reminderBtnActive : styles.reminderBtnInactive,
              ]}
              onPress={handleReminderPress}
              activeOpacity={0.8}
            >
              <Ionicons
                name={reminderActive ? 'notifications' : 'notifications-outline'}
                size={13}
                color={reminderActive ? '#FFFFFF' : Colors.primary}
                style={{ marginRight: 3 }}
              />
              <Text
                style={[
                  styles.reminderBtnText,
                  reminderActive ? styles.reminderBtnTextActive : styles.reminderBtnTextInactive,
                ]}
              >
                {reminderActive ? '已提醒' : '提醒'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 讲师与地点详情 (已去除前缀及评分) */}
        <View style={styles.detailsRow}>
          <View style={styles.teacherBadge}>
            <Text style={styles.teacherName}>{course.teacher}</Text>
          </View>

          <View style={styles.locationBadge}>
            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.locationText}>{course.location}</Text>
          </View>
        </View>

        {/* 笔记状态栏：一笔画勾动画 + 只显示有或没有笔记 + 点击直接打开笔记页面 */}
        <View style={styles.noteDivider} />

        <TouchableOpacity
          style={styles.noteStatusBar}
          activeOpacity={0.7}
          onPress={() => onNavigateToNotes && onNavigateToNotes(course)}
        >
          <View style={styles.noteStatusLeft}>
            <AnimatedCheckmark checked={hasNotes} size={18} />
            <Text
              style={[
                styles.noteStatusText,
                hasNotes ? styles.noteStatusTextActive : styles.noteStatusTextInactive,
              ]}
            >
              {hasNotes ? '本节已有随堂笔记' : '暂无随堂笔记'}
            </Text>
          </View>

          <View style={styles.noteActionRow}>
            <Text style={styles.noteActionText}>
              {hasNotes ? '去查看' : '记笔记'}
            </Text>
            <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineCol: {
    width: 62,
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  timeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 18,
    marginTop: 6,
    borderRadius: 1,
  },
  cardSurface: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  stageTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  categoryPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  categoryPillRequired: {
    backgroundColor: '#EFF6FF',
  },
  categoryPillElective: {
    backgroundColor: '#F3E8FF',
  },
  categoryPillMajor: {
    backgroundColor: '#ECFDF5',
  },
  categoryPillGeneral: {
    backgroundColor: '#FFFBEB',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryTextRequired: {
    color: '#2563EB',
  },
  categoryTextElective: {
    color: '#9333EA',
  },
  categoryTextMajor: {
    color: '#059669',
  },
  categoryTextGeneral: {
    color: '#D97706',
  },
  stageTagRestText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Rounded.pill,
  },
  reminderBtnActive: {
    backgroundColor: Colors.primary,
  },
  reminderBtnInactive: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  reminderBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reminderBtnTextActive: {
    color: '#FFFFFF',
  },
  reminderBtnTextInactive: {
    color: Colors.primary,
  },
  statusBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Rounded.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnLive: {
    backgroundColor: Colors.accentPinkLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accentPink,
  },
  statusTextLive: {
    color: Colors.accentPink,
    fontSize: 12,
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  teacherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teacherName: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  noteDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F3F4F6',
    marginVertical: 6,
  },
  noteStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  noteStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteStatusTextActive: {
    color: '#15803D',
  },
  noteStatusTextInactive: {
    color: Colors.textMuted,
  },
  noteActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  noteActionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
});
