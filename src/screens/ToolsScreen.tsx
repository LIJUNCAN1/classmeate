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

  // 引导重新导入课程表向导状态（与课程表页完全一致的引导流程）
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importStep, setImportStep] = useState<'select' | 'scanning' | 'success'>('select');
  const [importProgress, setImportProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenImportModal = () => {
    setImportStep('select');
    setImportProgress(0);
    setImportModalVisible(true);
  };

  const handleStartImportFlow = () => {
    setImportStep('scanning');
    setImportProgress(20);

    setTimeout(() => setImportProgress(55), 400);
    setTimeout(() => setImportProgress(85), 900);
    setTimeout(() => {
      setImportProgress(100);
      setImportStep('success');
    }, 1400);
  };

  const handleFinishImport = () => {
    setImportModalVisible(false);
    setToastMessage('🎉 教务课表已重新引导导入，已对齐最新学期教学日历！');
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

  // 4 个核心常用工具 (按图1要求已移除图标右上角绿色角标与文字)
  const primaryTools = [
    {
      id: 'classroom',
      title: '口令教室',
      desc: 'Piik 连麦互动 · 尚未开始小客厅静悄悄',
      icon: 'key-outline',
      color: Colors.accentPurple,
      bgColor: Colors.accentPurpleLight,
    },
    {
      id: 'mistakes',
      title: '错题本',
      desc: 'DeepSeek-R1 满血深度推理错因诊断',
      icon: 'bulb-outline',
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
    },
    {
      id: 'import',
      title: '教务课表导入',
      desc: '高校教务课表一键识别同步',
      icon: 'sync-circle-outline',
      color: Colors.primary,
      bgColor: Colors.primaryLight,
    },
  ];

  // 扩展校园生活与学习工具（按图1要求已移除：绩点GPA换算器、空闲自习室与图书馆空位、全校作息与节次时间表）
  const campusTools = [
    { id: 'ics_export', title: '导出日历到手机系统日历', icon: 'share-social-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* 顶部生机草木绿流体区域（标准统一头部高度与坐标） */}
      <View style={[styles.heroHeader, { paddingTop: topPadding + 8 }]}>
        <View style={styles.headerTopBar}>
          <Text style={styles.screenMainTitle}>工具</Text>
        </View>
      </View>

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
                } else if (t.id === 'import') {
                  handleOpenImportModal();
                }
              }}
            >
              <View style={[styles.toolIconWrapper, { backgroundColor: t.bgColor }]}>
                <Ionicons name={t.icon as any} size={24} color={t.color} />
              </View>
              <View style={styles.toolTitleRow}>
                <Text style={styles.toolTitle}>{t.title}</Text>
                {t.id === 'import' && (
                  <TouchableOpacity
                    style={styles.cardImportPillBtn}
                    onPress={handleOpenImportModal}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="download-outline" size={12} color="#FFFFFF" />
                    <Text style={styles.cardImportPillText}>导入</Text>
                  </TouchableOpacity>
                )}
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

      {/* 重新导入课程表引导向导弹窗（与课程表页完全一致的引导流程） */}
      <Modal
        visible={importModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.importModalBackdrop}>
          <View style={[styles.importModalCard, Shadows.card]}>
            {/* 顶部标题与关闭 */}
            <View style={styles.importModalHeader}>
              <View>
                <Text style={styles.importModalTitle}>
                  {importStep === 'select'
                    ? '教务课程表智能引导导入'
                    : importStep === 'scanning'
                    ? '正在智能嗅探识别教务课表...'
                    : '🎉 课表重新导入完成！'}
                </Text>
                <Text style={styles.importModalSub}>
                  {importStep === 'select'
                    ? '支持高校教务免密自动识别 / 统一身份认证 / 课表文件'
                    : importStep === 'scanning'
                    ? '已建立安全连接，正在智能提取本学期排课数据'
                    : '已成功同步学期完整排课与知识库节次绑定'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setImportModalVisible(false)}
                style={styles.importCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* 步骤 1：选择导入来源与引导 */}
            {importStep === 'select' && (
              <View style={styles.importStepContent}>
                <View style={styles.importSourcesList}>
                  {/* 方式 1：高校教务系统一键识别 */}
                  <TouchableOpacity
                    style={[styles.importSourceCard, styles.importSourceCardActive]}
                    activeOpacity={0.8}
                    onPress={handleStartImportFlow}
                  >
                    <View style={[styles.importSourceIconWrap, { backgroundColor: '#F0FDF4' }]}>
                      <Ionicons name="school" size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.importSourceTextWrap}>
                      <View style={styles.importSourceTitleRow}>
                        <Text style={styles.importSourceTitle}>高校教务系统一键识别</Text>
                        <View style={styles.recommendTag}>
                          <Text style={styles.recommendTagText}>推荐</Text>
                        </View>
                      </View>
                      <Text style={styles.importSourceDesc}>
                        免密直连正方、强智、青果、树人等主流高校教务平台
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                  </TouchableOpacity>

                  {/* 方式 2：课表文件与截图识别 */}
                  <TouchableOpacity
                    style={styles.importSourceCard}
                    activeOpacity={0.8}
                    onPress={handleStartImportFlow}
                  >
                    <View style={[styles.importSourceIconWrap, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="document-attach" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.importSourceTextWrap}>
                      <Text style={styles.importSourceTitle}>导入 ICS 日历 / 课表文件</Text>
                      <Text style={styles.importSourceDesc}>
                        支持 Excel / CSV / ICS 日历格式及课表截图 OCR 解析
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                  </TouchableOpacity>

                  {/* 方式 3：统一身份认证登录 */}
                  <TouchableOpacity
                    style={styles.importSourceCard}
                    activeOpacity={0.8}
                    onPress={handleStartImportFlow}
                  >
                    <View style={[styles.importSourceIconWrap, { backgroundColor: '#FAF5FF' }]}>
                      <Ionicons name="key" size={24} color="#8B5CF6" />
                    </View>
                    <View style={styles.importSourceTextWrap}>
                      <Text style={styles.importSourceTitle}>统一身份认证授权登录</Text>
                      <Text style={styles.importSourceDesc}>
                        使用校园统一身份认证学号与密码安全对接
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.importStartBtn}
                  onPress={handleStartImportFlow}
                  activeOpacity={0.8}
                >
                  <Ionicons name="flash" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.importStartBtnText}>开始自动识别并导入</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 步骤 2：识别扫描中（进度条与流水线步骤） */}
            {importStep === 'scanning' && (
              <View style={styles.importScanningContent}>
                <View style={styles.scanningPulseWrap}>
                  <Ionicons name="sync" size={36} color={Colors.primary} />
                </View>

                {/* 进度条 */}
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${importProgress}%` }]} />
                </View>
                <Text style={styles.progressPercentText}>{importProgress}%</Text>

                {/* 步骤校验 */}
                <View style={styles.scanChecklist}>
                  <View style={styles.checkItem}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                    <Text style={styles.checkItemText}>已建立教务网关安全握手通道</Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Ionicons
                      name={importProgress >= 55 ? 'checkmark-circle' : 'ellipsis-horizontal-circle'}
                      size={16}
                      color={importProgress >= 55 ? Colors.primary : '#94A3B8'}
                    />
                    <Text style={styles.checkItemText}>检索 2025-2026 夏学期周历排课数据</Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Ionicons
                      name={importProgress >= 85 ? 'checkmark-circle' : 'ellipsis-horizontal-circle'}
                      size={16}
                      color={importProgress >= 85 ? Colors.primary : '#94A3B8'}
                    />
                    <Text style={styles.checkItemText}>匹配教室地点、任课教师与节次作息</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 步骤 3：导入成功结果展示 */}
            {importStep === 'success' && (
              <View style={styles.importSuccessContent}>
                <View style={styles.successIconBadge}>
                  <Ionicons name="checkmark-done" size={28} color="#FFFFFF" />
                </View>

                <Text style={styles.successHeading}>本学期课程已成功全量导入！</Text>
                <Text style={styles.successDetailText}>
                  共更新 8 门学期课程 · 教学日历与节次时间均已精准对齐
                </Text>

                <ScrollView style={styles.importedCoursesPreview} showsVerticalScrollIndicator={false}>
                  {IMPORTED_COURSES_SAMPLE.map((c) => (
                    <View key={c.id} style={styles.previewCourseRow}>
                      <View style={styles.previewCourseLeft}>
                        <Text style={styles.previewCourseName}>{c.name}</Text>
                        <Text style={styles.previewCourseMeta}>
                          {c.teacher} · @ {c.location}
                        </Text>
                      </View>
                      <View style={styles.previewTag}>
                        <Text style={styles.previewTagText}>{c.startTime}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={styles.importFinishActionBtn}
                  onPress={handleFinishImport}
                  activeOpacity={0.8}
                >
                  <Text style={styles.importFinishActionText}>立即应用并查看课表</Text>
                </TouchableOpacity>
              </View>
            )}
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
  toolIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
});
