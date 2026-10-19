import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  Animated,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { WeekCalendarStrip } from '../components/WeekCalendarStrip';
import { CourseCard } from '../components/CourseCard';
import { WeekGridView } from '../components/WeekGridView';
import { AppleNotesEditor } from '../components/AppleNotesEditor';
import { FreeformCanvas } from '../components/FreeformCanvas';
import { Course } from '../types/schedule';
import { AutoScheduleService, AutoDetectStatus } from '../services/autoScheduleDetector';

interface ScheduleScreenProps {
  onNavigateToNotesTab?: (courseName: string) => void;
}

// 包含周一至周日完整一周的课程排期数据（最左侧规范为：必修课、选修课、专业课、通识课）
const FULL_WEEK_COURSES: Course[] = [
  // 周一 (dayOfWeek = 1)
  {
    id: 'c-1',
    name: '高等数学 (AI 与数据方向)',
    teacher: '张晓华 教授',
    location: '第一教学楼 A204',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:35',
    stageTag: '必修课 · 48课时 · 周一1-2节',
    status: 'in_progress',
    notesCount: 2,
  },
  {
    id: 'c-2',
    name: '计算机系统结构',
    teacher: '王工 讲师',
    location: '信息实验楼 301实验室',
    dayOfWeek: 1,
    startTime: '14:00',
    endTime: '15:35',
    stageTag: '专业课 · 32课时 · 周一5-6节',
    status: 'pending',
    notesCount: 1,
  },

  // 周二 (dayOfWeek = 2)
  {
    id: 'c-3',
    name: '大学英语写作与思辨',
    teacher: 'Sarah 外教',
    location: '外国语学院 405研讨室',
    dayOfWeek: 2,
    startTime: '10:00',
    endTime: '11:35',
    stageTag: '通识课 · 32课时 · 周二3-4节',
    status: 'pending',
    notesCount: 0,
  },

  // 周三 (dayOfWeek = 3)
  {
    id: 'c-4',
    name: '成人商务韩语谈判',
    teacher: 'Jennifer 老师',
    location: '国际交流中心 302',
    dayOfWeek: 3,
    startTime: '09:00',
    endTime: '10:35',
    stageTag: '选修课 · 36课时 · 周三1-2节',
    status: 'pending',
    notesCount: 3,
  },
  {
    id: 'c-5',
    name: 'TOPIK备考（留学专攻）',
    teacher: 'Stefanee 讲师',
    location: '同声传译实训室 401',
    dayOfWeek: 3,
    startTime: '13:30',
    endTime: '15:05',
    stageTag: '选修课 · 32课时 · 周三5-6节',
    status: 'pending',
    notesCount: 1,
  },
  {
    id: 'c-6',
    name: '韩语口语突破1v1',
    teacher: 'Cipher 老师',
    location: '在线协同音视频 2室',
    dayOfWeek: 3,
    startTime: '16:30',
    endTime: '17:45',
    stageTag: '选修课 · 24课时 · 周三7-8节',
    status: 'pending',
    notesCount: 0,
  },

  // 周四 (dayOfWeek = 4)
  {
    id: 'c-7',
    name: '数据结构与算法',
    teacher: '李院长',
    location: '软件工程学院 208机房',
    dayOfWeek: 4,
    startTime: '08:00',
    endTime: '09:35',
    stageTag: '专业课 · 48课时 · 周四1-2节',
    status: 'pending',
    notesCount: 4,
  },

  // 周五 (dayOfWeek = 5)
  {
    id: 'c-8',
    name: '交互设计与UI艺术',
    teacher: '陈总监',
    location: '创新设计工坊 102艺术厅',
    dayOfWeek: 5,
    startTime: '10:00',
    endTime: '12:25',
    stageTag: '选修课 · 36课时 · 周五3-5节',
    status: 'pending',
    notesCount: 2,
  },
];

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  onNavigateToNotesTab,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44
  );

  // 获取今日真实日期与星期
  const getTodayInfo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    // getDay() 0是周日，对应星期数字 7，其它1-6
    const dNum = now.getDay() === 0 ? 7 : now.getDay();
    return { dateStr, dayOfWeek: dNum };
  };

  // 模式：【今日】 vs 【周课表】（按要求将“日视图”改名为“今日”）
  const [scheduleViewMode, setScheduleViewMode] = useState<'day' | 'week'>('day');

  // 当前选中日期与对应星期几 (默认自动严格锁定今天的真实日期)
  const [selectedDate, setSelectedDate] = useState(() => getTodayInfo().dateStr);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(() => getTodayInfo().dayOfWeek);

  // 悬浮提醒 Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 课程表直开笔记：选择记录方式弹窗与编辑器状态
  const [recordModeModalVisible, setRecordModeModalVisible] = useState(false);
  const [selectedCourseForNote, setSelectedCourseForNote] = useState<Course | null>(null);
  const [appleNotesEditorVisible, setAppleNotesEditorVisible] = useState(false);
  const [freeformVisible, setFreeformVisible] = useState(false);

  // 点击卡片上的“记笔记”：弹出记录方式选择，直接开启对应编辑器
  const handleStartNoteForCourse = (course: Course) => {
    setSelectedCourseForNote(course);
    setRecordModeModalVisible(true);
  };

  // 退出笔记时：按要求直接跳转并切换到笔记页面
  const handleExitNote = () => {
    const targetCourse = selectedCourseForNote?.name;
    setAppleNotesEditorVisible(false);
    setFreeformVisible(false);
    if (onNavigateToNotesTab && targetCourse) {
      onNavigateToNotesTab(targetCourse);
    }
  };

  // 页面向下平滑出现的淡入向下动画 (Downward Entrance Animation)
  const dropAnim = useRef(new Animated.Value(-18)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const triggerEntranceAnimation = () => {
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
  };

  // 页面初次加载时触发向下出现动画
  useEffect(() => {
    triggerEntranceAnimation();
  }, [scheduleViewMode]);

  // 1. 每天 0:00 自动切换日期的机制
  useEffect(() => {
    const updateToRealToday = () => {
      const today = getTodayInfo();
      setSelectedDate(today.dateStr);
      setSelectedDayOfWeek(today.dayOfWeek);
    };

    updateToRealToday();

    // 计算距离明日凌晨 00:00:01 的倒计时
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    const msToMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      updateToRealToday();
      const dailyTimer = setInterval(updateToRealToday, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyTimer);
    }, msToMidnight);

    return () => clearTimeout(midnightTimer);
  }, []);

  // 2. 切换日期处理函数（点击日历轴任意一天，立刻切换过滤出该天的课表）
  const handleSelectDate = (dateStr: string, dayOfWeek: number) => {
    setSelectedDate(dateStr);
    setSelectedDayOfWeek(dayOfWeek);
    triggerEntranceAnimation();
  };

  // 3. 点击切换回“今日”模式时，自动复位到今天的日期
  const handleSwitchToToday = () => {
    setScheduleViewMode('day');
    const today = getTodayInfo();
    setSelectedDate(today.dateStr);
    setSelectedDayOfWeek(today.dayOfWeek);
    triggerEntranceAnimation();
  };

  // 4. 根据当前选中的星期几过滤出对应课程（用于下方课表列表）
  const dayCourses = FULL_WEEK_COURSES.filter((c) => c.dayOfWeek === selectedDayOfWeek);

  // 本日真实剩余课程（锁定真实今天的课程，不随日历轴点击切换而改变！）
  const realTodayDayOfWeek = getTodayInfo().dayOfWeek;
  const realTodayCourses = FULL_WEEK_COURSES.filter((c) => c.dayOfWeek === realTodayDayOfWeek);

  // 引导重新导入课程表向导状态（与首次未导入时完全一致的引导流程）
  const [reimportModalVisible, setReimportModalVisible] = useState(false);
  const [importStep, setImportStep] = useState<'select' | 'scanning' | 'success'>('select');
  const [importProgress, setImportProgress] = useState(0);

  const handleOpenReimportModal = () => {
    setImportStep('select');
    setImportProgress(0);
    setReimportModalVisible(true);
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
    setReimportModalVisible(false);
    triggerEntranceAnimation();
    setToastMessage('🎉 教务课表已重新引导导入，已对齐最新学期教学日历！');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 5. 点击接入系统提醒事项
  const handleToggleReminder = (course: Course, enabled: boolean) => {
    const msg = enabled
      ? `🔔 已接入系统提醒事项：将在【${course.name}】课前15分钟提醒`
      : `🔕 已关闭【${course.name}】上课提醒`;
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 顶部生机草木绿流体区域 */}
      <View style={[styles.heroHeader, { paddingTop: topPadding + 6 }]}>
        {/* 用户信息与 【今日 | 周课表】 切换 */}
        <View style={styles.userInfoRow}>
          <Text style={styles.screenMainTitle}>课程表</Text>

          {/* 模式切换：今日 vs 周课表 (已将“日视图”按要求改为“今日”) */}
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              style={[
                styles.modeBtn,
                scheduleViewMode === 'day' && styles.modeBtnActive,
              ]}
              onPress={handleSwitchToToday}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  scheduleViewMode === 'day' ? styles.modeBtnTextActive : styles.modeBtnTextInactive,
                ]}
              >
                今日
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeBtn,
                scheduleViewMode === 'week' && styles.modeBtnActive,
              ]}
              onPress={() => setScheduleViewMode('week')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  scheduleViewMode === 'week' ? styles.modeBtnTextActive : styles.modeBtnTextInactive,
                ]}
              >
                周课表
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 仅保留：本日剩余课（无论日历轴切换到哪天，固定只显示今日实际剩余课） */}
        {scheduleViewMode === 'day' && (
          <View style={styles.todayRemainingCard}>
            <View style={styles.todayRemainingLeft}>
              <View style={styles.remainingIconCircle}>
                <Ionicons name="time" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.todayRemainingLabel}>本日剩余课</Text>
            </View>

            <View style={styles.todayRemainingRight}>
              <Text style={styles.todayRemainingNumber}>{realTodayCourses.length}</Text>
              <Text style={styles.todayRemainingUnit}>节</Text>
            </View>
          </View>
        )}

        {/* 7 天横滑日历轴 (支持休假标识，自动定位高亮真实今日) */}
        {scheduleViewMode === 'day' && (
          <WeekCalendarStrip
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        )}
      </View>

      {/* 提醒事项 Toast 浮条 */}
      {toastMessage && (
        <View style={styles.toastFloatBar}>
          <Ionicons name="information-circle" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* 核心内容区（带向下出现的平滑动画） */}
      <Animated.View
        style={[
          styles.animatedContentWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: dropAnim }],
          },
        ]}
      >
        {scheduleViewMode === 'day' ? (
          <ScrollView
            style={styles.dayScrollArea}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <View style={styles.scheduleSection}>
              <View style={styles.scheduleHeaderRow}>
                <View style={styles.scheduleTitleGroup}>
                  <Text style={styles.scheduleSectionTitle}>
                    {selectedDayOfWeek === getTodayInfo().dayOfWeek ? '今日课表安排' : '当日课表安排'}
                  </Text>
                  <View style={styles.courseCountBadge}>
                    <Text style={styles.courseCountText}>{dayCourses.length} 门课</Text>
                  </View>
                </View>

                {/* 图1要求：改成“重新导入”按钮（点击进入引导导入向导） */}
                <TouchableOpacity
                  style={styles.reimportBtn}
                  onPress={handleOpenReimportModal}
                  activeOpacity={0.7}
                >
                  <Ionicons name="sync-outline" size={13} color={Colors.primary} />
                  <Text style={styles.reimportBtnText}>重新导入</Text>
                </TouchableOpacity>
              </View>

              {/* 当天课程列表：随选中日期动态切换 */}
              {dayCourses.length === 0 ? (
                <View style={[styles.weekendRestCard, Shadows.card]}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>🏖️</Text>
                  <Text style={styles.restTitle}>本日无课程安排</Text>
                  <Text style={styles.restSub}>
                    尽情享受休假时光，或者去知识库回顾本周随堂笔记
                  </Text>
                </View>
              ) : (
                <View style={styles.timelineList}>
                  {dayCourses.map((course, index) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isLast={index === dayCourses.length - 1}
                      onNavigateToNotes={(c) => handleStartNoteForCourse(c)}
                      onToggleReminder={handleToggleReminder}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={{ height: 32 }} />
          </ScrollView>
        ) : (
          /* 周课表全景网格视图 */
          <View style={styles.weekGridWrapper}>
            <WeekGridView
              onOpenNote={(courseName) => {
                const found = FULL_WEEK_COURSES.find((c) => c.name.includes(courseName.slice(0, 4)));
                handleStartNoteForCourse(found || FULL_WEEK_COURSES[0]);
              }}
            />
          </View>
        )}
      </Animated.View>

      {/* 课程表直开记笔记：选择记录方式弹窗 */}
      <Modal
        visible={recordModeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRecordModeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRecordModeModalVisible(false)}
        >
          <View style={[styles.recordModeCard, Shadows.card]}>
            <View style={styles.recordModeHeader}>
              <View>
                <Text style={styles.recordModeTitle}>选择记录方式</Text>
                <Text style={styles.recordModeSub}>
                  记录【{selectedCourseForNote?.name}】随堂笔记
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setRecordModeModalVisible(false)}
                style={styles.recordModeClose}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.recordModeOptions}>
              {/* 选项 1：随堂速记 */}
              <TouchableOpacity
                style={styles.recordOptionCard}
                activeOpacity={0.7}
                onPress={() => {
                  setRecordModeModalVisible(false);
                  setAppleNotesEditorVisible(true);
                }}
              >
                <View style={[styles.recordOptionIconWrap, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="document-text" size={24} color={Colors.primary} />
                </View>
                <View style={styles.recordOptionTextWrap}>
                  <View style={styles.recordOptionTitleRow}>
                    <Text style={styles.recordOptionTitle}>随堂速记</Text>
                    <View style={styles.optionTag}>
                      <Text style={styles.optionTagText}>打字 + 语音</Text>
                    </View>
                  </View>
                  <Text style={styles.recordOptionDesc}>
                    极简笔记风格 · 底部长按与上滑锁定语音实时转录
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* 选项 2：无边记白板 */}
              <TouchableOpacity
                style={styles.recordOptionCard}
                activeOpacity={0.7}
                onPress={() => {
                  setRecordModeModalVisible(false);
                  setFreeformVisible(true);
                }}
              >
                <View style={[styles.recordOptionIconWrap, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="infinite" size={24} color="#3B82F6" />
                </View>
                <View style={styles.recordOptionTextWrap}>
                  <View style={styles.recordOptionTitleRow}>
                    <Text style={styles.recordOptionTitle}>无边记白板</Text>
                    <View style={[styles.optionTag, { backgroundColor: '#DBEAFE' }]}>
                      <Text style={[styles.optionTagText, { color: '#1D4ED8' }]}>无限画纸</Text>
                    </View>
                  </View>
                  <Text style={styles.recordOptionDesc}>
                    点阵网格无限画布 · 悬浮 Apple Pencil 画笔坞 · 彩色便签贴纸
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 随堂速记编辑器（直接开启，退出时切至笔记页） */}
      {appleNotesEditorVisible && (
        <AppleNotesEditor
          visible={appleNotesEditorVisible}
          initialCourseName={selectedCourseForNote?.name}
          initialTitle={`第 14 周 · ${selectedCourseForNote?.name} 随堂笔记`}
          onClose={handleExitNote}
          onSave={handleExitNote}
        />
      )}

      {/* 无边记无限画布（直接开启，退出时切至笔记页） */}
      {freeformVisible && (
        <Modal
          visible={freeformVisible}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={handleExitNote}
        >
          <FreeformCanvas
            courseName={selectedCourseForNote?.name || '随堂'}
            onClose={handleExitNote}
            onSave={handleExitNote}
          />
        </Modal>
      )}

      {/* 重新导入课程表引导向导弹窗（与首次导入完全一致的引导流程） */}
      <Modal
        visible={reimportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReimportModalVisible(false)}
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
                onPress={() => setReimportModalVisible(false)}
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
                  {FULL_WEEK_COURSES.slice(0, 4).map((c) => (
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
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  userMeta: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: Rounded.pill,
    padding: 3,
  },
  modeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: Rounded.pill,
  },
  modeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  modeBtnTextInactive: {
    color: '#FFFFFF',
  },
  todayRemainingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginHorizontal: 16,
    borderRadius: Rounded.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  todayRemainingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  remainingIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayRemainingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  todayRemainingRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  todayRemainingNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  todayRemainingUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  toastFloatBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
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
  animatedContentWrapper: {
    flex: 1,
  },
  dayScrollArea: {
    flex: 1,
  },
  screenMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  scheduleSection: {
    paddingTop: 16,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    minHeight: 32,
  },
  scheduleTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 22,
    includeFontPadding: false,
  },
  courseCountBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Rounded.pill,
  },
  courseCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 14,
    includeFontPadding: false,
  },
  reimportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    gap: 4,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 10,
    borderRadius: Rounded.pill,
  },
  reimportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 16,
    includeFontPadding: false,
  },
  timelineList: {
    paddingLeft: 4,
  },
  weekendRestCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: Rounded.xl,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  restSub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  weekGridWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  recordModeCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.xl,
    padding: 20,
  },
  recordModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  recordModeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  recordModeSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  recordModeClose: {
    padding: 4,
  },
  recordModeOptions: {
    gap: 12,
  },
  recordOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recordOptionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordOptionTextWrap: {
    flex: 1,
  },
  recordOptionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  recordOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  optionTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  optionTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  recordOptionDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  // 引导重新导入弹窗样式
  importModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  importModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '82%',
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
});
