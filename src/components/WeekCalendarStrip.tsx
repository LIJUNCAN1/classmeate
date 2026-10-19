import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Rounded } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface WeekDay {
  dayName: string;
  dayNumber: number;
  dateStr: string;
  isToday?: boolean;
}

interface WeekCalendarStripProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export const WeekCalendarStrip: React.FC<WeekCalendarStripProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const days: WeekDay[] = [
    { dayName: '日', dayNumber: 19, dateStr: '2026-06-19' },
    { dayName: '一', dayNumber: 20, dateStr: '2026-06-20' },
    { dayName: '二', dayNumber: 21, dateStr: '2026-06-21' },
    { dayName: '三', dayNumber: 22, dateStr: '2026-06-22', isToday: true },
    { dayName: '四', dayNumber: 23, dateStr: '2026-06-23' },
    { dayName: '五', dayNumber: 24, dateStr: '2026-06-24' },
    { dayName: '六', dayNumber: 25, dateStr: '2026-06-25' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.monthSelector}>
          <Text style={styles.monthText}>2026.06</Text>
          <Ionicons name="caret-down" size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <Text style={styles.weekIndicator}>第 14 周 · 夏学期</Text>
      </View>

      <View style={styles.daysRow}>
        {days.map((item) => {
          const isSelected = item.dateStr === selectedDate;
          return (
            <TouchableOpacity
              key={item.dateStr}
              style={[
                styles.dayItem,
                isSelected && styles.dayItemSelected,
              ]}
              onPress={() => onSelectDate(item.dateStr)}
              activeOpacity={0.8}
            >
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
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    color: 'rgba(255, 255, 255, 0.85)',
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
