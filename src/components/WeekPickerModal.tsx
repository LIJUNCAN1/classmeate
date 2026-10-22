import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Shadows } from '../constants/theme';

interface WeekPickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentWeek: number; // 当前正在查看的周次 (1-25)
  realCurrentWeek: number; // 现实中当前周/本周 (如第7周)
  onSelectWeek: (week: number) => void;
  onUpdateRealCurrentWeek: (week: number) => void;
}

const TOTAL_WEEKS = 25;

export const WeekPickerModal: React.FC<WeekPickerModalProps> = ({
  visible,
  onClose,
  currentWeek,
  realCurrentWeek,
  onSelectWeek,
  onUpdateRealCurrentWeek,
}) => {
  const [isEditingRealWeek, setIsEditingRealWeek] = useState(false);

  // 点击周次
  const handlePressWeek = (week: number) => {
    if (isEditingRealWeek) {
      Alert.alert(
        '修改当前周',
        `确认将第 ${week} 周设置为本周吗？`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '确认',
            onPress: () => {
              onUpdateRealCurrentWeek(week);
              setIsEditingRealWeek(false);
              onSelectWeek(week);
              onClose();
            },
          },
        ]
      );
      return;
    }

    onSelectWeek(week);
    onClose();
  };

  const handleClose = () => {
    setIsEditingRealWeek(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          style={[styles.modalCard, Shadows.modal]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 顶部标题栏 */}
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>查看周课表</Text>
              {isEditingRealWeek && (
                <Text style={styles.headerSubHint}>（点击下方周次设为本周）</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setIsEditingRealWeek(!isEditingRealWeek)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.editBtnText, isEditingRealWeek && styles.editBtnActive]}>
                {isEditingRealWeek ? '完成' : '修改当前周'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 5x5 周次矩阵 */}
          <View style={styles.gridContainer}>
            {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((week) => {
              const isRealThisWeek = week === realCurrentWeek;
              const isSelectedViewing = week === currentWeek && !isRealThisWeek;

              return (
                <TouchableOpacity
                  key={week}
                  style={[
                    styles.weekButton,
                    isRealThisWeek && styles.weekButtonCurrent,
                    isSelectedViewing && styles.weekButtonSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handlePressWeek(week)}
                >
                  <Text
                    style={[
                      styles.weekButtonText,
                      isRealThisWeek && styles.weekButtonTextCurrent,
                      isSelectedViewing && styles.weekButtonTextSelected,
                    ]}
                  >
                    {isRealThisWeek ? '本周' : week}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1D2129',
  },
  headerSubHint: {
    fontSize: 13,
    color: '#FF7D00',
    marginLeft: 6,
  },
  editBtnText: {
    fontSize: 15,
    color: '#4F86F7',
    fontWeight: '500',
  },
  editBtnActive: {
    color: '#00B42A',
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  weekButton: {
    width: '18%', // 5 列分布
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekButtonCurrent: {
    backgroundColor: '#4F86F7',
  },
  weekButtonSelected: {
    backgroundColor: '#E8F3FF',
    borderWidth: 1.5,
    borderColor: '#4F86F7',
  },
  weekButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D2129',
  },
  weekButtonTextCurrent: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  weekButtonTextSelected: {
    color: '#4F86F7',
    fontWeight: '600',
  },
});
