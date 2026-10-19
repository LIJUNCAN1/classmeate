import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Rounded } from '../constants/theme';
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
  // 动态生成本周真实的 7 天日期（自动对齐周一到周日，自动定位真实今日）
  const { days, monthLabel } = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 是周日, 1-6 是周一到周六
    // 计算本周一的日期
    const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayDiff);

    const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
    const generatedDays: DynamicWeekDay[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

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

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return {
      days: generatedDays,
      monthLabel: `${year}.${month}`,
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.monthSelector} activeOpacity={0.7}>
          <Text style={styles.monthText}>{monthLabel}</Text>
          <Ionicons name="caret-down" size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <Text style={styles.weekIndicator}>第 14 周 · 夏学期</Text>
      </View>

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
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  weekIndicator: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.88)',
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
});
