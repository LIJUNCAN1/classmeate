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
import { Course } from '../types/schedule';

interface WeekCourseItem {
  id: string;
  name: string;
  teacher: string;
  location: string;
  day: number; // 1: 一, 2: 二, 3: 三, 4: 四, 5: 五, 6: 六, 7: 日
  startPeriod: number; // 1-10
  span: number; // 几节连上，例如 2
  colorScheme: {
    bg: string;
    border: string;
    text: string;
  };
  notesCount: number;
}

export const WeekGridView: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<WeekCourseItem | null>(null);

  // 星期表头定义
  const weekColumns = [
    { day: 1, name: '周一', date: '6/20' },
    { day: 2, name: '周二', date: '6/21' },
    { day: 3, name: '周三', date: '6/22', isToday: true },
    { day: 4, name: '周四', date: '6/23' },
    { day: 5, name: '周五', date: '6/24' },
    { day: 6, name: '周六', date: '6/25', isHoliday: true },
    { day: 7, name: '周日', date: '6/19', isHoliday: true },
  ];

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
      teacher: '张晓华 教授',
      location: '一教 A204',
      day: 1,
      startPeriod: 1,
      span: 2,
      colorScheme: { bg: Colors.courseBlueBg, border: Colors.courseBlueBorder, text: Colors.courseBlueText },
      notesCount: 2,
    },
    {
      id: 'w-2',
      name: '计算机系统结构',
      teacher: '王工 讲师',
      location: '实验楼 301',
      day: 1,
      startPeriod: 5,
      span: 2,
      colorScheme: { bg: Colors.coursePurpleBg, border: Colors.coursePurpleBorder, text: Colors.coursePurpleText },
      notesCount: 1,
    },
    {
      id: 'w-3',
      name: '大学英语与写作',
      teacher: 'Sarah 外教',
      location: '外语楼 405',
      day: 2,
      startPeriod: 3,
      span: 2,
      colorScheme: { bg: Colors.courseAmberBg, border: Colors.courseAmberBorder, text: Colors.courseAmberText },
      notesCount: 0,
    },
    {
      id: 'w-4',
      name: '成人商务韩语',
      teacher: 'Jennifer 老师',
      location: '国际交流 302',
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
      location: '视听实训 401',
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
      location: '在线协同2室',
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
      location: '计算机楼 208',
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
      location: '设计工坊 102',
      day: 5,
      startPeriod: 3,
      span: 3,
      colorScheme: { bg: Colors.courseGreenBg, border: Colors.courseGreenBorder, text: Colors.courseGreenText },
      notesCount: 2,
    },
  ];

  const PERIOD_HEIGHT = 58;

  return (
    <View style={styles.container}>
      {/* 顶部星期表头 (含休假标识) */}
      <View style={styles.headerRow}>
        <View style={styles.periodColHeader}>
          <Text style={styles.monthTag}>6月</Text>
        </View>

        {weekColumns.map((col) => (
          <View
            key={col.day}
            style={[
              styles.dayHeaderCol,
              col.isToday && styles.dayHeaderColToday,
            ]}
          >
            {/* 休假标识 */}
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

      {/* 课表内容滚动网格 */}
      <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.gridBody}>
          {/* 左侧节次与时间列 */}
          <View style={styles.periodsColumn}>
            {periods.map((p) => (
              <View key={p.num} style={[styles.periodCell, { height: PERIOD_HEIGHT }]}>
                <Text style={styles.periodNumber}>{p.num}</Text>
                <Text style={styles.periodTime}>{p.time}</Text>
              </View>
            ))}
          </View>

          {/* 7 列课程内容区域 */}
          <View style={styles.columnsContainer}>
            {/* 背景横向网格参考线 */}
            {periods.map((p) => (
              <View
                key={`line-${p.num}`}
                style={[
                  styles.horizontalGridLine,
                  { top: (p.num - 1) * PERIOD_HEIGHT, height: PERIOD_HEIGHT },
                ]}
              />
            ))}

            {/* 课程卡片绝对定位层 */}
            {weekCourses.map((c) => {
              const leftPercent = ((c.day - 1) / 7) * 100;
              const topOffset = (c.startPeriod - 1) * PERIOD_HEIGHT + 2;
              const cardHeight = c.span * PERIOD_HEIGHT - 4;

              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.courseBlock,
                    {
                      left: `${leftPercent}%`,
                      top: topOffset,
                      height: cardHeight,
                      backgroundColor: c.colorScheme.bg,
                      borderColor: c.colorScheme.border,
                    },
                  ]}
                  onPress={() => setSelectedCourse(c)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[styles.courseBlockName, { color: c.colorScheme.text }]}
                    numberOfLines={2}
                  >
                    {c.name}
                  </Text>
                  <Text
                    style={[styles.courseBlockLoc, { color: c.colorScheme.text }]}
                    numberOfLines={1}
                  >
                    @{c.location}
                  </Text>
                  {c.notesCount > 0 && (
                    <View style={styles.noteIndicator}>
                      <Ionicons name="document-text" size={10} color={c.colorScheme.text} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
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
                  <Text style={styles.metaText}>第 {selectedCourse.startPeriod}-{selectedCourse.startPeriod + selectedCourse.span - 1} 节</Text>
                </View>
              </View>

              <View style={styles.detailNotesSection}>
                <Text style={styles.notesSectionTitle}>
                  📝 关联随堂笔记 ({selectedCourse.notesCount} 篇)
                </Text>
                <Text style={styles.notesExcerpt}>
                  {selectedCourse.notesCount > 0
                    ? '• 核心语法句式与课前重点回顾\n• 课堂重点板书已拍照归档至知识库'
                    : '本门课程尚无随堂笔记，点击下方立即记录。'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.addNoteActionBtn}
                onPress={() => setSelectedCourse(null)}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.addNoteActionText}>打开/添加随堂笔记</Text>
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
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAF8',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  periodColHeader: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  dayHeaderCol: {
    flex: 1,
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
    top: -4,
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
  gridScroll: {
    flex: 1,
  },
  gridBody: {
    flexDirection: 'row',
    minHeight: 580,
  },
  periodsColumn: {
    width: 38,
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
    flex: 1,
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
    width: '14.28%',
    borderRadius: Rounded.md,
    padding: 4,
    borderWidth: 1,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  courseBlockName: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
  },
  courseBlockLoc: {
    fontSize: 9,
    marginTop: 3,
    lineHeight: 11,
  },
  noteIndicator: {
    position: 'absolute',
    bottom: 3,
    right: 3,
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
  notesSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
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
