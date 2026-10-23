import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  Animated,
  Easing,
  Modal,
  Image,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { WeekCalendarStrip } from '../components/WeekCalendarStrip';
import { CourseCard } from '../components/CourseCard';
import { WeekGridView } from '../components/WeekGridView';
import { AppleNotesEditor } from '../components/AppleNotesEditor';
import { FreeformCanvas, StickyNote, DrawingStroke } from '../components/FreeformCanvas';
import { ImportModal } from '../components/ImportModal';
import { WeekPickerModal } from '../components/WeekPickerModal';
import { ScheduleSettingsDrawer } from '../components/ScheduleSettingsDrawer';
import { Course } from '../types/schedule';
import { AutoScheduleService, AutoDetectStatus } from '../services/autoScheduleDetector';
import { getCurrentSemesterName, repairCourse, repairCourseList, isCourseInWeek } from '../services/jwParser';
import {
  saveScheduleData,
  loadScheduleData,
  NonCurrentWeekMode,
  loadNonCurrentWeekMode,
  saveNonCurrentWeekMode,
} from '../services/scheduleStorage';
import { syncScheduleToNativeWidget } from '../services/widgetHelper';

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

  // 课程对应的无边记持久化白板数据 (便签与墨水笔迹，绝不自动还原预设)
  const [courseFreeformData, setCourseFreeformData] = useState<
    Record<string, { title: string; notes: StickyNote[]; strokes: DrawingStroke[] }>
  >({});

  // 课程已有随堂笔记知识库映射（去查看直接打开已有笔记）
  const COURSE_NOTE_LIBRARY: Record<string, { title: string; content: string }> = {
    '高等数学': {
      title: '第14周 · 多元函数微分学与梯度下降',
      content: '二阶偏导数对称性几何意义；拉格朗日乘数法在约束极值求解中的工程应用。课堂例题第3道：如何通过海森矩阵判断多元函数鞍点。\n\n【核心考点】\n1. 偏导数连续是可微的充分条件。\n2. 梯度方向即为函数值增长最快的方向。',
    },
    '计算机系统结构': {
      title: '第12周 · 指令级并行与流水线冲突',
      content: '【核心架构】经典五级流水线（IF, ID, EX, MEM, WB）时序与旁路转发架构图谱。结构冲突、数据冲突与控制冲突的硬件解决方案对比。',
    },
    '商务韩语': {
      title: '第14周 · 破冰洽谈与敬语句型',
      content: '商务谈判中的开场礼仪；对客委婉语、谦逊语在合同初审时的严谨表述。需要重点注意双方落座顺序与初次交换名片的固定问候套语。',
    },
    'TOPIK': {
      title: '第13周 · 阅读真题主旨归纳速判法',
      content: '长难句倒装解构；段落首尾呼应词快筛技巧；历年错题第34-37题解析及高频副词总结。',
    },
    '数据结构': {
      title: '第14周 · 红黑树旋转与平衡性质',
      content: '红黑树的5大性质定理证明；插入节点后的双红修复逻辑，左旋与右旋变换的伪代码推导。',
    },
    '交互设计': {
      title: '第14周 · 移动端交互设计与微动效规范',
      content: '触控热区黄金法则、手势拖拽阻尼感计算公式以及高保真原型动效交付规范。',
    },
  };

  const getExistingNote = (name?: string) => {
    if (!name) return null;
    for (const key of Object.keys(COURSE_NOTE_LIBRARY)) {
      if (name.includes(key)) return COURSE_NOTE_LIBRARY[key];
    }
    return null;
  };

  // 点击卡片上的笔记操作：已有笔记直接打开，无笔记才弹出记录方式选择
  const handleStartNoteForCourse = (course: Course) => {
    setSelectedCourseForNote(course);
    if (course.notesCount > 0) {
      // 图4要求：已有笔记去查看直接打开，无需多余弹窗
      setAppleNotesEditorVisible(true);
    } else {
      setRecordModeModalVisible(true);
    }
  };

  // 退出笔记时：纯净关闭，不自动重复弹窗
  const handleExitNote = () => {
    setAppleNotesEditorVisible(false);
    setFreeformVisible(false);
    setSelectedCourseForNote(null);
  };

  // 页面向下平滑浮现动画 (Downward Floating Entrance Animation，切换周课表与日期时触发)
  const floatDownAnim = useRef(new Animated.Value(-24)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 顶部绿色色块向下浮现入场动画 (图2入场动画)
  const headerDropAnim = useRef(new Animated.Value(-28)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  // 剩余X节课卡片展开与收起平滑动画
  const summaryCollapseAnim = useRef(new Animated.Value(1)).current;
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);

  const triggerEntranceAnimation = () => {
    floatDownAnim.setValue(-24);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(floatDownAnim, {
        toValue: 0,
        friction: 7,
        tension: 85,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerHeaderAnimation = () => {
    headerDropAnim.setValue(-28);
    headerFadeAnim.setValue(0);
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
    ]).start();
  };

  const toggleSummaryCollapse = () => {
    if (!isSummaryCollapsed) {
      Animated.timing(summaryCollapseAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsSummaryCollapsed(true);
      });
    } else {
      setIsSummaryCollapsed(false);
      summaryCollapseAnim.setValue(0);
      Animated.spring(summaryCollapseAnim, {
        toValue: 1,
        friction: 7,
        tension: 85,
        useNativeDriver: true,
      }).start();
    }
  };

  // 页面初次加载时触发向下浮现动画与顶部绿色色块入场动效
  useEffect(() => {
    triggerEntranceAnimation();
    triggerHeaderAnimation();

    let isMounted = true;
    loadScheduleData().then((stored) => {
      if (isMounted && stored.courses && stored.courses.length > 0) {
        const repaired = repairCourseList(stored.courses);
        setCoursesList(repaired);
        syncScheduleToNativeWidget();
        if (stored.semester) {
          setCurrentSemester(stored.semester);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

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

  // 2. 切换日期处理函数（点击日历轴任意一天，立刻切换过滤出该天的课表；限制不能重复点击现在正在查看的日期）
  const handleSelectDate = (dateStr: string, dayOfWeek: number) => {
    if (dateStr === selectedDate) {
      return; // 限制不能重复点击现在正在查看的日期
    }
    setSelectedDate(dateStr);
    setSelectedDayOfWeek(dayOfWeek);
    triggerEntranceAnimation();
  };

  // 模式切换与滑块平移动画（今日 vs 周课表）
  const toggleSlideAnim = useRef(new Animated.Value(scheduleViewMode === 'day' ? 0 : 1)).current;

  // 3. 点击切换回“今日”模式时，自动复位到今天的日期并触发选中框移动动画
  const handleSwitchToToday = () => {
    setScheduleViewMode('day');
    Animated.spring(toggleSlideAnim, {
      toValue: 0,
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();
    const today = getTodayInfo();
    setSelectedDate(today.dateStr);
    setSelectedDayOfWeek(today.dayOfWeek);
    triggerEntranceAnimation();
  };

  // 周课表向下浮现动画 (Downward Floating Entrance)
  const weekDropAnim = useRef(new Animated.Value(-24)).current;

  const handleSwitchToWeek = () => {
    setScheduleViewMode('week');
    Animated.spring(toggleSlideAnim, {
      toValue: 1,
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // 周课表改为向下浮现动画
    weekDropAnim.setValue(-24);
    Animated.spring(weekDropAnim, {
      toValue: 0,
      friction: 7,
      tension: 85,
      useNativeDriver: true,
    }).start();

    triggerEntranceAnimation();
  };

  // 查看周课表 5x5 矩阵弹窗状态
  const [weekPickerVisible, setWeekPickerVisible] = useState(false);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(7); // 当前正在查看的周次 (默认为第7周)
  const [realCurrentWeekNumber, setRealCurrentWeekNumber] = useState(7); // 现实中当前周/本周

  // 监听周次切换触发向下浮现动效
  useEffect(() => {
    triggerEntranceAnimation();
    if (scheduleViewMode === 'week') {
      weekDropAnim.setValue(-24);
      Animated.spring(weekDropAnim, {
        toValue: 0,
        friction: 7,
        tension: 85,
        useNativeDriver: true,
      }).start();
    }
  }, [currentWeekNumber]);

  // 课程总表状态（初始为空，导入后即时全量更新并刷新日视图与周视图）
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 600;
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [currentSemester, setCurrentSemester] = useState<string>(() => getCurrentSemesterName());

  // 4. 根据当前选中的星期几与周次过滤出对应课程（用于下方课表列表）
  const dayCourses = coursesList
    .map(repairCourse)
    .filter((c) => c.dayOfWeek === selectedDayOfWeek && isCourseInWeek(c.weekRange, currentWeekNumber));

  // 本日真实剩余课程（锁定真实今天的课程，不随日历轴点击切换而改变！）
  const realTodayDayOfWeek = getTodayInfo().dayOfWeek;
  const realTodayCourses = coursesList
    .map(repairCourse)
    .filter((c) => c.dayOfWeek === realTodayDayOfWeek && isCourseInWeek(c.weekRange, realCurrentWeekNumber));

  // 最后一节课的下课时间与放学时间
  const todayEndTime = useMemo(() => {
    if (realTodayCourses.length === 0) return null;
    let maxTime = '00:00';
    for (const c of realTodayCourses) {
      if (c.endTime && c.endTime > maxTime) {
        maxTime = c.endTime;
      }
    }
    return maxTime !== '00:00' ? maxTime : '17:40';
  }, [realTodayCourses]);

  // 下一节课与倒计时
  const nextCourseInfo = useMemo(() => {
    const now = new Date();
    const curH = now.getHours();
    const curM = now.getMinutes();
    const curMinutes = curH * 60 + curM;

    let inProgress: Course | null = null;
    let nextUpcoming: Course | null = null;
    let minDiffMinutes = Infinity;

    for (const c of realTodayCourses) {
      const s = c.startTime || '08:00';
      const e = c.endTime || '09:40';
      const [sh, sm] = s.split(':').map(Number);
      const [eh, em] = e.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;

      if (curMinutes >= startMin && curMinutes <= endMin) {
        inProgress = c;
        break;
      }
      if (startMin > curMinutes) {
        const diff = startMin - curMinutes;
        if (diff < minDiffMinutes) {
          minDiffMinutes = diff;
          nextUpcoming = c;
        }
      }
    }

    if (inProgress) {
      return {
        status: 'in_progress',
        statusText: '正在上课',
        courseName: inProgress.name,
        location: inProgress.location,
        subText: `下课时间 ${inProgress.endTime}`,
      };
    }

    if (nextUpcoming) {
      const cd = minDiffMinutes >= 60 
        ? `${Math.floor(minDiffMinutes / 60)}小时${minDiffMinutes % 60}分`
        : `${minDiffMinutes}分钟`;
      return {
        status: 'upcoming',
        statusText: `距下节课还有 ${cd}`,
        courseName: nextUpcoming.name,
        location: nextUpcoming.location,
        subText: `${nextUpcoming.startTime} 上课`,
      };
    }

    if (realTodayCourses.length > 0) {
      return {
        status: 'finished',
        statusText: '今日课程已全部结束',
        courseName: '今日放学啦',
        location: '校外/寝室',
        subText: `已于 ${todayEndTime} 放学`,
      };
    }

    return {
      status: 'none',
      statusText: '今日无排课安排',
      courseName: '自由安排时间',
      location: '图书馆/自习室',
      subText: '享受充实一天',
    };
  }, [realTodayCourses, todayEndTime]);

  // 计算本日剩余课与放学时间/下节课倒计时（图4：距离放学时间、剩余X节课、今日计划、进度条）
  const todayRemainingSummary = useMemo(() => {
    const now = new Date();
    const curMinutes = now.getHours() * 60 + now.getMinutes();

    // 筛选今日尚未下课的课程
    const remainingCourses = realTodayCourses.filter((c) => {
      const e = c.endTime || '17:40';
      const [eh, em] = e.split(':').map(Number);
      const endMin = (eh || 0) * 60 + (em || 0);
      return endMin > curMinutes;
    });

    const remainingCount = remainingCourses.length;
    const totalCount = realTodayCourses.length;
    const finishedCount = Math.max(0, totalCount - remainingCount);
    const progressPercent = totalCount > 0 ? Math.round((finishedCount / totalCount) * 100) : 100;

    // 计算放学时间与倒计时（用户要求：最顶部改成休息时间）
    let dismissalText = '休息时间';
    if (totalCount > 0) {
      const lastCourse = realTodayCourses[realTodayCourses.length - 1];
      const lastEnd = lastCourse.endTime || todayEndTime || '17:40';
      const [eh, em] = lastEnd.split(':').map(Number);
      const endMin = (eh || 0) * 60 + (em || 0);
      const diff = endMin - curMinutes;

      if (diff <= 0) {
        dismissalText = '今日课程已结束 · 已放学';
      } else {
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        const timeStr = h > 0 ? `${h}小时${m}分` : `${m}分钟`;
        dismissalText = `距放学还有 ${timeStr}`;
      }
    }

    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const curDateStr = `Today, ${monthNames[now.getMonth()]}${now.getDate()}日`;

    return {
      remainingCount,
      totalCount,
      finishedCount,
      progressPercent,
      dismissalText,
      curDateStr,
      subTitleText: dismissalText,
    };
  }, [realTodayCourses, todayEndTime]);

  // 引导重新导入课程表向导状态
  const [reimportModalVisible, setReimportModalVisible] = useState(false);

  // 非本周课程显示模式（'hide' | 'stacked' | 'transparent'，默认非本周课不显示，只保留当前周真实排课）
  const [nonCurrentWeekMode, setNonCurrentWeekMode] = useState<NonCurrentWeekMode>('hide');
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const [qrScannerVisible, setQrScannerVisible] = useState(false);
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (qrScannerVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 200,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      laserAnim.setValue(0);
    }
  }, [qrScannerVisible]);

  // 模拟扫码同学二维码导入
  const handleScanSimulateSuccess = () => {
    const classmateCourses: Course[] = coursesList.length > 0 ? coursesList : [
      {
        id: `dom-sup-fri-34`,
        name: '【调】给水排水管道工程',
        teacher: '陈老师',
        location: '长智楼A208',
        weekRange: '7-16周',
        dayOfWeek: 5,
        startTime: '10:05',
        endTime: '11:40',
        stageTag: '必修课 · 周五3-4节',
        status: 'pending',
        notesCount: 0,
      },
      {
        id: `dom-sup-mon-w7`,
        name: '仪器分析实验',
        teacher: '罗金花',
        location: '力行楼S515',
        weekRange: '7周',
        dayOfWeek: 1,
        startTime: '14:00',
        endTime: '17:40',
        stageTag: '必修课 · 周一5-8节',
        status: 'pending',
        notesCount: 0,
      },
      {
        id: `dom-sup-sat-w7`,
        name: '环境工程原理实验',
        teacher: '宋勇',
        location: '力行楼S107',
        weekRange: '7周',
        dayOfWeek: 6,
        startTime: '14:00',
        endTime: '17:40',
        stageTag: '必修课 · 周六5-8节',
        status: 'pending',
        notesCount: 0,
      },
    ];

    const repaired = repairCourseList(classmateCourses);
    setCoursesList(repaired);
    saveScheduleData(repaired, currentSemester);
    syncScheduleToNativeWidget();
    setQrScannerVisible(false);
    setToastMessage(`🎉 扫码成功！已导入同学的 ${repaired.length} 门完整学期排课！`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadNonCurrentWeekMode().then((mode) => {
      setNonCurrentWeekMode(mode);
    });
  }, []);

  const handleModeChange = (mode: NonCurrentWeekMode) => {
    setNonCurrentWeekMode(mode);
    saveNonCurrentWeekMode(mode);
    const modeName = mode === 'hide' ? '非本周课不显示' : mode === 'stacked' ? '叠放与标签显示' : '半透明50%';
    setToastMessage(`已将非本周课切换为：${modeName}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenReimportModal = () => {
    setReimportModalVisible(true);
  };

  const handleImportSuccess = (importedCourses: Course[], semesterName?: string) => {
    const repaired = importedCourses.map(repairCourse);
    setCoursesList(repaired);
    const activeSem = semesterName || currentSemester;
    if (semesterName) {
      setCurrentSemester(semesterName);
    }
    // 持久化存储到本地 AsyncStorage，关闭或退出 App 绝不丢失！
    saveScheduleData(repaired, activeSem);
    syncScheduleToNativeWidget();
    triggerEntranceAnimation();
    setToastMessage(`🎉 已成功智能导入 ${repaired.length} 门课程！已放入【${activeSem}】`);
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

      {/* 顶部生机草木绿流体区域（带向下浮现入场动画，图2区域，周课表时底部边缘适当往下延展） */}
      <Animated.View
        style={[
          styles.heroHeader,
          scheduleViewMode === 'week' && styles.heroHeaderWeek,
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
        <View style={[styles.heroHeaderInner, isTablet && styles.heroHeaderInnerTablet]}>
          {/* 用户信息与 【今日 | 周课表】 切换 */}
          <View style={styles.userInfoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* 按用户要求：在左上角标题左边加一个抽屉设置按钮 */}
              <TouchableOpacity
                style={styles.drawerTriggerBtn}
                onPress={() => setSettingsDrawerVisible(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="menu" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* 用户要求：课程表标题改成当前周和切换但是只保留展开选择 不要左右箭头可以切换 */}
              <TouchableOpacity
                style={styles.headerWeekTitleBtn}
                onPress={() => setWeekPickerVisible(true)}
                activeOpacity={0.75}
              >
                <Text style={styles.screenMainTitle}>第 {currentWeekNumber} 周</Text>
                <Ionicons name="chevron-down" size={15} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            {/* 模式切换：今日 vs 周课表 (带选中框平移动画) */}
            <View style={styles.viewModeToggle}>
              <Animated.View
                style={[
                  styles.toggleAnimatedSlider,
                  {
                    transform: [
                      {
                        translateX: toggleSlideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [2, 58],
                        }),
                      },
                    ],
                  },
                ]}
              />

              <TouchableOpacity
                style={styles.modeBtn}
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
                style={styles.modeBtn}
                onPress={handleSwitchToWeek}
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

          {/* 7 天横滑日历轴 (支持休假标识，自动定位高亮真实今日) */}
          {scheduleViewMode === 'day' && (
            <WeekCalendarStrip
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onOpenWeekPicker={() => setWeekPickerVisible(true)}
              realWeekNumber={realCurrentWeekNumber}
              currentWeekNumberOverride={currentWeekNumber}
              courses={coursesList}
            />
          )}
        </View>
      </Animated.View>

      {/* 提醒事项 Toast 浮条 */}
      {toastMessage && (
        <View style={[styles.toastFloatBar, isTablet && styles.toastFloatBarTablet]}>
          <Ionicons name="information-circle" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* 核心内容区（向下浮现平滑动画） */}
      <Animated.View
        style={[
          styles.animatedContentWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: floatDownAnim }],
          },
        ]}
      >
        {scheduleViewMode === 'day' ? (
          <ScrollView
            style={styles.dayScrollArea}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <View style={[styles.scheduleSection, isTablet && styles.contentContainerTablet]}>
              {/* 今日剩余课卡片（槽位在无课时维持固定高度，确保下方图1暂无数据插画不随展开收起晃动位移） */}
              <View style={[dayCourses.length === 0 && styles.summaryCardSlotFixed]}>
                {isSummaryCollapsed ? (
                  <TouchableOpacity
                    style={styles.summaryCollapsedBar}
                    onPress={toggleSummaryCollapse}
                    activeOpacity={0.8}
                  >
                    <View style={styles.summaryCollapsedLeft}>
                      <Ionicons name="time-outline" size={16} color="#16A34A" style={{ marginRight: 6 }} />
                      <Text style={styles.summaryCollapsedTitle}>
                        {todayRemainingSummary.remainingCount === 0 ? (
                          '没课了'
                        ) : (
                          <>
                            剩余 <Text style={styles.summaryCollapsedHighlight}>{todayRemainingSummary.remainingCount}</Text> 节课
                          </>
                        )}
                      </Text>
                      <Text style={styles.summaryCollapsedSub}>· {todayRemainingSummary.dismissalText}</Text>
                    </View>
                    <Ionicons name="chevron-down" size={16} color="#64748B" />
                  </TouchableOpacity>
                ) : (
                  <Animated.View
                    style={[
                      styles.todayRemainingWidgetCard,
                      {
                        opacity: summaryCollapseAnim,
                        transform: [
                          {
                            translateY: summaryCollapseAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-14, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.summaryExpandedContent}>
                      {/* 右侧插画（透明背景跳舞小怪兽）：底部严格与卡片边框底部对齐，顶部自然超出边框盖在绿色色块下方 */}
                      <Image
                        source={require('../../assets/dancing-monster.png')}
                        style={styles.summaryDancingMonsterImage}
                        resizeMode="contain"
                      />

                      {/* 左侧信息列（严格从上到下：1.距离放学时间 2.剩余X节课 3.今日课程 4.进度条） */}
                      <View style={styles.summaryLeftCol}>
                        {/* 第1行：距离放学时间 / 休息时间 */}
                        <View style={styles.summaryDismissalRow}>
                          <Text style={styles.summaryDismissalText}>{todayRemainingSummary.dismissalText}</Text>
                        </View>

                        {/* 第2行：剩余X节课（纯中文大字粗体，用户要求剩余0节课时显示没课了） */}
                        <View style={styles.summaryCountRow}>
                          {todayRemainingSummary.remainingCount === 0 ? (
                            <Text style={styles.summaryClassesBigText}>没课了</Text>
                          ) : (
                            <Text style={styles.summaryClassesBigText}>
                              剩余 <Text style={styles.summaryClassesBigNum}>{todayRemainingSummary.remainingCount}</Text> 节课
                            </Text>
                          )}
                        </View>

                        {/* 第3行：今日课程与完成进度比例（用户要求：今日计划改成今日课程） */}
                        <View style={styles.summaryPlanRow}>
                          <Text style={styles.summaryPlanLabel}>今日课程</Text>
                          <Text style={styles.summaryPlanRatio}>
                            {todayRemainingSummary.finishedCount}/{Math.max(todayRemainingSummary.totalCount, 1)}
                          </Text>
                        </View>

                        {/* 第4行：浅绿水平进度条（图3：未填充是纯白色，已填充是绿色，底部严格对齐） */}
                        <View style={styles.summaryProgressTrack}>
                          <View
                            style={[
                              styles.summaryProgressFill,
                              { width: `${Math.min(100, Math.max(0, todayRemainingSummary.progressPercent))}%` },
                            ]}
                          />
                        </View>
                      </View>

                      {/* 卡片右上角折叠收起按钮 */}
                      <TouchableOpacity
                        style={styles.summaryCollapseTrigger}
                        onPress={toggleSummaryCollapse}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="chevron-up" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                )}
              </View>

              {/* 当天课程列表：随选中日期动态切换（无数据时绝对定位固定位置，收起或展开卡片绝对不晃动位移） */}
              {coursesList.length === 0 ? (
                <View style={styles.emptyScheduleCardFixed}>
                  <Image
                    source={require('../../assets/empty-schedule-404.png')}
                    style={[styles.emptyScheduleImage, isTablet && styles.emptyScheduleImageTablet]}
                    resizeMode="contain"
                  />
                  <Text style={styles.emptyScheduleTitle}>课程表暂无数据</Text>
                  <TouchableOpacity
                    style={[styles.emptyScheduleBtn, isTablet && styles.emptyScheduleBtnTablet]}
                    onPress={handleOpenReimportModal}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.emptyScheduleBtnText}>教务系统导入课程表</Text>
                  </TouchableOpacity>
                </View>
              ) : dayCourses.length === 0 ? (
                /* 图3无课程显示的icon已按要求改成图4(404小绿怪插画)，并且完全去掉了外框与阴影卡片 */
                <View style={styles.emptyScheduleCardFixed}>
                  <Image
                    source={require('../../assets/empty-schedule-404.png')}
                    style={[styles.emptyScheduleImage, isTablet && styles.emptyScheduleImageTablet]}
                    resizeMode="contain"
                  />
                  <Text style={styles.restTitle}>本日无课程安排</Text>
                  <Text style={styles.restSub}>
                    {coursesList.length > 0
                      ? `本日暂无排课，享受充实的一天吧！本学期在【${Array.from(new Set(coursesList.map((c) => ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][(c.dayOfWeek || 1) - 1]))).join('、')}】有课，可切换上方日历或点击右上角【周课表】查看`
                      : '尽情享受休假时光，或者去知识库回顾本周随堂笔记'}
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
          /* 周课表全景网格视图（向下浮现动画） */
          <Animated.View style={[styles.weekGridWrapper, { transform: [{ translateY: weekDropAnim }] }]}>
            <WeekGridView
              courses={coursesList}
              currentWeekIndex={currentWeekNumber}
              realCurrentWeekNumber={realCurrentWeekNumber}
              nonCurrentWeekMode={nonCurrentWeekMode}
              onSelectWeek={(w) => setCurrentWeekNumber(w)}
              onOpenWeekPicker={() => setWeekPickerVisible(true)}
              onOpenImportModal={handleOpenReimportModal}
              onOpenSettingsDrawer={() => setSettingsDrawerVisible(true)}
              onOpenNote={(courseName) => {
                const found = coursesList.find((c) => c.name.includes(courseName.slice(0, 4)));
                if (found) handleStartNoteForCourse(found);
              }}
            />
          </Animated.View>
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

      {/* 随堂速记编辑器（直接开启已有笔记或新建笔记，退出时不重复弹窗） */}
      {appleNotesEditorVisible && (
        <AppleNotesEditor
          visible={appleNotesEditorVisible}
          initialCourseName={selectedCourseForNote?.name}
          initialTitle={
            getExistingNote(selectedCourseForNote?.name)?.title ||
            `第 14 周 · ${selectedCourseForNote?.name} 随堂笔记`
          }
          initialContent={getExistingNote(selectedCourseForNote?.name)?.content || ''}
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
            initialTitle={courseFreeformData[selectedCourseForNote?.name || '随堂']?.title}
            initialNotes={courseFreeformData[selectedCourseForNote?.name || '随堂']?.notes || []}
            initialStrokes={courseFreeformData[selectedCourseForNote?.name || '随堂']?.strokes || []}
            onClose={handleExitNote}
            onSave={(data) => {
              setCourseFreeformData((prev) => ({
                ...prev,
                [selectedCourseForNote?.name || '随堂']: data,
              }));
              handleExitNote();
              setToastMessage(`🎉 已保存【${selectedCourseForNote?.name || '随堂'}】无边记白板`);
              setTimeout(() => setToastMessage(null), 2500);
            }}
          />
        </Modal>
      )}

      {/* 重新导入课程表智能通道弹窗（支持统一身份认证CAS、网页文本提取及示范排课） */}
      <ImportModal
        visible={reimportModalVisible}
        onClose={() => setReimportModalVisible(false)}
        onImportSuccess={handleImportSuccess}
        semesterName={currentSemester}
      />

      {/* 查看周课表 5x5 矩阵选择弹窗 (图 2) */}
      <WeekPickerModal
        visible={weekPickerVisible}
        onClose={() => setWeekPickerVisible(false)}
        currentWeek={currentWeekNumber}
        realCurrentWeek={realCurrentWeekNumber}
        onSelectWeek={(w) => {
          setCurrentWeekNumber(w);
          setToastMessage(`已切换至第 ${w} 周课表`);
          setTimeout(() => setToastMessage(null), 2500);
        }}
        onUpdateRealCurrentWeek={(w) => {
          setRealCurrentWeekNumber(w);
          setToastMessage(`🎉 已将第 ${w} 周设为当前学期的【本周】`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* 抽屉设置弹窗（设置非本周课显示方式 & 扫码入口 & 重新导入） */}
      <ScheduleSettingsDrawer
        visible={settingsDrawerVisible}
        onClose={() => setSettingsDrawerVisible(false)}
        currentMode={nonCurrentWeekMode}
        onModeChange={handleModeChange}
        semesterName={currentSemester}
        onOpenScanQr={() => setQrScannerVisible(true)}
        onReimport={handleOpenReimportModal}
      />

      {/* 用户要求：在设置里新增一个扫码，可以直接扫码同学的二维码导入课程 */}
      <Modal
        visible={qrScannerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrScannerVisible(false)}
      >
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerTopBar}>
            <TouchableOpacity
              onPress={() => setQrScannerVisible(false)}
              style={styles.scannerCloseBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>扫描同学课表二维码</Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={styles.viewfinderContainer}>
            <View style={styles.viewfinderBox}>
              <View style={[styles.cornerBorder, styles.cornerTL]} />
              <View style={[styles.cornerBorder, styles.cornerTR]} />
              <View style={[styles.cornerBorder, styles.cornerBL]} />
              <View style={[styles.cornerBorder, styles.cornerBR]} />

              {/* 扫描动态激光线 */}
              <Animated.View
                style={[
                  styles.scannerLaserLine,
                  {
                    transform: [{ translateY: laserAnim }],
                  },
                ]}
              />
            </View>
            <Text style={styles.viewfinderHint}>
              对准同学手机上展示的课星球二维码，自动识别导入
            </Text>
          </View>

          <View style={styles.scannerActionsContainer}>
            <TouchableOpacity
              style={styles.simulateScanBtn}
              onPress={handleScanSimulateSuccess}
              activeOpacity={0.8}
            >
              <Ionicons name="scan-circle" size={22} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.simulateScanBtnText}>一键识别同学课表二维码</Text>
            </TouchableOpacity>
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
    width: '100%',
  },
  heroHeaderWeek: {
    paddingBottom: 22,
  },
  heroHeaderInner: {
    width: '100%',
  },
  heroHeaderInnerTablet: {
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  contentContainerTablet: {
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  toastFloatBarTablet: {
    maxWidth: 912,
    alignSelf: 'center',
    width: '100%',
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 38,
    minHeight: 38,
    marginBottom: 4,
  },
  drawerTriggerBtn: {
    marginRight: 8,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekPickerTriggerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginLeft: 10,
  },
  weekPickerTriggerText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
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
    position: 'relative',
    width: 124,
    height: 34,
    alignItems: 'center',
  },
  toggleAnimatedSlider: {
    position: 'absolute',
    top: 3,
    left: 2,
    width: 58,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.pill,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  modeBtn: {
    width: 58,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Rounded.pill,
    zIndex: 1,
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
  summaryCardSlotFixed: {
    minHeight: 116,
  },
  // 本日剩余课收起状态胶囊条（紧凑间距，带开展收起动画）
  summaryCollapsedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2FAF4',
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  // 本日剩余课卡片（图1设计：间距紧凑，消除顶部过大空隙，右侧3D透明跳舞小怪兽插画底部贴合框底）
  todayRemainingWidgetCard: {
    backgroundColor: '#F2FAF4',
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    position: 'relative',
    overflow: 'visible',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 1,
  },
  summaryCollapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryCollapsedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryCollapsedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryCollapsedHighlight: {
    color: '#16A34A',
    fontWeight: '800',
    fontSize: 16,
  },
  summaryCollapsedSub: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
  },
  summaryExpandedContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    position: 'relative',
    justifyContent: 'space-between',
  },
  summaryDancingMonsterImage: {
    position: 'absolute',
    right: 8,
    bottom: 0, // 底部严格与卡片边框底部对齐！
    width: 120,
    height: 98,
    zIndex: 2,
  },
  summaryLeftCol: {
    width: '64%',
    zIndex: 3,
  },
  summaryDismissalRow: {
    marginBottom: 4,
  },
  summaryDismissalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  summaryCountRow: {
    marginBottom: 6,
  },
  summaryClassesBigText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  summaryClassesBigNum: {
    fontSize: 28,
    fontWeight: '900',
    color: '#15803D',
  },
  summaryPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryPlanLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  summaryPlanRatio: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  summaryProgressTrack: {
    height: 8,
    backgroundColor: '#FFFFFF', // 图3：未填充是纯白色，已填充是绿色！
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  summaryProgressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  summaryCollapseTrigger: {
    position: 'absolute',
    top: 10,
    right: 12,
    padding: 4,
    zIndex: 5,
  },
  widgetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  widgetTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  widgetIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  widgetMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 6,
  },
  widgetEndTimeSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  widgetCountBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Rounded.pill,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  widgetCountNum: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  widgetCountUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 2,
  },
  widgetReimportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Rounded.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  widgetReimportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  widgetNextCourseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  nextCoursePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nextCourseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nextDotLive: {
    backgroundColor: '#16A34A',
  },
  nextDotUpcoming: {
    backgroundColor: '#F59E0B',
  },
  nextCourseStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  nextCourseInfoText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
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
    width: '100%',
  },
  dayScrollArea: {
    flex: 1,
  },
  headerWeekTitleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  screenMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  widgetRemainingCountBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#EDFAEF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Rounded.pill,
    borderWidth: 1,
    borderColor: '#A6F4C5',
  },
  widgetRemainingCountNum: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  widgetRemainingCountUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 2,
  },
  scheduleSection: {
    paddingTop: 4,
    paddingBottom: 96,
    position: 'relative',
    minHeight: 560,
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
  emptyScheduleCardFixed: {
    position: 'absolute',
    top: 172,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
  },
  emptyScheduleCard: {
    backgroundColor: 'transparent',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
  },
  noCoursesContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
  },
  emptyScheduleImage: {
    width: 190,
    height: 190,
    marginBottom: 16,
  },
  emptyScheduleImageTablet: {
    width: 260,
    height: 260,
    marginBottom: 20,
  },
  emptyScheduleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyScheduleSub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 22,
    maxWidth: 320,
  },
  emptyScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: Rounded.pill,
  },
  emptyScheduleBtnTablet: {
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  emptyScheduleBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  weekendRestCard: {
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
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

  // 引导重新导入弹窗样式（按要求：去掉黑色遮罩改成纯阴影）
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
  // 扫码弹窗样式
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'space-between',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  scannerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scannerCloseBtn: {
    padding: 6,
  },
  scannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewfinderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderBox: {
    width: 240,
    height: 240,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cornerBorder: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#10B981',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 14,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 14,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 14,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 14,
  },
  scannerLaserLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  viewfinderHint: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    marginTop: 24,
    textAlign: 'center',
  },
  scannerActionsContainer: {
    alignItems: 'center',
  },
  simulateScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: Rounded.pill,
    width: '100%',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  simulateScanBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
