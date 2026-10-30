import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedCheckmark } from './AnimatedCheckmark';
import { Course } from '../types/schedule';
import {
  extractCourseFields,
  cleanPrefix,
  repairCourse,
  parseBuildingAndRoom,
  isCourseInWeek,
} from '../services/jwParser';
import { NonCurrentWeekMode } from '../services/scheduleStorage';

interface WeekCourseItem {
  id: string;
  name: string;
  teacher: string;
  location: string;
  weekRange: string;
  day: number; // 1: 一, 2: 二, 3: 三, 4: 四, 5: 五, 6: 六, 7: 日
  startPeriod: number; // 1-10
  span: number; // 节数跨度
  colorScheme: {
    bg: string;
    accent: string;
    text: string;
    border: string;
  };
  notesCount: number;
  isCurrentWeek: boolean;
}

interface GridSlotItem {
  slotKey: string;
  day: number;
  startPeriod: number;
  span: number;
  primaryCourse: WeekCourseItem;
  overlapCount: number;
  stackedCourses: WeekCourseItem[];
  isCurrentWeek: boolean;
}

interface WeekGridViewProps {
  courses?: Course[];
  onOpenNote?: (courseName: string, teacher: string) => void;
  currentWeekIndex?: number;
  realCurrentWeekNumber?: number;
  nonCurrentWeekMode?: NonCurrentWeekMode;
  onSelectWeek?: (week: number) => void;
  onOpenWeekPicker?: () => void;
  onOpenImportModal?: () => void;
  onOpenSettingsDrawer?: () => void;
}

const COLOR_PALETTES = [
  // 1. 经典薄荷绿 (清爽生机)
  { bg: '#EBFBF3', accent: '#10B981', text: '#065F46', border: '#A7F3D0' },
  // 2. 晴空霁蓝 (明亮科技)
  { bg: '#EFF6FF', accent: '#3B82F6', text: '#1E40AF', border: '#BFDBFE' },
  // 3. 香芋丁香紫 (优雅柔和)
  { bg: '#F5F3FF', accent: '#8B5CF6', text: '#5B21B6', border: '#DDD6FE' },
  // 4. 暖阳琥珀橙 (醒目温暖)
  { bg: '#FFFBEB', accent: '#F59E0B', text: '#92400E', border: '#FDE68A' },
  // 5. 珊瑚樱花粉 (甜美亲和)
  { bg: '#FFF1F2', accent: '#F43F5E', text: '#9F1239', border: '#FECDD3' },
  // 6. 碧海湖青绿 (沉稳清雅)
  { bg: '#F0FDFA', accent: '#14B8A6', text: '#115E59', border: '#99F6E4' },
  // 7. 暮日落霞橙 (饱满活力)
  { bg: '#FFF7ED', accent: '#F97316', text: '#9A3412', border: '#FED7AA' },
  // 8. 极光深靛蓝 (深邃知性)
  { bg: '#EEF2FF', accent: '#6366F1', text: '#3730A3', border: '#C7D2FE' },
  // 9. 蔷薇娇洋红 (俏皮鲜明)
  { bg: '#FDF2F8', accent: '#EC4899', text: '#9D174D', border: '#FBCFE8' },
  // 10. 青柠草地绿 (朝气蓬勃)
  { bg: '#F7FEE7', accent: '#84CC16', text: '#3F6212', border: '#D9F99D' },
  // 11. 紫罗兰幽香 (深邃层次)
  { bg: '#FAF5FF', accent: '#A855F7', text: '#6B21A8', border: '#E9D5FF' },
  // 12. 绿松石青蓝 (透彻灵动)
  { bg: '#ECFEFF', accent: '#06B6D4', text: '#155E75', border: '#A5F3FC' },
  // 13. 晚枫丹砂红 (热情醒目)
  { bg: '#FEF2F2', accent: '#EF4444', text: '#991B1B', border: '#FECACA' },
  // 14. 琉璃明鹅黄 (明媚阳光)
  { bg: '#FEFCE8', accent: '#EAB308', text: '#854D0E', border: '#FEF08A' },
  // 15. 静谧蓝石灰 (高级质感)
  { bg: '#F1F5F9', accent: '#64748B', text: '#334155', border: '#CBD5E1' },
  // 16. 魅惑紫晶色 (浓郁醒神)
  { bg: '#F3E8FF', accent: '#7C3AED', text: '#581C87', border: '#DDD6FE' },
];

