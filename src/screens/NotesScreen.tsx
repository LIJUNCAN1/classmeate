import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Easing,
  PanResponder,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AnimatedCheckmark } from '../components/AnimatedCheckmark';
import { FreeformCanvas, DrawingStroke, StrokePoint } from '../components/FreeformCanvas';
import { loadScheduleData } from '../services/scheduleStorage';
import { Course } from '../types/schedule';

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
  doodleStrokes?: DrawingStroke[];
  hasAudio?: boolean;
  hasImages?: boolean;
}

interface NotesScreenProps {
  initialCourseName?: string;
  onClearInitialCourse?: () => void;
}

// 饱满高辨识度纯色课程标签色板（用户要求：纯色底加白字）
const SOLID_COURSE_COLORS = [
  '#059669', // 翡翠绿
  '#2563EB', // 宝蓝
  '#7C3AED', // 典雅紫
  '#D97706', // 琥珀黄
  '#DB2777', // 玫红
  '#0891B2', // 青蓝
  '#4F46E5', // 靛蓝
  '#0D9488', // 墨青
  '#EA580C', // 暖橙
];

export function getSolidCourseColor(name: string): string {
  if (!name || name === '未关联课程') return '#64748B';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SOLID_COURSE_COLORS.length;
  return SOLID_COURSE_COLORS[index];
}

