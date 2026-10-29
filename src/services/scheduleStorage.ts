import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course } from '../types/schedule';

export type NonCurrentWeekMode = 'hide' | 'stacked' | 'transparent';

const STORAGE_KEYS = {
  COURSES: '@classmeate_courses_list_v2',
  SEMESTER: '@classmeate_active_semester_v2',
  LAST_UPDATE: '@classmeate_schedule_last_update_v2',
  NON_CURRENT_WEEK_MODE: '@classmeate_non_current_week_mode_v3',
  SEMESTER_START_DATE: '@classmeate_semester_start_date_v2',
};

/**
 * 根据开学日期与当前日期精准计算真实所处周次 (默认以 2026-09-07 开学周周一为第1周基准)
 */
export function calculateCurrentWeekNumber(date = new Date(), semesterStartDateStr?: string | null): number {
  let start = new Date(2026, 8, 7); // 2026-09-07 (第1周周一)
  if (semesterStartDateStr) {
    const parsed = new Date(semesterStartDateStr);
    if (!isNaN(parsed.getTime())) {
      start = parsed;
    }
  }

  // 统一对齐到开学周周一
  const startDay = start.getDay();
  const startMondayDiff = startDay === 0 ? -6 : 1 - startDay;
  const startMonday = new Date(start.getFullYear(), start.getMonth(), start.getDate() + startMondayDiff);
  startMonday.setHours(0, 0, 0, 0);

  // 统一对齐到目标日期所在周周一
  const curDay = date.getDay();
  const curMondayDiff = curDay === 0 ? -6 : 1 - curDay;
  const curMonday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + curMondayDiff);
  curMonday.setHours(0, 0, 0, 0);

  const diffTime = curMonday.getTime() - startMonday.getTime();
  const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(25, diffWeeks + 1));
}

export interface StoredScheduleData {
  courses: Course[];
  semester: string | null;
  lastUpdate: number | null;
}

export async function saveNonCurrentWeekMode(mode: NonCurrentWeekMode): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NON_CURRENT_WEEK_MODE, mode);
    return true;
  } catch (error) {
    console.error('[scheduleStorage] Failed to save non current week mode:', error);
    return false;
  }
}

export async function loadNonCurrentWeekMode(): Promise<NonCurrentWeekMode> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.NON_CURRENT_WEEK_MODE);
    if (val === 'hide' || val === 'stacked' || val === 'transparent') {
      return val;
    }
    return 'hide'; // 严格默认非本周课不显示（彻底隐藏，只保留当前周真实排课）
  } catch (error) {
    return 'hide';
  }
}

/**
 * 持久化存储导入的全部课程数据与学期信息
 */
export async function saveScheduleData(courses: Course[], semester?: string): Promise<boolean> {
  try {
    const payload = JSON.stringify(courses);
    await AsyncStorage.setItem(STORAGE_KEYS.COURSES, payload);
    if (semester) {
      await AsyncStorage.setItem(STORAGE_KEYS.SEMESTER, semester);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_UPDATE, Date.now().toString());
    return true;
  } catch (error) {
    console.error('[scheduleStorage] Failed to save schedule data:', error);
    return false;
  }
}

/**
 * 应用冷启动时从本地持久化存储加载课程表
 */
export async function loadScheduleData(): Promise<StoredScheduleData> {
  try {
    const [coursesJson, semester, lastUpdateStr] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.COURSES),
      AsyncStorage.getItem(STORAGE_KEYS.SEMESTER),
      AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATE),
    ]);

    let courses: Course[] = [];
    if (coursesJson) {
      const parsed = JSON.parse(coursesJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        courses = parsed;
      }
    }

    return {
      courses,
      semester: semester || null,
      lastUpdate: lastUpdateStr ? parseInt(lastUpdateStr, 10) : null,
    };
  } catch (error) {
    console.error('[scheduleStorage] Failed to load schedule data:', error);
    return { courses: [], semester: null, lastUpdate: null };
  }
}

/**
 * 清空本地持久化的课程表数据
 */
export async function clearScheduleData(): Promise<boolean> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.COURSES),
      AsyncStorage.removeItem(STORAGE_KEYS.SEMESTER),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_UPDATE),
    ]);
    return true;
  } catch (error) {
    console.error('[scheduleStorage] Failed to clear schedule data:', error);
    return false;
  }
}
