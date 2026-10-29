import { NativeModules, Platform } from 'react-native';
import { Course } from '../types/schedule';
import { isCourseInWeek, repairCourse } from './jwParser';
import { loadScheduleData, calculateCurrentWeekNumber } from './scheduleStorage';

export interface WidgetCourseItem {
  id: string;
  name: string;
  location: string;
  startTime: string;
  endTime: string;
  timeUntilStartText: string; // 如 "进行中", "25分钟后", "1小时20分后"
  isCurrent: boolean;
}

export interface WidgetScheduleData {
  remainingCount: number;
  totalCount: number;
  finishedCount: number;
  progressPercent: number; // 0.0 ~ 1.0
  dismissalTime: string;
  countdownText: string;
  dismissalCombinedText: string; // 保持向后兼容
  dismissalText: string; // 纯粹放学时间，如 "17:40 放学"（已去掉"距放学还有多久"）
  nextCourseText: string;
  upcomingCourses: WidgetCourseItem[]; // 一次只显示两门，已经结束的不显示
  dayOfWeek: number; // 1 ~ 7
  dayOfWeekName: string; // "周一", "周二", ..., "周日"
  isToday: boolean;
  isSampleData: boolean;
}

const DAY_NAMES = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

/**
 * 按照最新原子组件设计规范计算课表信息：
 * 1. 顶部：星期几写中间，左右可切换日期，右上角去掉原子组件标签
 * 2. 进度条：300度弧线在中间分段，今天有几节课就分几段
 * 3. 中心：醒目呈现剩余课数，正下方去掉"距放学还有多久"
 * 4. 底部列表：从左到右显示 课程名和地点，右边写还有多久上课，一次只显示两门，已结束的不显示
 */
export function computeWidgetData(
  courses: Course[],
  realWeekNumber: number = calculateCurrentWeekNumber(),
  targetDayOfWeek?: number
): WidgetScheduleData {
  const now = new Date();
  const currentTodayDayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1=周一, 7=周日
  const dayOfWeek = targetDayOfWeek && targetDayOfWeek >= 1 && targetDayOfWeek <= 7
    ? targetDayOfWeek
    : currentTodayDayOfWeek;
  const isToday = dayOfWeek === currentTodayDayOfWeek;
  const curMinutes = now.getHours() * 60 + now.getMinutes();

  // 若尚未导入任何课程，呈现真实标准示例数据
  if (!courses || courses.length === 0) {
    const sampleCourses: WidgetCourseItem[] = [
      {
        id: 's1',
        name: '给水排水管道工程',
        location: '长智楼 A208',
        startTime: '10:05',
        endTime: '11:40',
        timeUntilStartText: isToday ? '25分钟后' : '10:05 开始',
        isCurrent: false,
      },
      {
        id: 's2',
        name: '计算机系统结构',
        location: '信息实验楼 301',
        startTime: '14:00',
        endTime: '15:35',
        timeUntilStartText: isToday ? '4小时后' : '14:00 开始',
        isCurrent: false,
      },
    ];

    return {
      remainingCount: 2,
      totalCount: 4,
      finishedCount: 2,
      progressPercent: 0.5,
      dismissalTime: '17:40',
      countdownText: '',
      dismissalCombinedText: '17:40 放学',
      dismissalText: '17:40 放学',
      nextCourseText: '给水排水管道工程 @ 长智楼 A208 · 10:05',
      upcomingCourses: sampleCourses,
      dayOfWeek,
      dayOfWeekName: DAY_NAMES[dayOfWeek] || '周五',
      isToday,
      isSampleData: true,
    };
  }

  // 筛选指定星期几在该周的所有真实课程
  const dayCourses = courses
    .map(repairCourse)
    .filter((c) => c.dayOfWeek === dayOfWeek && isCourseInWeek(c.weekRange, realWeekNumber))
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  if (dayCourses.length === 0) {
    return {
      remainingCount: 0,
      totalCount: 0,
      finishedCount: 0,
      progressPercent: 1.0,
      dismissalTime: '今日无课',
      countdownText: '无排课',
      dismissalCombinedText: '今日无课',
      dismissalText: '今日无排课',
      nextCourseText: '今日无课 · 享受大学时光',
      upcomingCourses: [],
      dayOfWeek,
      dayOfWeekName: DAY_NAMES[dayOfWeek] || '周一',
      isToday,
      isSampleData: false,
    };
  }

  // 计算未结束的课程（如果是今天，则过滤掉已经结束的课程；如果是其他星期，全部视为未结束）
  const activeOrUpcomingCourses = isToday
    ? dayCourses.filter((c) => {
        const [eh, em] = (c.endTime || '17:40').split(':').map(Number);
        const endMin = (eh || 0) * 60 + (em || 0);
        return endMin > curMinutes;
      })
    : dayCourses;

  const totalCount = dayCourses.length;
  const remainingCount = activeOrUpcomingCourses.length;
  const finishedCount = isToday ? Math.max(0, totalCount - remainingCount) : 0;
  const progressPercent = totalCount > 0 ? finishedCount / totalCount : 1.0;

  // 放学时间：最后一节课的下课时间（去掉“距放学还有多久”）
  const lastCourse = dayCourses[dayCourses.length - 1];
  const lastEndTime = lastCourse.endTime || '17:40';
  const dismissalText = remainingCount === 0 && isToday ? '已放学' : `${lastEndTime} 放学`;

  // 构建从左到右显示且一次只显示两门的课程列表（已结束的不显示）
  const upcomingCourses: WidgetCourseItem[] = activeOrUpcomingCourses
    .slice(0, 2)
    .map((c) => {
      const [sh, sm] = (c.startTime || '08:00').split(':').map(Number);
      const [eh, em] = (c.endTime || '09:40').split(':').map(Number);
      const startMin = (sh || 0) * 60 + (sm || 0);
      const endMin = (eh || 0) * 60 + (em || 0);

      let timeUntilStartText = `${c.startTime} 开始`;
      let isCurrent = false;

      if (isToday) {
        if (curMinutes >= startMin && curMinutes <= endMin) {
          timeUntilStartText = '进行中';
          isCurrent = true;
        } else if (curMinutes < startMin) {
          const diff = startMin - curMinutes;
          if (diff < 60) {
            timeUntilStartText = `${diff}分钟后`;
          } else {
            const h = Math.floor(diff / 60);
            const m = diff % 60;
            timeUntilStartText = m > 0 ? `${h}小时${m}分后` : `${h}小时后`;
          }
        }
      }

      return {
        id: c.id,
        name: c.name,
        location: c.location || '待定教室',
        startTime: c.startTime || '08:00',
        endTime: c.endTime || '09:40',
        timeUntilStartText,
        isCurrent,
      };
    });

  const nextCourseText = upcomingCourses.length > 0
    ? `${upcomingCourses[0].name} @ ${upcomingCourses[0].location} · ${upcomingCourses[0].startTime}`
    : '今日课程已全部结束 ✨';

  return {
    remainingCount,
    totalCount,
    finishedCount,
    progressPercent,
    dismissalTime: lastEndTime,
    countdownText: '',
    dismissalCombinedText: dismissalText,
    dismissalText,
    nextCourseText,
    upcomingCourses,
    dayOfWeek,
    dayOfWeekName: DAY_NAMES[dayOfWeek] || '周一',
    isToday,
    isSampleData: false,
  };
}

