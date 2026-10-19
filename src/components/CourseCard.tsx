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

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isLast = false,
  onNavigateToNotes,
  onToggleReminder,
}) => {
  // 提醒状态（已开启提醒 / 未开启提醒）
  const [reminderActive, setReminderActive] = useState(course.status === 'in_progress');
  const hasNotes = course.notesCount > 0;

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
            {course.stageTag && (
              <Text style={styles.stageTagText}>{course.stageTag}</Text>
            )}
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

        {/* 讲师与地点详情 (已彻底去除前面的 CN、国旗等前缀) */}
        <View style={styles.detailsRow}>
          <View style={styles.teacherBadge}>
            <Text style={styles.teacherName}>{course.teacher}</Text>
            {course.rating && (
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={10} color="#FAAD14" />
                <Text style={styles.ratingText}>{course.rating}</Text>
              </View>
            )}
          </View>

          <View style={styles.locationBadge}>
            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.locationText}>{course.location}</Text>
          </View>
        </View>

        {/* 笔记状态栏：一笔画勾动画 + 只显示有或没有笔记 + 点击直接打开笔记页面 */}
        <View style={styles.noteDivider} />
        <TouchableOpacity
          style={styles.noteFooter}
          onPress={() => onNavigateToNotes && onNavigateToNotes(course)}
          activeOpacity={0.7}
        >
          <View style={styles.noteStatusLeft}>
            {/* 一笔画成的勾动效组件 */}
            <AnimatedCheckmark checked={hasNotes} size={18} />
            <Text
              style={[
                styles.noteStatusText,
                hasNotes ? styles.noteStatusTextActive : styles.noteStatusTextEmpty,
              ]}
            >
              {hasNotes ? '已有课堂笔记' : '暂无笔记'}
            </Text>
          </View>

          <View style={styles.openNoteBtn}>
            <Text style={styles.openNoteBtnText}>记笔记</Text>
            <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
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
    paddingRight: 16,
  },
  timelineCol: {
    width: 68,
    alignItems: 'center',
    paddingTop: 14,
  },
  timeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  timelineLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: Colors.timelineLine,
    marginTop: 8,
    marginBottom: -16,
  },
  cardSurface: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleArea: {
    flex: 1,
    paddingRight: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  stageTagText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '400',
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
    fontWeight: '600',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.accentGoldLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Rounded.pill,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentGold,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  noteDivider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginBottom: 10,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteStatusTextActive: {
    color: Colors.textPrimary,
  },
  noteStatusTextEmpty: {
    color: Colors.textMuted,
  },
  openNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  openNoteBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
});
