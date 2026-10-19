import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { POPULAR_JW_PRESETS, MOCK_IMPORTED_COURSES } from '../services/jwParser';
import { Course } from '../types/schedule';

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImportSuccess: (importedCourses: Course[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  visible,
  onClose,
  onImportSuccess,
}) => {
  const [selectedPreset, setSelectedPreset] = useState('zf');
  const [isImporting, setIsImporting] = useState(false);

  const handleRunMockImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      onImportSuccess(MOCK_IMPORTED_COURSES);
      onClose();
    }, 800);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.sheetContainer, Shadows.modal]}>
          {/* 模态把手条 */}
          <View style={styles.sheetHandle} />

          {/* 标题栏 */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>教务系统课程表导入</Text>
              <Text style={styles.subtitle}>
                通过内置安全 WebView 直连学校教务，免账号密码上传
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* 实现原理与工作流程卡片 */}
            <View style={styles.flowCard}>
              <Text style={styles.flowCardTitle}>⚡ 导入实现原理与三大保障：</Text>
              <View style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>1</Text>
                </View>
                <Text style={styles.stepDesc}>
                  <Text style={styles.boldText}>安全免密登录</Text>：在原生内嵌 WebView 打开学校官方登录页，用户自行输入验证码/人脸识别，App 绝不截获或储存账号密码。
                </Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>2</Text>
                </View>
                <Text style={styles.stepDesc}>
                  <Text style={styles.boldText}>DOM 智能解析</Text>：页面跳转至课表后，App 自动注入轻量 Parser 脚本提取表格数据（周次/节次/地点/教师）。
                </Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>3</Text>
                </View>
                <Text style={styles.stepDesc}>
                  <Text style={styles.boldText}>双向绑定笔记</Text>：导入后自动为每门课程建立知识库时间轴索引，随堂一键挂载笔记。
                </Text>
              </View>
            </View>

            {/* 教务系统预设选择 */}
            <Text style={styles.sectionLabel}>选择高校教务系统类型：</Text>
            {POPULAR_JW_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPreset;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.presetItem,
                    isSelected && styles.presetItemSelected,
                  ]}
                  onPress={() => setSelectedPreset(preset.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.presetLeft}>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.presetName}>{preset.name}</Text>
                      <Text style={styles.presetDesc}>{preset.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 底部操作按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.primaryBtn, isImporting && { opacity: 0.7 }]}
              onPress={handleRunMockImport}
              disabled={isImporting}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isImporting ? 'hourglass-outline' : 'cloud-download'}
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.primaryBtnText}>
                {isImporting ? '正在同步教务课表...' : '一键模拟导入测试课表'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  flowCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Rounded.lg,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  flowCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  stepNum: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 1,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  stepDesc: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surface,
    marginBottom: 8,
  },
  presetItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  presetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  presetName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  presetDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Rounded.pill,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
