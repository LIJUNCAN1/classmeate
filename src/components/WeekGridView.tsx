import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedCheckmark } from './AnimatedCheckmark';

interface WeekCourseItem {
  id: string;
  name: string;
  teacher: string;
  location: string;
  day: number; // 1: 一, 2: 二, 3: 三, 4: 四, 5: 五, 6: 六, 7: 日
  startPeriod: number; // 1-10
  span: number; // 节数跨度
  colorScheme: {
    bg: string;
    border: string;
    text: string;
  };
  notesCount: number;
}

interface WeekGridViewProps {
  onOpenNote?: (courseName: string, teacher: string) => void;
}

export const WeekGridView: React.FC<WeekGridViewProps> = ({ onOpenNote }) => {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(14); // 第 14 周
  const [selectedCourse, setSelectedCourse] = useState<WeekCourseItem | null>(null);
  const [zoomScale, setZoomScale] = useState(1.0); // 缩放比例，支持双指放大

  // 星期与日期定义（随周次切换动态计算）
  const weekDatesMap: Record<number, { range: string; days: { day: number; name: string; date: string; isToday?: boolean; isHoliday?: boolean }[] }> = {
    13: {
      range: '06/13 - 06/19',
      days: [
        { day: 1, name: '周一', date: '6/13' },
        { day: 2, name: '周二', date: '6/14' },
        { day: 3, name: '周三', date: '6/15' },
        { day: 4, name: '周四', date: '6/16' },
        { day: 5, name: '周五', date: '6/17' },
        { day: 6, name: '周六', date: '6/18', isHoliday: true },
        { day: 7, name: '周日', date: '6/19', isHoliday: true },
      ],
    },
    14: {
      range: '06/20 - 06/26',
      days: [
        { day: 1, name: '周一', date: '6/20' },
        { day: 2, name: '周二', date: '6/21' },
        { day: 3, name: '周三', date: '6/22', isToday: true },
        { day: 4, name: '周四', date: '6/23' },
        { day: 5, name: '周五', date: '6/24' },
        { day: 6, name: '周六', date: '6/25', isHoliday: true },
        { day: 7, name: '周日', date: '6/26', isHoliday: true },
      ],
    },
    15: {
      range: '06/27 - 07/03',
      days: [
        { day: 1, name: '周一', date: '6/27' },
        { day: 2, name: '周二', date: '6/28' },
        { day: 3, name: '周三', date: '6/29' },
        { day: 4, name: '周四', date: '6/30' },
        { day: 5, name: '周五', date: '7/01' },
        { day: 6, name: '周六', date: '7/02', isHoliday: true },
        { day: 7, name: '周日', date: '7/03', isHoliday: true },
      ],
    },
  };

  const activeWeekData = weekDatesMap[currentWeekIndex] || weekDatesMap[14];

  // 节次定义 (10节课)
  const periods = [
    { num: 1, time: '08:00' },
    { num: 2, time: '08:55' },
    { num: 3, time: '10:00' },
    { num: 4, time: '10:55' },
    { num: 5, time: '14:00' },
    { num: 6, time: '14:55' },
    { num: 7, time: '16:00' },
    { num: 8, time: '16:55' },
    { num: 9, time: '19:00' },
    { num: 10, time: '19:55' },
  ];

  // 一整周各天的课程数据分布
  const weekCourses: WeekCourseItem[] = [
    {
      id: 'w-1',
      name: '高等数学 (AI与数据)',
      teacher: '张晓华',
      location: '第一教学楼 A204',
      day: 1,
      startPeriod: 1,
      span: 2,
      colorScheme: { bg: Colors.courseBlueBg, border: Colors.courseBlueBorder, text: Colors.courseBlueText },
      notesCount: 2,
    },
    {
      id: 'w-2',
      name: '计算机系统结构',
      teacher: '王工',
      location: '信息实验楼 301实验室',
      day: 1,
      startPeriod: 5,
      span: 2,
      colorScheme: { bg: Colors.coursePurpleBg, border: Colors.coursePurpleBorder, text: Colors.coursePurpleText },
      notesCount: 1,
    },
    {
      id: 'w-3',
      name: '大学英语写作',
      teacher: 'Sarah',
      location: '外国语学院 405研讨室',
      day: 2,
      startPeriod: 3,
      span: 2,
      colorScheme: { bg: Colors.courseAmberBg, border: Colors.courseAmberBorder, text: Colors.courseAmberText },
      notesCount: 0,
    },
    {
      id: 'w-4',
      name: '成人商务韩语',
      teacher: 'Jennifer',
      location: '国际交流中心 302多媒体室',
      day: 3,
      startPeriod: 2,
      span: 2,
      colorScheme: { bg: Colors.courseGreenBg, border: Colors.courseGreenBorder, text: Colors.courseGreenText },
      notesCount: 3,
    },
    {
      id: 'w-5',
      name: 'TOPIK专攻精讲',
      teacher: 'Stefanee',
      location: '同声传译实训室 401',
      day: 3,
      startPeriod: 5,
      span: 2,
      colorScheme: { bg: Colors.coursePinkBg, border: Colors.coursePinkBorder, text: Colors.coursePinkText },
      notesCount: 1,
    },
    {
      id: 'w-6',
      name: '韩语口语1v1突破',
      teacher: 'Cipher',
      location: '线上协同音视频 2号房间',
      day: 3,
      startPeriod: 7,
      span: 2,
      colorScheme: { bg: Colors.courseBlueBg, border: Colors.courseBlueBorder, text: Colors.courseBlueText },
      notesCount: 0,
    },
    {
      id: 'w-7',
      name: '数据结构与算法',
      teacher: '李院长',
      location: '软件工程学院 208机房',
      day: 4,
      startPeriod: 1,
      span: 2,
      colorScheme: { bg: Colors.coursePurpleBg, border: Colors.coursePurpleBorder, text: Colors.coursePurpleText },
      notesCount: 4,
    },
    {
      id: 'w-8',
      name: '交互设计与UI艺术',
      teacher: '陈总监',
      location: '创新设计工坊 102艺术厅',
      day: 5,
      startPeriod: 3,
      span: 3,
      colorScheme: { bg: Colors.courseGreenBg, border: Colors.courseGreenBorder, text: Colors.courseGreenText },
      notesCount: 2,
    },
  ];

  // 基础单元格高度随缩放动态调整
  const BASE_PERIOD_HEIGHT = 68;
  const periodHeight = BASE_PERIOD_HEIGHT * zoomScale;
  const colWidth = 72 * zoomScale; // 7列每列宽度随着缩放伸展

  return (
    <View style={styles.container}>
      {/* 顶部周次与日期切换栏 (支持切换上一周/下一周) */}
      <View style={styles.weekNavHeader}>
        <TouchableOpacity
          style={styles.weekArrowBtn}
          onPress={() => setCurrentWeekIndex((prev) => Math.max(1, prev - 1))}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={16} color={Colors.textPrimary} />
          <Text style={styles.weekArrowText}>上一周</Text>
        </TouchableOpacity>

        <View style={styles.weekCenterTitle}>
          <Text style={styles.weekTitleText}>第 {currentWeekIndex} 周</Text>
          <Text style={styles.weekRangeText}>{activeWeekData.range}</Text>
        </View>

        <TouchableOpacity
          style={styles.weekArrowBtn}
          onPress={() => setCurrentWeekIndex((prev) => prev + 1)}
          activeOpacity={0.7}
        >
          <Text style={styles.weekArrowText}>下一周</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* 缩放手势提示与双指放大控制器 */}
      <View style={styles.zoomControlBar}>
        <Text style={styles.zoomHintText}>
          🔍 支持双指捏合缩放（当前 {Math.round(zoomScale * 100)}%）
        </Text>
        <View style={styles.zoomPillsGroup}>
          <TouchableOpacity
            style={styles.zoomPillBtn}
            onPress={() => setZoomScale((s) => Math.max(0.85, s - 0.15))}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={14} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomPillBtn}
            onPress={() => setZoomScale((s) => Math.min(1.8, s + 0.15))}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={14} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 双向可滚动区域：支持双指放大 (maximumZoomScale & pinchGestureEnabled) */}
      <ScrollView
        style={styles.outerScroll}
        maximumZoomScale={2.5}
        minimumZoomScale={0.8}
        pinchGestureEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ minWidth: colWidth * 7 + 42 }}
        >
          <View style={styles.tableWrapper}>
            {/* 星期表头行 (含休假标识) */}
            <View style={styles.headerRow}>
              <View style={styles.periodColHeader}>
                <Text style={styles.monthTag}>节\周</Text>
              </View>

              {activeWeekData.days.map((col) => (
                <View
                  key={col.day}
                  style={[
                    styles.dayHeaderCol,
                    { width: colWidth },
                    col.isToday && styles.dayHeaderColToday,
                  ]}
                >
                  {col.isHoliday && (
                    <View style={styles.holidayMiniBadge}>
                      <Text style={styles.holidayMiniBadgeText}>休</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.dayHeaderText,
                      col.isToday && styles.dayHeaderTextToday,
                    ]}
                  >
                    {col.name}
                  </Text>
                  <Text
                    style={[
                      styles.dateSubText,
                      col.isToday && styles.dateSubTextToday,
                    ]}
                  >
                    {col.date}
                  </Text>
                </View>
              ))}
            </View>

            {/* 表体：左侧节次 + 7列课程网格 */}
            <View style={styles.gridBody}>
              {/* 左侧节次与时间列 */}
              <View style={styles.periodsColumn}>
                {periods.map((p) => (
                  <View key={p.num} style={[styles.periodCell, { height: periodHeight }]}>
                    <Text style={styles.periodNumber}>{p.num}</Text>
                    <Text style={styles.periodTime}>{p.time}</Text>
                  </View>
                ))}
              </View>

              {/* 7 列课程内容区域 */}
              <View style={[styles.columnsContainer, { width: colWidth * 7 }]}>
                {/* 背景水平网格线 */}
                {periods.map((p) => (
                  <View
                    key={`line-${p.num}`}
                    style={[
                      styles.horizontalGridLine,
                      { top: (p.num - 1) * periodHeight, height: periodHeight },
                    ]}
                  />
                ))}

                {/* 课程卡片绝对定位层 */}
                {weekCourses.map((c) => {
                  const leftPos = (c.day - 1) * colWidth + 2;
                  const topOffset = (c.startPeriod - 1) * periodHeight + 2;
                  const cardHeight = c.span * periodHeight - 4;
                  const cardWidth = colWidth - 4;

                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.courseBlock,
                        {
                          left: leftPos,
                          top: topOffset,
                          width: cardWidth,
                          height: cardHeight,
                          backgroundColor: c.colorScheme.bg,
                          borderColor: c.colorScheme.border,
                        },
                      ]}
                      onPress={() => setSelectedCourse(c)}
                      activeOpacity={0.85}
                    >
                      {/* 上课内容与地点：按要求完整自动换行，绝不使用省略号裁剪 */}
                      <View style={styles.courseTopArea}>
                        <Text
                          style={[styles.courseBlockName, { color: c.colorScheme.text }]}
                        >
                          {c.name}
                        </Text>
                        <Text
                          style={[styles.courseBlockLoc, { color: c.colorScheme.text }]}
                        >
                          @ {c.location}
                        </Text>
                      </View>

                      {/* 卡片底部：左下角常驻老师名字，右下角展示笔记勾标 */}
                      <View style={styles.courseCardFooter}>
                        <Text
                          style={[styles.teacherNameText, { color: c.colorScheme.text }]}
                          numberOfLines={1}
                        >
                          {c.teacher}
                        </Text>
                        <View style={styles.noteIndicator}>
                          <AnimatedCheckmark checked={c.notesCount > 0} size={14} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </ScrollView>

      {/* 课程详情与快速笔记浮层 */}
      {selectedCourse && (
        <Modal transparent animationType="fade" visible={true} onRequestClose={() => setSelectedCourse(null)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.detailCard, Shadows.modal]}>
              <View style={styles.detailHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailTitle}>{selectedCourse.name}</Text>
                  <Text style={styles.detailTeacher}>任课教师：{selectedCourse.teacher}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCourse(null)} style={styles.detailCloseBtn}>
                  <Ionicons name="close" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.detailMetaRow}>
                <View style={styles.metaBadge}>
                  <Ionicons name="location-outline" size={13} color={Colors.primary} />
                  <Text style={styles.metaText}>{selectedCourse.location}</Text>
                </View>
                <View style={styles.metaBadge}>
                  <Ionicons name="time-outline" size={13} color={Colors.accentBlue} />
                  <Text style={styles.metaText}>
                    第 {selectedCourse.startPeriod}-{selectedCourse.startPeriod + selectedCourse.span - 1} 节
                  </Text>
                </View>
              </View>

              <View style={styles.detailNotesSection}>
                <View style={styles.notesSectionHeader}>
                  <AnimatedCheckmark checked={selectedCourse.notesCount > 0} size={16} />
                  <Text style={styles.notesSectionTitle}>
                    {selectedCourse.notesCount > 0 ? '已有随堂笔记' : '暂无随堂笔记'}
                  </Text>
                </View>
                <Text style={styles.notesExcerpt}>
                  {selectedCourse.notesCount > 0
                    ? '已自动关联归档到本课时，包含随堂速记要点与重点板书。'
                    : '本门课程尚无随堂笔记，点击下方可直接跳转打开笔记页面进行记录。'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.addNoteActionBtn}
                onPress={() => {
                  const c = selectedCourse;
                  setSelectedCourse(null);
                  if (onOpenNote) {
                    onOpenNote(c.name, c.teacher);
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.addNoteActionText}>打开随堂笔记编辑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  weekNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekArrowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: Rounded.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  weekArrowText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginHorizontal: 2,
  },
  weekCenterTitle: {
    alignItems: 'center',
  },
  weekTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  weekRangeText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  zoomControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
  },
  zoomHintText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  zoomPillsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  zoomPillBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  outerScroll: {
    flex: 1,
  },
  tableWrapper: {
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAF8',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 6,
  },
  periodColHeader: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTag: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  dayHeaderCol: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 2,
  },
  dayHeaderColToday: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Rounded.sm,
  },
  holidayMiniBadge: {
    position: 'absolute',
    top: -3,
    right: 2,
    backgroundColor: '#FF4D4F',
    borderRadius: 7,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holidayMiniBadgeText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '800',
    lineHeight: 10,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dayHeaderTextToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dateSubText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  dateSubTextToday: {
    color: Colors.primary,
    fontWeight: '600',
  },
  gridBody: {
    flexDirection: 'row',
  },
  periodsColumn: {
    width: 42,
    backgroundColor: '#FAFAFA',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  periodCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  periodNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  periodTime: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
  },
  columnsContainer: {
    position: 'relative',
  },
  horizontalGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  courseBlock: {
    position: 'absolute',
    borderRadius: Rounded.md,
    padding: 5,
    borderWidth: 1,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  courseTopArea: {
    flex: 1,
  },
  courseBlockName: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    marginBottom: 3,
  },
  courseBlockLoc: {
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: '500',
  },
  courseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 3,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  teacherNameText: {
    fontSize: 9.5,
    fontWeight: '700',
    flex: 1,
  },
  noteIndicator: {
    marginLeft: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  detailCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.xl,
    padding: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  detailTeacher: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  detailCloseBtn: {
    padding: 4,
  },
  detailMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Rounded.pill,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  detailNotesSection: {
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: Rounded.md,
    marginBottom: 16,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  notesSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  notesExcerpt: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  addNoteActionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Rounded.pill,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNoteActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
