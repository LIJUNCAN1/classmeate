import { Course, JwSystemPreset } from '../types/schedule';

export const POPULAR_JW_PRESETS: JwSystemPreset[] = [
  {
    id: 'zf',
    name: '新版正方教务系统',
    type: 'zhengfang',
    defaultUrl: 'https://jwglxt.university.edu.cn',
    description: '支持国内数百所高校的新版正方教务，通过个人课表 DOM 树自动提取周次与节次',
  },
  {
    id: 'qz',
    name: '强智教务系统',
    type: 'qiangzhi',
    defaultUrl: 'https://qzjw.university.edu.cn',
    description: '支持强智教务，通过课表视图矩阵自动提取课程与教室地点',
  },
  {
    id: 'qg',
    name: '青果教务网络管理系统',
    type: 'qingguo',
    defaultUrl: 'https://qgjw.university.edu.cn',
    description: '支持青果教务系统学生课表查询页自动解析',
  },
  {
    id: 'ics',
    name: '通用 ICS / Excel 导入',
    type: 'custom_cas',
    defaultUrl: '',
    description: '从教务系统或统一门户导出的 .ics 日历文件直接一键导入',
  },
];

/**
 * 注入到内置 WebView 中的 JavaScript 解析脚本模板
 * 当用户在 WebView 中登录成功并跳转到课表页面时，自动执行此脚本抓取表格 DOM
 */
export const INJECTED_PARSER_SCRIPT = `
(function() {
  try {
    var courses = [];
    // 典型正方教务系统表格解析逻辑示范
    var table = document.querySelector('#kbtable') || document.querySelector('.table-schedule') || document.querySelector('table');
    if (table) {
      var rows = table.querySelectorAll('tr');
      // 解析星期列与节次行...
      // 将提取的数据封装为标准结构
    }
    // 向 React Native 客户端发送抓取到的课程列表
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'JW_SCHEDULE_PARSED',
        success: true,
        data: courses
      }));
    }
  } catch(e) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'JW_SCHEDULE_ERROR',
        error: e.toString()
      }));
    }
  }
})();
true;
`;

/**
 * 示例导入数据（模拟教务系统解析返回的结果）
 */
export const MOCK_IMPORTED_COURSES: Course[] = [
  {
    id: 'jw-101',
    name: '高等数学 (AI 与数据方向)',
    teacher: '张晓华 教授',
    countryFlag: '🇨🇳',
    rating: '4.9',
    location: '第一教学楼 A204',
    dayOfWeek: 3,
    startTime: '08:00',
    endTime: '09:35',
    stageTag: '必修大课 · 48课时 · 周三1-2节',
    status: 'in_progress',
    notesCount: 2,
    weekRange: '1-16周',
  },
  {
    id: 'jw-102',
    name: '成人商务韩语谈判',
    teacher: 'Jennifer 老师',
    countryFlag: '🇺🇸',
    rating: '5.0',
    location: '国际交流中心 302',
    dayOfWeek: 3,
    startTime: '09:00',
    endTime: '10:35',
    stageTag: '进阶阶段 · 36课时 · 高阶',
    status: 'pending',
    notesCount: 0,
    weekRange: '1-12周',
  },
  {
    id: 'jw-103',
    name: 'TOPIK备考（留学专攻）',
    teacher: 'Stefanee 讲师',
    countryFlag: '🇨🇦',
    rating: '4.8',
    location: '同声传译实训室 401',
    dayOfWeek: 3,
    startTime: '13:30',
    endTime: '15:05',
    stageTag: '强化阶段 · 32课时 · 高阶',
    status: 'pending',
    notesCount: 1,
    weekRange: '1-16周',
  },
  {
    id: 'jw-104',
    name: '出国旅游韩语实用',
    teacher: 'Zephyr 老师',
    countryFlag: '🇺🇸',
    rating: '4.8',
    location: '语言视听教室 102',
    dayOfWeek: 3,
    startTime: '15:20',
    endTime: '16:10',
    stageTag: '应用阶段 · 16课时 · 基本',
    status: 'completed',
    notesCount: 3,
    weekRange: '1-8周',
  },
  {
    id: 'jw-105',
    name: '韩语口语突破1v1',
    teacher: 'Cipher 老师',
    countryFlag: '🇬🇧',
    rating: '5.0',
    location: '自习室/线上协同 2号房',
    dayOfWeek: 3,
    startTime: '16:30',
    endTime: '17:45',
    stageTag: '培养阶段 · 24课时 · 入门',
    status: 'pending',
    notesCount: 0,
    weekRange: '1-16周',
  },
];
