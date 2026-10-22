import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../types/schedule';
import { repairCourse, extractCourseFields } from '../services/jwParser';

interface CourseCardProps {
  course: Course;
  isNow?: boolean;
  onNavigateToNotes?: (course: Course) => void;
  savedNotesCount?: number;
  isLast?: boolean;
  onToggleReminder?: (course: Course, enabled: boolean) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isNow = false,
  onNavigateToNotes,
  savedNotesCount = 0,
  isLast = false,
}) => {
  // 课程信息提取与清洗
  const repaired = repairCourse(course);
  const rawMerged = `${repaired.name || ''}\n${repaired.location || ''}\n${repaired.teacher || ''}`;
  const extracted = extractCourseFields(rawMerged);

  const rawName = repaired.name || extracted?.name || '未知课程';

  // 课程名清洗前缀
  let displayName = rawName.replace(/^【(?:调|重|选|必|停|考)?】\s*/, '').replace(/^(?:调|重)\s+/, '').trim();
  let displayLoc = repaired.location || extracted?.location || '教学楼';
  let displayTeacher = repaired.teacher || extracted?.teacher || '任课教师';

  const hasTiao = rawName.includes('调') || (course.name && course.name.includes('调'));
  const hasChong = rawName.includes('重') || (course.name && course.name.includes('重'));

  // 课程类别判断（必修课 / 选修课 / 专业课 / 通识课）
  const category = useMemo(() => {
    const n = displayName;
    if (n.includes('必修') || n.includes('高数') || n.includes('英语') || n.includes('政治') || n.includes('体育') || n.includes('物理') || n.includes('军训') || n.includes('马克思') || n.includes('形式与政策') || n.includes('监测') || n.includes('化学')) {
      return '必修课';
    }
    if (n.includes('选修') || n.includes('通选')) {
      return '选修课';
    }
    if (n.includes('实验') || n.includes('系统') || n.includes('工程') || n.includes('原理') || n.includes('结构') || n.includes('实训')) {
      return '专业课';
    }
    return '通识课';
  }, [displayName]);

  // 计算标准节次与起止时间
  const { startTime, endTime, sectionLabel } = useMemo(() => {
    const s = course.startPeriod || 1;
    const span = course.span || 2;
    const e = s + span - 1;

    const periodTimes: { [k: number]: { start: string; end: string } } = {
      1: { start: '08:00', end: '08:45' },
      2: { start: '08:50', end: '09:35' },
      3: { start: '10:05', end: '10:50' },
      4: { start: '10:55', end: '11:40' },
      5: { start: '14:00', end: '14:45' },
      6: { start: '14:50', end: '15:35' },
      7: { start: '16:05', end: '16:50' },
      8: { start: '16:55', end: '17:40' },
      9: { start: '19:00', end: '19:45' },
      10: { start: '19:50', end: '20:35' },
    };

    const startStr = course.startTime || periodTimes[s]?.start || '08:00';
    const endStr = course.endTime || periodTimes[e]?.end || '09:35';

    return {
      startTime: startStr,
      endTime: endStr,
      sectionLabel: `${s}-${e}节`,
    };
  }, [course]);

  // 计算课程状态：已下课 / 上课中 / 待上课 (附倒计时)
  const { statusLabel, statusType } = useMemo(() => {
    const now = new Date();
    const curMinutes = now.getHours() * 60 + now.getMinutes();

    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMin = (sh || 0) * 60 + (sm || 0);
    const endMin = (eh || 0) * 60 + (em || 0);

    if (curMinutes >= endMin) {
      return { statusLabel: '已下课', statusType: 'finished' };
    }
    if (curMinutes >= startMin && curMinutes < endMin) {
      return { statusLabel: '上课中...', statusType: 'in_progress' };
    }
    const diff = startMin - curMinutes;
    if (diff > 0 && diff <= 120) {
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      const cd = h > 0 ? `${h}小时${m}分` : `${m}分钟`;
      return { statusLabel: `${cd}后上课`, statusType: 'countdown' };
    }
    return { statusLabel: '待上课', statusType: 'countdown' };
  }, [startTime, endTime]);

  const hasNotes = savedNotesCount > 0;

  return (
    <View style={styles.container}>
      {/* 左侧每节课时间展示（图4：节次居上，起始时间居中，结束时间居下，左右空隙均匀，且和右边卡片上下居中） */}
      <View style={styles.timelineCol}>
        <Text style={styles.sectionText}>{sectionLabel}</Text>
        <Text style={styles.startTimeText}>{startTime}</Text>
        <Text style={styles.endTimeText}>{endTime}</Text>
      </View>

      {/* 右侧课程卡片 */}
      <View style={[styles.cardSurface, Shadows.card]}>
        {/* 卡片头部：课程名称（前缀加实心圆圈背景）与右侧随堂笔记操作按钮 */}
        <View style={styles.cardHeader}>
          <View style={styles.nameRow}>
            {hasTiao && (
              <View style={styles.solidCircleBadgeTiao}>
                <Text style={styles.solidCircleBadgeText}>调</Text>
              </View>
            )}
            {hasChong && (
              <View style={styles.solidCircleBadgeChong}>
                <Text style={styles.solidCircleBadgeText}>重</Text>
              </View>
            )}
            <Text style={styles.courseName} numberOfLines={1}>
              {displayName}
            </Text>
          </View>

          {/* 右上角的笔记：去掉外框，左边有一个圆圈，没有笔记是白色圆圈，有的时候是一笔成型的勾，文字颜色区分 */}
          <TouchableOpacity
            style={styles.minimalNoteBtn}
            onPress={() => onNavigateToNotes && onNavigateToNotes(course)}
            activeOpacity={0.7}
          >
            {hasNotes ? (
              <View style={styles.noteCheckedCircle}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
            ) : (
              <View style={styles.noteUncheckedCircle} />
            )}
            <Text
              style={[
                styles.noteBtnText,
                hasNotes ? styles.noteTextActive : styles.noteTextInactive,
              ]}
            >
              {hasNotes ? '去查看' : '记笔记'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 必修课等分类 tag 与紧随其后的老师名字（去掉tag后面的·） */}
        <View style={styles.tagAndTeacherRow}>
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
          <Text style={styles.teacherInlineText}>{displayTeacher}</Text>
        </View>

        {/* 上课地点：去掉“上课地点：”字样，去掉“16位同学也在用” */}
        <View style={styles.locationRow}>
          <Text style={styles.locationText}>{displayLoc}</Text>
        </View>

        {/* 状态徽章改在卡片右下角，造型参考图5（适配右下角） */}
        <View
          style={[
            styles.cornerStatusBadge,
            statusType === 'in_progress' && styles.cornerBadgeLive,
            statusType === 'countdown' && styles.cornerBadgeCountdown,
            statusType === 'finished' && styles.cornerBadgeFinished,
          ]}
        >
          {statusType === 'in_progress' && <View style={styles.livePulseDot} />}
          <Text
            style={[
              styles.cornerStatusText,
              statusType === 'in_progress' && styles.cornerTextLive,
              statusType === 'countdown' && styles.cornerTextCountdown,
              statusType === 'finished' && styles.cornerTextFinished,
            ]}
          >
            {statusLabel}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginHorizontal: 16,
  },
  // 左侧时间列：与右侧卡片垂直居中，两边间距均匀
  timelineCol: {
    width: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  startTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    fontVariant: ['tabular-nums'],
  },
  endTimeText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },

  // 右侧悬浮卡片
  cardSurface: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  solidCircleBadgeTiao: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  solidCircleBadgeChong: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  solidCircleBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    letterSpacing: -0.2,
  },

  // 极简随堂笔记操作按钮（无外框，带圆形完成/未完成标记）
  minimalNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  noteUncheckedCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  noteCheckedCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  noteBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  noteTextActive: {
    color: '#059669',
  },
  noteTextInactive: {
    color: '#64748B',
  },

  // 类别与老师接在后面（去掉·）
  tagAndTeacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
  teacherInlineText: {
    fontSize: 12.5,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 6,
  },

  // 地点显示（去掉“上课地点: ”与同学计数）
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 80, // 避免文本盖住右下角徽章
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  // 右下角状态标签（造型参考图5，平滑贴合右下角）
  cornerStatusBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cornerBadgeLive: {
    backgroundColor: '#F3E8FF', // 图5柔紫
  },
  cornerBadgeCountdown: {
    backgroundColor: '#FEF3C7',
  },
  cornerBadgeFinished: {
    backgroundColor: '#F1F5F9',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7C3AED',
    marginRight: 4,
  },
  cornerStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cornerTextLive: {
    color: '#7C3AED',
  },
  cornerTextCountdown: {
    color: '#D97706',
  },
  cornerTextFinished: {
    color: '#94A3B8',
  },
});
