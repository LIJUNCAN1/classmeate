---
name: Classmeate
description: 课表与笔记深度结合的现代化跨平台学习工具设计系统
colors:
  primary: "#52C41A"
  primary-gradient-start: "#68D391"
  primary-gradient-end: "#48BB78"
  primary-light: "#F0FDF4"
  primary-border: "#DCFCE7"
  accent-blue: "#4A90E2"
  accent-blue-light: "#EFF6FF"
  accent-purple: "#8B5CF6"
  accent-purple-light: "#F5F3FF"
  accent-amber: "#F59E0B"
  accent-amber-light: "#FEF3C7"
  accent-gold: "#FAAD14"
  accent-gold-light: "#FFFBEB"
  accent-pink: "#FF4D4F"
  accent-pink-light: "#FFF1F0"
  course-blue-bg: "#E6F4FF"
  course-blue-border: "#91CAFF"
  course-blue-text: "#0958D9"
  course-green-bg: "#E6F7ED"
  course-green-border: "#B7EB8F"
  course-green-text: "#237804"
  course-purple-bg: "#F9F0FF"
  course-purple-border: "#D3ADF7"
  course-purple-text: "#531DAB"
  course-amber-bg: "#FFF7E6"
  course-amber-border: "#FFD591"
  course-amber-text: "#D46B08"
  course-pink-bg: "#FFF1F0"
  course-pink-border: "#FFA39E"
  course-pink-text: "#CF1322"
  surface: "#FFFFFF"
  background: "#F8FAF8"
  text-primary: "#1F2937"
  text-secondary: "#4B5563"
  text-muted: "#9CA3AF"
  border-subtle: "#F3F4F6"
  timeline-line: "#E5E7EB"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Segoe UI', Roboto, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "1.25"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Segoe UI', Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "1.35"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "normal"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "1.4"
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "20px"
  xl: "24px"
components:
  card-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "16px 20px"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-secondary-pill:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  tag-status:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

## Overview

Classmeate 设计系统以**“生机盎然、呼吸感、轻盈无扰与陪伴成长”**为核心视觉基调。
设计灵感源于自然草木的生机绿调与现代移动端微质感。通过清新的渐变顶栏、温和的大圆角浮动卡片、生动的 3D 粘土徽章/吉祥物以及清晰的时间轴轨道，将严肃的日程规划与沉淀型的笔记学习融合成兼具秩序感与愉悦感的体验。

## Colors

- **Primary Brand（品牌主色）**：
  - `primary` (`#52C41A` / `#48BB78`)：核心激活状态、今日高亮、重要 CTA 胶囊。
  - `primary-gradient` (`#68D391` -> `#48BB78`)：页面顶部弧形背景，传达自然生机。
  - `primary-light` (`#F0FDF4`)：标签背景、次要操作胶囊底色。
- **Semantic Accents（功能辅助色）**：
  - `accent-blue` (`#4A90E2`)：知识大纲、教师视角、系统课标签。
  - `accent-gold` (`#FAAD14`)：荣誉徽章、积分/金币、VIP特权提示。
  - `accent-pink` (`#FF4D4F`)：紧急提醒、回放标记、未读通知。
- **Surfaces & Neutrals（表面与中性色）**：
  - `background` (`#F8FAF8`)：极浅淡绿灰背景，避免纯白背景的高眩光反差。
  - `surface` (`#FFFFFF`)：核心功能卡片底色。
  - `text-primary` (`#1F2937`) / `text-secondary` (`#4B5563`) / `text-muted` (`#9CA3AF`)。

## Typography

遵循移动端与多端自适应字体阶梯，优先调用系统原生无衬线字体（iOS SF Pro / Android Roboto / HarmonyOS Sans / 苹方）：
- **Display (24px Bold)**：用于一级页面核心标题与问候语（如“请选择学习类型”、“上午好，同学”）。
- **Title (17px Semibold)**：用于卡片课程名称、分组工具大标题。
- **Body (14px Regular)**：用于课程时间、地点、任课教师及笔记正文摘要。
- **Caption (12px Medium)**：用于状态标签、倒计时提示、周次与星期标识。

## Layout

- **顶部流体状态区 (Hero Fluid Area)**：
  - 顶部 180~220px 承载清新渐变底色，底部呈自然大圆角弧形过渡（border-bottom-radius: 28px）。
- **水平日历周期滑动条 (Horizontal Calendar Strip)**：
  - 紧凑排布 7 天日期卡片，当前日/选中日使用高对比度绿底白字圆胶囊（如“三 今”）。
- **垂直时间轴导轨 (Vertical Schedule Timeline)**：
  - 左侧为时间刻度节点（如 9:00、13:30），中间通过 1.5px 浅灰轴线连接。
  - 右侧通过垂直间距 12px 悬挂大圆角独立课程卡片。
- **功能金刚区 (Quick Access Grid)**：
  - 4 列等宽图标网格，包含彩色微渐变圆角图标与 12px 标签文字。

## Elevation & Depth

- **卡片悬浮层 (Floating Card Elevation)**：
  - `box-shadow: 0 4px 16px -2px rgba(31, 41, 55, 0.05), 0 2px 4px -2px rgba(31, 41, 55, 0.02);`
  - 杜绝硬边缘黑色重投影，确保背景与卡片之间的过渡柔和通透。
- **模态与弹窗层 (Modal & Sheet)**：
  - `box-shadow: 0 10px 30px -4px rgba(0, 0, 0, 0.1);`

## Shapes

- **容器卡片 (Cards)**：统一采用 `rounded.xl` (20px) 或 `rounded.lg` (16px) 的连续曲率圆角。
- **行动胶囊 (Capsule / Pill Buttons)**：所有状态按钮、日期圆圈、操作入口均采用 `rounded.pill` (9999px)，触感圆润亲和。
- **输入框与选择器 (Inputs & Toggles)**：采用 `rounded.md` (12px)，内边距充足。

## Components

1. **课程卡片 (CourseCard)**：
   - 布局：左侧课程核心信息（名称、教师姓名、国旗/专业标签、周次教室），右侧垂直居中放置操作状态胶囊（“待上课 / 预约 / 笔记 (3)”）。
   - 底部延伸区：轻触可展开查看或快速记录随堂笔记。
2. **日历星期选择器 (WeekCalendarStrip)**：
   - 一周 7 天横滑视图，展示星期缩写与日期数字；选中项为草绿色背景胶囊与阴影光晕。
3. **单选/配置卡片 (OptionCard)**：
   - 包含单选圆框、3D 粘土徽章/插画、主标题及副文案，选中态带有绿色描边与高亮背景淡晕。
4. **底部导航栏 (BottomTabBar)**：
   - 5 标签结构（首页、课表、随堂笔记、课程库、我的），图标采用 24px 双色风格，当前选中项高亮为品牌绿，配以轻微弹性动画。

## Do's and Don'ts

- **Do**：
  - 保持界面的轻盈与呼吸感，卡片留白必须充裕（内边距 ≥ 16px）。
  - 课程表状态（未上/正在上/已结课）使用清晰明确的胶囊色阶区分。
  - 当展示 3D 粘土图标或吉祥物时，背景必须干净克制，让视线自然聚焦于内容。
- **Don't**：
  - 严禁使用浓重暗沉的暗黑渐变、生硬的深紫色或粗黑描边。
  - 严禁在课表卡片堆砌多层嵌套卡片（Card-in-Card AI Slop）。
  - 严禁在无必要的情况下使用固定像素绝对定位，确保跨屏幕尺寸（手机、平板、桌面分屏）的自适应弹性。
