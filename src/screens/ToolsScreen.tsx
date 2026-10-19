import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  Modal,
  Animated,
} from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ToolsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44
  );

  // 页面向下出现的平滑与生长动效 (translateY + scale + opacity)
  const dropAnim = useRef(new Animated.Value(-24)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dropAnim.setValue(-24);
    scaleAnim.setValue(0.96);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.spring(dropAnim, {
        toValue: 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 科学计算器弹窗与计算逻辑
  const [calcVisible, setCalcVisible] = useState(false);
  const [calcExpression, setCalcExpression] = useState('');
  const [calcResult, setCalcResult] = useState('0');

  const handleCalcInput = (btn: string) => {
    if (btn === 'C') {
      setCalcExpression('');
      setCalcResult('0');
      return;
    }
    if (btn === '⌫') {
      setCalcExpression((prev) => prev.slice(0, -1));
      return;
    }
    if (btn === '=') {
      try {
        // 安全表达式求值
        const sanitized = calcExpression
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/√\(/g, 'Math.sqrt(')
          .replace(/\^/g, '**');

        // eslint-disable-next-line no-eval
        const res = Function(`"use strict"; return (${sanitized})`)();
        if (typeof res === 'number' && !isNaN(res)) {
          setCalcResult(String(Number(res.toFixed(6))));
        } else {
          setCalcResult('Error');
        }
      } catch (e) {
        setCalcResult('Error');
      }
      return;
    }

    if (['sin', 'cos', 'tan', '√'].includes(btn)) {
      setCalcExpression((prev) => prev + btn + '(');
    } else {
      setCalcExpression((prev) => prev + btn);
    }
  };

  // 4 个核心常用工具 (已将“学力测评”按要求升级为“科学计算器”)
  const primaryTools = [
    {
      id: 'classroom',
      title: '口令教室',
      desc: '输入课堂口令秒进会议与互动',
      icon: 'key-outline',
      color: Colors.accentPurple,
      bgColor: Colors.accentPurpleLight,
    },
    {
      id: 'mistakes',
      title: '错题本',
      desc: '随堂错题拍照与AI解析归纳',
      icon: 'book-outline',
      color: Colors.accentBlue,
      bgColor: Colors.accentBlueLight,
    },
    {
      id: 'calculator',
      title: '科学计算器',
      desc: '三角函数/方根/微积分高级运算',
      icon: 'calculator-outline',
      color: Colors.accentAmber,
      bgColor: Colors.accentAmberLight,
      badge: '随堂利器',
    },
    {
      id: 'import',
      title: '教务课表导入',
      desc: '高校教务课表一键识别同步',
      icon: 'sync-circle-outline',
      color: Colors.primary,
      bgColor: Colors.primaryLight,
      badge: '已对接',
    },
  ];

  // 扩展校园生活与学习工具
  const campusTools = [
    { id: 'gpa', title: '绩点GPA换算器', icon: 'ribbon-outline' },
    { id: 'rooms', title: '空闲自习室与图书馆空位', icon: 'business-outline' },
    { id: 'schedule_setting', title: '全校作息与节次时间表', icon: 'alarm-outline' },
    { id: 'ics_export', title: '导出日历到手机系统日历', icon: 'share-social-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* 顶部标题区 */}
      <View style={[styles.heroHeader, { paddingTop: topPadding + 10 }]}>
        <Text style={styles.headerTitle}>工具箱与服务</Text>
        <Text style={styles.headerSub}>随堂计算器、错题本与校园效率工具</Text>
      </View>

      {/* 核心内容区（带向下的生长动效） */}
      <Animated.ScrollView
        style={[
          styles.scrollArea,
          {
            opacity: fadeAnim,
            transform: [{ translateY: dropAnim }, { scale: scaleAnim }],
          },
        ]}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 常用工具网格 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>核心常用工具</Text>
        </View>

        <View style={styles.toolGrid}>
          {primaryTools.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.toolCard, Shadows.card]}
              activeOpacity={0.7}
              onPress={() => {
                if (t.id === 'calculator') {
                  setCalcVisible(true);
                }
              }}
            >
              <View style={[styles.toolIconWrapper, { backgroundColor: t.bgColor }]}>
                <Ionicons name={t.icon as any} size={24} color={t.color} />
                {t.badge && (
                  <View style={styles.toolBadge}>
                    <Text style={styles.toolBadgeText}>{t.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.toolTitle}>{t.title}</Text>
              <Text style={styles.toolDesc} numberOfLines={2}>
                {t.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 更多校园实用工具 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>校园学习工具</Text>
        </View>

        <View style={[styles.listCard, Shadows.card]}>
          {campusTools.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.listItem,
                idx < campusTools.length - 1 && styles.listItemBorder,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.listItemLeft}>
                <Ionicons name={item.icon as any} size={20} color={Colors.textSecondary} />
                <Text style={styles.listItemTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.ScrollView>

      {/* 科学计算器弹窗交互 */}
      <Modal
        visible={calcVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCalcVisible(false)}
      >
        <View style={styles.calcModalBackdrop}>
          <View style={[styles.calcCard, Shadows.card]}>
            {/* 计算器头部 */}
            <View style={styles.calcHeader}>
              <View style={styles.calcTitleRow}>
                <Ionicons name="calculator" size={18} color={Colors.primary} />
                <Text style={styles.calcTitle}>科学计算器 · 随堂利器</Text>
              </View>
              <TouchableOpacity
                onPress={() => setCalcVisible(false)}
                style={styles.calcCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* 计算器显示屏 */}
            <View style={styles.calcScreen}>
              <Text style={styles.calcExprText} numberOfLines={2}>
                {calcExpression || '0'}
              </Text>
              <Text style={styles.calcResultText} numberOfLines={1}>
                = {calcResult}
              </Text>
            </View>

            {/* 科学计算键盘 */}
            <View style={styles.calcKeypad}>
              {[
                ['sin', 'cos', 'tan', 'C', '⌫'],
                ['√', '^', '(', ')', '÷'],
                ['7', '8', '9', '×', 'π'],
                ['4', '5', '6', '-', 'e'],
                ['1', '2', '3', '+', '='],
                ['0', '.', '%', 'Ans', 'Rad'],
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.calcRow}>
                  {row.map((btn) => {
                    const isOp = ['÷', '×', '-', '+', '='].includes(btn);
                    const isFunc = ['sin', 'cos', 'tan', '√', '^', 'C', '⌫', 'π', 'e'].includes(btn);
                    const isEquals = btn === '=';

                    return (
                      <TouchableOpacity
                        key={btn}
                        style={[
                          styles.calcBtn,
                          isFunc && styles.calcBtnFunc,
                          isOp && styles.calcBtnOp,
                          isEquals && styles.calcBtnEquals,
                        ]}
                        onPress={() => handleCalcInput(btn)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.calcBtnText,
                            isFunc && styles.calcBtnTextFunc,
                            isOp && styles.calcBtnTextOp,
                            isEquals && styles.calcBtnTextEquals,
                          ]}
                        >
                          {btn}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroHeader: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 4,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  toolIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  toolBadge: {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Rounded.pill,
  },
  toolBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  toolDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.xl,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  listItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // 科学计算器弹窗
  calcModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  calcCard: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
  },
  calcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calcTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calcTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  calcCloseBtn: {
    padding: 4,
  },
  calcScreen: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-end',
    marginBottom: 16,
    minHeight: 84,
    justifyContent: 'center',
  },
  calcExprText: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 6,
  },
  calcResultText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: -0.5,
  },
  calcKeypad: {
    gap: 8,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  calcBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcBtnFunc: {
    backgroundColor: '#475569',
  },
  calcBtnOp: {
    backgroundColor: '#F59E0B',
  },
  calcBtnEquals: {
    backgroundColor: Colors.primary,
  },
  calcBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  calcBtnTextFunc: {
    fontSize: 13,
    color: '#E2E8F0',
  },
  calcBtnTextOp: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  calcBtnTextEquals: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
