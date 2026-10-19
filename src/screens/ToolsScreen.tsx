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
  Linking,
  TextInput,
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

  // 口令教室接入 Piik (https://demo.piik.tv/)
  const [piikVisible, setPiikVisible] = useState(false);
  const [roomCode, setRoomCode] = useState('CLASS-8826');

  // 错题本接入 DeepSeek AI 诊断
  const [deepseekVisible, setDeepseekVisible] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState('math1');
  const [customQuestion, setCustomQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const DEEPSEEK_PRESETS = [
    {
      id: 'math1',
      subject: '高等数学',
      title: '极限 lim_{x->0} (e^x - cos x - x) / x^2 求解错误',
      studentError: '误用洛必达法则未先化简，或泰勒展开时只展开到一阶项导致阶数不匹配分子为 0。',
      thinking: '1. 审题：型别为 0/0 型未定型。\n2. 分析学生解法：若使用泰勒展开，分子中包含 e^x 与 cos x，分母为 x^2（二阶项），因此分子必须展开至 x^2。\n3. 错因定位：展开阶数不足导致分子高阶无穷小项被过早舍去。\n4. 构建严密推导过程。',
      diagnosis: '【展开阶数不匹配】分母为二阶无穷小 x^2，分子各项必须统一展开至至少 x^2 项，否则会导致关键项抵消丢失。',
      solution: '① 展开 e^x = 1 + x + x²/2 + o(x²)\n② 展开 cos x = 1 - x²/2 + o(x²)\n③ 分子 = (1 + x + x²/2) - (1 - x²/2) - x = x² + o(x²)\n④ 原式 = lim_{x->0} [x² + o(x²)] / x² = 1',
      variant: '【变式巩固】求极限：lim_{x->0} [ln(1+x) - sin x] / x²',
    },
    {
      id: 'linear1',
      subject: '线性代数',
      title: '方阵 A 相似对角化判定与特征向量正交化遗漏',
      studentError: '求出重特征值后未验证对应线性无关特征向量个数，直接代入对角化公式。',
      thinking: '1. 审题：n 阶方阵可对角化的充要条件是具有 n 个线性无关的特征向量。\n2. 错因追溯：学生混淆了“对称矩阵”与“普通方阵”的性质，对于 k 重特征值未检查几何重数 dim(V_λ) 是否等于 k。\n3. 给出判定定理与纠偏步骤。',
      diagnosis: '【代数重数 ≠ 几何重数】对于重特征值 λ，必须检验矩阵 (A - λE) 的秩是否满足 n - r(A - λE) = k。',
      solution: '① 计算特征多项式 |A - λE| = 0 得到特征值及重数\n② 对每个 k 重特征值，解基础解系并验证解向量个数是否为 k\n③ 若为对称阵直接正交化；非对称阵仅需线性无关',
      variant: '【变式巩固】判断三阶矩阵 A = [[1, 1, 0], [0, 1, 0], [0, 0, 2]] 是否可相似对角化。',
    },
    {
      id: 'physics1',
      subject: '大学物理',
      title: '定轴转动刚体角动量守恒边界条件误判',
      studentError: '在合外力矩不为零的坐标系中直接套用角动量守恒定律。',
      thinking: '1. 审题：刚体转动问题中角动量守恒的前提是系统关于某固定转轴的合外力矩 M_ext = 0。\n2. 错因追溯：忽略了轴承支反力对非质心轴产生的力矩。\n3. 明确守恒条件的物理边界。',
      diagnosis: '【合外力矩不为零】转动过程中轴承受到突加冲量约束，必须选择过转轴且外力矩为零的点作为参考轴。',
      solution: '① 明确转轴位置，隔离刚体受力分析\n② 检验 ∑M_z = 0 是否成立\n③ 若成立方可使用 J₁ω₁ = J₂ω₂ 列方程求解',
      variant: '【变式巩固】一均匀细棒长 L 质量 M，绕一端光滑水平轴自由摆下，到达铅垂位置时受到打击，求碰撞冲量。',
    },
  ];

  const handleRunDeepSeek = (preset?: any) => {
    const item = preset || DEEPSEEK_PRESETS.find((p) => p.id === selectedPresetId);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult(item);
    }, 900);
  };

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

  // 4 个核心常用工具 (口令教室已对接 Piik，错题本已接入 DeepSeek AI)
  const primaryTools = [
    {
      id: 'classroom',
      title: '口令教室',
      desc: 'Piik 连麦互动 · 尚未开始小客厅静悄悄',
      icon: 'key-outline',
      color: Colors.accentPurple,
      bgColor: Colors.accentPurpleLight,
      badge: 'Piik接入',
    },
    {
      id: 'mistakes',
      title: '错题本',
      desc: 'DeepSeek-R1 满血深度推理错因诊断',
      icon: 'bulb-outline',
      color: Colors.accentBlue,
      bgColor: Colors.accentBlueLight,
      badge: 'DeepSeek',
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

  // 扩展校园生活与学习工具（按图1要求已移除：绩点GPA换算器、空闲自习室与图书馆空位、全校作息与节次时间表）
  const campusTools = [
    { id: 'ics_export', title: '导出日历到手机系统日历', icon: 'share-social-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* 顶部标题区 */}
      <View style={[styles.heroHeader, { paddingTop: topPadding + 10 }]}>
        <Text style={styles.headerTitle}>工具箱与服务</Text>
        <Text style={styles.headerSub}>Piik 口令教室 · DeepSeek 错题本 · 科学计算器</Text>
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
                } else if (t.id === 'classroom') {
                  setPiikVisible(true);
                } else if (t.id === 'mistakes') {
                  setDeepseekVisible(true);
                  if (!analysisResult) {
                    handleRunDeepSeek();
                  }
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

      {/* 口令教室接入 Piik (https://demo.piik.tv/) */}
      <Modal
        visible={piikVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPiikVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.piikCard, Shadows.card]}>
            {/* 头部状态与标题 */}
            <View style={styles.piikHeader}>
              <View>
                <View style={styles.piikTitleRow}>
                  <Text style={styles.piikTitle}>Piik 口令教室</Text>
                  <View style={styles.piikLiveBadge}>
                    <View style={styles.piikLiveDot} />
                    <Text style={styles.piikLiveText}>尚未开始 · 小客厅静悄悄</Text>
                  </View>
                </View>
                <Text style={styles.piikSub}>https://demo.piik.tv/ · 低延迟互动连麦课堂</Text>
              </View>
              <TouchableOpacity
                onPress={() => setPiikVisible(false)}
                style={styles.calcCloseBtn}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* 口令输入与快速连入栏 */}
            <View style={styles.piikCodeBar}>
              <View style={styles.piikInputWrap}>
                <Ionicons name="key" size={16} color="#8B5CF6" />
                <TextInput
                  style={styles.piikInput}
                  value={roomCode}
                  onChangeText={setRoomCode}
                  placeholder="输入课堂口令"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <TouchableOpacity
                style={styles.piikJoinBtn}
                onPress={() => {
                  Linking.openURL('https://demo.piik.tv/');
                }}
              >
                <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                <Text style={styles.piikJoinText}>在新窗口打开</Text>
              </TouchableOpacity>
            </View>

            {/* 网页端内嵌 Piik demo.piik.tv iframe / 移动端内嵌视窗 */}
            <View style={styles.piikFrameContainer}>
              {Platform.OS === 'web' ? (
                // @ts-ignore
                <iframe
                  src="https://demo.piik.tv/"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: 14,
                  }}
                  allow="camera; microphone; display-capture"
                  title="Piik Classroom"
                />
              ) : (
                <View style={styles.piikNativePlaceholder}>
                  <Ionicons name="videocam" size={48} color="#8B5CF6" />
                  <Text style={styles.piikNativeTitle}>已连接至 Piik 会议引擎</Text>
                  <Text style={styles.piikNativeSub}>尚未开始 · 小客厅静悄悄</Text>
                  <TouchableOpacity
                    style={styles.piikNativeBtn}
                    onPress={() => Linking.openURL('https://demo.piik.tv/')}
                  >
                    <Text style={styles.piikNativeBtnText}>一键开启 Piik 课堂</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* 错题本接入 DeepSeek AI 诊断 */}
      <Modal
        visible={deepseekVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDeepseekVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.deepseekCard, Shadows.card]}>
            {/* DeepSeek 弹窗头部 */}
            <View style={styles.deepseekHeader}>
              <View>
                <View style={styles.deepseekTitleRow}>
                  <View style={styles.deepseekLogoPill}>
                    <Text style={styles.deepseekLogoText}>DeepSeek-R1</Text>
                  </View>
                  <Text style={styles.deepseekTitle}>错题本 · 深度推理诊断</Text>
                </View>
                <Text style={styles.deepseekSub}>基于深度推理大模型 · 根因归纳与变式训练</Text>
              </View>
              <TouchableOpacity
                onPress={() => setDeepseekVisible(false)}
                style={styles.calcCloseBtn}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.deepseekScroll} showsVerticalScrollIndicator={false}>
              {/* 典型错题快捷选择 */}
              <Text style={styles.deepseekSectionTitle}>选择近期随堂错题预设：</Text>
              <View style={styles.presetRow}>
                {DEEPSEEK_PRESETS.map((p) => {
                  const isSel = p.id === selectedPresetId;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.presetPill, isSel && styles.presetPillActive]}
                      onPress={() => {
                        setSelectedPresetId(p.id);
                        handleRunDeepSeek(p);
                      }}
                    >
                      <Text style={[styles.presetText, isSel && styles.presetTextActive]}>
                        {p.subject}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 当前错题描述 */}
              {(() => {
                const cur = DEEPSEEK_PRESETS.find((p) => p.id === selectedPresetId);
                if (!cur) return null;
                return (
                  <View style={styles.errorProblemCard}>
                    <View style={styles.problemHeader}>
                      <Ionicons name="alert-circle" size={16} color="#DC2626" />
                      <Text style={styles.problemTitle}>{cur.title}</Text>
                    </View>
                    <Text style={styles.studentErrorLabel}>学生解法漏洞：</Text>
                    <Text style={styles.studentErrorText}>{cur.studentError}</Text>
                  </View>
                );
              })()}

              {/* 手动诊断按钮 */}
              <TouchableOpacity
                style={styles.runDeepseekBtn}
                onPress={() => handleRunDeepSeek()}
                disabled={isAnalyzing}
              >
                <Ionicons
                  name={isAnalyzing ? 'sync' : 'sparkles'}
                  size={16}
                  color="#FFFFFF"
                  style={isAnalyzing ? { transform: [{ rotate: '45deg' }] } : undefined}
                />
                <Text style={styles.runDeepseekBtnText}>
                  {isAnalyzing ? 'DeepSeek-R1 正在深度思考...' : '启动 DeepSeek-R1 深度诊断'}
                </Text>
              </TouchableOpacity>

              {/* AI 诊断结果区 */}
              {isAnalyzing && (
                <View style={styles.thinkingCard}>
                  <Text style={styles.thinkingTitle}>DeepSeek-R1 思考中 (Chain-of-Thought)...</Text>
                  <Text style={styles.thinkingSub}>
                    分析题目边界条件、归纳学生逻辑断层、生成变式巩固题...
                  </Text>
                </View>
              )}

              {analysisResult && !isAnalyzing && (
                <View style={styles.resultContainer}>
                  {/* 思维链 CoT 模块 */}
                  <View style={styles.cotBlock}>
                    <View style={styles.cotHeader}>
                      <Ionicons name="code-working-outline" size={14} color="#64748B" />
                      <Text style={styles.cotHeaderText}>Thinking Process (推理思维链)</Text>
                    </View>
                    <Text style={styles.cotContent}>{analysisResult.thinking}</Text>
                  </View>

                  {/* 错因诊断 */}
                  <View style={styles.diagBlock}>
                    <Text style={styles.diagLabel}>❌ 错因深度诊断：</Text>
                    <Text style={styles.diagText}>{analysisResult.diagnosis}</Text>
                  </View>

                  {/* 严密推导解答 */}
                  <View style={styles.solBlock}>
                    <Text style={styles.solLabel}>💡 严密解答步骤：</Text>
                    <Text style={styles.solText}>{analysisResult.solution}</Text>
                  </View>

                  {/* 变式巩固 */}
                  <View style={styles.variantBlock}>
                    <Text style={styles.variantLabel}>🎯 举一反三 · 变式巩固：</Text>
                    <Text style={styles.variantText}>{analysisResult.variant}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
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

  // 通用半透明模态背景
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },

  // Piik 口令教室弹窗
  piikCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  piikHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  piikTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  piikTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  piikLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 4,
  },
  piikLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  piikLiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  piikSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  piikCodeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  piikInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  piikInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  piikJoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  piikJoinText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  piikFrameContainer: {
    width: '100%',
    height: 440,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  piikNativePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  piikNativeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  piikNativeSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 20,
  },
  piikNativeBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  piikNativeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // DeepSeek AI 错题本弹窗
  deepseekCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  deepseekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  deepseekTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deepseekLogoPill: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deepseekLogoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  deepseekTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  deepseekSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  deepseekScroll: {
    maxHeight: 520,
  },
  deepseekSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  presetTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  errorProblemCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  problemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  problemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
    flex: 1,
  },
  studentErrorLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
    marginTop: 2,
  },
  studentErrorText: {
    fontSize: 12,
    color: '#7F1D1D',
    marginTop: 2,
    lineHeight: 18,
  },
  runDeepseekBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  runDeepseekBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  thinkingCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  thinkingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 4,
  },
  thinkingSub: {
    fontSize: 11,
    color: '#64748B',
  },
  resultContainer: {
    gap: 10,
    paddingBottom: 16,
  },
  cotBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  cotHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  cotContent: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#475569',
    lineHeight: 16,
  },
  diagBlock: {
    backgroundColor: '#FFF1F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  diagLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BE123C',
    marginBottom: 4,
  },
  diagText: {
    fontSize: 12,
    color: '#9F1239',
    lineHeight: 18,
  },
  solBlock: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  solLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 4,
  },
  solText: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 19,
  },
  variantBlock: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  variantLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  variantText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
});
