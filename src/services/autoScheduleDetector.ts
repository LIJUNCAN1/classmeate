import { Course } from '../types/schedule';

export interface AutoDetectStatus {
  isAutoDetected: boolean;
  schoolName: string;
  semester: string;
  courseCount: number;
  lastSyncTime: string;
}

/**
 * 自动识别教务课表服务 (Auto-Detection Engine)
 */
export const AutoScheduleService = {
  detectScheduleSilently: async (): Promise<{ success: boolean; data: Course[]; status: AutoDetectStatus }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          data: [],
          status: {
            isAutoDetected: false,
            schoolName: '高校教务系统',
            semester: '2025-2026学年 第二学期',
            courseCount: 0,
            lastSyncTime: '未同步',
          },
        });
      }, 200);
    });
  },
};
