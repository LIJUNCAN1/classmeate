/**
 * Classmeate Design System Tokens
 * Fully aligned with DESIGN.md
 */
export const Colors = {
  primary: '#52C41A',
  primaryGradientStart: '#68D391',
  primaryGradientEnd: '#48BB78',
  primaryLight: '#F0FDF4',
  primaryBorder: '#DCFCE7',

  accentBlue: '#4A90E2',
  accentBlueLight: '#EFF6FF',
  accentPurple: '#8B5CF6',
  accentPurpleLight: '#F5F3FF',
  accentAmber: '#F59E0B',
  accentAmberLight: '#FEF3C7',
  accentGold: '#FAAD14',
  accentGoldLight: '#FFFBEB',
  accentPink: '#FF4D4F',
  accentPinkLight: '#FFF1F0',

  courseBlueBg: '#E6F4FF',
  courseBlueBorder: '#91CAFF',
  courseBlueText: '#0958D9',
  courseGreenBg: '#E6F7ED',
  courseGreenBorder: '#B7EB8F',
  courseGreenText: '#237804',
  coursePurpleBg: '#F9F0FF',
  coursePurpleBorder: '#D3ADF7',
  coursePurpleText: '#531DAB',
  courseAmberBg: '#FFF7E6',
  courseAmberBorder: '#FFD591',
  courseAmberText: '#D46B08',
  coursePinkBg: '#FFF1F0',
  coursePinkBorder: '#FFA39E',
  coursePinkText: '#CF1322',

  surface: '#FFFFFF',
  background: '#F8FAF8',
  textPrimary: '#1F2937',
  textMain: '#1F2937',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#E2E8F0',
  borderSubtle: '#F3F4F6',
  timelineLine: '#E5E7EB',
};

export const Rounded = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  glow: {
    shadowColor: '#52C41A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

/**
 * 根据课程名称获取周课表对应的专属颜色方案 (背景/边框/字体)
 */
export const getCourseColorScheme = (name: string) => {
  if (name.includes('数学') || name.includes('口语')) {
    return { bg: Colors.courseBlueBg, border: Colors.courseBlueBorder, text: Colors.courseBlueText };
  }
  if (name.includes('韩语') || name.includes('设计') || name.includes('交互')) {
    return { bg: Colors.courseGreenBg, border: Colors.courseGreenBorder, text: Colors.courseGreenText };
  }
  if (name.includes('系统') || name.includes('算法') || name.includes('结构')) {
    return { bg: Colors.coursePurpleBg, border: Colors.coursePurpleBorder, text: Colors.coursePurpleText };
  }
  if (name.includes('英语') || name.includes('写作')) {
    return { bg: Colors.courseAmberBg, border: Colors.courseAmberBorder, text: Colors.courseAmberText };
  }
  if (name.includes('TOPIK') || name.includes('专攻')) {
    return { bg: Colors.coursePinkBg, border: Colors.coursePinkBorder, text: Colors.coursePinkText };
  }
  return { bg: Colors.courseBlueBg, border: Colors.courseBlueBorder, text: Colors.courseBlueText };
};

