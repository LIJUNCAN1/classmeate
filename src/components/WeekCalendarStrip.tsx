import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface DynamicWeekDay {
  dayName: string;
  dayNumber: number;
  dateStr: string;
  dayOfWeek: number; // 1-7 (1=周一, 7=周日)
  isToday: boolean;
  isHoliday?: boolean;
}

interface WeekCalendarStripProps {
  selectedDate: string;
  onSelectDate: (dateStr: string, dayOfWeek: number) => void;
  onOpenWeekPicker?: () => void;
  realWeekNumber?: number;
  currentWeekNumberOverride?: number;
  courses?: Array<{ dayOfWeek: number }>;
}

export const WeekCalendarStrip: React.FC<WeekCalendarStripProps> = ({
  selectedDate,
  onSelectDate,
  onOpenWeekPicker,
  realWeekNumber = 7,
  currentWeekNumberOverride,
  courses = [],
}) => {
  // 当前基准日期（支持按周偏移，每周周一自动对齐当周）
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2026);

  // 动态生成真实的 7 天日期（以周一为起点）
  const { days, monthLabel, currentWeekNumber, isCurrentRealWeek } = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 是周日, 1-6 是周一到周六
    // 每周一自动成为该周的起始第一天
    const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay;
    const baseMonday = new Date(now);
    const offset = currentWeekNumberOverride !== undefined ? (currentWeekNumberOverride - realWeekNumber) : weekOffset;
    baseMonday.setDate(now.getDate() + mondayDiff + offset * 7);

    const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
    const generatedDays: DynamicWeekDay[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseMonday);
      d.setDate(baseMonday.getDate() + i);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayStr}`;

      const isToday = d.toDateString() === now.toDateString();
      // 周六、周日自动标休
      const isHoliday = i === 5 || i === 6;

      generatedDays.push({
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        dateStr,
        dayOfWeek: i + 1,
        isToday,
        isHoliday,
      });
    }

    // 计算当前显示的周对应的月份与年份
    const midWeekDay = new Date(baseMonday);
    midWeekDay.setDate(baseMonday.getDate() + 3);
    const year = midWeekDay.getFullYear();
    const month = String(midWeekDay.getMonth() + 1).padStart(2, '0');

    // 计算周次（根据 realWeekNumber 基准周与偏移量计算）
    const baseWeek = realWeekNumber;
    const calculatedWeek = baseWeek + weekOffset;
    const finalWeek = currentWeekNumberOverride !== undefined ? currentWeekNumberOverride : calculatedWeek;

    return {
      days: generatedDays,
      monthLabel: `${year}.${month}`,
      currentWeekNumber: Math.max(1, finalWeek),
      isCurrentRealWeek: weekOffset === 0,
    };
  }, [weekOffset, realWeekNumber, currentWeekNumberOverride]);

  // 切换周处理：切换到非本周默认选中周一，切回本周默认选中今天
  const handleWeekChange = (newOffset: number) => {
    setWeekOffset(newOffset);

    const now = new Date();
    const currentDay = now.getDay();
    const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay;
    const baseMonday = new Date(now);
    baseMonday.setDate(now.getDate() + mondayDiff + newOffset * 7);

    if (newOffset === 0) {
      // 本周：默认移动到今天
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const todayDateStr = `${y}-${m}-${d}`;
      const dNum = now.getDay() === 0 ? 7 : now.getDay();
      onSelectDate(todayDateStr, dNum);
    } else {
      // 其它周：默认移动到星期一
      const y = baseMonday.getFullYear();
      const m = String(baseMonday.getMonth() + 1).padStart(2, '0');
      const d = String(baseMonday.getDate()).padStart(2, '0');
      const mondayDateStr = `${y}-${m}-${d}`;
      onSelectDate(mondayDateStr, 1);
    }
  };

  // 选择月份处理
  const handleSelectMonth = (monthIndex: number) => {
    // 根据选定的年份与月份计算到基准周的偏移
    const now = new Date();
    const targetDate = new Date(selectedYear, monthIndex, 1);
    const diffTime = targetDate.getTime() - now.getTime();
    const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));
    handleWeekChange(diffWeeks);
    setMonthPickerVisible(false);
  };

  const monthsList = [
    '01月 · 冬季学期', '02月 · 开学备课', '03月 · 春季学期', '04月 · 期中预备',
    '05月 · 专题研讨', '06月 · 夏学期', '07月 · 暑假集训', '08月 · 实践实习',
    '09月 · 秋季开学', '10月 · 国庆调休', '11月 · 期中考核', '12月 · 期末备考',
  ];

  return (
    <View style={styles.container}>
      {/* 7 天横滑日历轴 (支持休假标识，自动定位高亮真实今日) */}
      <View style={styles.daysRow}>
        {days.map((item) => {
          const isSelected = item.dateStr === selectedDate || (item.isToday && !selectedDate);
          const hasCourse = courses.some((c) => c.dayOfWeek === item.dayOfWeek);

          return (
            <TouchableOpacity
              key={item.dateStr}
              style={[
                styles.dayItem,
                isSelected && styles.dayItemSelected,
              ]}
              onPress={() => {
                // 限制不能重复点击现在正在查看的日期
                if (isSelected) return;
                onSelectDate(item.dateStr, item.dayOfWeek);
              }}
              disabled={isSelected}
              activeOpacity={0.8}
            >
              <View style={styles.dayNameContainer}>
                <Text
                  style={[
                    styles.dayNameText,
                    isSelected && styles.dayNameTextSelected,
                  ]}
                >
                  {item.dayName}
                </Text>
                {item.isHoliday && (
                  <View
                    style={[
                      styles.holidayBadge,
                      isSelected ? styles.holidayBadgeSelected : styles.holidayBadgeNormal,
                    ]}
                  >
                    <Text style={styles.holidayBadgeText}>休</Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.dayBadge,
                  isSelected && item.isToday && styles.dayBadgeTodaySelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumberText,
                    isSelected && (item.isToday ? styles.dayNumberTextTodaySelected : styles.dayNumberTextSelected),
                  ]}
                >
                  {item.isToday ? '今' : item.dayNumber}
                </Text>
              </View>

              {/* 课程圆点指示器（有课的日子显示圆点，选中有课显示绿色，未选中显示半透明白色） */}
              {hasCourse && (
                <View
                  style={[
                    styles.courseDot,
                    isSelected ? styles.courseDotSelected : styles.courseDotNormal,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 月份选择弹出抽屉 */}
      <Modal
        visible={monthPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMonthPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMonthPickerVisible(false)}
        >
          <View style={[styles.monthPickerCard, Shadows.card]}>
            <View style={styles.monthPickerHeader}>
              <Text style={styles.pickerTitle}>选择学期月份</Text>
              <View style={styles.yearToggleRow}>
                <TouchableOpacity
                  onPress={() => setSelectedYear((y) => y - 1)}
                  style={styles.yearBtn}
                >
                  <Ionicons name="chevron-back" size={16} color={Colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.yearText}>{selectedYear} 年</Text>
                <TouchableOpacity
                  onPress={() => setSelectedYear((y) => y + 1)}
                  style={styles.yearBtn}
                >
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMain} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              <View style={styles.monthsGrid}>
                {monthsList.map((mName, index) => {
                  const isCurrent = monthLabel === `${selectedYear}.${String(index + 1).padStart(2, '0')}`;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.monthGridItem,
                        isCurrent && styles.monthGridItemActive,
                      ]}
                      onPress={() => handleSelectMonth(index)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.monthGridText,
                          isCurrent && styles.monthGridTextActive,
                        ]}
                      >
                        {mName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.pickerCloseBtn}
              onPress={() => setMonthPickerVisible(false)}
            >
              <Text style={styles.pickerCloseText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Rounded.pill,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  weekControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Rounded.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  weekArrowBtn: {
    padding: 3,
  },
  weekIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 4,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: Rounded.lg,
    position: 'relative',
    minWidth: 42,
  },
  dayItemSelected: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dayNameContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  holidayBadge: {
    position: 'absolute',
    top: -4,
    right: -13,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  holidayBadgeNormal: {
    backgroundColor: '#FF4D4F',
  },
  holidayBadgeSelected: {
    backgroundColor: '#FF4D4F',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  holidayBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 11,
  },
  dayNameText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  dayNameTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dayBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeTodaySelected: {
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  dayNumberText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dayNumberTextTodaySelected: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  dayNumberTextSelected: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  courseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  courseDotSelected: {
    backgroundColor: Colors.primary,
  },
  courseDotNormal: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  monthPickerCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.xl,
    padding: 20,
  },
  monthPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMain,
  },
  yearToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearBtn: {
    padding: 4,
  },
  yearText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMain,
    marginHorizontal: 6,
  },
  monthsGrid: {
    gap: 8,
  },
  monthGridItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Rounded.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  monthGridItemActive: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.primary,
  },
  monthGridText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  monthGridTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  pickerCloseBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: Rounded.pill,
  },
  pickerCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
