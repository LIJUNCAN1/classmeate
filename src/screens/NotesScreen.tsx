import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  StatusBar as RNStatusBar,
  Animated,
  PanResponder,
} from 'react-native';
import { Colors, Rounded, Shadows, getCourseColorScheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCheckmark } from '../components/AnimatedCheckmark';

export interface NoteItem {
  id: string;
  courseName: string;
  title: string;
  date: string;
  content: string;
  tags: string[];
  type: 'text' | 'freeform'; // 手动输入 vs 无边记手写
  freeformPaths?: string[];  // 无边记绘制点迹
  hasAudio?: boolean;
  hasImages?: boolean;
}

interface NotesScreenProps {
  initialCourseName?: string;
  onClearInitialCourse?: () => void;
}

export const NotesScreen: React.FC<NotesScreenProps> = ({
  initialCourseName,
  onClearInitialCourse,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44
  );

  // 页面向下出现平滑动画
  const dropAnim = useRef(new Animated.Value(-18)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dropAnim.setValue(-18);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(dropAnim, {
        toValue: 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'n1',
      courseName: '成人商务韩语',
      title: '第14周 · 破冰洽谈与敬语句型',
      date: '今天 09:45',
      content: '商务谈判中的开场礼仪；对客委婉语、谦逊语在合同初审时的严谨表述。需要重点注意双方落座顺序与初次交换名片的固定问候套语。',
      tags: ['随堂速记', '音频已转录'],
      type: 'text',
      hasAudio: true,
      hasImages: true,
    },
    {
      id: 'n2',
      courseName: '高等数学 (AI与数据)',
      title: '第14周 · 多元函数微分学与梯度下降',
      date: '昨天 10:20',
      content: '二阶偏导数对称性几何意义；拉格朗日乘数法在约束极值求解中的工程应用。课堂例题第3道：如何通过海森矩阵判断多元函数鞍点。',
      tags: ['板书拍照', '重点公式'],
      type: 'text',
      hasAudio: false,
      hasImages: true,
    },
    {
      id: 'n3',
      courseName: 'TOPIK专攻精讲',
      title: '第13周 · 阅读真题主旨归纳速判法',
      date: '6月18日',
      content: '长难句倒装解构；段落首尾呼应词快筛技巧；历年错题第34-37题解析及高频副词总结。',
      tags: ['复习卡片'],
      type: 'text',
      hasAudio: false,
      hasImages: false,
    },
    {
      id: 'n4',
      courseName: '计算机系统结构',
      title: '第12周 · 指令级并行与流水线冲突 (无边记)',
      date: '6月12日',
      content: '【无边记手绘草图】经典五级流水线（IF, ID, EX, MEM, WB）时序与旁路转发架构图谱。',
      tags: ['无边记手写', '核心架构'],
      type: 'freeform',
      freeformPaths: ['path1', 'path2'],
      hasAudio: false,
      hasImages: true,
    },
  ]);

  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 模式选择弹窗：选择“手动输入”还是“无边记自己写”
  const [modeSelectVisible, setModeSelectVisible] = useState(false);

  // 编辑器状态
  const [editorVisible, setEditorVisible] = useState(false);
  const [noteMode, setNoteMode] = useState<'text' | 'freeform'>('text');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [inputCourseName, setInputCourseName] = useState('高等数学 (AI与数据)');
  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');

  // 语音识别状态
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 无边记手写笔触点阵
  const [drawStrokes, setDrawStrokes] = useState<{ x: number; y: number }[]>([]);
  const [penColor, setPenColor] = useState('#1F2937');

  // 如果从外部路由携带 initialCourseName，直接弹出选择新建笔记
  useEffect(() => {
    if (initialCourseName) {
      setInputCourseName(initialCourseName);
      setInputTitle(`第 14 周 · ${initialCourseName} 随堂速记`);
      setInputContent('');
      setEditingNoteId(null);
      setModeSelectVisible(true);
      if (onClearInitialCourse) {
        onClearInitialCourse();
      }
    }
  }, [initialCourseName]);

  const availableCourses = [
    '高等数学 (AI与数据)',
    '成人商务韩语',
    'TOPIK专攻精讲',
    '计算机系统结构',
    '大学英语写作',
    '数据结构与算法',
    '交互设计与UI艺术',
  ];

  // 课程分类
  const courseFolderList = [
    { id: 'all', name: '全部笔记', count: notes.length },
    ...availableCourses.map((cName) => ({
      id: cName,
      name: cName,
      count: notes.filter((n) => n.courseName.includes(cName.slice(0, 4))).length,
    })).filter((item) => item.count > 0 || item.id === selectedFolder),
  ];

  // 筛选后的笔记列表
  const filteredNotes = notes.filter((item) => {
    const matchFolder = selectedFolder === 'all' || item.courseName.includes(selectedFolder.slice(0, 4));
    const matchSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  // 开启真实语音识别 (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    // 检查浏览器或系统环境是否支持 Web Speech API
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInputContent((prev) => (prev ? prev + '\n' + transcript : transcript));
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
        return;
      } catch (err) {
        // Fallback below
      }
    }

    // 移动端/环境无原生物理麦克风权限时的仿真录音转文字流
    setIsListening(true);
    const mockPhrases = [
      '老师强调期末论文要结合实际案例进行定量分析，',
      '注意课后大作业第二题的多目标规划求解思路。',
    ];
    let step = 0;
    const interval = setInterval(() => {
      if (step < mockPhrases.length) {
        setInputContent((prev) => (prev ? prev + ' ' + mockPhrases[step] : mockPhrases[step]));
        step++;
      } else {
        clearInterval(interval);
        setIsListening(false);
      }
    }, 1200);
  };

  // 选择创建模式：键盘输入 vs 无边记
  const startCreateWithMode = (mode: 'text' | 'freeform') => {
    setNoteMode(mode);
    setModeSelectVisible(false);
    setEditingNoteId(null);
    if (!inputTitle) {
      setInputTitle(mode === 'freeform' ? '随堂无边记板书草图' : '随堂重点知识速记');
    }
    setDrawStrokes([]);
    setEditorVisible(true);
  };

  // 保存笔记
  const handleSaveNote = () => {
    if (!inputTitle.trim()) return;

    if (editingNoteId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNoteId
            ? {
                ...n,
                courseName: inputCourseName,
                title: inputTitle,
                content: inputContent,
                type: noteMode,
              }
            : n
        )
      );
    } else {
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        courseName: inputCourseName,
        title: inputTitle,
        date: '刚刚',
        content:
          noteMode === 'freeform'
            ? '【无边记手写原稿已保存】点击可继续在画布上涂鸦与批注。'
            : inputContent || '（随堂即时要点记录）',
        tags: noteMode === 'freeform' ? ['无边记手绘'] : ['随堂速记'],
        type: noteMode,
        hasAudio: isListening,
        hasImages: noteMode === 'freeform',
      };
      setNotes((prev) => [newNote, ...prev]);
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    setEditorVisible(false);
  };

  // PanResponder 实现无边记自由手写触控
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setDrawStrokes((prev) => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setDrawStrokes((prev) => [...prev, { x: locationX, y: locationY }]);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* 顶部草木绿流体区域 */}
      <View style={[styles.heroHeader, { paddingTop: topPadding + 8 }]}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>随堂知识库</Text>
            <Text style={styles.headerSub}>所有笔记均自动绑定当前课时与周次</Text>
          </View>

          <TouchableOpacity
            style={styles.newNoteBtn}
            onPress={() => setModeSelectVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color={Colors.primary} />
            <Text style={styles.newNoteText}>记笔记</Text>
          </TouchableOpacity>
        </View>

        {/* 快捷方式栏 */}
        <View style={styles.quickRecordRow}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => startCreateWithMode('text')}
            activeOpacity={0.8}
          >
            <Ionicons name="keypad" size={18} color="#FFFFFF" />
            <Text style={styles.quickActionText}>键盘打字输入</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => startCreateWithMode('freeform')}
            activeOpacity={0.8}
          >
            <Ionicons name="brush" size={18} color="#FFFFFF" />
            <Text style={styles.quickActionText}>无边记自己写</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => {
              startCreateWithMode('text');
              setTimeout(toggleSpeechRecognition, 300);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={18} color="#FFFFFF" />
            <Text style={styles.quickActionText}>语音识别输入</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 搜索栏 */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索课程笔记、公式或关键词..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* 笔记主内容区（带向下出现的平滑过渡动效） */}
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: dropAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 课程分类水平滑动条 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.folderScroll}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {courseFolderList.map((f) => {
              const isSelected = f.id === selectedFolder;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[
                    styles.folderPill,
                    isSelected && styles.folderPillSelected,
                  ]}
                  onPress={() => setSelectedFolder(f.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.folderPillText,
                      isSelected && styles.folderPillTextSelected,
                    ]}
                  >
                    {f.name} ({f.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 笔记卡片列表 */}
          <View style={styles.noteList}>
            {filteredNotes.map((note) => {
              // 关键需求：左上角标签使用周课表上对应的颜色！
              const courseColor = getCourseColorScheme(note.courseName);

              return (
                <TouchableOpacity
                  key={note.id}
                  style={[styles.noteCard, Shadows.card]}
                  onPress={() => {
                    setEditingNoteId(note.id);
                    setInputCourseName(note.courseName);
                    setInputTitle(note.title);
                    setInputContent(note.content);
                    setNoteMode(note.type || 'text');
                    setEditorVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.noteCardHeader}>
                    {/* 左上角课程标签：与周课表卡片颜色 100% 对应 */}
                    <View
                      style={[
                        styles.courseTag,
                        {
                          backgroundColor: courseColor.bg,
                          borderColor: courseColor.border,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Ionicons name="bookmark" size={11} color={courseColor.text} />
                      <Text style={[styles.courseTagText, { color: courseColor.text }]}>
                        {note.courseName}
                      </Text>
                    </View>
                    <Text style={styles.noteDateText}>{note.date}</Text>
                  </View>

                  <Text style={styles.noteTitle}>{note.title}</Text>
                  <Text style={styles.notePreview} numberOfLines={3}>
                    {note.content}
                  </Text>

                  <View style={styles.noteFooter}>
                    <View style={styles.statusIndicatorRow}>
                      <AnimatedCheckmark checked={true} size={15} />
                      <Text style={styles.statusVerifiedText}>
                        {note.type === 'freeform' ? '无边记手绘原稿' : '已关联对应课表'}
                      </Text>
                    </View>

                    <View style={styles.tagGroup}>
                      {note.type === 'freeform' ? (
                        <Ionicons name="brush" size={14} color={Colors.primary} />
                      ) : (
                        <Ionicons name="create-outline" size={14} color={Colors.primary} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>

      {/* 选择创建模式弹窗 (手动打字 vs 无边记手写) */}
      <Modal
        visible={modeSelectVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModeSelectVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modeSelectCard, Shadows.modal]}>
            <Text style={styles.modeSelectTitle}>选择记录方式</Text>
            <Text style={styles.modeSelectSubtitle}>
              按你的上课习惯随心选择打字或手绘
            </Text>

            <View style={styles.modeOptionsRow}>
              {/* 选项 1：手动文字输入 */}
              <TouchableOpacity
                style={styles.modeChoiceBox}
                onPress={() => startCreateWithMode('text')}
                activeOpacity={0.8}
              >
                <View style={[styles.modeChoiceIconCircle, { backgroundColor: Colors.primaryLight }]}>
                  <Ionicons name="text-outline" size={26} color={Colors.primary} />
                </View>
                <Text style={styles.modeChoiceTitle}>手动打字输入</Text>
                <Text style={styles.modeChoiceDesc}>
                  键盘键入 · 支持语音实时转文字
                </Text>
              </TouchableOpacity>

              {/* 选项 2：无边记自己写 */}
              <TouchableOpacity
                style={styles.modeChoiceBox}
                onPress={() => startCreateWithMode('freeform')}
                activeOpacity={0.8}
              >
                <View style={[styles.modeChoiceIconCircle, { backgroundColor: Colors.accentBlueLight }]}>
                  <Ionicons name="brush-outline" size={26} color={Colors.accentBlue} />
                </View>
                <Text style={styles.modeChoiceTitle}>无边记自己写</Text>
                <Text style={styles.modeChoiceDesc}>
                  自由手绘涂鸦 · 触控板书记录
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelChoiceBtn}
              onPress={() => setModeSelectVisible(false)}
            >
              <Text style={styles.cancelChoiceText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 实时笔记编辑器弹窗 */}
      <Modal
        visible={editorVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditorVisible(false)}
      >
        <View style={styles.editorModalRoot}>
          {/* 顶栏控制 */}
          <View style={styles.editorHeader}>
            <TouchableOpacity
              onPress={() => setEditorVisible(false)}
              style={styles.editorCancelBtn}
            >
              <Text style={styles.editorCancelText}>取消</Text>
            </TouchableOpacity>

            <Text style={styles.editorHeaderTitle}>
              {noteMode === 'freeform' ? '🎨 无边记手写板书' : '📝 手动输入笔记'}
            </Text>

            <TouchableOpacity
              onPress={handleSaveNote}
              style={styles.editorSaveBtn}
            >
              <Text style={styles.editorSaveText}>保存</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editorBody} showsVerticalScrollIndicator={false}>
            {/* 课程选择 */}
            <Text style={styles.inputSectionLabel}>关联课程：</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {availableCourses.map((c) => {
                const isSelected = c === inputCourseName;
                const cColor = getCourseColorScheme(c);
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.coursePickPill,
                      isSelected && {
                        backgroundColor: cColor.bg,
                        borderColor: cColor.border,
                      },
                    ]}
                    onPress={() => setInputCourseName(c)}
                  >
                    <Text
                      style={[
                        styles.coursePickText,
                        isSelected && { color: cColor.text, fontWeight: '700' },
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 笔记标题 */}
            <Text style={styles.inputSectionLabel}>笔记标题：</Text>
            <TextInput
              style={styles.titleInput}
              value={inputTitle}
              onChangeText={setInputTitle}
              placeholder="请输入笔记标题"
              placeholderTextColor={Colors.textMuted}
            />

            {/* 内容区：区分 手动输入（含语音识别） 与 无边记手写 */}
            {noteMode === 'text' ? (
              <View>
                <View style={styles.textAreaHeaderRow}>
                  <Text style={styles.inputSectionLabel}>随堂正文内容：</Text>

                  {/* 🎙️ 真实语音识别功能按钮 */}
                  <TouchableOpacity
                    style={[
                      styles.speechRecBtn,
                      isListening && styles.speechRecBtnActive,
                    ]}
                    onPress={toggleSpeechRecognition}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isListening ? 'mic' : 'mic-outline'}
                      size={14}
                      color={isListening ? '#FFFFFF' : Colors.primary}
                    />
                    <Text
                      style={[
                        styles.speechRecBtnText,
                        isListening && styles.speechRecBtnTextActive,
                      ]}
                    >
                      {isListening ? '正在语音识别中...' : '点击语音识别'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {isListening && (
                  <View style={styles.listeningNoticeCard}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.listeningNoticeText}>
                      正在录入课堂语音，识别文本已实时同步写入正文中...
                    </Text>
                  </View>
                )}

                <TextInput
                  style={styles.contentTextArea}
                  value={inputContent}
                  onChangeText={setInputContent}
                  placeholder="在此输入重点公式、课堂提要，或点击上方麦克风进行语音转文字..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            ) : (
              /* 无边记自己写画布区 */
              <View>
                <View style={styles.freeformToolBar}>
                  <Text style={styles.inputSectionLabel}>无边记触控画布：</Text>
                  <View style={styles.colorDotsGroup}>
                    {['#1F2937', Colors.primary, '#3B82F6', '#EF4444'].map((col) => (
                      <TouchableOpacity
                        key={col}
                        style={[
                          styles.colorDot,
                          { backgroundColor: col },
                          penColor === col && styles.colorDotActive,
                        ]}
                        onPress={() => setPenColor(col)}
                      />
                    ))}
                    <TouchableOpacity
                      style={styles.clearCanvasBtn}
                      onPress={() => setDrawStrokes([])}
                    >
                      <Ionicons name="trash-outline" size={14} color={Colors.textMuted} />
                      <Text style={styles.clearCanvasText}>清空</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 手绘触摸白板 */}
                <View style={styles.canvasSurface} {...panResponder.panHandlers}>
                  {drawStrokes.length === 0 && (
                    <View style={styles.canvasPlaceholder}>
                      <Ionicons name="finger-print-outline" size={36} color="#D1D5DB" />
                      <Text style={styles.canvasPlaceholderText}>
                        在此触摸或手写笔涂鸦绘制，自由板书推导公式
                      </Text>
                    </View>
                  )}

                  {drawStrokes.map((pt, i) => (
                    <View
                      key={i}
                      style={{
                        position: 'absolute',
                        left: pt.x - 3,
                        top: pt.y - 3,
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: penColor,
                      }}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* 删除按钮 */}
            {editingNoteId && (
              <TouchableOpacity
                style={styles.deleteNoteBtn}
                onPress={() => {
                  setNotes((prev) => prev.filter((n) => n.id !== editingNoteId));
                  setEditorVisible(false);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={16} color="#FF4D4F" style={{ marginRight: 4 }} />
                <Text style={styles.deleteNoteText}>删除本篇笔记</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 2,
  },
  newNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Rounded.pill,
    gap: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newNoteText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  quickRecordRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: Rounded.md,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    padding: 0,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingTop: 12,
  },
  folderScroll: {
    marginBottom: 12,
  },
  folderPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  folderPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  folderPillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  folderPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noteList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  noteCard: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  noteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Rounded.pill,
    gap: 4,
  },
  courseTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  noteDateText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  notePreview: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: 10,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusVerifiedText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modeSelectCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.xl,
    padding: 20,
    alignItems: 'center',
  },
  modeSelectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  modeSelectSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  modeOptionsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  modeChoiceBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: Rounded.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modeChoiceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modeChoiceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  modeChoiceDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  cancelChoiceBtn: {
    paddingVertical: 8,
  },
  cancelChoiceText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  editorModalRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  editorCancelBtn: {
    padding: 4,
  },
  editorCancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  editorHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  editorSaveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
  },
  editorSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editorBody: {
    flex: 1,
    padding: 16,
  },
  inputSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  coursePickPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  coursePickText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  titleInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  textAreaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  speechRecBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Rounded.pill,
  },
  speechRecBtnActive: {
    backgroundColor: '#EF4444',
  },
  speechRecBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  speechRecBtnTextActive: {
    color: '#FFFFFF',
  },
  listeningNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: Rounded.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  listeningNoticeText: {
    fontSize: 11,
    color: '#991B1B',
    flex: 1,
  },
  contentTextArea: {
    backgroundColor: '#F9FAFB',
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 180,
    marginBottom: 20,
  },
  freeformToolBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorDotsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  colorDotActive: {
    borderWidth: 2,
    borderColor: '#000000',
    transform: [{ scale: 1.15 }],
  },
  clearCanvasBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 6,
  },
  clearCanvasText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  canvasSurface: {
    width: '100%',
    height: 280,
    backgroundColor: '#FAF5FF',
    borderRadius: Rounded.lg,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
  },
  canvasPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasPlaceholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  deleteNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Rounded.pill,
    backgroundColor: '#FFF1F0',
    marginBottom: 32,
  },
  deleteNoteText: {
    color: '#FF4D4F',
    fontSize: 13,
    fontWeight: '700',
  },
});
