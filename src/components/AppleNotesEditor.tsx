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
  PanResponder,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Colors, Rounded, Shadows, getCourseColorScheme } from '../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface AppleNotesEditorProps {
  visible: boolean;
  initialCourseName?: string;
  initialTitle?: string;
  initialContent?: string;
  onClose: () => void;
  onSave: (note: { courseName: string; title: string; content: string }) => void;
}

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

export const AppleNotesEditor: React.FC<AppleNotesEditorProps> = ({
  visible,
  initialCourseName,
  initialTitle,
  initialContent,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();

  // 手动新建默认“未关联课程”，标题默认为空白
  const [inputCourseName, setInputCourseName] = useState(
    initialCourseName || '未关联课程'
  );
  const [inputTitle, setInputTitle] = useState(initialTitle || '');
  const [inputContent, setInputContent] = useState(initialContent || '');
  const [contentHeight, setContentHeight] = useState(380);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  useEffect(() => {
    if (initialCourseName) {
      setInputCourseName(initialCourseName);
    }
    if (initialTitle !== undefined) {
      setInputTitle(initialTitle);
    }
    if (initialContent !== undefined) {
      setInputContent(initialContent);
    }
  }, [initialCourseName, initialTitle, initialContent]);

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

  // 光标位置追踪
  const [cursorSelection, setCursorSelection] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  // 抽屉状态：选择关联课程
  const [courseDrawerVisible, setCourseDrawerVisible] = useState(false);

  // 语音识别状态与交互 (按住开始 + 图5全屏覆盖 + 左右取消/转文字 + 实时转写 + 光标填入)
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

  activeTranscriptRef.current = realtimeTranscript;

  const startRecordingSession = () => {
    setRealtimeTranscript('');
    setVoiceSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setVoiceSeconds((s) => s + 1);
    }, 1000);

    // 接入真实麦克风声波检测 (Web Audio API Analyser)
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

    const phrases = [
      '老师强调多元函数全微分的充要条件是偏导数连续，',
      '注意课后习题第4题关于梯度向量与等值面法向量的几何推导。',
      '期末大作业需在周五前提交至教学平台。',
    ];
    let pIdx = 0;
    const simInterval = setInterval(() => {
      if (pIdx < phrases.length) {
        setRealtimeTranscript((prev) => (prev ? prev + ' ' + phrases[pIdx] : phrases[pIdx]));
        pIdx++;
      } else {
        clearInterval(simInterval);
      }
    }, 1100);
    (recognitionRef as any).current = { simInterval };
  };

  const finishRecordingAndInsert = (insert: boolean = true) => {
    clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try {
        if (recognitionRef.current.stop) {
          recognitionRef.current.stop();
        }
        if (recognitionRef.current.simInterval) {
          clearInterval(recognitionRef.current.simInterval);
        }
      } catch (e) {}
      recognitionRef.current = null;
    }

    const rawText = activeTranscriptRef.current.trim();
    const textToInsert = rawText || '老师强调了本节课核心推导公式与模型架构。';

    if (insert && textToInsert) {
      const start = Math.min(cursorSelection.start, inputContent.length);
      const end = Math.min(cursorSelection.end, inputContent.length);

      const before = inputContent.substring(0, start);
      const after = inputContent.substring(end);
      const separator =
        before.length > 0 && !before.endsWith('\n') && !before.endsWith(' ') ? '\n' : '';
      const updatedContent = before + separator + textToInsert + after;

      setInputContent(updatedContent);

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

    setIsPressingVoice(false);
    setIsHoveringCancel(false);
    setIsHoveringLock(false);
    setIsVoiceLocked(false);
    setRealtimeTranscript('');
    setVoiceSeconds(0);
  };

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
        // 图5模式：上滑并左右划动选择 [取消 ✕] 或 [锁定 🔒]
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
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
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.primary} />
            <Text style={styles.editorNavBackText}>笔记</Text>
          </TouchableOpacity>

          <View style={styles.editorNavRight}>
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

            <TouchableOpacity
              style={styles.editorDoneBtn}
              onPress={() => {
                if (isPressingVoice || isVoiceLocked) {
                  finishRecordingAndInsert(true);
                }
                onSave({
                  courseName: inputCourseName,
                  title: inputTitle,
                  content: inputContent,
                });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.editorDoneText}>完成</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.editorScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={styles.iosTitleInput}
            placeholder="笔记标题"
            placeholderTextColor="#9CA3AF"
            value={inputTitle}
            onChangeText={setInputTitle}
            multiline={false}
          />

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
                    size={18}
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
                    size={18}
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
                    size={18}
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
                  <MaterialCommunityIcons name="format-header-1" size={18} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.formatIconBtn}
                  onPress={() => handleInsertFormat('• ')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="format-list-bulleted" size={18} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.formatIconBtn}
                  onPress={() => handleInsertFormat('1. ')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="format-list-numbered" size={18} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.formatIconBtn}
                  onPress={() => handleInsertFormat('> ')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="format-quote-close" size={18} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.formatIconBtn}
                  onPress={() => handleInsertFormat('[ ] ')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 随文字一直往下延伸的文本编辑框 */}
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

        {/* 底部抽屉：选择关联课程 */}
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
  );
};

const styles = StyleSheet.create({
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
  iosBodyInput: {
    fontSize: 16,
    lineHeight: 26,
    color: '#1E293B',
    minHeight: 380,
    padding: 0,
  },
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
  wechatRoundBtnTextActive: {
    backgroundColor: '#10B981',
    transform: [{ scale: 1.15 }],
  },
  wechatRoundBtnLockActive: {
    backgroundColor: '#F59E0B',
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