function parseCourseSection(course: Course): { startPeriod: number; span: number } {
  if (course.stageTag) {
    const m = course.stageTag.match(/(?:周[一二三四五六日天1-7])?\s*(\d+)\s*[-~到,]?\s*(\d*)\s*节/);
    if (m) {
      const s = parseInt(m[1], 10);
      const e = m[2] ? parseInt(m[2], 10) : s;
      return { startPeriod: Math.min(10, Math.max(1, s)), span: Math.max(1, e - s + 1) };
    }
  }
  if (course.startTime) {
    const t = course.startTime;
    let s = 1;
    if (t <= '08:30') s = 1;
    else if (t <= '09:30') s = 2;
    else if (t <= '10:30') s = 3;
    else if (t <= '11:30') s = 4;
    else if (t <= '14:30') s = 5;
    else if (t <= '15:30') s = 6;
    else if (t <= '16:30') s = 7;
    else if (t <= '17:30') s = 8;
    else if (t <= '19:30') s = 9;
    else s = 10;
    return { startPeriod: s, span: 2 };
  }
  return { startPeriod: 1, span: 2 };
}

function getWeekDays(weekIndex: number, realWeekNumber: number = 8) {
  const now = new Date();
  const currentDay = now.getDay();
  const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay;
  const currentMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayDiff);
  // 基于现实当前周计算周次偏移量
  const weekOffset = weekIndex - realWeekNumber;
  const weekStart = new Date(currentMonday.getTime() + weekOffset * 7 * 86400000);
  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);
  const range = `${(weekStart.getMonth() + 1).toString().padStart(2, '0')}/${weekStart.getDate().toString().padStart(2, '0')} - ${(weekEnd.getMonth() + 1).toString().padStart(2, '0')}/${weekEnd.getDate().toString().padStart(2, '0')}`;
  
  const today = new Date();
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const days = dayNames.map((name, i) => {
    const d = new Date(weekStart.getTime() + i * 86400000);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    const isToday = d.toDateString() === today.toDateString();
    const isHoliday = i >= 5;
    return {
      day: i + 1,
      name,
      date: dateStr,
      isToday,
      isHoliday,
    };
  });
  return { range, days };
}

