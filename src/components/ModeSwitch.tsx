import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Rounded } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ViewMode } from '../types/schedule';

interface ModeSwitchProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onOpenImport: () => void;
}

export const ModeSwitch: React.FC<ModeSwitchProps> = ({
  currentMode,
  onModeChange,
  onOpenImport,
}) => {
  return (
    <View style={styles.container}>
      {/* 模式切换双胶囊 */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            currentMode === 'teacher' && styles.toggleBtnActive,
          ]}
          onPress={() => onModeChange('teacher')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.toggleText,
              currentMode === 'teacher' ? styles.toggleTextActive : styles.toggleTextInactive,
            ]}
          >
            教师模式
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            currentMode === 'calendar' && styles.toggleBtnActive,
          ]}
          onPress={() => onModeChange('calendar')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.toggleText,
              currentMode === 'calendar' ? styles.toggleTextActive : styles.toggleTextInactive,
            ]}
          >
            日历模式
          </Text>
        </TouchableOpacity>
      </View>

      {/* 右侧工具栏：教务导入 & 搜索 */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.actionIconBtn}
          onPress={onOpenImport}
          activeOpacity={0.7}
        >
          <Ionicons name="cloud-download-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIconBtn} activeOpacity={0.7}>
          <Ionicons name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: Rounded.pill,
    padding: 3,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: Rounded.pill,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: Colors.primary,
  },
  toggleTextInactive: {
    color: '#FFFFFF',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
