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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Rounded, Shadows, getCourseColorScheme } from '../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCheckmark } from '../components/AnimatedCheckmark';
import { FreeformCanvas } from '../components/FreeformCanvas';

let ExpoSpeechRecognition: any = null;
try {
  ExpoSpeechRecognition = require('expo-speech-recognition').ExpoSpeechRecognitionModule;
} catch (e) {
  ExpoSpeechRecognition = null;
}

export interface NoteItem {
  id: string;
  courseName: string;
  title: string;
  date: string;
  content: string;
  tags: string[];
  type: 'text' | 'freeform';
  freeformPaths?: string[];
  hasAudio?: boolean;
  hasImages?: boolean;
}

interface NotesScreenProps {
  initialCourseName?: string;
  onClearInitialCourse?: () => void;
}

// 关联课程列表（含规范类别）
const COURSES_CATALOG = [
  { name: '高等数学 (AI与数据)', category: '必修课', teacher: '张晓华 教授', time: '周一 08:00' },
  { name: '计算机系统结构', category: '专业课', teacher: '王工 讲师', time: '周一 14:00' },
  { name: '大学英语写作与思辨', category: '通识课', teacher: 'Sarah 外教', time: '周二 10:00' },
  { name: '成人商务韩语', category: '选修课', teacher: 'Jennifer 老师', time: '周三 09:00' },
  { name: 'TOPIK专攻精讲', category: '选修课', teacher: 'Stefanee 讲师', time: '周三 13:30' },
  { name: '韩语口语突破1v1', category: '选修课', teacher: 'Cipher 老师', time: '周三 16:30' },
  { name: '数据结构与算法', category: '专业课', teacher: '李院长', time: '周四 08:00' },
  { name: '交互设计与UI艺术', category: '选修课', teacher: '陈总监', time: '周五 10:00' },
];

