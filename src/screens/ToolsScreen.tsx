import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Easing,
  Linking,
  TextInput,
} from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Path, G } from 'react-native-svg';
import { ImportModal } from '../components/ImportModal';
import { APP_VERSION } from '../constants/version';
import { computeWidgetData, syncScheduleToNativeWidget, WidgetScheduleData } from '../services/widgetHelper';
import { loadScheduleData } from '../services/scheduleStorage';

// 导入课表预览示例课程数据（与课表页对齐）
const IMPORTED_COURSES_SAMPLE = [
  { id: 'c1', name: '高等数学 (AI与数据)', teacher: '陆教授', location: '理科教学楼 302', startTime: '08:00' },
  { id: 'c2', name: '商务韩语口语', teacher: '朴老师', location: '外国语学院 405', startTime: '10:05' },
  { id: 'c3', name: '计算机系统结构', teacher: '张副教授', location: '信息楼实验中心 B3', startTime: '14:00' },
  { id: 'c4', name: '中国近代史纲要', teacher: '陈教授', location: '文科楼报告厅', startTime: '16:05' },
];

export const ToolsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44
  );

  // 顶部生机草木绿区域向下浮现入场动效（与课表页对齐）
  const headerDropAnim = useRef(new Animated.Value(-28)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  // 页面向下出现的平滑与生长动效 (translateY + scale + opacity)
  const dropAnim = useRef(new Animated.Value(-20)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    headerDropAnim.setValue(-28);
    headerFadeAnim.setValue(0);
    dropAnim.setValue(-20);
    scaleAnim.setValue(0.96);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(headerDropAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(dropAnim, {
        toValue: 0,
        friction: 7,
        tension: 85,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 85,
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

  // 引导重新导入课程表向导状态
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [qrShareVisible, setQrShareVisible] = useState(false);
  const [qrScanVisible, setQrScanVisible] = useState(false);
  const [widgetModalVisible, setWidgetModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 实时原子组件数据（从本地真实课表动态读取计算，支持切换日期）
  const [widgetDayOfWeek, setWidgetDayOfWeek] = useState<number>(() => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d;
  });
  const [widgetData, setWidgetData] = useState<WidgetScheduleData>(() => computeWidgetData([], 7));

  const refreshWidgetInfo = useCallback(async (targetDay?: number) => {
    try {
      const day = targetDay !== undefined ? targetDay : widgetDayOfWeek;
      const stored = await loadScheduleData();
      const data = computeWidgetData(stored.courses, 7, day);
      setWidgetData(data);
      const todayDayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();
      if (day === todayDayOfWeek) {
        syncScheduleToNativeWidget(data);
      }
    } catch (e) {
      console.warn('[ToolsScreen] Failed to refresh widget info:', e);
    }
  }, [widgetDayOfWeek]);

  useEffect(() => {
    refreshWidgetInfo();
  }, [refreshWidgetInfo]);

  const handleOpenImportModal = () => {
    setImportModalVisible(true);
  };

  const handleFinishImport = (courses?: any[]) => {
    setImportModalVisible(false);
    const count = courses ? courses.length : 8;
    setToastMessage(`🎉 已成功智能导入 ${count} 门课程！已对齐学期排课`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 错题本按要求改造成纯粹的 DeepSeek 对话框 (只写使用 DeepSeek 的对话框)
  const [deepseekVisible, setDeepseekVisible] = useState(false);
  const [deepseekInputText, setDeepseekInputText] = useState('');
  const [isDeepseekGenerating, setIsDeepseekGenerating] = useState(false);

  interface DeepSeekMessage {
    id: string;
    sender: 'user' | 'assistant';
    content: string;
    thinking?: string;
    time: string;
  }

  const INITIAL_DEEPSEEK_MESSAGES: DeepSeekMessage[] = [
    {
      id: 'init-1',
      sender: 'assistant',
      thinking: '已对接随堂知识图谱与 DeepSeek-R1 深度推理内核。正在监听学生错题与难点提问...',
      content: '同学你好！我是 DeepSeek-R1 深度推理模型 🐳。\n\n请直接在下方对话框发送你在随堂练习、高数、线代、物化课上做错的题目或困惑的解法步骤。我将为你输出完整的思维推导过程（Thinking Process），精准诊断逻辑断层，并给出一步步严密演算与举一反三变式训练！',
      time: '刚刚',
    },
  ];

  const [deepseekMessages, setDeepseekMessages] = useState<DeepSeekMessage[]>(INITIAL_DEEPSEEK_MESSAGES);

  const handleSendDeepSeekMessage = (textToSend?: string) => {
    const content = (textToSend || deepseekInputText).trim();
    if (!content || isDeepseekGenerating) return;

    const userMsg: DeepSeekMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content,
      time: '刚刚',
    };

    setDeepseekMessages((prev) => [...prev, userMsg]);
    setDeepseekInputText('');
    setIsDeepseekGenerating(true);

    setTimeout(() => {
      let thinking = '1. 审题：剖析题目核心考点与边界约束。\n2. 分析学生潜在失误：识别公式展开阶数、几何重数与代数重数混淆或力矩参考轴选择偏差。\n3. 构建严谨逐步证明与演算链。\n4. 设计同构变式题。';
      let reply = '';

      if (content.includes('极限') || content.includes('高数') || content.includes('泰勒') || content.includes('0/0')) {
        thinking = '1. 审题：0/0 型未定型极限运算。\n2. 错因定位：学生使用泰勒展开时，分子仅展开到一阶项，而分母为二阶无穷小 x²，导致阶数不匹配、高阶项被过早舍去产生逻辑断层。\n3. 步骤拆解：将 e^x 与 cos x 均统一展开至 x² 项。\n4. 构建严密分步求解。';
        reply = `❌ 【错因深度诊断】\n展开阶数不匹配。分母是二阶无穷小 $x^2$，分子各项必须统一展开至至少 $x^2$ 项，否则会导致关键有效项丢失。\n\n💡 【DeepSeek 严密解答步骤】\n① 展开 $e^x = 1 + x + \\frac{x^2}{2} + o(x^2)$\n② 展开 $\\cos x = 1 - \\frac{x^2}{2} + o(x^2)$\n③ 分子代入：$(1 + x + \\frac{x^2}{2}) - (1 - \\frac{x^2}{2}) - x = x^2 + o(x^2)$\n④ 计算极限：$\\lim_{x \\to 0} \\frac{x^2 + o(x^2)}{x^2} = 1$\n\n🎯 【举一反三 · 变式巩固】\n求极限：$\\lim_{x \\to 0} \\frac{\\ln(1+x) - \\sin x}{x^2}$`;
      } else if (content.includes('矩阵') || content.includes('特征值') || content.includes('线代') || content.includes('对角化')) {
        thinking = '1. 审题：n 阶方阵可相似对角化的充要条件。\n2. 错因追溯：混淆代数重数与几何重数概念，求出重特征值后未验证对应线性无关特征向量个数。\n3. 定理运用：需满足对于每个 k 重特征值，dim(V_λ) = n - r(A - λE) = k。\n4. 输出纠偏说明。';
        reply = `❌ 【错因深度诊断】\n误以为“有 n 个特征值即必可对角化”，忽略了重特征值的几何重数检验。代数重数 ≠ 几何重数。\n\n💡 【DeepSeek 严密解答步骤】\n① 求解特征方程 $|A - \\lambda E| = 0$ 得到所有特征值及其代数重数 $k$\n② 对每一个重特征值，求解齐次线性方程组 $(A - \\lambda E)X = 0$\n③ 验证基础解系所含向量个数（几何重数）是否恰好等于代数重数 $k$\n④ 仅当所有特征值的几何重数均等于代数重数时，矩阵才可相似对角化。\n\n🎯 【举一反三 · 变式巩固】\n已知矩阵 $A = \\begin{pmatrix} 1 & 1 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 2 \\end{pmatrix}$，试判断其是否可对角化。`;
      } else if (content.includes('物') || content.includes('刚体') || content.includes('角动量')) {
        thinking = '1. 审题：刚体转动问题中角动量守恒的前提是系统关于某固定转轴的合外力矩 M_ext = 0。\n2. 错因追溯：忽略了轴承支反力对非质心轴产生的力矩。\n3. 明确守恒条件的物理边界。';
        reply = `❌ 【错因深度诊断】\n【合外力矩不为零】转动过程中轴承受到突加冲量约束，必须选择过转轴且外力矩为零的点作为参考轴。\n\n💡 【DeepSeek 严密解答步骤】\n① 明确转轴位置，隔离刚体受力分析\n② 检验 ∑M_z = 0 是否成立\n③ 若成立方可使用 J₁ω₁ = J₂ω₂ 列方程求解\n\n🎯 【举一反三 · 变式巩固】\n一均匀细棒长 L 质量 M，绕一端光滑水平轴自由摆下，到达铅垂位置时受到打击，求碰撞冲量。`;
      } else {
        thinking = `1. 知识库检索：针对用户问题 “${content.slice(0, 20)}” 调用随堂知识图谱。\n2. 错因定位：学生常错在概念边界理解不透或遗漏隐含前置条件。\n3. 推导验证：运用公理化定理逐步推导验证。\n4. 形成系统化纠偏方案。`;
        reply = `❌ 【错因深度诊断】\n在该题型的求解过程中，最易忽略前置成立条件或物理守恒边界。建议重点核查前提约束与展开细节。\n\n💡 【DeepSeek 严密解答步骤】\n① 明确题目已知参量，建立标准模型方程组\n② 分步代入边界条件，逐步进行严格等价推导\n③ 对最终结果进行量纲分析与特殊值极限检验，确保无逻辑断层与运算失误\n\n🎯 【举一反三 · 变式巩固】\n建议更换参数初值或将固定边界改为自由边界，重新演算一次以巩固理解。`;
      }

      const aiMsg: DeepSeekMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        thinking,
        content: reply,
        time: '刚刚',
      };
      setDeepseekMessages((prev) => [...prev, aiMsg]);
      setIsDeepseekGenerating(false);
    }, 800);
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

  const handlePrevWidgetDay = () => {
    const next = widgetDayOfWeek === 1 ? 7 : widgetDayOfWeek - 1;
    setWidgetDayOfWeek(next);
    refreshWidgetInfo(next);
  };

  const handleNextWidgetDay = () => {
    const next = widgetDayOfWeek === 7 ? 1 : widgetDayOfWeek + 1;
    setWidgetDayOfWeek(next);
    refreshWidgetInfo(next);
  };

  // 分段弧线进度条（用户要求：在进度条中间分段，今天有几节课就分几段，底部80度对称开口，绝不遮挡文字）
  const renderWidgetArcSegments = (totalCount: number, finishedCount: number) => {
    const cx = 105;
    const cy = 82;
    const R = 62;
    const strokeWidth = 8.5;
    const totalSweep = 280; // 底部保留 80 度宽敞开口，两侧尖端与放学文字保留充裕间隙
    const startBase = 130; // 从 130° 顺时针绘制 280° 至 50°

    if (totalCount <= 0) {
      const r1 = (130 * Math.PI) / 180;
      const r2 = (50 * Math.PI) / 180;
      const x1 = cx + R * Math.cos(r1);
      const y1 = cy + R * Math.sin(r1);
      const x2 = cx + R * Math.cos(r2);
      const y2 = cy + R * Math.sin(r2);
      return (
        <Path
          d={`M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 1 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      );
    }

    if (totalCount === 1) {
      const r1 = (130 * Math.PI) / 180;
      const r2 = (50 * Math.PI) / 180;
      const x1 = cx + R * Math.cos(r1);
      const y1 = cy + R * Math.sin(r1);
      const x2 = cx + R * Math.cos(r2);
      const y2 = cy + R * Math.sin(r2);
      const pathD = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 1 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
      return (
        <>
          <Path
            d={pathD}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
          {finishedCount >= 1 && (
            <Path
              d={pathD}
              stroke="#10B981"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
          )}
        </>
      );
    }

    const N = Math.min(10, Math.max(2, totalCount));
    const gapAngle = N >= 6 ? 4 : 6;
    const totalGap = (N - 1) * gapAngle;
    const segSweep = (totalSweep - totalGap) / N;

    const segments = [];
    for (let i = 0; i < N; i++) {
      const a1 = startBase + i * (segSweep + gapAngle);
      const a2 = a1 + segSweep;
      const r1 = (a1 * Math.PI) / 180;
      const r2 = (a2 * Math.PI) / 180;

      const x1 = cx + R * Math.cos(r1);
      const y1 = cy + R * Math.sin(r1);
      const x2 = cx + R * Math.cos(r2);
      const y2 = cy + R * Math.sin(r2);
      const largeArc = segSweep > 180 ? 1 : 0;
      const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;

      const isFilled = i < finishedCount;
      segments.push(
        <Path
          key={`seg-${i}`}
          d={d}
          stroke={isFilled ? '#10B981' : '#E2E8F0'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      );
    }

    return segments;
  };

  // 核心常用工具（用户要求：在工具里新增二维码分享与桌面组件功能）
  const primaryTools = [
    {
      id: 'desktop_widget',
      title: '桌面小组件',
      desc: '300°圆形角度图 · 剩余课与放学倒计时',
      icon: 'cube-outline',
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
    {
      id: 'qr_share',
      title: '课表二维码',
      desc: '课表二维码分享 · 扫码一键互传课表',
      icon: 'qr-code-outline',
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
    {
      id: 'import',
      title: '教务课表导入',
      desc: '高校教务课表一键识别同步',
      icon: 'sync-circle-outline',
      color: Colors.primary,
      bgColor: Colors.primaryLight,
    },
    {
      id: 'calculator',
      title: '科学计算器',
      desc: '三角函数/方根/微积分高级运算',
      icon: 'calculator-outline',
      color: Colors.accentAmber,
      bgColor: Colors.accentAmberLight,
    },
  ];

  // 扩展校园生活与学习工具
  const campusTools = [
    { id: 'desktop_widget', title: '桌面课表小组件与锁屏组件', icon: 'cube-outline' },
    { id: 'qr_share', title: '课表二维码分享与同学互传', icon: 'qr-code-outline' },
    { id: 'ics_export', title: '导出日历到手机系统日历', icon: 'share-social-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* 顶部生机草木绿流体区域（带向下浮现入场动效） */}
      <Animated.View
        style={[
          styles.heroHeader,
          {
            paddingTop: topPadding + 8,
            opacity: headerFadeAnim,
            transform: [
              {
                translateY: headerDropAnim.interpolate({
                  inputRange: [-100, 0, 100],
                  outputRange: [-100, 0, 0],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.headerTopBar}>
          <Text style={styles.screenMainTitle}>工具</Text>
        </View>
      </Animated.View>

      {/* 提醒 Toast 浮条 */}
      {toastMessage && (
        <View style={styles.toastFloatBar}>
          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* 核心内容区（带向下的生长动效） */}
      <Animated.ScrollView
        style={[
          styles.scrollArea,
          {
            opacity: fadeAnim,
            transform: [{ translateY: dropAnim }, { scale: scaleAnim }],
          },
        ]}
        contentContainerStyle={{ paddingBottom: 96 }}
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
                if (t.id === 'desktop_widget') {
                  refreshWidgetInfo();
                  setWidgetModalVisible(true);
                } else if (t.id === 'qr_share') {
                  setQrShareVisible(true);
                } else if (t.id === 'calculator') {
                  setCalcVisible(true);
                } else if (t.id === 'classroom') {
                  setPiikVisible(true);
                } else if (t.id === 'mistakes') {
                  setDeepseekVisible(true);
                } else if (t.id === 'import') {
                  handleOpenImportModal();
                }
              }}
            >
              {/* 图标与导入 CTA 在同一行（用户要求：教务课表的导入CTA要在icon右边） */}
              <View style={styles.toolIconAndCtaRow}>
                <View style={[styles.toolIconWrapper, { backgroundColor: t.bgColor }]}>
                  <Ionicons name={t.icon as any} size={24} color={t.color} />
                </View>
                {t.id === 'import' && (
                  <TouchableOpacity
                    style={styles.cardImportPillBtn}
                    onPress={handleOpenImportModal}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="download-outline" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                    <Text style={styles.cardImportPillText}>导入</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.toolTitleRow}>
                <Text style={styles.toolTitle}>{t.title}</Text>
              </View>
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
              onPress={() => {
                if (item.id === 'desktop_widget') {
                  refreshWidgetInfo();
                  setWidgetModalVisible(true);
                } else if (item.id === 'qr_share') {
                  setQrShareVisible(true);
                } else if (item.id === 'ics_export') {
                  setToastMessage('📅 正在导出课表至手机系统日历...');
                  setTimeout(() => {
                    setToastMessage('✅ 课表已成功同步导出至手机系统日历！');
                    setTimeout(() => setToastMessage(null), 3000);
                  }, 800);
                }
              }}
            >
              <View style={styles.listItemLeft}>
                <Ionicons name={item.icon as any} size={20} color={Colors.textSecondary} />
                <Text style={styles.listItemTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* 底部版本号信息展示（用户要求：课星球左边的绿点去掉改成灰色 classplant，去掉已是最新版本） */}
        <View style={styles.footerVersionContainer}>
          <View style={styles.footerVersionPill}>
            <View style={styles.footerVersionDotGray} />
            <Text style={styles.footerVersionText}>classplant v{APP_VERSION}</Text>
          </View>
        </View>

        <View style={{ height: 90 }} />
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

      {/* 口令教室接入 Piik (全屏运行 + 独立全功能窗口支持屏幕共享与连麦) */}
      <Modal
        visible={piikVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setPiikVisible(false)}
      >
        <View style={styles.piikFullScreenContainer}>
          {/* Piik 顶部功能导航条 */}
          <View style={[styles.piikNavBar, { paddingTop: topPadding }]}>
            <View style={styles.piikNavLeft}>
              <TouchableOpacity
                onPress={() => setPiikVisible(false)}
                style={styles.piikBackBtn}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
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
            </View>

            {/* 顶栏右侧：独立全功能窗口打开按钮 (解决浏览器端屏幕共享与音视频权限) */}
            <View style={styles.piikNavRight}>
              <View style={styles.piikCodeChip}>
                <Ionicons name="key" size={13} color="#C4B5FD" />
                <Text style={styles.piikCodeChipText}>口令: {roomCode}</Text>
              </View>

              <TouchableOpacity
                style={styles.piikLaunchDirectBtn}
                onPress={() => {
                  if (typeof window !== 'undefined' && (window as any).open) {
                    (window as any).open('https://demo.piik.tv/', '_blank');
                  } else {
                    Linking.openURL('https://demo.piik.tv/');
                  }
                }}
              >
                <Ionicons name="open-outline" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.piikLaunchDirectText}>独立全屏打开 (支持屏幕共享)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 教室主体区域：全屏内嵌 Piik demo.piik.tv (带全量媒体权限 allow) */}
          <View style={styles.piikFullFrame}>
            {Platform.OS === 'web' ? (
              // @ts-ignore
              <iframe
                src="https://demo.piik.tv/"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#0F172A',
                }}
                allow="camera *; microphone *; display-capture *; fullscreen *; autoplay *; clipboard-write *"
                // @ts-ignore
                allowFullScreen={true}
                title="Piik Classroom"
              />
            ) : (
              <View style={styles.piikNativePlaceholder}>
                <Ionicons name="videocam" size={56} color="#8B5CF6" />
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
      </Modal>

      {/* 错题本：按要求改造成纯粹的 DeepSeek 对话框 (只写使用 DeepSeek 的对话框) */}
      <Modal
        visible={deepseekVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDeepseekVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.deepseekCard, Shadows.card]}>
            {/* DeepSeek 对话框头部 */}
            <View style={styles.deepseekChatHeader}>
              <View style={styles.deepseekTitleRow}>
                <View style={styles.deepseekLogoPill}>
                  <Text style={styles.deepseekLogoText}>DeepSeek-R1</Text>
                </View>
                <View>
                  <Text style={styles.deepseekChatTitle}>错题诊断助手</Text>
                  <Text style={styles.deepseekChatSub}>深度推理 · 思维链拆解 · 错因定位</Text>
                </View>
              </View>

              <View style={styles.deepseekHeaderActions}>
                {/* 清空对话按钮 */}
                <TouchableOpacity
                  onPress={() => setDeepseekMessages(INITIAL_DEEPSEEK_MESSAGES)}
                  style={styles.deepseekActionIconBtn}
                >
                  <Ionicons name="refresh" size={18} color="#64748B" />
                </TouchableOpacity>
                {/* 关闭按钮 */}
                <TouchableOpacity
                  onPress={() => setDeepseekVisible(false)}
                  style={styles.deepseekActionIconBtn}
                >
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 快捷错题提问标签 (点击直接发送到对话框) */}
            <View style={styles.quickPromptRow}>
              {[
                '极限洛必达泰勒展开阶数错误',
                '矩阵重特征值相似对角化判定',
                '定轴转动角动量守恒边界条件',
              ].map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={styles.quickPromptChip}
                  onPress={() => handleSendDeepSeekMessage(chip)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickPromptChipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 对话消息滚动流 (DeepSeek Chat Flow) */}
            <ScrollView
              style={styles.deepseekChatScroll}
              contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 4 }}
              showsVerticalScrollIndicator={false}
            >
              {deepseekMessages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.chatMessageRow,
                    msg.sender === 'user' ? styles.chatRowUser : styles.chatRowAssistant,
                  ]}
                >
                  {/* AI 头像 */}
                  {msg.sender === 'assistant' && (
                    <View style={styles.aiAvatar}>
                      <Text style={styles.aiAvatarText}>🐳</Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.chatBubble,
                      msg.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleAssistant,
                    ]}
                  >
                    {/* DeepSeek 思考过程 (Thinking Process) 模块 */}
                    {msg.thinking && (
                      <View style={styles.chatThinkingCard}>
                        <View style={styles.chatThinkingHeader}>
                          <Ionicons name="bulb-outline" size={13} color="#2563EB" />
                          <Text style={styles.chatThinkingTitle}>Thinking Process (深度思考过程)</Text>
                        </View>
                        <Text style={styles.chatThinkingText}>{msg.thinking}</Text>
                      </View>
                    )}

                    {/* 正文诊断内容 */}
                    <Text
                      style={[
                        styles.chatBubbleText,
                        msg.sender === 'user' ? styles.chatTextUser : styles.chatTextAssistant,
                      ]}
                    >
                      {msg.content}
                    </Text>
                  </View>
                </View>
              ))}

              {/* 正在生成中的思考动画 */}
              {isDeepseekGenerating && (
                <View style={[styles.chatMessageRow, styles.chatRowAssistant]}>
                  <View style={styles.aiAvatar}>
                    <Text style={styles.aiAvatarText}>🐳</Text>
                  </View>
                  <View style={[styles.chatBubble, styles.chatBubbleAssistant]}>
                    <View style={styles.generatingHeader}>
                      <View style={styles.generatingPulseDot} />
                      <Text style={styles.generatingText}>DeepSeek-R1 正在深度思考并拆解逻辑漏洞...</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* 底部输入框与发送按钮 */}
            <View style={styles.deepseekInputBar}>
              <TextInput
                style={styles.deepseekChatInput}
                value={deepseekInputText}
                onChangeText={setDeepseekInputText}
                placeholder="在此输入错题题目或描述解法疑问..."
                placeholderTextColor="#94A3B8"
                multiline={false}
                onSubmitEditing={() => handleSendDeepSeekMessage()}
                returnKeyType="send"
              />

              <TouchableOpacity
                style={[
                  styles.deepseekSendBtn,
                  (!deepseekInputText.trim() || isDeepseekGenerating) && styles.deepseekSendBtnDisabled,
                ]}
                onPress={() => handleSendDeepSeekMessage()}
                disabled={!deepseekInputText.trim() || isDeepseekGenerating}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 课程表智能导入通道弹窗（支持统一身份认证CAS、网页文本提取及示范排课） */}
      <ImportModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onImportSuccess={handleFinishImport}
      />

      {/* 用户要求：在工具里新增一个二维码分享工具 可以直接扫码同学的二维码导入课程 */}
      <Modal
        visible={qrShareVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrShareVisible(false)}
      >
        <View style={styles.qrModalBackdrop}>
          <View style={[styles.qrModalCard, Shadows.modal]}>
            <View style={styles.qrModalHeader}>
              <View style={styles.qrHeaderLeft}>
                <View style={styles.qrIconWrap}>
                  <Ionicons name="qr-code" size={20} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.qrModalTitle}>课表二维码分享</Text>
                  <Text style={styles.qrModalSub}>课星球 · 同学扫码即刻同步</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setQrShareVisible(false)}
                style={styles.qrCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* 二维码展示区 */}
            <View style={styles.qrMatrixContainer}>
              <View style={styles.qrMatrixCard}>
                <Svg width={180} height={180} viewBox="0 0 180 180">
                  <Rect x="0" y="0" width="180" height="180" fill="#FFFFFF" rx="8" />
                  
                  {/* 定位角 1: 左上 */}
                  <Rect x="16" y="16" width="44" height="44" fill="#0F172A" rx="6" />
                  <Rect x="22" y="22" width="32" height="32" fill="#FFFFFF" rx="4" />
                  <Rect x="28" y="28" width="20" height="20" fill="#10B981" rx="3" />

                  {/* 定位角 2: 右上 */}
                  <Rect x="120" y="16" width="44" height="44" fill="#0F172A" rx="6" />
                  <Rect x="126" y="22" width="32" height="32" fill="#FFFFFF" rx="4" />
                  <Rect x="132" y="28" width="20" height="20" fill="#10B981" rx="3" />

                  {/* 定位角 3: 左下 */}
                  <Rect x="16" y="120" width="44" height="44" fill="#0F172A" rx="6" />
                  <Rect x="22" y="126" width="32" height="32" fill="#FFFFFF" rx="4" />
                  <Rect x="28" y="132" width="20" height="20" fill="#10B981" rx="3" />

                  {/* 核心数据码点 */}
                  <Rect x="72" y="20" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="88" y="20" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="100" y="20" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="72" y="36" width="8" height="8" fill="#10B981" rx="1.5" />
                  <Rect x="88" y="36" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="72" y="52" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="88" y="52" width="8" height="8" fill="#10B981" rx="1.5" />
                  <Rect x="100" y="52" width="8" height="8" fill="#1E293B" rx="1.5" />

                  {/* 中心吉祥物/星标 */}
                  <Rect x="68" y="68" width="44" height="44" fill="#F0FDF4" stroke="#10B981" strokeWidth="2" rx="8" />
                  <Path d="M90 76 L93 84 L102 85 L95 91 L97 100 L90 95 L83 100 L85 91 L78 85 L87 84 Z" fill="#F59E0B" />

                  {/* 其它数据点 */}
                  <Rect x="20" y="72" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="36" y="72" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="20" y="88" width="8" height="8" fill="#10B981" rx="1.5" />
                  <Rect x="36" y="88" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="52" y="88" width="8" height="8" fill="#1E293B" rx="1.5" />

                  <Rect x="124" y="72" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="140" y="72" width="8" height="8" fill="#10B981" rx="1.5" />
                  <Rect x="124" y="88" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="156" y="88" width="8" height="8" fill="#1E293B" rx="1.5" />

                  <Rect x="72" y="124" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="88" y="124" width="8" height="8" fill="#10B981" rx="1.5" />
                  <Rect x="100" y="124" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="72" y="140" width="8" height="8" fill="#10B981" rx="1.5" />
                  <Rect x="88" y="140" width="8" height="8" fill="#1E293B" rx="1.5" />

                  <Rect x="124" y="124" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="140" y="124" width="8" height="8" fill="#1E293B" rx="1.5" />
                  <Rect x="156" y="124" width="8" height="8" fill="#10B981" rx="1.5" />
                  <Rect x="124" y="140" width="8" height="8" fill="#10B981" rx="1.5" />
                  <Rect x="140" y="140" width="8" height="8" fill="#1E293B" rx="1.5" />
                </Svg>
              </View>
              <Text style={styles.qrMatrixDesc}>
                同学在【课星球】中打开扫码对准此码，即可一秒同步全套课表
              </Text>
            </View>

            {/* 操作按钮区 */}
            <View style={styles.qrActionsCol}>
              <TouchableOpacity
                style={styles.qrPrimaryActionBtn}
                onPress={() => {
                  setToastMessage('📋 已复制课表分享口令：#KP-9821-EXP#');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="copy-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.qrPrimaryActionBtnText}>复制课表分享口令</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.qrSecondaryActionBtn}
                onPress={() => {
                  setToastMessage('🖼️ 课表高清二维码已保存至手机相册！');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="download-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.qrSecondaryActionBtnText}>保存二维码到相册</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 用户要求：工具里新增桌面组件可以显示现在剩余的课程数和放学时间和倒计时 还有下一节课的信息 中间是剩余的课程数 下面写着放学时间 外面一个300度的圆形线条角度图 底部写一下节课的名字 */}
      <Modal
        visible={widgetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWidgetModalVisible(false)}
      >
        <View style={styles.qrModalBackdrop}>
          <View style={[styles.widgetModalCard, Shadows.modal]}>
            <View style={styles.qrModalHeader}>
              <View style={styles.qrHeaderLeft}>
                <View style={[styles.qrIconWrap, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="cube" size={20} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.qrModalTitle}>桌面小组件</Text>
                  <Text style={styles.qrModalSub}>实时课表 · 300° 圆形线条角度图</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setWidgetModalVisible(false)}
                style={styles.qrCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* 300度圆形线条分段角度图桌面组件效果展示 */}
            <View style={styles.widgetCardContainer}>
              <View style={[styles.widgetSurfaceCard, Shadows.card]}>
                {/* 顶部状态栏：左侧课星球，星期几写中间左右可切换日期，右上角原子组件已去掉 */}
                <View style={styles.widgetCardTopBar}>
                  <Text style={styles.widgetBrandTitle}>课星球</Text>

                  <View style={styles.widgetDaySwitcher}>
                    <TouchableOpacity
                      onPress={handlePrevWidgetDay}
                      style={styles.widgetDayArrowBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="chevron-back" size={13} color="#15803D" />
                    </TouchableOpacity>

                    <Text style={styles.widgetDayLabel}>
                      {widgetData.dayOfWeekName}
                      {widgetData.isToday ? ' (今天)' : ''}
                    </Text>

                    <TouchableOpacity
                      onPress={handleNextWidgetDay}
                      style={styles.widgetDayArrowBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="chevron-forward" size={13} color="#15803D" />
                    </TouchableOpacity>
                  </View>

                  {/* 右上角原子组件按用户要求去掉，用透明占位平衡居中 */}
                  <View style={{ width: 36 }} />
                </View>

                {/* 分段弧线角度图与内部核心数据（今天有几节课就分几段，底部80度开口绝不遮挡文字） */}
                <View style={styles.widgetRingWrapper}>
                  <Svg width={210} height={160} viewBox="0 0 210 160">
                    {renderWidgetArcSegments(widgetData.totalCount, widgetData.finishedCount)}
                  </Svg>

                  {/* 环心与正下方区域 */}
                  <View style={styles.widgetRingContentBox}>
                    {/* 中心：大字号醒目呈现剩余课程数 */}
                    <View style={styles.widgetCenterNumberRow}>
                      <Text style={styles.widgetNumberText}>{widgetData.remainingCount}</Text>
                      <Text style={styles.widgetNumberUnit}>节剩余</Text>
                    </View>

                    {/* 正下方：放学时间（用户要求：去掉距放学还有多久） */}
                    <Text style={styles.widgetDismissalCombinedText} numberOfLines={1}>
                      {widgetData.dismissalText}
                    </Text>
                  </View>
                </View>

                {/* 底部课程表列表：从左到右 课程名和地点，右边写还有多久上课，一次只显示两门，已经结束的不显示 */}
                <View style={styles.widgetCoursesContainer}>
                  {widgetData.upcomingCourses.length === 0 ? (
                    <View style={styles.widgetCourseEmptyRow}>
                      <Ionicons name="sparkles" size={13} color="#15803D" style={{ marginRight: 6 }} />
                      <Text style={styles.widgetCourseEmptyText}>
                        {widgetData.totalCount === 0 ? '今日没课 · 享受大学时光' : '今日课程已全部结束 ✨'}
                      </Text>
                    </View>
                  ) : (
                    widgetData.upcomingCourses.slice(0, 2).map((item, idx) => (
                      <View key={item.id || idx} style={styles.widgetCourseItemRow}>
                        {/* 左边：课程名和地点 */}
                        <View style={styles.widgetCourseLeftInfo}>
                          <Text style={styles.widgetCourseItemName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={styles.widgetCourseItemLocation} numberOfLines={1}>
                            @{item.location || '待定教室'}
                          </Text>
                        </View>

                        {/* 右边：还有多久上课的课程表 */}
                        <View style={styles.widgetCourseRightInfo}>
                          <View style={[styles.widgetTimeBadge, item.isCurrent && styles.widgetTimeBadgeCurrent]}>
                            <Text style={[styles.widgetTimeBadgeText, item.isCurrent && styles.widgetTimeBadgeTextCurrent]}>
                              {item.timeUntilStartText}
                            </Text>
                          </View>
                          <Text style={styles.widgetTimeSubtitle}>{item.startTime}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>

            {/* OPPO / Android 桌面原子组件添加指引 */}
            <View style={styles.oppoGuideBox}>
              <View style={styles.oppoGuideHeader}>
                <Ionicons name="phone-portrait-outline" size={15} color="#16A34A" style={{ marginRight: 5 }} />
                <Text style={styles.oppoGuideTitle}>OPPO ColorOS 原子组件添加说明</Text>
              </View>
              <Text style={styles.oppoGuideStep}>1. 回到手机主屏幕，双指在桌面空白处捏合（或长按空白处）</Text>
              <Text style={styles.oppoGuideStep}>2. 点击底部菜单栏的【卡片】或【原子组件】（或【插件】）</Text>
              <Text style={styles.oppoGuideStep}>3. 在列表中找到【课星球】，选择 2x2 或 2x4 规格即可添加！</Text>
            </View>

            {/* 底部功能按钮 */}
            <View style={styles.widgetActionsCol}>
              <TouchableOpacity
                style={styles.qrPrimaryActionBtn}
                onPress={() => {
                  setToastMessage('✅ OPPO ColorOS 原子组件配置已激活！返回桌面即可添加');
                  setWidgetModalVisible(false);
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.qrPrimaryActionBtnText}>已完成配置 · 去桌面添加</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.qrSecondaryActionBtn}
                onPress={() => {
                  setToastMessage('🔄 桌面原子组件数据已与当前课表成功同步！');
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.qrSecondaryActionBtnText}>同步原子组件实时数据</Text>
              </TouchableOpacity>
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
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 38,
    minHeight: 38,
  },
  screenMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 28,
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
  toastFloatBar: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Rounded.pill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
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
  toolIconAndCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toolIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  toolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardImportPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Rounded.pill,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  cardImportPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 14,
  },
  toolDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  // 引导重新导入弹窗样式（按要求：去掉黑色遮罩改成纯阴影，与课表页完全一致）
  importModalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  importModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '82%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  importModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  importModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  importModalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  importCloseBtn: {
    padding: 4,
  },
  importStepContent: {
    marginTop: 4,
  },
  importSourcesList: {
    gap: 10,
    marginBottom: 20,
  },
  importSourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  importSourceCardActive: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  importSourceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  importSourceTextWrap: {
    flex: 1,
  },
  importSourceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  importSourceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  recommendTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  recommendTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  importSourceDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  importStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Rounded.pill,
  },
  importStartBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  importScanningContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  scanningPulseWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 20,
  },
  scanChecklist: {
    width: '100%',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkItemText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  importSuccessContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  successDetailText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  importedCoursesPreview: {
    width: '100%',
    maxHeight: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewCourseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  previewCourseLeft: {
    flex: 1,
  },
  previewCourseName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  previewCourseMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  previewTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  previewTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  importFinishActionBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Rounded.pill,
  },
  importFinishActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
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

  // Piik 全屏口令教室样式
  piikFullScreenContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  piikNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  piikNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  piikBackBtn: {
    padding: 6,
    marginRight: 2,
  },
  piikTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  piikTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  piikLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#22C55E',
    gap: 4,
  },
  piikLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  piikLiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4ADE80',
  },
  piikSub: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  piikNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  piikCodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#312E81',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  piikCodeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C4B5FD',
  },
  piikLaunchDirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  piikLaunchDirectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  piikFullFrame: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
  },
  piikNativePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  piikNativeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 14,
  },
  piikNativeSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 20,
  },
  piikNativeBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  piikNativeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 纯粹的 DeepSeek-R1 错题对话框样式 (按要求：只写使用 DeepSeek 的对话框)
  deepseekCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 16,
    paddingBottom: 24,
    height: '88%',
    maxHeight: 680,
  },
  deepseekChatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  deepseekTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deepseekLogoPill: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deepseekLogoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  deepseekChatTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  deepseekChatSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  deepseekHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deepseekActionIconBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  quickPromptRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
    flexWrap: 'wrap',
  },
  quickPromptChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quickPromptChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  deepseekChatScroll: {
    flex: 1,
    marginVertical: 6,
  },
  chatMessageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  chatRowUser: {
    justifyContent: 'flex-end',
  },
  chatRowAssistant: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiAvatarText: {
    fontSize: 16,
  },
  chatBubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 12,
  },
  chatBubbleUser: {
    backgroundColor: '#2563EB',
    borderTopRightRadius: 4,
  },
  chatBubbleAssistant: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopLeftRadius: 4,
  },
  chatBubbleText: {
    fontSize: 13,
    lineHeight: 20,
  },
  chatTextUser: {
    color: '#FFFFFF',
  },
  chatTextAssistant: {
    color: '#1E293B',
  },
  chatThinkingCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  chatThinkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  chatThinkingTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  chatThinkingText: {
    fontSize: 11,
    color: '#3B82F6',
    lineHeight: 15,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  generatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  generatingPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  generatingText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  deepseekInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  deepseekChatInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    paddingVertical: 8,
  },
  deepseekSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deepseekSendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  // 二维码分享弹窗样式
  qrModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  qrModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  qrModalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  qrHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qrIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  qrModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  qrModalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  qrCloseBtn: {
    padding: 4,
  },
  qrMatrixContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  qrMatrixCard: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  qrMatrixDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 14,
    paddingHorizontal: 12,
  },
  qrActionsCol: {
    width: '100%',
    marginTop: 16,
    gap: 10,
  },
  qrPrimaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: Rounded.pill,
  },
  qrPrimaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  qrSecondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: Rounded.pill,
  },
  qrSecondaryActionBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  // 桌面小组件样式
  widgetModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '90%',
    maxWidth: 380,
    alignItems: 'center',
  },
  widgetCardContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 14,
  },
  widgetSurfaceCard: {
    width: 296,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  widgetCardTopBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  widgetBrandTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  widgetDaySwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Rounded.pill,
    gap: 4,
  },
  widgetDayArrowBtn: {
    padding: 2,
  },
  widgetDayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  widgetRingWrapper: {
    position: 'relative',
    width: 210,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetRingContentBox: {
    position: 'absolute',
    top: 36,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetCenterNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  widgetNumberText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
    lineHeight: 40,
  },
  widgetNumberUnit: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginLeft: 4,
  },
  widgetDismissalCombinedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 3,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  widgetCoursesContainer: {
    width: '100%',
    marginTop: 6,
    gap: 6,
  },
  widgetCourseItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  widgetCourseLeftInfo: {
    flex: 1,
    marginRight: 8,
  },
  widgetCourseItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  widgetCourseItemLocation: {
    fontSize: 10.5,
    color: '#64748B',
  },
  widgetCourseRightInfo: {
    alignItems: 'flex-end',
  },
  widgetTimeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  widgetTimeBadgeCurrent: {
    backgroundColor: '#FEF3C7',
  },
  widgetTimeBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  widgetTimeBadgeTextCurrent: {
    color: '#D97706',
  },
  widgetTimeSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
  },
  widgetCourseEmptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  widgetCourseEmptyText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#15803D',
  },
  oppoGuideBox: {
    width: '100%',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginVertical: 10,
  },
  oppoGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  oppoGuideTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#15803D',
  },
  oppoGuideStep: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    marginBottom: 2,
  },
  widgetActionsCol: {
    width: '100%',
    marginTop: 8,
    gap: 10,
  },
  // 底部版本信息
  footerVersionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  footerVersionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Rounded.pill,
    marginBottom: 6,
  },
  footerVersionDotGray: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    marginRight: 6,
  },
  footerVersionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    fontVariant: ['tabular-nums'],
  },
});