// 真实笔刷压感轮廓曲线算法，计算切向法向量并生成饱满带压感的闭合贝塞尔 Ribbon 曲线
function strokeToOutlinePath(points: StrokePoint[], defaultWidth: number = 3.5): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    const r = (p.w || defaultWidth) / 2;
    return `M ${p.x - r} ${p.y} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
  }

  const leftPts: { x: number; y: number }[] = [];
  const rightPts: { x: number; y: number }[] = [];

  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    let dx = 0;
    let dy = 0;

    if (i === 0) {
      dx = points[1].x - curr.x;
      dy = points[1].y - curr.y;
    } else if (i === points.length - 1) {
      dx = curr.x - points[i - 1].x;
      dy = curr.y - points[i - 1].y;
    } else {
      dx = points[i + 1].x - points[i - 1].x;
      dy = points[i + 1].y - points[i - 1].y;
    }

    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const halfW = Math.max(1, (curr.w || defaultWidth) / 2);

    leftPts.push({ x: curr.x + nx * halfW, y: curr.y + ny * halfW });
    rightPts.push({ x: curr.x - nx * halfW, y: curr.y - ny * halfW });
  }

  let d = `M ${leftPts[0].x} ${leftPts[0].y}`;
  for (let i = 1; i < leftPts.length; i++) {
    const midX = (leftPts[i - 1].x + leftPts[i].x) / 2;
    const midY = (leftPts[i - 1].y + leftPts[i].y) / 2;
    d += ` Q ${leftPts[i - 1].x} ${leftPts[i - 1].y}, ${midX} ${midY}`;
  }
  d += ` L ${leftPts[leftPts.length - 1].x} ${leftPts[leftPts.length - 1].y}`;
  d += ` L ${rightPts[rightPts.length - 1].x} ${rightPts[rightPts.length - 1].y}`;

  for (let i = rightPts.length - 2; i >= 0; i--) {
    const midX = (rightPts[i + 1].x + rightPts[i].x) / 2;
    const midY = (rightPts[i + 1].y + rightPts[i].y) / 2;
    d += ` Q ${rightPts[i + 1].x} ${rightPts[i + 1].y}, ${midX} ${midY}`;
  }
  d += ` L ${rightPts[0].x} ${rightPts[0].y} Z`;

  return d;
}

interface SwipeableNoteCardProps {
  note: NoteItem;
  onPress: () => void;
  onDelete: (id: string) => void;
}

const SwipeableNoteCard: React.FC<SwipeableNoteCardProps> = ({ note, onPress, onDelete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteBtnOpacity = useRef(new Animated.Value(0)).current;
  const deleteBtnScale = useRef(new Animated.Value(0.75)).current;
  const cardHeight = useRef(new Animated.Value(1)).current;
  const cardMargin = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  isOpenRef.current = isOpen;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
      },
      onPanResponderMove: (_, gestureState) => {
        const startX = isOpenRef.current ? -84 : 0;
        const currentX = startX + gestureState.dx;
        const clamped = Math.max(-100, Math.min(0, currentX));
        translateX.setValue(clamped);

        const progress = Math.min(1, Math.abs(clamped) / 80);
        deleteBtnOpacity.setValue(progress);
        deleteBtnScale.setValue(0.75 + progress * 0.25);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isOpenRef.current) {
          if (gestureState.dx > 25 || gestureState.vx > 0.3) {
            closeCard();
          } else {
            openCard();
          }
        } else {
          if (gestureState.dx < -30 || gestureState.vx < -0.3) {
            openCard();
          } else {
            closeCard();
          }
        }
      },
      onPanResponderTerminate: () => {
        if (isOpenRef.current) openCard();
        else closeCard();
      },
    })
  ).current;

  const openCard = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: -84,
        tension: 85,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(deleteBtnOpacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.spring(deleteBtnScale, {
        toValue: 1,
        tension: 90,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeCard = () => {
    setIsOpen(false);
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        tension: 85,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(deleteBtnOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(deleteBtnScale, {
        toValue: 0.75,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDelete = () => {
    // 笔记消失动画：卡片迅速向左滑出并淡出，随后高度与边距平滑塌陷归零
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -400,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(deleteBtnOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(cardHeight, {
          toValue: 0,
          duration: 240,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(cardMargin, {
          toValue: 0,
          duration: 240,
          useNativeDriver: false,
        }),
      ]).start(() => {
        onDelete(note.id);
      });
    });
  };

  return (
    <Animated.View
      style={{
        opacity: cardOpacity,
        transform: [{ scaleY: cardHeight }],
        maxHeight: cardHeight.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 150],
        }),
        marginBottom: cardMargin.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 12],
        }),
        overflow: 'hidden',
      }}
    >
      <View style={styles.swipeContainer}>
        {/* 底层右侧出现的删除按钮（带出场动画：弹性放大 + 渐入） */}
        <Animated.View
          style={[
            styles.deleteBtnWrapper,
            {
              opacity: deleteBtnOpacity,
              transform: [{ scale: deleteBtnScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.deleteActionBtn}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
            <Text style={styles.deleteActionText}>删除</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 顶层可滑动的笔记内容 */}
        <Animated.View
          style={[
            styles.swipeForeground,
            { transform: [{ translateX }] },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={[styles.iosNoteCard, Shadows.card]}
            activeOpacity={0.85}
            onPress={() => {
              if (isOpen) {
                closeCard();
              } else {
                onPress();
              }
            }}
          >
            <View style={styles.noteCardTopRow}>
              {/* 课程标签：纯色底加白字（用户要求） */}
              <View
                style={[
                  styles.courseColorPill,
                  {
                    backgroundColor: getSolidCourseColor(note.courseName),
                    borderWidth: 0,
                  },
                ]}
              >
                <Text style={styles.courseColorPillText}>
                  {note.courseName}
                </Text>
              </View>

              <Text style={styles.noteDateText}>{note.date}</Text>
            </View>

            <Text style={styles.noteCardTitle} numberOfLines={1}>
              {note.title}
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
                    <Ionicons name="mic-outline" size={11} color="#2563EB" style={{ marginRight: 3 }} />
                    <Text style={[styles.tagBadgeText, { color: '#2563EB' }]}>飞书会议录音</Text>
                  </View>
                )}
              </View>

              <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export const NotesScreen: React.FC<NotesScreenProps> = ({
  initialCourseName,
  onClearInitialCourse,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top || 0,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 40) : 48
  );

  // 顶部生机草木绿流体色块向下浮现入场动效（单调递增，绝不回弹产生白边）
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
      Animated.timing(headerDropAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(dropAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
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
            // 严格过滤历史上曾经遗留的 mock 预设笔记，彻底杜绝任何自动预置假数据
            const cleanNotes = parsed.filter((n: NoteItem) => {
              if (!n) return false;
              const isMockId = ['n1', 'n2', 'n3', 'n4'].includes(n.id);
              const isMockTitle =
                typeof n.title === 'string' &&
                (n.title.includes('多元函数微分学') ||
                  n.title.includes('破冰洽谈') ||
                  n.title.includes('流水线冲突') ||
                  n.title.includes('阅读真题主旨') ||
                  n.title.includes('红黑树旋转') ||
                  n.title.includes('移动端交互设计'));
              return !isMockId && !isMockTitle;
            });
            setNotes(cleanNotes);
            if (cleanNotes.length !== parsed.length) {
              AsyncStorage.setItem('@kexingqiu_notes', JSON.stringify(cleanNotes));
            }
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
  const [customCourseInput, setCustomCourseInput] = useState('');
  const [importedCourses, setImportedCourses] = useState<Course[]>([]);

  // 动态从本地加载真实导入的课程列表（彻底去除预设假课程）
  const loadCourses = async () => {
    try {
      const data = await loadScheduleData();
      if (data && Array.isArray(data.courses)) {
        setImportedCourses(data.courses);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const catalogCourses = useMemo(() => {
    const map = new Map<string, { name: string; teacher?: string; location?: string }>();
    importedCourses.forEach((c) => {
      if (c.name && !map.has(c.name)) {
        map.set(c.name, {
          name: c.name,
          teacher: c.teacher || '',
          location: c.location || '',
        });
      }
    });
    return Array.from(map.values());
  }, [importedCourses]);

  // 涂鸦手绘覆盖模式（放在右下角语音输入上方，打开可在输入的文本上直接写字涂鸦）
  const [isDoodleMode, setIsDoodleMode] = useState(false);
  const [doodleStrokes, setDoodleStrokes] = useState<DrawingStroke[]>([]);
  const [currentDoodleStroke, setCurrentDoodleStroke] = useState<StrokePoint[]>([]);

  const isDoodleModeRef = useRef(isDoodleMode);
  isDoodleModeRef.current = isDoodleMode;
  const doodleStrokesRef = useRef<DrawingStroke[]>([]);
  doodleStrokesRef.current = doodleStrokes;
  const currentDoodleStrokeRef = useRef<StrokePoint[]>([]);

  // 涂鸦手势（支持真实笔刷压感，在文本上方自由画图/写公式）
  const doodlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isDoodleModeRef.current,
      onMoveShouldSetPanResponder: () => isDoodleModeRef.current,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const initialPt: StrokePoint = {
          x: locationX,
          y: locationY,
          w: 3.5,
          t: Date.now(),
        };
        currentDoodleStrokeRef.current = [initialPt];
        setCurrentDoodleStroke([initialPt]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const now = Date.now();
        const pts = currentDoodleStrokeRef.current;
        const lastPt = pts.length > 0 ? pts[pts.length - 1] : null;

        let w = 3.5;
        if (lastPt) {
          const dist = Math.hypot(locationX - lastPt.x, locationY - lastPt.y);
          if (dist < 1.0) return;
          const dt = Math.max(10, now - (lastPt.t || now - 16));
          const speed = dist / dt;

          let speedFactor = 1.0;
          if (speed > 1.2) {
            speedFactor = Math.max(0.5, 1.2 / speed);
          } else if (speed < 0.4) {
            speedFactor = Math.min(1.5, 1.0 + (0.4 - speed) * 1.5);
          }
          const force = evt.nativeEvent.force;
          if (typeof force === 'number' && force > 0) {
            speedFactor *= Math.min(1.8, Math.max(0.5, force * 1.6));
          }
          w = 3.5 * speedFactor;
          if (lastPt.w) {
            w = lastPt.w * 0.35 + w * 0.65;
          }
        }
        const nextPt: StrokePoint = { x: locationX, y: locationY, w, t: now };
        pts.push(nextPt);
        setCurrentDoodleStroke([...pts]);
      },
      onPanResponderRelease: () => {
        const pts = currentDoodleStrokeRef.current;
        if (pts.length > 0) {
          const newStroke: DrawingStroke = {
            points: [...pts],
            color: '#1E293B',
            width: 3.5,
          };
          const next = [...doodleStrokesRef.current, newStroke];
          doodleStrokesRef.current = next;
          setDoodleStrokes(next);
          currentDoodleStrokeRef.current = [];
          setCurrentDoodleStroke([]);
        }
      },
    })
  ).current;

  // 苹果 Freeform 无边记无限画布状态（默认空白，无预设标题）
  const [freeformModalVisible, setFreeformModalVisible] = useState(false);
  const [freeformTargetCourse, setFreeformTargetCourse] = useState('');
  const [freeformTargetTitle, setFreeformTargetTitle] = useState('');

  // ================= 飞书风格语音会议记录核心状态与逻辑 =================
  const [feishuVoiceVisible, setFeishuVoiceVisible] = useState(false);
  const [feishuVoiceMode, setFeishuVoiceMode] = useState<'editor' | 'standalone'>('editor');
  const [feishuIsPaused, setFeishuIsPaused] = useState(false);
  const [feishuSeconds, setFeishuSeconds] = useState(0);
  const [feishuTranscript, setFeishuTranscript] = useState('');
  const [feishuAudioWaves, setFeishuAudioWaves] = useState<number[]>([
    8, 14, 22, 32, 26, 16, 24, 34, 28, 18, 12, 20, 26, 30, 20, 14
  ]);

  const feishuPulseAnim = useRef(new Animated.Value(1)).current;
  const feishuTimerRef = useRef<any>(null);
  const feishuWavesIntervalRef = useRef<any>(null);
  const feishuActiveTranscriptRef = useRef('');
  feishuActiveTranscriptRef.current = feishuTranscript;
  const feishuIsNativeActiveRef = useRef(false);
  const feishuNativeSubsRef = useRef<any[]>([]);

  // 监听外部带参数打开
  useEffect(() => {
    if (initialCourseName) {
      setSelectedFolder(initialCourseName);
      setEditorVisible(false);
      if (onClearInitialCourse) {
        onClearInitialCourse();
      }
    }
  }, [initialCourseName]);

  // 启动飞书会议语音记录
  const startFeishuVoiceSession = (mode: 'editor' | 'standalone' = 'editor') => {
    setFeishuVoiceMode(mode);
    setFeishuVoiceVisible(true);
    setFeishuIsPaused(false);
    setFeishuSeconds(0);
    setFeishuTranscript('');

    // 脉冲呼吸红点动效
    Animated.loop(
      Animated.sequence([
        Animated.timing(feishuPulseAnim, {
          toValue: 1.35,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(feishuPulseAnim, {
          toValue: 1.0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 计时器
    clearInterval(feishuTimerRef.current);
    feishuTimerRef.current = setInterval(() => {
      setFeishuSeconds((s) => s + 1);
    }, 1000);

    // 启动声波波动
    startFeishuWaveAnimation();

    // 启动真实原生语音识别
    startNativeSpeechSession();
  };

  const startFeishuWaveAnimation = () => {
    clearInterval(feishuWavesIntervalRef.current);
    feishuWavesIntervalRef.current = setInterval(() => {
      const now = Date.now() / 180;
      const waves = Array.from({ length: 16 }).map((_, i) => {
        const base = Math.sin(now + i * 0.45) * 14 + 18;
        const noise = (Math.random() - 0.5) * 8;
        return Math.max(6, Math.min(38, Math.round(base + noise)));
      });
      setFeishuAudioWaves(waves);
    }, 90);
  };

  const startNativeSpeechSession = () => {
    if (ExpoSpeechRecognition) {
      ExpoSpeechRecognition.requestPermissionsAsync()
        .then((res: any) => {
          if (res?.granted) {
            if (feishuNativeSubsRef.current.length > 0) {
              feishuNativeSubsRef.current.forEach((s: any) => s?.remove?.());
              feishuNativeSubsRef.current = [];
            }

            const resSub = ExpoSpeechRecognition.addSpeechRecognitionListener(
              'result',
              (event: any) => {
                const text = event.results?.[0]?.transcript;
                if (text) {
                  setFeishuTranscript(text);
                }
              }
            );

            const volSub = ExpoSpeechRecognition.addSpeechRecognitionListener(
              'volumechange',
              (event: any) => {
                const vol = typeof event.value === 'number' ? Math.max(0, event.value) : 10;
                const scaledWaves = Array.from({ length: 16 }).map((_, i) => {
                  const waveH = Math.max(6, Math.min(42, 8 + vol * (2.0 + (i % 5) * 0.4)));
                  return Math.round(waveH);
                });
                setFeishuAudioWaves(scaledWaves);
              }
            );

            feishuNativeSubsRef.current = [resSub, volSub];

            ExpoSpeechRecognition.start({
              lang: 'zh-CN',
              interimResults: true,
              continuous: true,
              addsPunctuation: true,
              requiresOnDeviceRecognition: false,
            }).catch((e: any) => {
              console.log('Feishu speech recognition start error:', e);
            });

            feishuIsNativeActiveRef.current = true;
          }
        })
        .catch((e: any) => {
          console.log('Permission error:', e);
        });
    }
  };

  // 暂停或恢复录音
  const toggleFeishuPause = () => {
    if (!feishuIsPaused) {
      setFeishuIsPaused(true);
      clearInterval(feishuTimerRef.current);
      clearInterval(feishuWavesIntervalRef.current);
      if (ExpoSpeechRecognition && feishuIsNativeActiveRef.current) {
        try {
          ExpoSpeechRecognition.stop();
        } catch (e) {}
        feishuIsNativeActiveRef.current = false;
      }
    } else {
      setFeishuIsPaused(false);
      feishuTimerRef.current = setInterval(() => {
        setFeishuSeconds((s) => s + 1);
      }, 1000);
      startFeishuWaveAnimation();
      startNativeSpeechSession();
    }
  };

  const stopFeishuEngines = () => {
    clearInterval(feishuTimerRef.current);
    clearInterval(feishuWavesIntervalRef.current);
    if (ExpoSpeechRecognition && feishuIsNativeActiveRef.current) {
      try {
        ExpoSpeechRecognition.stop();
      } catch (e) {}
      if (feishuNativeSubsRef.current.length > 0) {
        feishuNativeSubsRef.current.forEach((s: any) => s?.remove?.());
        feishuNativeSubsRef.current = [];
      }
      feishuIsNativeActiveRef.current = false;
    }
  };

  // 放弃录音
  const discardFeishuSession = () => {
    stopFeishuEngines();
    setFeishuVoiceVisible(false);
    setFeishuTranscript('');
    setFeishuSeconds(0);
  };

  // 完成录音并填入/保存
  const finishFeishuSession = () => {
    stopFeishuEngines();
    const finalTranscript =
      feishuActiveTranscriptRef.current.trim() || '随堂核心知识点研讨发言与核心要点纪要。';

    if (feishuVoiceMode === 'editor') {
      const start = Math.min(cursorSelection.start, inputContent.length);
      const end = Math.min(cursorSelection.end, inputContent.length);
      const before = inputContent.substring(0, start);
      const after = inputContent.substring(end);
      const separator = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
      const updated = before + separator + finalTranscript + after;
      setInputContent(updated);
      const newPos = start + separator.length + finalTranscript.length;
      setCursorSelection({ start: newPos, end: newPos });
      setToastMessage('✅ 飞书会议语音转文字已插入笔记');
    } else {
      const newNote: NoteItem = {
        id: `n-${Date.now()}`,
        courseName: '未关联课程',
        title: finalTranscript.split('\n')[0].substring(0, 24) || '随堂会议语音纪要',
        date: '刚刚',
        content: finalTranscript,
        tags: ['会议录音', '语音速记'],
        type: 'text',
        hasAudio: true,
      };
      const updated = [newNote, ...notes];
      setNotes(updated);
      AsyncStorage.setItem('@kexingqiu_notes', JSON.stringify(updated));
      setToastMessage('🎉 已生成飞书会议语音笔记');
    }

    setFeishuVoiceVisible(false);
    setFeishuTranscript('');
    setFeishuSeconds(0);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 删除笔记（支持左滑删除与平滑消失动画）
  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    AsyncStorage.setItem('@kexingqiu_notes', JSON.stringify(updated));
    setToastMessage('🗑️ 随堂笔记已删除');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 打开笔记编辑
  const handleOpenNote = (note: NoteItem) => {
    if (note.type === 'freeform' && (!note.content || note.content.includes('【无边记无限画纸】'))) {
      setFreeformTargetCourse(note.courseName);
      setFreeformTargetTitle(note.title);
      setFreeformModalVisible(true);
      return;
    }
    setEditingNoteId(note.id);
    setInputCourseName(note.courseName);
    setInputTitle(note.title);
    setInputContent(note.content);
    setDoodleStrokes(note.doodleStrokes || []);
    doodleStrokesRef.current = note.doodleStrokes || [];
    setIsDoodleMode(false);
    setCursorSelection({ start: note.content.length, end: note.content.length });
    setEditorVisible(true);
  };

  // 新建随堂笔记 (按要求：手动打开默认未关联课程，标题为空白)
  const handleCreateNewNote = () => {
    setEditingNoteId(null);
    setInputCourseName('未关联课程');
    setInputTitle('');
    setInputContent('');
    setDoodleStrokes([]);
    doodleStrokesRef.current = [];
    setIsDoodleMode(false);
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
              doodleStrokes,
              type: (doodleStrokes.length > 0 ? 'freeform' : 'text') as 'freeform' | 'text',
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
        doodleStrokes,
        tags: ['随堂笔记'],
        type: (doodleStrokes.length > 0 ? 'freeform' : 'text') as 'freeform' | 'text',
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
      {/* 顶部生机草木绿流体区域（带向下浮现入场动画，单调递增无回弹） */}
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
        <View style={styles.headerTopRow}>
          <Text style={styles.screenMainTitle}>笔记</Text>

          <View style={styles.headerActionBtns}>
            {/* 飞书会议录音快捷入口 */}
            <TouchableOpacity
              style={styles.greenMeetingVoiceBtn}
              onPress={() => startFeishuVoiceSession('standalone')}
              activeOpacity={0.8}
            >
              <Ionicons name="mic" size={15} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.greenMeetingVoiceBtnText}>会议录音</Text>
            </TouchableOpacity>

            {/* 无边记快捷入口（默认全新空白，无预设标题） */}
            <TouchableOpacity
              style={styles.greenFreeformBtn}
              onPress={() => {
                setFreeformTargetCourse('');
                setFreeformTargetTitle('');
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
        contentContainerStyle={{ paddingBottom: 96, flexGrow: 1 }}
      >
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyNotesContainer}>
            <Ionicons name="document-text-outline" size={46} color="#CBD5E1" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyNotesTitle}>暂无随堂笔记</Text>
            <Text style={styles.emptyNotesSubtitle}>
              点击右上角「+」或底部悬浮键创建第一篇随堂笔记
            </Text>
          </View>
        ) : (
          filteredNotes.map((note) => (
            <SwipeableNoteCard
              key={note.id}
              note={note}
              onPress={() => handleOpenNote(note)}
              onDelete={handleDeleteNote}
            />
          ))
        )}
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
                if (feishuVoiceVisible) {
                  discardFeishuSession();
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

            {/* 辅助信息与工具条（已按用户要求去掉顶部的日期和字数显示） */}
            <View style={styles.metaInfoRow}>
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
            </View>

            {/* 正文输入与覆盖涂鸦手绘层（无边框纯净文档，打开涂鸦开关可直接在文本上方自由写字） */}
            <View style={styles.documentBodyWrapper}>
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

              {/* 手绘涂鸦覆盖层：当右下角开关打开时，可直接在文本上方自由写字、批注、推导 */}
              <View
                style={StyleSheet.absoluteFill}
                pointerEvents={isDoodleMode ? 'auto' : 'none'}
                {...doodlePanResponder.panHandlers}
              >
                <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
                  {doodleStrokes.map((s, idx) => (
                    <Path
                      key={`doodle-${idx}`}
                      d={strokeToOutlinePath(s.points, s.width)}
                      fill={s.color}
                    />
                  ))}
                  {currentDoodleStroke.length > 0 && (
                    <Path
                      d={strokeToOutlinePath(currentDoodleStroke, 3.5)}
                      fill="#1E293B"
                    />
                  )}
                </Svg>
              </View>
            </View>

            <View style={{ height: 180 }} />
          </ScrollView>

          {/* 右下角涂鸦开关浮动工具（按用户要求：放在右下角，语音输入上面，打开可以在输入的文本上写字） */}
          <View style={[styles.bottomRightDoodleAnchor, { bottom: Math.max(insets.bottom, 12) + 64 }]}>
            {isDoodleMode && doodleStrokes.length > 0 && (
              <TouchableOpacity
                style={styles.doodleMiniActionBtn}
                onPress={() => {
                  const next = doodleStrokes.slice(0, -1);
                  doodleStrokesRef.current = next;
                  setDoodleStrokes(next);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-undo-outline" size={16} color="#475569" />
              </TouchableOpacity>
            )}
            {isDoodleMode && doodleStrokes.length > 0 && (
              <TouchableOpacity
                style={styles.doodleMiniActionBtn}
                onPress={() => {
                  doodleStrokesRef.current = [];
                  setDoodleStrokes([]);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.doodleToggleSwitch,
                isDoodleMode && styles.doodleToggleSwitchActive,
                Shadows.card,
              ]}
              onPress={() => setIsDoodleMode((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isDoodleMode ? 'brush' : 'brush-outline'}
                size={17}
                color={isDoodleMode ? '#FFFFFF' : Colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.doodleToggleSwitchText,
                  isDoodleMode && styles.doodleToggleSwitchTextActive,
                ]}
              >
                {isDoodleMode ? '涂鸦中' : '涂鸦'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 底部语音交互条 */}
          <View style={[styles.bottomVoiceDock, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {/* 飞书语音会议纪要 / 随堂录音按钮 */}
            <TouchableOpacity
              style={styles.feishuVoiceBarTrigger}
              onPress={() => startFeishuVoiceSession('editor')}
              activeOpacity={0.8}
            >
              <View style={styles.feishuVoiceBarIconBg}>
                <Ionicons name="mic" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.feishuVoiceBarInfo}>
                <Text style={styles.feishuVoiceBarTitle}>飞书会议语音速记</Text>
                <Text style={styles.feishuVoiceBarSub}>点击开启随堂录音，实时转写为文字填入笔记</Text>
              </View>
              <View style={styles.feishuVoiceBarPill}>
                <Ionicons name="sparkles" size={12} color="#2563EB" style={{ marginRight: 3 }} />
                <Text style={styles.feishuVoiceBarPillText}>实时纪要</Text>
              </View>
            </TouchableOpacity>
          </View>

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
                  {catalogCourses.length === 0 ? (
                    <View style={styles.emptyCourseDrawerNotice}>
                      <Ionicons name="school-outline" size={32} color="#94A3B8" style={{ marginBottom: 6 }} />
                      <Text style={styles.emptyCourseDrawerTitle}>尚未导入教务课程</Text>
                      <Text style={styles.emptyCourseDrawerSub}>可在课表页面一键导入，或在下方直接输入课程名称</Text>
                    </View>
                  ) : (
                    catalogCourses.map((courseItem) => {
                      const isSelected = inputCourseName === courseItem.name;

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
                            <View style={styles.courseItemMeta}>
                              <Text style={styles.courseItemName}>{courseItem.name}</Text>
                              {courseItem.teacher ? (
                                <Text style={styles.courseItemTeacher}>
                                  {courseItem.teacher} {courseItem.location ? `· ${courseItem.location}` : ''}
                                </Text>
                              ) : null}
                            </View>
                          </View>

                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}

                  {/* 自定义输入课程名称选项 */}
                  <View style={styles.customCourseSection}>
                    <Text style={styles.customCourseLabel}>自定义课程名称</Text>
                    <View style={styles.customCourseInputRow}>
                      <TextInput
                        style={styles.customCourseInput}
                        placeholder="输入课程名称..."
                        placeholderTextColor="#94A3B8"
                        value={customCourseInput}
                        onChangeText={setCustomCourseInput}
                      />
                      <TouchableOpacity
                        style={styles.customCourseApplyBtn}
                        onPress={() => {
                          if (customCourseInput.trim()) {
                            setInputCourseName(customCourseInput.trim());
                            setCourseDrawerVisible(false);
                            setCustomCourseInput('');
                          }
                        }}
                      >
                        <Text style={styles.customCourseApplyText}>使用</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 未关联课程选项 */}
                  <TouchableOpacity
                    style={[
                      styles.drawerCourseItem,
                      inputCourseName === '未关联课程' && styles.drawerCourseItemActive,
                      { marginTop: 8 }
                    ]}
                    onPress={() => {
                      setInputCourseName('未关联课程');
                      setCourseDrawerVisible(false);
                    }}
                  >
                    <Text style={[styles.courseItemName, { color: '#64748B' }]}>暂不关联课程（独立笔记）</Text>
                    {inputCourseName === '未关联课程' && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
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
                title: data.title.trim() || (freeformTargetCourse ? `${freeformTargetCourse} 手写笔记` : '随堂手写笔记'),
                date: '刚刚',
                content:
                  data.notes.length > 0 || data.strokes.length > 0
                    ? `包含 ${data.notes.length} 张便签，${data.strokes.length} 段墨水手绘。`
                    : '',
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

      {/* ================= 飞书风格语音会议/速记记录器 (Lark Minutes Audio Meeting Recorder) ================= */}
      <Modal
        visible={feishuVoiceVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={discardFeishuSession}
      >
        <View style={styles.feishuBackdrop}>
          <View style={styles.feishuCard}>
            {/* 顶部手柄条 */}
            <View style={styles.feishuHandleBar} />

            {/* 顶栏：实时状态与场景标签 */}
            <View style={styles.feishuHeaderRow}>
              <View style={styles.feishuLiveBadge}>
                <Animated.View
                  style={[
                    styles.feishuLiveDot,
                    feishuIsPaused && { backgroundColor: '#F59E0B' },
                    !feishuIsPaused && { transform: [{ scale: feishuPulseAnim }] },
                  ]}
                />
                <Text style={styles.feishuLiveText}>
                  {feishuIsPaused ? '录音已暂停' : '会议录音中'}
                </Text>
              </View>

              <View style={styles.feishuTagPill}>
                <Text style={styles.feishuTagPillText}>普通话 · 实时转文字</Text>
              </View>

              <TouchableOpacity
                style={styles.feishuCloseBtn}
                onPress={discardFeishuSession}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* 核心计时器与飞书灵动音浪 */}
            <View style={styles.feishuTimerWaveSection}>
              <Text style={styles.feishuBigTimer}>{formatTimer(feishuSeconds)}</Text>

              <View style={styles.feishuWaveSpectrumRow}>
                {feishuAudioWaves.map((h, idx) => {
                  const isMiddle = idx >= 4 && idx <= 11;
                  const barColor = isMiddle ? '#2563EB' : '#10B981';
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.feishuSpectrumBar,
                        {
                          height: feishuIsPaused ? 4 : h,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </View>

            {/* 飞书实时转写内容卡片区 */}
            <View style={styles.feishuTranscriptBox}>
              <View style={styles.feishuTranscriptHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="chatbox-ellipses-outline" size={15} color="#2563EB" />
                  <Text style={styles.feishuTranscriptTitle}>实时发言转写</Text>
                </View>
                <View style={styles.feishuCharCountBadge}>
                  <Text style={styles.feishuCharCountText}>
                    {feishuTranscript.length} 字
                  </Text>
                </View>
              </View>

              <ScrollView
                style={styles.feishuTranscriptScroll}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {feishuTranscript ? (
                  <Text style={styles.feishuTranscriptActiveText}>
                    {feishuTranscript}
                    {!feishuIsPaused && <Text style={styles.feishuBlinkingCursor}>▍</Text>}
                  </Text>
                ) : (
                  <View style={styles.feishuEmptyPromptWrap}>
                    <Text style={styles.feishuEmptyPromptText}>
                      {feishuIsPaused
                        ? '录音已暂停，点击下方「继续」恢复聆听'
                        : '🎙️ 正在聆听课堂发言与会议内容，实时转写为文字...\n可随时暂停或完成填入。'}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* 飞书三键控制底座 */}
            <View style={styles.feishuControlDock}>
              {/* 左：放弃 */}
              <TouchableOpacity
                style={styles.feishuDiscardBtn}
                onPress={discardFeishuSession}
                activeOpacity={0.75}
              >
                <Ionicons name="trash-outline" size={20} color="#64748B" />
                <Text style={styles.feishuDiscardBtnText}>放弃</Text>
              </TouchableOpacity>

              {/* 中：暂停 / 继续 */}
              <TouchableOpacity
                style={[
                  styles.feishuPauseResumeBtn,
                  feishuIsPaused && styles.feishuResumeBtnActive,
                ]}
                onPress={toggleFeishuPause}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={feishuIsPaused ? 'mic' : 'pause'}
                  size={28}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {/* 右：完成填入 / 保存 */}
              <TouchableOpacity
                style={styles.feishuFinishBtn}
                onPress={finishFeishuSession}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 5 }} />
                <Text style={styles.feishuFinishBtnText}>
                  {feishuVoiceMode === 'editor' ? '完成填入' : '完成保存'}
                </Text>
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
  emptyNotesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyNotesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  emptyNotesSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
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
    color: '#FFFFFF',
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
  // Swipe to delete styles
  swipeContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  deleteBtnWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 12,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteActionBtn: {
    backgroundColor: '#EF4444',
    width: 68,
    height: '92%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  swipeForeground: {
    backgroundColor: 'transparent',
    zIndex: 2,
  },

  // 顶部 Feishu 语音会议速记按钮
  greenMeetingVoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F766E',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Rounded.pill,
    gap: 5,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  greenMeetingVoiceBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // 编辑器中触发条
  feishuVoiceBarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  feishuVoiceBarIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  feishuVoiceBarInfo: {
    flex: 1,
  },
  feishuVoiceBarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  feishuVoiceBarSub: {
    fontSize: 11,
    color: '#60A5FA',
    marginTop: 1,
  },
  feishuVoiceBarPill: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Rounded.pill,
  },
  feishuVoiceBarPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
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

  // ================= 飞书语音会议纪要 (Feishu Meeting Minutes Style) =================
  feishuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  feishuCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '82%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 24,
  },
  feishuHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  feishuHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  feishuLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Rounded.pill,
  },
  feishuLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  feishuLiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  feishuTagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Rounded.pill,
  },
  feishuTagPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  feishuCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  feishuTimerWaveSection: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 14,
  },
  feishuBigTimer: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
    marginBottom: 12,
  },
  feishuWaveSpectrumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    gap: 4,
  },
  feishuSpectrumBar: {
    width: 4,
    borderRadius: 2,
  },
  feishuTranscriptBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    minHeight: 140,
    maxHeight: 220,
    marginBottom: 20,
  },
  feishuTranscriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  feishuTranscriptTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  feishuCharCountBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  feishuCharCountText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  feishuTranscriptScroll: {
    maxHeight: 150,
  },
  feishuTranscriptActiveText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1E293B',
    fontWeight: '500',
  },
  feishuBlinkingCursor: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '800',
  },
  feishuEmptyPromptWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  feishuEmptyPromptText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  feishuControlDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  feishuDiscardBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  feishuDiscardBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
  },
  feishuPauseResumeBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  feishuResumeBtnActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  feishuFinishBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  feishuFinishBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 4,
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
  documentBodyWrapper: {
    position: 'relative',
    minHeight: 380,
  },
  bottomRightDoodleAnchor: {
    position: 'absolute',
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 90,
  },
  doodleMiniActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doodleToggleSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Rounded.pill,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doodleToggleSwitchActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  doodleToggleSwitchText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  doodleToggleSwitchTextActive: {
    color: '#FFFFFF',
  },
  emptyCourseDrawerNotice: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyCourseDrawerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  emptyCourseDrawerSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  customCourseSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  customCourseLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  customCourseInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customCourseInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  customCourseApplyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  customCourseApplyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
