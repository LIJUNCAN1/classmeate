import { Course } from '../types/schedule';
import { MOCK_IMPORTED_COURSES } from './jwParser';

export interface AutoDetectStatus {
  isAutoDetected: boolean;
  schoolName: string;
  semester: string;
  courseCount: number;
  lastSyncTime: string;
}

/**
 * 自动识别教务课表服务 (Auto-Detection Engine)
 * 无需用户手动点击多步选择，进入系统后根据网络环境、本地缓存或剪贴板/文件自动探测并同步
 */
export const AutoScheduleService = {
  detectScheduleSilently: async (): Promise<{ success: boolean; data: Course[]; status: AutoDetectStatus }> => {
    // 模拟 400ms 智能静默嗅探与 DOM / ICS 解析
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: MOCK_IMPORTED_COURSES,
          status: {
            isAutoDetected: true,
            schoolName: '高校教务系统 (自动识别)',
            semester: '2025-2026学年 第二学期',
            courseCount: MOCK_IMPORTED_COURSES.length,
            lastSyncTime: '刚刚 自动同步',
          },
        });
      }, 400);
    });
  },
};
