export interface Course {
  id: string;
  name: string;
  teacher: string;
  teacherAvatar?: string;
  countryFlag?: string;
  rating?: string;
  location: string;
  dayOfWeek: number; // 1-7 (1 = Monday, 7 = Sunday)
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:35"
  stageTag?: string; // e.g. "进阶阶段 · 36课时 · 高阶"
  status: 'pending' | 'in_progress' | 'completed' | 'booked';
  notesCount: number;
  weekRange?: string; // e.g. "1-16周"
  startPeriod?: number;
  span?: number;
}

export interface DaySchedule {
  date: string;       // e.g. "2026-06-21"
  dayOfWeekName: string; // e.g. "三"
  dayNumber: number;  // e.g. 21
  isToday: boolean;
  courses: Course[];
}

export type ViewMode = 'calendar' | 'teacher';
export type TeacherTab = 'wait' | 'done';

export interface JwSystemPreset {
  id: string;
  name: string;
  type: 'zhengfang' | 'qiangzhi' | 'qingguo' | 'urp' | 'custom_cas';
  defaultUrl: string;
  description: string;
}