export const WeekGridView: React.FC<WeekGridViewProps> = ({
  courses = [],
  onOpenNote,
  currentWeekIndex: propWeekIndex = 8,
  realCurrentWeekNumber = 8,
  nonCurrentWeekMode = 'hide',
  onSelectWeek,
  onOpenWeekPicker,
  onOpenImportModal,
  onOpenSettingsDrawer,
}) => {
  const [internalWeekIndex, setInternalWeekIndex] = useState(propWeekIndex);
  const currentWeekIndex = propWeekIndex || internalWeekIndex;

  // 周课表切换周次时的向上浮现与平滑过渡动画
  const weekFadeAnim = useRef(new Animated.Value(1)).current;
  const weekSlideAnim = useRef(new Animated.Value(0)).current;
  const weekFloatUpAnim = useRef(new Animated.Value(0)).current;

  // 用户要求保留【切回本周】CTA（仅当处于非本周时呈现弹性生长动效，彻底去除原有黑色底座）
  const isNotRealWeek = currentWeekIndex !== (realCurrentWeekNumber || 8);
  const backTodayScaleAnim = useRef(new Animated.Value(isNotRealWeek ? 1 : 0)).current;

  useEffect(() => {
    if (isNotRealWeek) {
      backTodayScaleAnim.setValue(0);
      Animated.spring(backTodayScaleAnim, {
        toValue: 1,
        tension: 90,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(backTodayScaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isNotRealWeek]);

  useEffect(() => {
    if (propWeekIndex && propWeekIndex !== internalWeekIndex) {
      setInternalWeekIndex(propWeekIndex);
      // 外部更新周次（如顶部下拉展开周次）时触发向上浮现动效
      weekFloatUpAnim.setValue(22);
      weekFadeAnim.setValue(0.2);
      Animated.parallel([
        Animated.timing(weekFadeAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.spring(weekFloatUpAnim, {
          toValue: 0,
          tension: 80,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [propWeekIndex]);

  const setCurrentWeekIndex = (val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(currentWeekIndex) : val;
    setInternalWeekIndex(nextVal);
    onSelectWeek?.(nextVal);
  };

  const handleSwitchWeek = (newWeek: number) => {
    if (newWeek === currentWeekIndex || newWeek < 1) return;
    const direction = newWeek > currentWeekIndex ? 1 : -1;

    // 向上浮现配合水平微滑
    weekFloatUpAnim.setValue(20);
    weekFadeAnim.setValue(0.2);
    weekSlideAnim.setValue(direction * 14);

    Animated.parallel([
      Animated.timing(weekFadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(weekFloatUpAnim, {
        toValue: 0,
        tension: 85,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(weekSlideAnim, {
        toValue: 0,
        tension: 85,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentWeekIndex(newWeek);
  };
  const [selectedCourse, setSelectedCourse] = useState<WeekCourseItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<GridSlotItem | null>(null);
  const [zoomScale, setZoomScale] = useState(1.0); // 缩放比例，支持双指放大

  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 600;

  // 星期与日期定义（随周次切换动态计算）
  const activeWeekData = getWeekDays(currentWeekIndex, realCurrentWeekNumber || 8);

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

  // 1. 整理与修复所有课程
  const repairedList = useMemo(() => courses.map(repairCourse), [courses]);

  // 建立唯一课程名 -> 配色映射字典
  // 核心规则：同一门课程（名称一致）在全周任何时间段 100% 保持完全相同的专属颜色；不同课程依次分发不同色系，杜绝色彩紊乱
  const courseColorMap = useMemo(() => {
    const map = new Map<string, typeof COLOR_PALETTES[0]>();
    const uniqueCourseNames: string[] = Array.from(
      new Set(
        repairedList
          .map((c: Course) => (c.name || '').trim())
          .filter((name): name is string => Boolean(name))
      )
    );
    uniqueCourseNames.forEach((name: string, idx: number) => {
      map.set(name, COLOR_PALETTES[idx % COLOR_PALETTES.length]);
    });
    return map;
  }, [repairedList]);

  const repairedWeekCourses: WeekCourseItem[] = repairedList.map((c: Course) => {
    const isCurrentWeek = isCourseInWeek(c.weekRange, currentWeekIndex);
    const { startPeriod, span } = parseCourseSection(c);
    const day = c.dayOfWeek || 1;
    const cleanName = (c.name || '').trim();
    const colorScheme = courseColorMap.get(cleanName) || COLOR_PALETTES[0];

    return {
      id: c.id,
      name: c.name,
      teacher: c.teacher,
      location: c.location,
      weekRange: c.weekRange || '1-16周',
      day,
      startPeriod,
      span,
      colorScheme,
      notesCount: c.notesCount || 0,
      isCurrentWeek,
    };
  });

  // 2. 按 (day, startPeriod) 槽位聚合课程，计算重叠数与堆叠色块（支持图2与图3效果）
  const slotGroups: Record<string, WeekCourseItem[]> = {};
  repairedWeekCourses.forEach((c) => {
    const key = `${c.day}_${c.startPeriod}`;
    if (!slotGroups[key]) slotGroups[key] = [];
    slotGroups[key].push(c);
  });

  const slots: GridSlotItem[] = [];
  Object.keys(slotGroups).forEach((key) => {
    const group = slotGroups[key];
    if (group.length === 0) return;

    if (nonCurrentWeekMode === 'hide') {
      // 模式 1（默认）：非本周课不显示（严格只保留当前周真实排课，12周后的课在第13、14周彻底隐藏）
      const activeCourses = group.filter((c) => c.isCurrentWeek);
      if (activeCourses.length === 0) {
        return; // 该周此节次无排课，彻底隐藏留空
      }
      const primaryCourse = activeCourses[0];
      slots.push({
        slotKey: key,
        day: primaryCourse.day,
        startPeriod: primaryCourse.startPeriod,
        span: primaryCourse.span,
        primaryCourse,
        overlapCount: activeCourses.length,
        stackedCourses: activeCourses,
        isCurrentWeek: true,
      });
    } else {
      // 模式 2 (stacked) 或模式 3 (transparent)：允许展示非本周课
      const currentWeekItem = group.find((c) => c.isCurrentWeek);
      const primaryCourse = currentWeekItem || group[0];
      const isCurrentWeek = !!currentWeekItem;

      slots.push({
        slotKey: key,
        day: primaryCourse.day,
        startPeriod: primaryCourse.startPeriod,
        span: primaryCourse.span,
        primaryCourse,
        overlapCount: group.length,
        stackedCourses: group,
        isCurrentWeek,
      });
    }
  });

  // 平板端自适应：左右保留安全舒适边距（缩回来），与顶栏及底栏对齐
  const horizontalMargin = isTablet ? 18 : 8;
  const maxTableWidth = isTablet ? Math.min(windowWidth - horizontalMargin * 2, 960) : windowWidth - horizontalMargin * 2;
  const timeColWidth = isTablet ? 42 : 36;
  const availableGridWidth = Math.max(maxTableWidth - timeColWidth, 300);
  const exactTabletColWidth = availableGridWidth / 7;
  const colWidth = isTablet ? exactTabletColWidth * zoomScale : 72 * zoomScale;
  const totalTableWidth = isTablet ? maxTableWidth : colWidth * 7 + timeColWidth;
  const BASE_PERIOD_HEIGHT = isTablet ? 72 : 68;
  const periodHeight = BASE_PERIOD_HEIGHT * (isTablet ? Math.max(0.85, zoomScale) : zoomScale);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          flex: 1,
          opacity: weekFadeAnim,
          transform: [
            { translateX: weekSlideAnim },
            { translateY: weekFloatUpAnim },
          ],
        }}
      >
        {courses.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            showsVerticalScrollIndicator={false}
          >
          <Image
            source={require('../../assets/empty-schedule-404.png')}
            style={[styles.emptyImage, isTablet && styles.emptyImageTablet]}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>课程表暂无数据</Text>
          <Text style={styles.emptySubtitle}>
            尚未导入任何课程。可点击下方按钮一键导入高校教务课表
          </Text>
          {onOpenImportModal && (
            <TouchableOpacity
              style={[styles.emptyImportBtn, isTablet && styles.emptyImportBtnTablet]}
              onPress={onOpenImportModal}
              activeOpacity={0.8}
            >
              <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyImportBtnText}>教务系统导入课程表</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <>
          {/* 按用户要求：已彻底去掉“🔍 支持双指捏合缩放（当前 100%）”整栏 */}

          {/* 双向可滚动区域：支持双指放大 (maximumZoomScale & pinchGestureEnabled) */}
          <ScrollView
            style={styles.outerScroll}
            contentContainerStyle={[styles.outerScrollContent, isTablet && { alignItems: 'center' }]}
            maximumZoomScale={2.5}
            minimumZoomScale={0.8}
            pinchGestureEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                width: isTablet && zoomScale === 1.0 ? totalTableWidth : undefined,
                minWidth: isTablet && zoomScale === 1.0 ? totalTableWidth : colWidth * 7 + timeColWidth,
                alignItems: isTablet ? 'center' : undefined,
                justifyContent: isTablet ? 'center' : undefined,
              }}
            >
              <View style={[styles.tableWrapper, isTablet && { width: totalTableWidth, alignSelf: 'center' }]}>
                {/* 星期表头行 (含休假标识) */}
                <View style={styles.headerRow}>
                  <View style={[styles.periodColHeader, { width: timeColWidth }]}>
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
                      <View style={styles.dayHeaderTitleWrap}>
                        <Text
                          style={[
                            styles.dayHeaderText,
                            col.isToday && styles.dayHeaderTextToday,
                          ]}
                        >
                          {col.name}
                        </Text>
                        {col.isHoliday && (
                          <View style={styles.holidayMiniBadge}>
                            <Text style={styles.holidayMiniBadgeText}>休</Text>
                          </View>
                        )}
                      </View>
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
                  <View style={[styles.periodsColumn, { width: timeColWidth }]}>
                    {periods.map((p) => (
                      <View key={p.num} style={[styles.periodCell, { height: periodHeight, width: timeColWidth }]}>
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

                    {/* 课程卡片绝对定位层（支持叠放色块、非本周标签与右上角重叠数） */}
                    {slots.map((slot) => {
                      const c = slot.primaryCourse;
                      const isCurrentWeek = slot.isCurrentWeek;
                      const leftPos = (slot.day - 1) * colWidth + 2;
                      const topOffset = (slot.startPeriod - 1) * periodHeight + 2;
                      const cardHeight = slot.span * periodHeight - 4;
                      const cardWidth = colWidth - 4;
                      const { building, room } = parseBuildingAndRoom(c.location);
                      const secondaryCourse = slot.stackedCourses.find((item) => item.id !== c.id);

                      // 透明度控制：
                      // 模式 3: 半透明 50%
                      // 模式 2 (stacked): 本周 100%, 非本周 0.9 (并带“非本周”胶囊标)
                      const cardOpacity = isCurrentWeek
                        ? 1
                        : nonCurrentWeekMode === 'transparent'
                        ? 0.5
                        : 0.88;

                      return (
                        <TouchableOpacity
                          key={slot.slotKey}
                          style={[
                            styles.courseBlock,
                            {
                              left: leftPos,
                              top: topOffset,
                              width: cardWidth,
                              height: cardHeight,
                              backgroundColor: isCurrentWeek ? c.colorScheme.bg : '#F3F4F6',
                              borderColor: isCurrentWeek
                                ? (c.colorScheme.border || 'rgba(0,0,0,0.06)')
                                : '#D1D5DB',
                              opacity: cardOpacity,
                              borderStyle: isCurrentWeek ? 'solid' : 'dashed',
                            },
                          ]}
                          onPress={() => {
                            setSelectedSlot(slot);
                            setSelectedCourse(c);
                          }}
                          activeOpacity={0.85}
                        >
                          {/* 顶部专属对比色卡头条：写在顶部的色块里（严格对齐图1效果） */}
                          <View
                            style={[
                              styles.cardAccentBar,
                              {
                                backgroundColor: isCurrentWeek ? c.colorScheme.accent : '#A0A5AC',
                                height: !isCurrentWeek ? 16 : 4,
                                justifyContent: 'center',
                                alignItems: 'center',
                              },
                            ]}
                          >
                            {!isCurrentWeek && (
                              <Text style={styles.cardAccentBarNotThisWeekText}>非本周</Text>
                            )}
                          </View>

                          {/* 右上角重叠科目数角标 (图2与图3效果：如 2, 3, 6, 4) */}
                          {nonCurrentWeekMode === 'stacked' && slot.overlapCount > 1 && (
                            <View style={[styles.overlapBadge, !isCurrentWeek && { top: 2 }]}>
                              <Text style={styles.overlapBadgeText}>{slot.overlapCount}</Text>
                            </View>
                          )}

                          <View style={styles.cardInnerContent}>

                            {/* 课程名与地点（分行无@） */}
                            <View style={styles.courseTopArea}>
                              <Text
                                style={[
                                  styles.courseBlockName,
                                  { color: isCurrentWeek ? c.colorScheme.text : '#4B5563' },
                                ]}
                                numberOfLines={2}
                              >
                                {c.name}
                              </Text>

                              {/* 课程名与地点之间的分割线 */}
                              {(building || room) ? (
                                <View
                                  style={[
                                    styles.courseCardDivider,
                                    {
                                      backgroundColor: isCurrentWeek
                                        ? (c.colorScheme.border || 'rgba(0,0,0,0.1)')
                                        : 'rgba(0,0,0,0.1)',
                                    },
                                  ]}
                                />
                              ) : null}

                              {building ? (
                                <Text
                                  style={[
                                    styles.courseBlockLoc,
                                    { color: isCurrentWeek ? c.colorScheme.text : '#6B7280' },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {building}
                                </Text>
                              ) : null}
                              {room ? (
                                <Text
                                  style={[
                                    styles.courseBlockLoc,
                                    { color: isCurrentWeek ? c.colorScheme.text : '#6B7280' },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {room}
                                </Text>
                              ) : null}
                            </View>

                            {/* 底部：左下角常驻教师名字，右下角展示随堂笔记标记 */}
                            <View style={styles.courseCardFooter}>
                              <Text
                                style={[
                                  styles.teacherNameText,
                                  { color: isCurrentWeek ? c.colorScheme.text : '#6B7280' },
                                ]}
                                numberOfLines={1}
                              >
                                {c.teacher}
                              </Text>
                              <View style={styles.noteIndicator}>
                                <AnimatedCheckmark checked={c.notesCount > 0} size={13} />
                              </View>
                            </View>
                          </View>

                          {/* 底部堆叠色块条 (对齐图3效果：若同位置有其他课，底部显示色块) */}
                          {nonCurrentWeekMode === 'stacked' && slot.overlapCount > 1 && (
                            <View
                              style={[
                                styles.cardBottomStackedBar,
                                {
                                  backgroundColor: secondaryCourse
                                    ? secondaryCourse.colorScheme.accent
                                    : c.colorScheme.accent,
                                },
                              ]}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}

                    {/* 本周无课程提示浮层 */}
                    {slots.length === 0 && (
                      <View style={styles.emptyWeekOverlay}>
                        <View style={styles.emptyWeekPill}>
                          <Ionicons name="sparkles-outline" size={16} color="#10B981" />
                          <Text style={styles.emptyWeekPillText}>第 {currentWeekIndex} 周无排课安排</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>
          </ScrollView>
        </>
      )}
      </Animated.View>

      {/* 用户要求保留：非本周时单独展示悬浮【切回本周】胶囊（无黑色底座及中间第7周上一周等冗余内容） */}
      {isNotRealWeek && (
        <Animated.View
          style={[
            styles.floatingBackTodayAnimWrap,
            {
              transform: [{ scale: backTodayScaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.floatingBackTodayBtn}
            onPress={() => {
              Animated.sequence([
                Animated.timing(backTodayScaleAnim, {
                  toValue: 1.15,
                  duration: 70,
                  useNativeDriver: true,
                }),
                Animated.timing(backTodayScaleAnim, {
                  toValue: 0,
                  duration: 120,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                handleSwitchWeek(realCurrentWeekNumber || 8);
              });
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.floatingBackTodayText}>切回本周 (第 {realCurrentWeekNumber || 8} 周)</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* 课程详情与快速笔记浮层 */}
      {selectedCourse && (
        <Modal transparent animationType="fade" visible={true} onRequestClose={() => {
          setSelectedCourse(null);
          setSelectedSlot(null);
        }}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.detailCard, Shadows.modal]}>
              <View style={styles.detailHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailTitle}>{selectedCourse.name}</Text>
                  <Text style={styles.detailTeacher}>任课教师：{selectedCourse.teacher}</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  setSelectedCourse(null);
                  setSelectedSlot(null);
                }} style={styles.detailCloseBtn}>
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
                <View style={styles.metaBadge}>
                  <Ionicons name="calendar-outline" size={13} color="#D97706" />
                  <Text style={styles.metaText}>{selectedCourse.weekRange}</Text>
                </View>
              </View>

              {/* 若本节次存在多门不同周次轮替的重叠课程，展示快捷切换列表 */}
              {selectedSlot && selectedSlot.overlapCount > 1 && (
                <View style={styles.overlapSection}>
                  <Text style={styles.overlapSectionTitle}>
                    本节次共有 {selectedSlot.overlapCount} 门不同周次的轮替课程：
                  </Text>
                  <View style={styles.overlapList}>
                    {selectedSlot.stackedCourses.map((item) => {
                      const isItemActive = item.id === selectedCourse.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.overlapItemRow,
                            isItemActive && styles.overlapItemRowActive,
                          ]}
                          onPress={() => setSelectedCourse(item)}
                          activeOpacity={0.7}
                        >
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text style={[styles.overlapItemName, isItemActive && { color: Colors.primary }]}>
                                {item.name}
                              </Text>
                              {item.isCurrentWeek && (
                                <View style={styles.currentWeekTag}>
                                  <Text style={styles.currentWeekTagText}>本周有课</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.overlapItemSub}>
                              {item.teacher} · {item.location} · {item.weekRange}
                            </Text>
                          </View>
                          <Ionicons
                            name={isItemActive ? 'checkmark-circle' : 'chevron-forward'}
                            size={18}
                            color={isItemActive ? Colors.primary : Colors.textMuted}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              <View style={styles.detailNotesSection}>
                <View style={styles.notesSectionHeader}>
                  <AnimatedCheckmark checked={selectedCourse.notesCount > 0} size={16} />
                  <Text style={styles.notesSectionTitle}>
                    {selectedCourse.notesCount > 0 ? `已记录 ${selectedCourse.notesCount} 篇随堂笔记` : '暂无随堂笔记'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.addNoteActionBtn}
                onPress={() => {
                  const c = selectedCourse;
                  setSelectedCourse(null);
                  setSelectedSlot(null);
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
    width: '100%',
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#FAFAF9',
  },
  emptyImage: {
    width: 220,
    height: 220,
    marginBottom: 16,
  },
  emptyImageTablet: {
    width: 320,
    height: 320,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 340,
    marginBottom: 24,
  },
  emptyImportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: Rounded.pill,
    ...Shadows.card,
  },
  emptyImportBtnTablet: {
    paddingHorizontal: 32,
    paddingVertical: 15,
  },
  emptyImportBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
  outerScrollContent: {
    paddingBottom: 110,
  },
  tableWrapper: {
    flexDirection: 'column',
    paddingBottom: 40,
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
    paddingVertical: 3,
    borderRadius: 14,
    marginHorizontal: 1,
  },
  dayHeaderColToday: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  dayHeaderTitleWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holidayMiniBadge: {
    position: 'absolute',
    top: -4,
    right: -14,
    backgroundColor: '#FF4D4F',
    borderRadius: 7,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dateSubText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  dateSubTextToday: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardAccentBar: {
    height: 4,
    width: '100%',
  },
  cardInnerContent: {
    flex: 1,
    padding: 4,
    justifyContent: 'space-between',
  },
  overlapBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    zIndex: 6,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  overlapBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  cardAccentBarNotThisWeekText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
    lineHeight: 12,
  },
  floatingBackToCurrentWeekBtn: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: '#FF5733',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#FF5733',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 99,
  },
  floatingBackToCurrentWeekBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardBottomStackedBar: {
    height: 5,
    width: '100%',
    borderBottomLeftRadius: Rounded.md,
    borderBottomRightRadius: Rounded.md,
  },
  notThisWeekBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
  },
  notThisWeekBadgeText: {
    fontSize: 8.5,
    color: '#6B7280',
    fontWeight: '600',
  },
  overlapSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  overlapSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  overlapList: {
    gap: 8,
  },
  overlapItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  overlapItemRowActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  overlapItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  overlapItemSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  currentWeekTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  currentWeekTagText: {
    fontSize: 9.5,
    color: '#15803D',
    fontWeight: '700',
  },
  emptyWeekOverlay: {
    position: 'absolute',
    top: 130,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  emptyWeekPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Rounded.pill,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyWeekPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
  },
  courseTopArea: {
    flex: 1,
    alignItems: 'flex-start',
    width: '100%',
  },
  courseBlockName: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    marginBottom: 2,
    textAlign: 'left',
  },
  courseCardDivider: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: 2,
    opacity: 0.85,
  },
  courseBlockLoc: {
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: '500',
    textAlign: 'left',
  },
  courseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    paddingTop: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  teacherNameText: {
    fontSize: 9.5,
    fontWeight: '700',
    flex: 1,
    textAlign: 'left',
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
  // 用户保留：悬浮返回本周按钮（居中优雅胶囊，无多余底座）
  floatingBackTodayAnimWrap: {
    position: 'absolute',
    bottom: 84,
    alignSelf: 'center',
    zIndex: 99,
  },
  floatingBackTodayBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingBackTodayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
