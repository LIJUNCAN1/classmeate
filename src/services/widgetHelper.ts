import { NativeModules, Platform } from 'react-native';
import { Course } from '../types/schedule';
import { isCourseInWeek, repairCourse } from './jwParser';
import { loadScheduleData } from './scheduleStorage';

export interface WidgetScheduleData {
  remainingCount: number;
  totalCount: number;
  progressPercent: number; // 0.0 ~ 1.0
  dismissalTime: string;
  countdownText: string;
  dismissalCombinedText: string; // 如 "20:35 放学 · 距放学 2小时15分"
  nextCourseText: string; // 如 "下节: 形势与政策 @ 涵虚楼A101 · 14:00"
  isSampleData: boolean;
}

/**
 * 严格按照原子组件要求计算课表信息：
 * 1. 外圈：300 度的优雅弧线进度图（底部保留 60 度开口）
 * 2. 中心：大字号醒目呈现今日剩余课程数（如 3 节剩余）
 * 3. 正下方：清晰标注放学时间与倒计时（如 20:35 放学 · 距放学 2小时15分）
 * 4. 底部胶囊：展示下节课具体信息（如 下节: 形势与政策 @ 涵虚楼A101 · 14:00）
 */
export function computeWidgetData(courses: Course[], realWeekNumber: number = 7): WidgetScheduleData {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1=周一, 7=周日
  const curMinutes = now.getHours() * 60 + now.getMinutes();

  // 若尚未导入任何课程，呈现真实标准示例数据
  if (!courses || courses.length === 0) {
    return {
      remainingCount: 3,
      totalCount: 4,
      progressPercent: 0.25,
      dismissalTime: '20:35',
      countdownText: '距放学 2小时15分',
      dismissalCombinedText: '20:35 放学 · 距放学 2小时15分',
      nextCourseText: '下节: 形势与政策 @ 涵虚楼A101 · 14:00',
      isSampleData: true,
    };
  }

  // 筛选今日在该周的所有真实课程
  const todayCourses = courses
    .map(repairCourse)
    .filter((c) => c.dayOfWeek === dayOfWeek && isCourseInWeek(c.weekRange, realWeekNumber))
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  if (todayCourses.length === 0) {
    return {
      remainingCount: 0,
      totalCount: 0,
      progressPercent: 1.0,
      dismissalTime: '今日无课',
      countdownText: '自由安排',
      dismissalCombinedText: '今日无课 · 自由安排',
      nextCourseText: '下节: 今日无课 · 享受大学时光',
      isSampleData: false,
    };
  }

  // 计算今日尚未结束的课程
  const remainingCourses = todayCourses.filter((c) => {
    const [eh, em] = (c.endTime || '17:40').split(':').map(Number);
    const endMin = (eh || 0) * 60 + (em || 0);
    return endMin > curMinutes;
  });

  const remainingCount = remainingCourses.length;
  const totalCount = todayCourses.length;
  const finishedCount = Math.max(0, totalCount - remainingCount);
  const progressPercent = totalCount > 0 ? finishedCount / totalCount : 1.0;

  // 放学时间：今日最后一节课的下课时间
  const lastCourse = todayCourses[todayCourses.length - 1];
  const lastEndTime = lastCourse.endTime || '17:40';
  const [leh, lem] = lastEndTime.split(':').map(Number);
  const lastEndMin = (leh || 0) * 60 + (lem || 0);
  const diff = lastEndMin - curMinutes;

  let countdownText = '今日课程已结束';
  if (diff > 0) {
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    countdownText = h > 0 ? `距放学 ${h}小时${m}分` : `距放学 ${m}分钟`;
  }

  const dismissalCombinedText = `${lastEndTime} 放学 · ${countdownText}`;

  // 下节课解析
  let nextCourseText = '今日课程已全部结束 ✨';
  const upcoming = todayCourses.find((c) => {
    const [sh, sm] = (c.startTime || '08:00').split(':').map(Number);
    const startMin = (sh || 0) * 60 + (sm || 0);
    return startMin > curMinutes;
  });

  const current = todayCourses.find((c) => {
    const [sh, sm] = (c.startTime || '08:00').split(':').map(Number);
    const [eh, em] = (c.endTime || '09:40').split(':').map(Number);
    const startMin = (sh || 0) * 60 + (sm || 0);
    const endMin = (eh || 0) * 60 + (em || 0);
    return curMinutes >= startMin && curMinutes <= endMin;
  });

  if (upcoming) {
    const loc = upcoming.location ? ` @ ${upcoming.location}` : '';
    nextCourseText = `下节: ${upcoming.name}${loc} · ${upcoming.startTime}`;
  } else if (current) {
    const loc = current.location ? ` @ ${current.location}` : '';
    nextCourseText = `正在上: ${current.name}${loc} · ${current.endTime}下课`;
  }

  return {
    remainingCount,
    totalCount,
    progressPercent,
    dismissalTime: lastEndTime,
    countdownText,
    dismissalCombinedText,
    nextCourseText,
    isSampleData: false,
  };
}

/**
 * 将最新课表数据同步到 Android 原生小组件 SharedPreferences 与 Widget
 */
export async function syncScheduleToNativeWidget(data?: WidgetScheduleData): Promise<void> {
  try {
    let widgetData = data;
    if (!widgetData) {
      const stored = await loadScheduleData();
      widgetData = computeWidgetData(stored.courses);
    }

    if (Platform.OS === 'android' && NativeModules.WidgetBridge) {
      NativeModules.WidgetBridge.updateWidgetData(
        widgetData.remainingCount,
        widgetData.totalCount,
        widgetData.dismissalCombinedText,
        widgetData.nextCourseText,
        widgetData.progressPercent
      );
    }
  } catch (e) {
    console.warn('[widgetHelper] Failed to sync to native widget:', e);
  }
}