export const NotesScreen: React.FC<NotesScreenProps> = ({
  initialCourseName,
  onClearInitialCourse,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top || 0,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 40) : 48
  );

  // 顶部生机草木绿流体色块向下浮现入场动效（与课表页对齐）
  const headerDropAnim = useRef(new Animated.Value(-28)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  // 页面下方内容向下出现平滑动画
  const dropAnim = useRef(new Animated.Value(-20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    headerDropAnim.setValue(-28);
    headerFadeAnim.setValue(0);
    dropAnim.setValue(-20);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.spring(headerDropAnim, {
        toValue: 0,
        friction: 7,
        tension: 85,
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
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 笔记库（用户要求：去掉所有预设内容、标题、关联课程，从全新纯净状态开始）
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('@kexingqiu_notes').then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            setNotes(parsed);
          }
        } catch (e) {}
      }
    });
  }, []);

  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 编辑器状态（无预设内容）
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [inputCourseName, setInputCourseName] = useState('未关联课程');
  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [contentHeight, setContentHeight] = useState(380);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  // 格式化与对齐插入辅助函数
  const handleInsertFormat = (prefix: string) => {
    const start = Math.min(cursorSelection.start, inputContent.length);
    const end = Math.min(cursorSelection.end, inputContent.length);
    const before = inputContent.substring(0, start);
    const after = inputContent.substring(end);
    const needNewline = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
    const updated = before + needNewline + prefix + after;
    setInputContent(updated);
    const newPos = start + needNewline.length + prefix.length;
    setCursorSelection({ start: newPos, end: newPos });
  };

  // 记录文本输入框光标位置 { start, end }
  const [cursorSelection, setCursorSelection] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  // 抽屉状态：选择关联课程
  const [courseDrawerVisible, setCourseDrawerVisible] = useState(false);

  // 手绘画板展开状态（整合在编辑器内）
  const [showCanvas, setShowCanvas] = useState(false);
  const [drawStrokes, setDrawStrokes] = useState<{ x: number; y: number }[]>([]);
  const [penColor, setPenColor] = useState('#1F2937');

  // 苹果 Freeform 无边记无限画布状态（默认空白）
  const [freeformModalVisible, setFreeformModalVisible] = useState(false);
  const [freeformTargetCourse, setFreeformTargetCourse] = useState('未关联课程');
  const [freeformTargetTitle, setFreeformTargetTitle] = useState('');

  // ================= 语音识别核心状态与交互 (图5 微信/iOS式全屏交互) =================
  const [isPressingVoice, setIsPressingVoice] = useState(false);
  const [isHoveringCancel, setIsHoveringCancel] = useState(false);
  const [isHoveringLock, setIsHoveringLock] = useState(false);
  const [isVoiceLocked, setIsVoiceLocked] = useState(false);
  const [realtimeTranscript, setRealtimeTranscript] = useState('');
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [audioWaves, setAudioWaves] = useState<number[]>([10, 16, 24, 30, 22, 14, 20, 28, 16, 12]);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const activeTranscriptRef = useRef('');
  const audioContextRef = useRef<any>(null);
  const analyserRef = useRef<any>(null);
  const micStreamRef = useRef<any>(null);
  const animFrameRef = useRef<any>(null);
  const nativeListenersRef = useRef<any[]>([]);
  const isNativeSpeechActiveRef = useRef(false);

  // 同步 ref 供闭包访问
  activeTranscriptRef.current = realtimeTranscript;

  // 监听外部带参数打开
  useEffect(() => {
    if (initialCourseName) {
      // 切换到对应课程文件夹筛选查看，不强制弹出空白新建卡片
      setSelectedFolder(initialCourseName);
      setEditorVisible(false);
      if (onClearInitialCourse) {
        onClearInitialCourse();
      }
    }
  }, [initialCourseName]);

  // 开启真实或仿真语音识别
  const startRecordingSession = () => {
    setRealtimeTranscript('');
    setVoiceSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setVoiceSeconds((s) => s + 1);
    }, 1000);

    // 1. Android 原生环境优先调用系统级 SpeechRecognizer (expo-speech-recognition)
    if (ExpoSpeechRecognition) {
      ExpoSpeechRecognition.requestPermissionsAsync()
        .then((res: any) => {
          if (res?.granted) {
            if (nativeListenersRef.current.length > 0) {
              nativeListenersRef.current.forEach((sub: any) => sub?.remove?.());
              nativeListenersRef.current = [];
            }

            const resultSub = ExpoSpeechRecognition.addSpeechRecognitionListener(
              'result',
              (event: any) => {
                const text = event.results?.[0]?.transcript;
                if (text) {
                  setRealtimeTranscript(text);
                }
              }
            );

            const volSub = ExpoSpeechRecognition.addSpeechRecognitionListener(
              'volumechange',
              (event: any) => {
                const vol = typeof event.value === 'number' ? Math.max(0, event.value) : 10;
                const dynamicWaves = [
                  Math.max(6, Math.min(36, 8 + vol * 2.2)),
                  Math.max(8, Math.min(36, 10 + vol * 2.8)),
                  Math.max(10, Math.min(36, 12 + vol * 3.5)),
                  Math.max(12, Math.min(38, 14 + vol * 4.0)),
                  Math.max(8, Math.min(32, 10 + vol * 2.6)),
                  Math.max(6, Math.min(28, 8 + vol * 2.0)),
                  Math.max(10, Math.min(36, 12 + vol * 3.2)),
                  Math.max(12, Math.min(38, 14 + vol * 3.8)),
                  Math.max(8, Math.min(30, 10 + vol * 2.4)),
                  Math.max(6, Math.min(24, 8 + vol * 1.8)),
                ];
                setAudioWaves(dynamicWaves);
              }
            );

            nativeListenersRef.current = [resultSub, volSub];

            ExpoSpeechRecognition.start({
              lang: 'zh-CN',
              interimResults: true,
              continuous: true,
              requiresOnDeviceRecognition: false,
              addsPunctuation: true,
            }).catch((e: any) => {
              console.log('ExpoSpeechRecognition start error in NotesScreen:', e);
            });

            isNativeSpeechActiveRef.current = true;
          }
        })
        .catch(() => {});
      return;
    }

    // 2. Web 浏览器端接入 Web Audio 与 Web Speech API
    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    ) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          micStreamRef.current = stream;
          const AudioCtx =
            (window as any).AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const audioCtx = new AudioCtx();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateVolume = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              const levels: number[] = [];
              for (let i = 0; i < 10; i++) {
                const val = dataArray[i * 2] || 0;
                levels.push(Math.max(6, Math.min(36, 6 + (val / 255) * 32)));
              }
              setAudioWaves(levels);
              animFrameRef.current = requestAnimationFrame(updateVolume);
            };
            updateVolume();
          }
        })
        .catch(() => {});
    }

    if (
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let currentSessionText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentSessionText += event.results[i][0].transcript;
          }
          if (currentSessionText) {
            setRealtimeTranscript(currentSessionText);
          }
        };

        recognition.onerror = () => {};
        recognition.onend = () => {};

        recognition.start();
        recognitionRef.current = recognition;
        return;
      } catch (e) {}
    }
  };

  // 停止录音并将识别文字精确插入到当前光标位置
  const finishRecordingAndInsert = (insert: boolean = true) => {
    clearInterval(timerRef.current);

    if (ExpoSpeechRecognition && isNativeSpeechActiveRef.current) {
      try {
        ExpoSpeechRecognition.stop();
      } catch (e) {}
      if (nativeListenersRef.current.length > 0) {
        nativeListenersRef.current.forEach((sub: any) => sub?.remove?.());
        nativeListenersRef.current = [];
      }
      isNativeSpeechActiveRef.current = false;
    }

    if (recognitionRef.current) {
      try {
        if (recognitionRef.current.stop) {
          recognitionRef.current.stop();
        }
      } catch (e) {}
      recognitionRef.current = null;
    }

    const rawText = activeTranscriptRef.current.trim();
    const textToInsert = rawText;

    if (insert && textToInsert) {
      // 插入到当前光标位置 cursorSelection
      const start = Math.min(cursorSelection.start, inputContent.length);
      const end = Math.min(cursorSelection.end, inputContent.length);

      const before = inputContent.substring(0, start);
      const after = inputContent.substring(end);
      const separator = before.length > 0 && !before.endsWith('\n') && !before.endsWith(' ') ? '\n' : '';
      const updatedContent = before + separator + textToInsert + after;

      setInputContent(updatedContent);

      // 更新光标到插入内容之后
      const newPos = start + separator.length + textToInsert.length;
      setCursorSelection({ start: newPos, end: newPos });
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((t: any) => t.stop());
      } catch (e) {}
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioWaves([10, 16, 24, 30, 22, 14, 20, 28, 16, 12]);

    // 重置语音状态
    setIsPressingVoice(false);
    setIsHoveringCancel(false);
    setIsHoveringLock(false);
    setIsVoiceLocked(false);
    setRealtimeTranscript('');
    setVoiceSeconds(0);
  };

  // 手指滑动识别 (图5手势：上滑左右划动选择 [取消 ✕] 或 [锁定 🔒])
  const voicePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        if (isVoiceLocked) return;
        setIsPressingVoice(true);
        setIsHoveringCancel(false);
        setIsHoveringLock(false);
        startRecordingSession();
      },

      onPanResponderMove: (_, gestureState) => {
        if (isVoiceLocked) return;
        // 用户上滑并划向左右两侧
        if (gestureState.dy < -35) {
          if (gestureState.dx < -30) {
            setIsHoveringCancel(true);
            setIsHoveringLock(false);
          } else if (gestureState.dx > 30) {
            setIsHoveringLock(true);
            setIsHoveringCancel(false);
          } else {
            setIsHoveringCancel(false);
            setIsHoveringLock(false);
          }
        } else {
          setIsHoveringCancel(false);
          setIsHoveringLock(false);
        }
      },

      onPanResponderRelease: () => {
        if (isVoiceLocked) return;
        if (isHoveringCancel) {
          finishRecordingAndInsert(false);
        } else if (isHoveringLock) {
          // 松手在锁定按钮上：进入持续锁定录音模式！
          setIsVoiceLocked(true);
          setIsPressingVoice(false);
          setIsHoveringLock(false);
        } else {
          finishRecordingAndInsert(true);
        }
      },

      onPanResponderTerminate: () => {
        if (isVoiceLocked) return;
        finishRecordingAndInsert(false);
      },
    })
  ).current;

  // 手绘画板手势
  const canvasPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
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

  // 打开笔记编辑
  const handleOpenNote = (note: NoteItem) => {
    if (note.type === 'freeform') {
      setFreeformTargetCourse(note.courseName);
      setFreeformTargetTitle(note.title);
      setFreeformModalVisible(true);
      return;
    }
    setEditingNoteId(note.id);
    setInputCourseName(note.courseName);
    setInputTitle(note.title);
    setInputContent(note.content);
    setShowCanvas(false);
    setDrawStrokes([]);
    setCursorSelection({ start: note.content.length, end: note.content.length });
    setEditorVisible(true);
  };

  // 新建随堂笔记 (按要求：手动打开默认未关联课程，标题为空白)
  const handleCreateNewNote = () => {
    setEditingNoteId(null);
    setInputCourseName('未关联课程');
    setInputTitle('');
    setInputContent('');
    setShowCanvas(false);
    setDrawStrokes([]);
    setCursorSelection({ start: 0, end: 0 });
    setEditorVisible(true);
  };

  // 保存随堂笔记（用户要求：确认保存功能正常，标题空时自动提取内容第一行，并持久化到本地）
  const handleSaveNote = () => {
    const finalTitle =
      inputTitle.trim() ||
      inputContent.trim().split('\n')[0].substring(0, 24) ||
      '新建随堂笔记';

    let updatedNotes: NoteItem[] = [];
    if (editingNoteId) {
      updatedNotes = notes.map((n) =>
        n.id === editingNoteId
          ? {
              ...n,
              courseName: inputCourseName,
              title: finalTitle,
              content: inputContent,
              type: (showCanvas || drawStrokes.length > 0 ? 'freeform' : 'text') as 'freeform' | 'text',
            }
          : n
      );
    } else {
      const newNote: NoteItem = {
        id: `n-${Date.now()}`,
        courseName: inputCourseName,
        title: finalTitle,
        date: '刚刚',
        content: inputContent,
        tags: ['随堂笔记'],
        type: (showCanvas || drawStrokes.length > 0 ? 'freeform' : 'text') as 'freeform' | 'text',
      };
      updatedNotes = [newNote, ...notes];
    }
    setNotes(updatedNotes);
    AsyncStorage.setItem('@kexingqiu_notes', JSON.stringify(updatedNotes));
    setEditorVisible(false);
    setToastMessage('✅ 随堂笔记已保存');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 文件夹分类列表（基于用户实际笔记动态生成，彻底去除预设课程）
  const uniqueCourses = Array.from(
    new Set(notes.map((n) => n.courseName).filter((c) => c && c !== '未关联课程'))
  );
  const folderList = [
    { id: 'all', name: '所有笔记', icon: 'folder', count: notes.length },
    ...uniqueCourses.map((c) => ({
      id: c,
      name: c,
      icon: 'document-text-outline',
      count: notes.filter((n) => n.courseName === c).length,
    })),
  ];

  const filteredNotes = notes.filter((item) => {
    const matchFolder = selectedFolder === 'all' || item.courseName.includes(selectedFolder);
    const matchSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  return (
    <View style={styles.container}>
      {/* 顶部生机草木绿流体区域（带向下浮现入场动画） */}
      <Animated.View
        style={[
          styles.heroHeader,
          {
            paddingTop: topPadding + 8,
            opacity: headerFadeAnim,
            transform: [{ translateY: headerDropAnim }],
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <Text style={styles.screenMainTitle}>笔记</Text>

          <View style={styles.headerActionBtns}>
            {/* 无边记快捷入口（图标与文字上下居中对齐） */}
            <TouchableOpacity
              style={styles.greenFreeformBtn}
              onPress={() => {
                setFreeformTargetCourse(COURSES_CATALOG[0].name);
                setFreeformTargetTitle(`第 14 周 · ${COURSES_CATALOG[0].name} 脑力激荡`);
                setFreeformModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="infinite" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.greenFreeformBtnText}>无边记</Text>
            </TouchableOpacity>

            {/* 写笔记按钮 */}
            <TouchableOpacity
              style={styles.greenNewNoteBtn}
              onPress={handleCreateNewNote}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={16} color={Colors.primary} style={{ marginRight: 3 }} />
              <Text style={styles.greenNewNoteBtnText}>写笔记</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 搜索框（按图1要求置于绿色顶部栏内部） */}
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索全部随堂笔记、关键词或课程..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* 提醒事项 Toast 浮条 */}
      {toastMessage && (
        <View style={styles.toastFloatBar}>
          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* 文件夹分类横滑胶囊条（带向下入场动画） */}
      <Animated.View
        style={[
          styles.folderStripArea,
          {
            opacity: fadeAnim,
            transform: [{ translateY: dropAnim }],
          },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folderScroll}>
          {folderList.map((folder) => {
            const isSelected = selectedFolder === folder.id;
            return (
              <TouchableOpacity
                key={folder.id}
                style={[styles.folderChip, isSelected && styles.folderChipActive]}
                onPress={() => setSelectedFolder(folder.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={folder.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : '#4B5563'}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.folderChipText, isSelected && styles.folderChipTextActive]}>
                  {folder.name}
                </Text>
                <View style={[styles.folderCountBadge, isSelected && styles.folderCountBadgeActive]}>
                  <Text style={[styles.folderCountText, isSelected && styles.folderCountTextActive]}>
                    {folder.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* 笔记卡片流（带向下入场平滑动效） */}
      <Animated.ScrollView
        style={[
          styles.notesListScroll,
          {
            opacity: fadeAnim,
            transform: [{ translateY: dropAnim }],
          },
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
      >
        {filteredNotes.map((note) => {
          const courseColor = getCourseColorScheme(note.courseName);
          return (
            <TouchableOpacity
              key={note.id}
              style={[styles.iosNoteCard, Shadows.card]}
              activeOpacity={0.8}
              onPress={() => handleOpenNote(note)}
            >
              <View style={styles.noteCardTopRow}>
                {/* 课程标签：颜色严格对齐周课表 */}
                <View
                  style={[
                    styles.courseColorPill,
                    {
                      backgroundColor: courseColor.bg,
                      borderColor: courseColor.border,
                    },
                  ]}
                >
                  <Text style={[styles.courseColorPillText, { color: courseColor.text }]}>
                    {note.courseName}
                  </Text>
                </View>

                <Text style={styles.noteDateText}>{note.date}</Text>
              </View>

              <Text style={styles.noteCardTitle} numberOfLines={1}>
                {note.title}
              </Text>

              <Text style={styles.noteCardSnippet} numberOfLines={2}>
                {note.content}
              </Text>

              <View style={styles.noteCardFooter}>
                <View style={styles.badgesRow}>
                  {note.type === 'freeform' && (
                    <View style={styles.tagBadge}>
                      <Ionicons name="brush-outline" size={11} color="#6366F1" style={{ marginRight: 3 }} />
                      <Text style={[styles.tagBadgeText, { color: '#6366F1' }]}>手绘无边记</Text>
                    </View>
                  )}
                  {note.hasAudio && (
                    <View style={styles.tagBadge}>
                      <Ionicons name="mic-outline" size={11} color="#10B981" style={{ marginRight: 3 }} />
                      <Text style={[styles.tagBadgeText, { color: '#10B981' }]}>语音已速记</Text>
                    </View>
                  )}
                </View>

                <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>

      {/* ================= 图5风格：全屏一体化笔记编辑器 ================= */}
      <Modal
        visible={editorVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditorVisible(false)}
      >
        <View style={styles.editorContainer}>
          {/* 顶部操作栏（严格预留状态栏充足高度） */}
          <View
            style={[
              styles.editorNavBar,
              {
                paddingTop:
                  Math.max(
                    insets.top || 0,
                    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 40) : 48
                  ) + 10,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.editorNavLeft}
              onPress={() => {
                if (isPressingVoice || isVoiceLocked) {
                  finishRecordingAndInsert(false);
                }
                setEditorVisible(false);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.primary} />
              <Text style={styles.editorNavBackText}>笔记</Text>
            </TouchableOpacity>

            <View style={styles.editorNavRight}>
              {/* 抽屉关联课程快捷胶囊 */}
              <TouchableOpacity
                style={styles.courseDrawerBtn}
                onPress={() => setCourseDrawerVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="book-outline" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.courseDrawerBtnText} numberOfLines={1}>
                  {inputCourseName.length > 8 ? inputCourseName.slice(0, 8) + '...' : inputCourseName}
                </Text>
                <Ionicons name="chevron-down" size={12} color={Colors.primary} style={{ marginLeft: 2 }} />
              </TouchableOpacity>

              {/* 保存/完成按钮 */}
              <TouchableOpacity
                style={styles.editorDoneBtn}
                onPress={handleSaveNote}
                activeOpacity={0.8}
              >
                <Text style={styles.editorDoneText}>完成</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 编辑器主体（支持向上滚动，不遮挡键盘） */}
          <ScrollView
            style={styles.editorScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 笔记大标题 */}
            <TextInput
              style={styles.iosTitleInput}
              placeholder="笔记标题"
              placeholderTextColor="#9CA3AF"
              value={inputTitle}
              onChangeText={setInputTitle}
              multiline={false}
            />

            {/* 辅助信息与工具条 */}
            <View style={styles.metaInfoRow}>
              <Text style={styles.metaDateText}>
                {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} · {inputContent.length} 字
              </Text>

              {/* 文本对齐与段落工具条（按要求：全部使用 icon 显示，不要加文字写在按键下面） */}
              <View style={styles.editorFormatToolbar}>
                {/* 对齐工具组 */}
                <View style={styles.formatGroup}>
                  <TouchableOpacity
                    style={[styles.formatIconBtn, textAlign === 'left' && styles.formatIconBtnActive]}
                    onPress={() => setTextAlign('left')}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="format-align-left"
                      size={17}
                      color={textAlign === 'left' ? Colors.primary : '#64748B'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.formatIconBtn, textAlign === 'center' && styles.formatIconBtnActive]}
                    onPress={() => setTextAlign('center')}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="format-align-center"
                      size={17}
                      color={textAlign === 'center' ? Colors.primary : '#64748B'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.formatIconBtn, textAlign === 'right' && styles.formatIconBtnActive]}
                    onPress={() => setTextAlign('right')}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="format-align-right"
                      size={17}
                      color={textAlign === 'right' ? Colors.primary : '#64748B'}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.formatDivider} />

                {/* 段落样式工具组 (纯Icon无文字) */}
                <View style={styles.formatGroup}>
                  <TouchableOpacity
                    style={styles.formatIconBtn}
                    onPress={() => handleInsertFormat('# ')}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="format-header-1" size={17} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formatIconBtn}
                    onPress={() => handleInsertFormat('• ')}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="format-list-bulleted" size={17} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formatIconBtn}
                    onPress={() => handleInsertFormat('1. ')}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="format-list-numbered" size={17} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formatIconBtn}
                    onPress={() => handleInsertFormat('> ')}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="format-quote-close" size={17} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formatIconBtn}
                    onPress={() => handleInsertFormat('[ ] ')}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={17} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.editorActionTools}>
                {/* 展开/收起手绘涂鸦板 */}
                <TouchableOpacity
                  style={[styles.toolTogglePill, showCanvas && styles.toolTogglePillActive]}
                  onPress={() => setShowCanvas((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="brush-outline"
                    size={14}
                    color={showCanvas ? '#FFFFFF' : '#4B5563'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.toolToggleText, showCanvas && styles.toolToggleTextActive]}>
                    {showCanvas ? '收起画板' : '涂鸦速记'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 整合手绘板（展开时可直接在正文上方速记公式或手绘架构） */}
            {showCanvas && (
              <View style={styles.canvasSection}>
                <View style={styles.canvasToolbar}>
                  <Text style={styles.canvasHint}>🎨 随堂手绘板（在虚线区直接涂鸦）</Text>
                  <View style={styles.colorPillsRow}>
                    {['#1F2937', '#2563EB', '#10B981', '#DC2626'].map((col) => (
                      <TouchableOpacity
                        key={col}
                        style={[
                          styles.colorCircle,
                          { backgroundColor: col },
                          penColor === col && styles.colorCircleActive,
                        ]}
                        onPress={() => setPenColor(col)}
                      />
                    ))}
                    <TouchableOpacity
                      onPress={() => setDrawStrokes([])}
                      style={styles.clearCanvasBtn}
                    >
                      <Text style={styles.clearCanvasText}>清空</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.canvasSurface} {...canvasPanResponder.panHandlers}>
                  {drawStrokes.length === 0 && (
                    <View style={styles.canvasEmptyPlaceholder}>
                      <Ionicons name="pencil-outline" size={24} color="#CBD5E1" />
                      <Text style={styles.canvasEmptyText}>用手指在这里直接画图、写公式草稿</Text>
                    </View>
                  )}
                  {drawStrokes.map((pt, idx) => (
                    <View
                      key={idx}
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

            {/* 正文输入框：随文字一直往下延伸 */}
            <TextInput
              style={[
                styles.iosBodyInput,
                {
                  textAlign,
                  minHeight: Math.max(380, contentHeight),
                },
              ]}
              placeholder="在此开始记录课堂要点、推导过程... 也可使用底部语音速记直接在光标处填入。"
              placeholderTextColor="#A0AEC0"
              value={inputContent}
              onChangeText={setInputContent}
              multiline={true}
              scrollEnabled={false}
              textAlignVertical="top"
              onContentSizeChange={(e) => {
                setContentHeight(e.nativeEvent.contentSize.height);
              }}
              onSelectionChange={(e) => {
                setCursorSelection(e.nativeEvent.selection);
              }}
            />

            <View style={{ height: 180 }} />
          </ScrollView>

          {/* 底部语音交互条 */}
          <View style={[styles.bottomVoiceDock, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {/* 录音锁定之后：在按住说话上方显示转文字内容框 (小框实时显示转文字内容) */}
            {isVoiceLocked && (
              <View style={styles.lockedTranscriptBox}>
                <View style={styles.lockedBoxHeader}>
                  <View style={styles.lockedBoxLiveRow}>
                    <View style={styles.lockedLiveDot} />
                    <Text style={styles.lockedBoxTitle}>正在实时转文字...</Text>
                    <Text style={styles.lockedBoxTimer}>{voiceSeconds}s</Text>
                  </View>
                  <View style={styles.lockedWaveRow}>
                    {audioWaves.slice(0, 8).map((h, i) => (
                      <View key={i} style={[styles.lockedWaveBar, { height: Math.max(4, h * 0.45) }]} />
                    ))}
                  </View>
                </View>
                <ScrollView style={styles.lockedBoxScroll} nestedScrollEnabled={true}>
                  <Text style={styles.lockedBoxContent}>
                    {realtimeTranscript ? realtimeTranscript : '正在聆听您的声音，随时将语音识别为文字...'}
                  </Text>
                </ScrollView>
                <View style={styles.lockedBoxActionRow}>
                  <TouchableOpacity
                    style={styles.lockedActionCancel}
                    onPress={() => finishRecordingAndInsert(false)}
                  >
                    <Ionicons name="trash-outline" size={14} color="#EF4444" />
                    <Text style={styles.lockedActionCancelText}>放弃</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.lockedActionInsert}
                    onPress={() => finishRecordingAndInsert(true)}
                  >
                    <Ionicons name="checkmark-done" size={16} color="#10B981" />
                    <Text style={styles.lockedActionInsertText}>填入光标位置</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 底部按钮：锁定后变成“正在转文字...”，点击可直接完成转文字并插入 */}
            {isVoiceLocked ? (
              <TouchableOpacity
                style={styles.voiceTouchAreaLocked}
                onPress={() => finishRecordingAndInsert(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="mic" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.voiceTouchTextLocked}>
                  正在转文字 · 点击完成
                </Text>
              </TouchableOpacity>
            ) : (
              // 空闲/长按状态下的主按钮
              <View
                style={[
                  styles.voiceTouchArea,
                  isPressingVoice && styles.voiceTouchAreaActive,
                ]}
                {...voicePanResponder.panHandlers}
              >
                <Ionicons
                  name="mic-outline"
                  size={20}
                  color={isPressingVoice ? '#FFFFFF' : Colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.voiceTouchText,
                    isPressingVoice && styles.voiceTouchTextActive,
                  ]}
                >
                  {isPressingVoice ? '松开发送 · 滑动选择' : '按住 说话'}
                </Text>
              </View>
            )}
          </View>

          {/* ================= 图5风格：全屏微信/iOS式语音交互遮罩 ================= */}
          {isPressingVoice && (
            <View style={styles.wechatVoiceOverlay} pointerEvents="none">
              {/* 顶部/中部：绿色气泡与实际麦克风声波 (图5) */}
              <View style={styles.wechatSpeechBubble}>
                <View style={styles.wechatWaveRow}>
                  {audioWaves.map((waveH, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.wechatWaveBar,
                        { height: waveH },
                      ]}
                    />
                  ))}
                </View>

                {realtimeTranscript ? (
                  <Text style={styles.wechatTranscriptText} numberOfLines={2}>
                    “{realtimeTranscript}”
                  </Text>
                ) : null}
              </View>

              {/* 气泡尖角 */}
              <View style={styles.wechatBubbleTriangle} />

              {/* 左右两个大圆操作按钮（图5：左侧 ✕ 取消，右侧 🔒 锁定） */}
              <View style={styles.wechatActionRow}>
                {/* 左：取消 ✕ */}
                <View
                  style={[
                    styles.wechatRoundBtn,
                    isHoveringCancel && styles.wechatRoundBtnCancelActive,
                  ]}
                >
                  <Ionicons name="close" size={32} color="#FFFFFF" />
                </View>

                {/* 右：按要求将“文”改成锁定按钮 🔒 */}
                <View
                  style={[
                    styles.wechatRoundBtn,
                    isHoveringLock && styles.wechatRoundBtnLockActive,
                  ]}
                >
                  <Ionicons name="lock-closed" size={28} color="#FFFFFF" />
                </View>
              </View>

              {/* 提示文案：松开 发送 / 松开 取消 / 松开 锁定 */}
              <Text
                style={[
                  styles.wechatPromptText,
                  isHoveringCancel && { color: '#EF4444', fontWeight: '700' },
                  isHoveringLock && { color: '#F59E0B', fontWeight: '700' },
                ]}
              >
                {isHoveringCancel
                  ? '松开手指，取消录音'
                  : isHoveringLock
                  ? '松开手指，锁定录音 🔒'
                  : '松开 发送'}
              </Text>

              {/* 底部隆起半圆弧座与语音波形图标 (图5) */}
              <View style={styles.wechatBottomDome}>
                <Ionicons
                  name="radio"
                  size={24}
                  color="#64748B"
                  style={{ transform: [{ rotate: '-45deg' }] }}
                />
              </View>
            </View>
          )}

          {/* ================= 底部抽屉：选择关联课程 (BottomSheet Drawer) ================= */}
          <Modal
            visible={courseDrawerVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setCourseDrawerVisible(false)}
          >
            <TouchableOpacity
              style={styles.drawerBackdrop}
              activeOpacity={1}
              onPress={() => setCourseDrawerVisible(false)}
            >
              <View style={[styles.drawerCard, Shadows.card]}>
                {/* 抽屉顶部小横条 */}
                <View style={styles.drawerHandleBar} />

                <View style={styles.drawerHeader}>
                  <View>
                    <Text style={styles.drawerTitle}>选择关联课程</Text>
                    <Text style={styles.drawerSub}>将随堂笔记直接绑定至教务课表知识库</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.drawerCloseBtn}
                    onPress={() => setCourseDrawerVisible(false)}
                  >
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.drawerCourseList} showsVerticalScrollIndicator={false}>
                  {COURSES_CATALOG.map((courseItem) => {
                    const isSelected = inputCourseName.includes(courseItem.name.slice(0, 4));

                    return (
                      <TouchableOpacity
                        key={courseItem.name}
                        style={[
                          styles.drawerCourseItem,
                          isSelected && styles.drawerCourseItemActive,
                        ]}
                        onPress={() => {
                          setInputCourseName(courseItem.name);
                          setCourseDrawerVisible(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.drawerItemLeft}>
                          {/* 图4要求：高等数学等前面的icon/圆点已去掉 */}
                          <View style={styles.courseItemMeta}>
                            <View style={styles.courseItemTitleRow}>
                              <Text style={styles.courseItemName}>{courseItem.name}</Text>
                              <View
                                style={[
                                  styles.categoryMiniBadge,
                                  courseItem.category === '必修课' && { backgroundColor: '#EFF6FF' },
                                  courseItem.category === '选修课' && { backgroundColor: '#F3E8FF' },
                                  courseItem.category === '专业课' && { backgroundColor: '#ECFDF5' },
                                  courseItem.category === '通识课' && { backgroundColor: '#FFFBEB' },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.categoryMiniText,
                                    courseItem.category === '必修课' && { color: '#2563EB' },
                                    courseItem.category === '选修课' && { color: '#9333EA' },
                                    courseItem.category === '专业课' && { color: '#059669' },
                                    courseItem.category === '通识课' && { color: '#D97706' },
                                  ]}
                                >
                                  {courseItem.category}
                                </Text>
                              </View>
                            </View>

                            <Text style={styles.courseItemTeacher}>
                              {courseItem.teacher} · {courseItem.time}
                            </Text>
                          </View>
                        </View>

                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </Modal>

      {/* 苹果 Freeform 无边记无限画布 Modal */}
      {freeformModalVisible && (
        <Modal
          visible={freeformModalVisible}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setFreeformModalVisible(false)}
        >
          <FreeformCanvas
            courseName={freeformTargetCourse}
            initialTitle={freeformTargetTitle}
            onClose={() => setFreeformModalVisible(false)}
            onSave={(data) => {
              const newNote: NoteItem = {
                id: `n-${Date.now()}`,
                courseName: freeformTargetCourse || '未关联课程',
                title: data.title || '无边记手绘脑图',
                date: '刚刚',
                content: `【无边记无限画纸】包含 ${data.notes.length} 张彩色便签，${data.strokes.length} 段手绘架构笔迹。`,
                tags: ['无边记手写', '思维导图'],
                type: 'freeform',
              };
              const updated = [newNote, ...notes];
              setNotes(updated);
              AsyncStorage.setItem('@kexingqiu_notes', JSON.stringify(updated));
              setFreeformModalVisible(false);
              setToastMessage('✅ 无边记手写脑图已保存');
              setTimeout(() => setToastMessage(null), 2500);
            }}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  toastFloatBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Rounded.pill,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
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
  headerTopRow: {
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
  headerGreeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 4,
  },
  headerActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenFreeformBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 10,
    borderRadius: Rounded.pill,
  },
  greenFreeformBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 16,
    includeFontPadding: false,
  },
  greenNewNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    borderRadius: Rounded.pill,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  greenNewNoteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 16,
    includeFontPadding: false,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    padding: 0,
  },
  folderStripArea: {
    marginVertical: 10,
  },
  folderScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
  },
  folderChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  folderChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  folderChipTextActive: {
    color: '#FFFFFF',
  },
  folderCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    marginLeft: 6,
  },
  folderCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  folderCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  folderCountTextActive: {
    color: '#FFFFFF',
  },
  notesListScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  iosNoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  noteCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseColorPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  courseColorPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  noteDateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  noteCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  noteCardSnippet: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  noteCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F1F5F9',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ================= 一体化全屏编辑器样式 =================
  editorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  editorNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  editorNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editorNavBackText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 2,
  },
  editorNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseDrawerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Rounded.pill,
    maxWidth: 160,
  },
  courseDrawerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  editorDoneBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
  },
  editorDoneText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editorScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  iosTitleInput: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    padding: 0,
    letterSpacing: -0.3,
  },
  metaInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  metaDateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  editorFormatToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formatGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  formatIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatIconBtnActive: {
    backgroundColor: '#E0F2FE',
  },
  formatDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  editorActionTools: {
    flexDirection: 'row',
    gap: 8,
  },
  toolTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Rounded.pill,
  },
  toolTogglePillActive: {
    backgroundColor: '#6366F1',
  },
  toolToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  toolToggleTextActive: {
    color: '#FFFFFF',
  },
  canvasSection: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  canvasToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  canvasHint: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  colorPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  colorCircleActive: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  clearCanvasBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FEE2E2',
    marginLeft: 4,
  },
  clearCanvasText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  canvasSurface: {
    height: 180,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  canvasEmptyPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasEmptyText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
  },
  iosBodyInput: {
    fontSize: 16,
    lineHeight: 26,
    color: '#1E293B',
    minHeight: 380,
    padding: 0,
  },

  // ================= 实时转录悬浮小框 (HUD) =================
  floatingSpeechHUD: {
    position: 'absolute',
    bottom: 84,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 99,
  },
  hudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hudWaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hudTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  hudInsertDoneBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Rounded.pill,
  },
  hudInsertDoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hudContentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    maxHeight: 100,
  },
  hudTranscriptText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  hudGuideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  hudGuideText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // ================= 底部语音交互条 =================
  bottomVoiceDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  voiceTouchArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 24,
    paddingVertical: 12,
  },
  voiceTouchAreaActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  voiceTouchAreaLockHover: {
    backgroundColor: '#D97706',
    borderColor: '#F59E0B',
  },
  voiceTouchText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  voiceTouchTextActive: {
    color: '#FFFFFF',
  },
  voiceTouchAreaLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 24,
    paddingVertical: 12,
  },
  voiceTouchTextLocked: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lockedTranscriptBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  lockedBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  lockedBoxLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockedLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  lockedBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  lockedBoxTimer: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  lockedWaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 18,
  },
  lockedWaveBar: {
    width: 3,
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  lockedBoxScroll: {
    maxHeight: 70,
    marginBottom: 8,
  },
  lockedBoxContent: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  lockedBoxActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  lockedActionCancel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  lockedActionCancelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  lockedActionInsert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  lockedActionInsertText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  lockedVoiceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  lockedVoiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulsingVoiceIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedVoiceTimerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  lockedVoiceHintText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  lockedActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedCancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
    backgroundColor: '#F1F5F9',
  },
  lockedCancelText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  lockedFinishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
    backgroundColor: Colors.primary,
  },
  lockedFinishText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ================= 抽屉选择关联课程 (BottomSheet Drawer) =================
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  drawerCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: '75%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  // ================= 图5风格：全屏微信/iOS式语音交互遮罩 =================
  wechatVoiceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 9999,
  },
  wechatSpeechBubble: {
    backgroundColor: '#95EC69',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    maxWidth: '82%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  wechatWaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 38,
  },
  wechatWaveBar: {
    width: 3.5,
    backgroundColor: '#285820',
    borderRadius: 2,
  },
  wechatTranscriptText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A4315',
    marginTop: 6,
    textAlign: 'center',
  },
  wechatBubbleTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#95EC69',
    marginBottom: 44,
  },
  wechatActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '76%',
    marginBottom: 28,
  },
  wechatRoundBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(55, 65, 81, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  wechatRoundBtnCancelActive: {
    backgroundColor: '#EF4444',
    transform: [{ scale: 1.15 }],
  },
  wechatRoundBtnLockActive: {
    backgroundColor: '#F59E0B',
    transform: [{ scale: 1.15 }],
  },
  wechatRoundBtnTextActive: {
    backgroundColor: '#10B981',
    transform: [{ scale: 1.15 }],
  },
  wechatRoundBtnLabel: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  wechatPromptText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.88)',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  wechatBottomDome: {
    width: '100%',
    height: 80,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    paddingTop: 14,
  },
  drawerHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  drawerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  drawerCloseBtn: {
    padding: 4,
  },
  drawerCourseList: {
    maxHeight: 360,
  },
  drawerCourseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  drawerCourseItemActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  drawerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  courseCircleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  courseItemMeta: {
    flex: 1,
  },
  courseItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  categoryMiniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  categoryMiniText: {
    fontSize: 10,
    fontWeight: '700',
  },
  courseItemTeacher: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
