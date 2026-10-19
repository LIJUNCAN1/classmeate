import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../types/schedule';

interface CourseCardProps {
  course: Course;
  isLast?: boolean;
  onOpenNotes?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isLast = false,
  onOpenNotes,
}) => {
  const [expanded, setExpanded] = useState(false);

  // 状态胶囊配置
  const renderStatusButton = () => {
    switch (course.status) {
      case 'in_progress':
        return (
          <TouchableOpacity
            style={[styles.statusBtn, styles.statusBtnLive]}
            activeOpacity={0.8}
          >
            <View style={styles.livePulseDot} />
            <Text style={styles.statusTextLive}>上课中</Text>
          </TouchableOpacity>
        );
      case 'completed':
        return (
          <View style={[styles.statusBtn, styles.statusBtnDisabled]}>
            <Text style={styles.statusTextDisabled}>已预约</Text>
          </View>
        );
      case 'booked':
        return (
          <TouchableOpacity
            style={[styles.statusBtn, styles.statusBtnSecondary]}
            activeOpacity={0.8}
          >
            <Text style={styles.statusTextSecondary}>已选课</Text>
          </TouchableOpacity>
        );
      case 'pending':
      default:
        return (
          <TouchableOpacity
            style={[styles.statusBtn, styles.statusBtnPrimary]}
            activeOpacity={0.8}
          >
            <Text style={styles.statusTextPrimary}>预约</Text>
          </TouchableOpacity>
        );
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
          {renderStatusButton()}
        </View>

        {/* 讲师与地点详情 */}
        <View style={styles.detailsRow}>
          <View style={styles.teacherBadge}>
            {course.countryFlag && (
              <Text style={styles.flagEmoji}>{course.countryFlag}</Text>
            )}
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

        {/* Classmeate 核心特色：课表深度绑定笔记 */}
        <View style={styles.noteDivider} />
        <TouchableOpacity
          style={styles.noteFooter}
          onPress={() => {
            setExpanded(!expanded);
            if (onOpenNotes) onOpenNotes(course);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.noteCountArea}>
            <Ionicons name="document-text" size={14} color={Colors.primary} />
            <Text style={styles.noteCountText}>
              {course.notesCount > 0
                ? `已沉淀 ${course.notesCount} 篇课堂笔记`
                : '暂无笔记，点击随堂快记'}
            </Text>
          </View>
          <View style={styles.noteActionPill}>
            <Text style={styles.noteActionText}>
              {expanded ? '收起' : '记笔记'}
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-forward'}
              size={12}
              color={Colors.primary}
            />
          </View>
        </TouchableOpacity>

        {/* 展开的轻量笔记预览/速记框 */}
        {expanded && (
          <View style={styles.expandedNoteArea}>
            <Text style={styles.notePreviewTitle}>💡 上次课重点回顾：</Text>
            <Text style={styles.notePreviewContent}>
              • 核心语法句式及商务谈判破冰礼仪规范{'\n'}
              • 下节课准备：研读第3章案例并携带课后练习册
            </Text>
            <TouchableOpacity style={styles.quickAddNoteBtn} activeOpacity={0.8}>
              <Ionicons name="add-circle-outline" size={14} color="#FFFFFF" />
              <Text style={styles.quickAddNoteText}>添加语音/板书速记</Text>
            </TouchableOpacity>
          </View>
        )}
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
  statusBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: Rounded.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnPrimary: {
    backgroundColor: Colors.primary,
  },
  statusTextPrimary: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statusBtnSecondary: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  statusTextSecondary: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
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
  statusBtnDisabled: {
    backgroundColor: '#F3F4F6',
  },
  statusTextDisabled: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  teacherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  flagEmoji: {
    fontSize: 13,
  },
  teacherName: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
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
    fontSize: 11,
    color: Colors.textMuted,
  },
  noteDivider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: 8,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteCountArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteCountText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  noteActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  noteActionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  expandedNoteArea: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Rounded.md,
    padding: 10,
    marginTop: 10,
  },
  notePreviewTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 3,
  },
  notePreviewContent: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  quickAddNoteBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
  },
  quickAddNoteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