/**
 * 将最新课表数据（包含全周 7 天排课）同步到 Android 原生小组件 SharedPreferences 与 Widget
 */
export async function syncScheduleToNativeWidget(data?: WidgetScheduleData): Promise<void> {
  try {
    const stored = await loadScheduleData();
    const now = new Date();
    const todayDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();

    const currentRealWeek = calculateCurrentWeekNumber();
    // 计算周一至周日全周 7 天的完整组件数据
    const weeklyData = [1, 2, 3, 4, 5, 6, 7].map((day) => computeWidgetData(stored.courses, currentRealWeek, day));

    let widgetData = data;
    if (!widgetData || widgetData.dayOfWeek === todayDayOfWeek) {
      widgetData = weeklyData.find((d) => d.dayOfWeek === todayDayOfWeek) || weeklyData[0];
    }

    if (Platform.OS === 'android' && NativeModules.WidgetBridge) {
      // 序列化全周 7 天数据，供桌面小组件离线/在桌面直接切换星期
      const weeklyPayload = weeklyData.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        dayOfWeekName: d.dayOfWeekName,
        totalCount: d.totalCount,
        remainingCount: d.remainingCount,
        finishedCount: d.finishedCount,
        dismissalText: d.dismissalText,
        courses: d.upcomingCourses.map((c) => ({
          name: c.name,
          location: c.location ? `@${c.location}` : '',
          timeText: c.timeUntilStartText ? `${c.timeUntilStartText} · ${c.startTime}` : c.startTime,
        })),
      }));

      if (NativeModules.WidgetBridge.updateWeeklySchedule) {
        NativeModules.WidgetBridge.updateWeeklySchedule(
          JSON.stringify(weeklyPayload),
          widgetData.dayOfWeek
        );
      }

      const c1 = widgetData.upcomingCourses[0] || { name: '', location: '', startTime: '' };
      const c2 = widgetData.upcomingCourses[1] || { name: '', location: '', startTime: '' };

      if (NativeModules.WidgetBridge.updateWidgetDetailData) {
        NativeModules.WidgetBridge.updateWidgetDetailData(
          widgetData.remainingCount,
          widgetData.totalCount,
          widgetData.dismissalText,
          widgetData.dayOfWeekName,
          c1.name,
          c1.location ? `@${c1.location}` : '',
          c1.timeUntilStartText ? `${c1.timeUntilStartText} · ${c1.startTime}` : '',
          c2.name,
          c2.location ? `@${c2.location}` : '',
          c2.timeUntilStartText ? `${c2.timeUntilStartText} · ${c2.startTime}` : ''
        );
      } else {
        NativeModules.WidgetBridge.updateWidgetData(
          widgetData.remainingCount,
          widgetData.totalCount,
          widgetData.dismissalText,
          widgetData.nextCourseText,
          widgetData.progressPercent
        );
      }
    }
  } catch (e) {
    console.warn('[widgetHelper] Failed to sync to native widget:', e);
  }
}
