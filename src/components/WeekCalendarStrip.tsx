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
}

export const WeekCalendarStrip: React.FC<WeekCalendarStripProps> = ({
  selectedDate,
  onSelectDate,
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
    baseMonday.setDate(now.getDate() + mondayDiff + weekOffset * 7);

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

    // 计算周次（基准第14周，根据偏移量计算）
    const weekNum = 14 + weekOffset;

    return {
      days: generatedDays,
      monthLabel: `${year}.${month}`,
      currentWeekNumber: Math.max(1, weekNum),
      isCurrentRealWeek: weekOffset === 0,
    };
  }, [weekOffset]);

  // 选择月份处理
  const handleSelectMonth = (monthIndex: number) => {
    // 根据选定的年份与月份计算到基准周的偏移
    const now = new Date();
    const targetDate = new Date(selectedYear, monthIndex, 1);
    const diffTime = targetDate.getTime() - now.getTime();
    const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));
    setWeekOffset(diffWeeks);
    setMonthPickerVisible(false);
  };

  const monthsList = [
    '01月 · 冬季学期', '02月 · 开学备课', '03月 · 春季学期', '04月 · 期中预备',
    '05月 · 专题研讨', '06月 · 夏学期', '07月 · 暑假集训', '08月 · 实践实习',
    '09月 · 秋季开学', '10月 · 国庆调休', '11月 · 期中考核', '12月 · 期末备考',
  ];

  return (
    <View style={styles.container}>
      {/* 顶部月份与周次指示器（点击月份弹出选择抽屉/弹窗） */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.monthSelector}
          activeOpacity={0.7}
          onPress={() => setMonthPickerVisible(true)}
        >
          <Text style={styles.monthText}>{monthLabel}</Text>
          <Ionicons name="caret-down" size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {/* 周次切换与每周周一自动流转 */}
        <View style={styles.weekControlRow}>
          <TouchableOpacity
            style={styles.weekArrowBtn}
            onPress={() => setWeekOffset((prev) => prev - 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={13} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setWeekOffset(0)}
            activeOpacity={0.7}
          >
            <Text style={styles.weekIndicator}>
              第 {currentWeekNumber} 周 · 夏学期
              {!isCurrentRealWeek && ' (回本周)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.weekArrowBtn}
            onPress={() => setWeekOffset((prev) => prev + 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={13} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 7 天横滑日历轴 (支持休假标识，自动定位高亮真实今日) */}
      <View style={styles.daysRow}>
        {days.map((item) => {
          const isSelected = item.dateStr === selectedDate || (item.isToday && !selectedDate);
          return (
            <TouchableOpacity
              key={item.dateStr}
              style={[
                styles.dayItem,
                isSelected && styles.dayItemSelected,
              ]}
              onPress={() => onSelectDate(item.dateStr, item.dayOfWeek)}
              activeOpacity={0.8}
            >
              {/* 休假标识标签 */}
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

              <Text
                style={[
                  styles.dayNameText,
                  isSelected && styles.dayNameTextSelected,
                ]}
              >
                {item.dayName}
              </Text>
              <View
                style={[
                  styles.dayBadge,
                  isSelected && styles.dayBadgeSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumberText,
                    isSelected && styles.dayNumberTextSelected,
                  ]}
                >
                  {item.isToday ? '今' : item.dayNumber}
                </Text>
              </View>
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
    paddingTop: 4,
    paddingBottom: 16,
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
  holidayBadge: {
    position: 'absolute',
    top: -2,
    right: 2,
    width: 15,
    height: 15,
    borderRadius: 8,
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
    marginBottom: 6,
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
  dayBadgeSelected: {
    backgroundColor: Colors.primary,
  },
  dayNumberText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dayNumberTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
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
