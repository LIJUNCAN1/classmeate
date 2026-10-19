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
} from 'react-native';
import { Colors, Rounded, Shadows, getCourseColorScheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
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

  const [inputCourseName, setInputCourseName] = useState(
    initialCourseName || COURSES_CATALOG[0].name
  );
  const [inputTitle, setInputTitle] = useState(
    initialTitle || `第 14 周 · ${initialCourseName || COURSES_CATALOG[0].name} 随堂笔记`
  );
  const [inputContent, setInputContent] = useState(initialContent || '');

  useEffect(() => {
    if (initialCourseName) {
      setInputCourseName(initialCourseName);
      if (!initialTitle) {
        setInputTitle(`第 14 周 · ${initialCourseName} 随堂笔记`);
      }
    }
  }, [initialCourseName, initialTitle]);

  // 光标位置追踪
  const [cursorSelection, setCursorSelection] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  // 抽屉状态：选择关联课程
  const [courseDrawerVisible, setCourseDrawerVisible] = useState(false);

  // 语音识别状态与交互 (按住开始 + 上滑锁定 + 悬浮HUD + 实时打字 + 光标填入)
  const [isPressingVoice, setIsPressingVoice] = useState(false);
  const [isHoveringLock, setIsHoveringLock] = useState(false);
  const [isVoiceLocked, setIsVoiceLocked] = useState(false);
  const [realtimeTranscript, setRealtimeTranscript] = useState('');
  const [voiceSeconds, setVoiceSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const activeTranscriptRef = useRef('');

  activeTranscriptRef.current = realtimeTranscript;

  const startRecordingSession = () => {
    setRealtimeTranscript('');
    setVoiceSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setVoiceSeconds((s) => s + 1);
    }, 1000);

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

    const textToInsert = activeTranscriptRef.current.trim();

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

    setIsPressingVoice(false);
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
        setIsHoveringLock(false);
        startRecordingSession();
      },
      onPanResponderMove: (_, gestureState) => {
        if (isVoiceLocked) return;
        if (gestureState.dy < -45) {
          setIsHoveringLock(true);
        } else {
          setIsHoveringLock(false);
        }
      },
      onPanResponderRelease: () => {
        if (isVoiceLocked) return;
        if (isHoveringLock) {
          setIsVoiceLocked(true);
          setIsPressingVoice(false);
        } else {
          finishRecordingAndInsert(true);
        }
      },
      onPanResponderTerminate: () => {
        if (isVoiceLocked) return;
        finishRecordingAndInsert(true);
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
        {/* 顶部操作栏 */}
        <View style={[styles.editorNavBar, { paddingTop: Math.max(insets.top, 16) }]}>
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
          </View>

          <TextInput
            style={styles.iosBodyInput}
            placeholder="在此开始记录课堂要点、推导过程... 也可使用底部语音速记直接在光标处填入。"
            placeholderTextColor="#A0AEC0"
            value={inputContent}
            onChangeText={setInputContent}
            multiline={true}
            textAlignVertical="top"
            onSelectionChange={(e) => {
              setCursorSelection(e.nativeEvent.selection);
            }}
          />

          <View style={{ height: 160 }} />
        </ScrollView>

        {/* 实时听写悬浮小框 (HUD) */}
        {(isPressingVoice || isVoiceLocked) && (
          <View style={[styles.floatingSpeechHUD, Shadows.card]}>
            <View style={styles.hudHeader}>
              <View style={styles.hudWaveRow}>
                <View
                  style={[
                    styles.liveDot,
                    { backgroundColor: isHoveringLock ? '#F59E0B' : '#10B981' },
                  ]}
                />
                <Text style={styles.hudTitle}>
                  {isVoiceLocked
                    ? `已锁定听写 (${voiceSeconds}s) · 可同时键盘打字`
                    : isHoveringLock
                    ? '松开立即锁定语音录音 🔒'
                    : `正在聆听录音 (${voiceSeconds}s)...`}
                </Text>
              </View>

              {isVoiceLocked && (
                <TouchableOpacity
                  style={styles.hudInsertDoneBtn}
                  onPress={() => finishRecordingAndInsert(true)}
                >
                  <Text style={styles.hudInsertDoneText}>结束并插入</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.hudContentBox}>
              <Text style={styles.hudTranscriptText}>
                {realtimeTranscript
                  ? `“${realtimeTranscript}”`
                  : '正在识别语音内容...请清晰讲述课堂发言'}
              </Text>
            </View>

            {!isVoiceLocked && (
              <View style={styles.hudGuideRow}>
                <Ionicons
                  name={isHoveringLock ? 'lock-closed' : 'arrow-up'}
                  size={14}
                  color={isHoveringLock ? '#F59E0B' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.hudGuideText,
                    isHoveringLock && { color: '#F59E0B', fontWeight: '700' },
                  ]}
                >
                  {isHoveringLock ? '松开手指锁定持续录音' : '向上滑动到锁定区可锁住录音'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 底部语音交互条 */}
        <View style={[styles.bottomVoiceDock, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {isVoiceLocked ? (
            <View style={styles.lockedVoiceBar}>
              <View style={styles.lockedVoiceInfo}>
                <View style={styles.pulsingVoiceIcon}>
                  <Ionicons name="mic" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.lockedVoiceTimerText}>录音中 {voiceSeconds}s</Text>
                <Text style={styles.lockedVoiceHintText}>（上方键盘可同时打字）</Text>
              </View>

              <View style={styles.lockedActionButtons}>
                <TouchableOpacity
                  style={styles.lockedCancelBtn}
                  onPress={() => finishRecordingAndInsert(false)}
                >
                  <Text style={styles.lockedCancelText}>取消</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.lockedFinishBtn}
                  onPress={() => finishRecordingAndInsert(true)}
                >
                  <Ionicons name="checkmark" size={15} color="#FFFFFF" style={{ marginRight: 2 }} />
                  <Text style={styles.lockedFinishText}>插入光标处</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.voiceTouchArea,
                isPressingVoice && styles.voiceTouchAreaActive,
                isHoveringLock && styles.voiceTouchAreaLockHover,
              ]}
              {...voicePanResponder.panHandlers}
            >
              <Ionicons
                name={isHoveringLock ? 'lock-closed' : isPressingVoice ? 'mic' : 'mic-outline'}
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
                {isHoveringLock
                  ? '松开锁定持续录音 🔒'
                  : isPressingVoice
                  ? '松开完成 · ↑ 上滑锁定'
                  : '长按语音输入 · 上滑锁定'}
              </Text>
            </View>
          )}
        </View>

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
                  const colorScheme = getCourseColorScheme(courseItem.name);

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
                        <View
                          style={[
                            styles.courseCircleDot,
                            { backgroundColor: colorScheme.text },
                          ]}
                        />

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
  iosBodyInput: {
    fontSize: 16,
    lineHeight: 26,
    color: '#1E293B',
    minHeight: 280,
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
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
