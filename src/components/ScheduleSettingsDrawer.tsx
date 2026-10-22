import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Colors, Rounded } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { NonCurrentWeekMode } from '../services/scheduleStorage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 360);

interface ScheduleSettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
  currentMode: NonCurrentWeekMode;
  onModeChange: (mode: NonCurrentWeekMode) => void;
  semesterName?: string;
  onOpenScanQr?: () => void;
  onReimport?: () => void;
}

export const ScheduleSettingsDrawer: React.FC<ScheduleSettingsDrawerProps> = ({
  visible,
  onClose,
  currentMode,
  onModeChange,
  semesterName,
  onOpenScanQr,
  onReimport,
}) => {
  // 抽屉展开平移动画与遮罩淡入动效
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(-DRAWER_WIDTH);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 75,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      if (callback) {
        callback();
      }
    });
  };

  // 用户要求：
  // 1. 去掉说明只需要标题
  // 2. 去掉（默认推荐）
  // 3. 去掉图2图3效果的tag
  const options: {
    mode: NonCurrentWeekMode;
    title: string;
    icon: string;
  }[] = [
    {
      mode: 'hide',
      title: '非本周课不显示',
      icon: 'eye-off-outline',
    },
    {
      mode: 'stacked',
      title: '叠放与标签显示',
      icon: 'layers-outline',
    },
    {
      mode: 'transparent',
      title: '显示但透明 50%',
      icon: 'contrast-outline',
    },
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => handleClose()}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => handleClose()}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.drawerContainer,
            {
              width: DRAWER_WIDTH,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* 抽屉头部：用户要求去掉左上角标题icon，并在学期位置改成CTA加一个+功能是重新导入课程表 */}
          <View style={styles.drawerHeader}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.drawerTitle}>课程表显示设置</Text>
              <TouchableOpacity
                style={styles.reimportCtaBtn}
                onPress={() => {
                  handleClose(() => {
                    onReimport?.();
                  });
                }}
                activeOpacity={0.75}
              >
                <Ionicons name="add" size={15} color={Colors.primary} style={{ marginRight: 2 }} />
                <Text style={styles.reimportCtaBtnText}>重新导入课程表</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => handleClose()} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.drawerBody} showsVerticalScrollIndicator={false}>
            {/* 非本周课显示方式设置区块 */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>非本周课程显示方式</Text>
            </View>

            <View style={styles.optionsList}>
              {options.map((opt) => {
                const isSelected = currentMode === opt.mode;
                return (
                  <TouchableOpacity
                    key={opt.mode}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => {
                      onModeChange(opt.mode);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionTopRow}>
                      <View style={styles.optionTitleGroup}>
                        <View
                          style={[
                            styles.optionIconCircle,
                            isSelected && styles.optionIconCircleSelected,
                          ]}
                        >
                          <Ionicons
                            name={opt.icon as any}
                            size={18}
                            color={isSelected ? '#FFFFFF' : Colors.textSecondary}
                          />
                        </View>
                        <Text
                          style={[
                            styles.optionTitle,
                            isSelected && styles.optionTitleSelected,
                          ]}
                        >
                          {opt.title}
                        </Text>
                      </View>

                      {/* 单选按钮圆圈 */}
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 扫码导入快捷入口 */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>快捷工具与课表同步</Text>
            </View>

            <TouchableOpacity
              style={styles.scanQrActionCard}
              onPress={() => {
                handleClose(() => {
                  onOpenScanQr?.();
                });
              }}
              activeOpacity={0.8}
            >
              <View style={styles.scanQrIconWrap}>
                <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.scanQrTitle}>扫码导入同学课表</Text>
                <Text style={styles.scanQrSub}>对准同学展示的课表二维码同步全套课程</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </ScrollView>

          {/* 抽屉底部确定按钮 */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => handleClose()} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>完成并保存</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  drawerContainer: {
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  drawerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  reimportCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: '#EDFAEF',
    borderRadius: Rounded.pill,
    borderWidth: 1,
    borderColor: '#A6F4C5',
  },
  reimportCtaBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  optionCardSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: Colors.primary,
  },
  optionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optionIconCircleSelected: {
    backgroundColor: Colors.primary,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  optionTitleSelected: {
    color: Colors.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginLeft: 8,
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  scanQrActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scanQrIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanQrTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scanQrSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
