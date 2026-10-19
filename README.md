# Classmeate 🎓

> **打破传统课程表与笔记应用的割裂，以“课表驱动知识流”（Schedule-driven Knowledge Flow）为核心的现代化跨平台学习工具。**

---

## ✨ 核心特性

- 📅 **智能课程表**：支持单双周、重叠课程、作息表定制与上课提醒。
- 📝 **关联式课堂笔记**：自动绑定当前课时，课表不再是静态时间表，而是动态的知识归档入口。
- 🏫 **教务系统一键导入**：内置原生安全免密 WebView 架构，自动提取高校教务（正方、强智、青果、ICS 等）课程数据。
- 🎨 **Impeccable 设计规范**：
  - 清新草木绿流体顶栏与大圆角呼吸感纯白悬浮卡片。
  - 规范的 [`DESIGN.md`](./DESIGN.md) 设计 Token 字典与严格的无反模式保障。
  - 紧凑的横向 7 天日历星期轴与垂直时间轴导轨。

---

## 🛠️ 技术选型

- **框架**：[React Native](https://reactnative.dev/) + [Expo SDK 58](https://expo.dev/)
- **语言**：TypeScript 6.0
- **图标**：Expo Vector Icons (Ionicons)
- **多端支持**：iOS / Android / Web 自适应

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
# 启动 Web 端实时预览
npx expo start --web

# 启动移动端开发服务（通过 Expo Go 扫码）
npx expo start
```

---

## 📂 项目结构

```text
├── DESIGN.md                 # 设计系统 Token 字典与视觉规范
├── PRODUCT.md                # 产品定义与核心事实
├── App.tsx                   # 根应用入口
└── src/
    ├── constants/theme.ts    # 代码级设计 Token
    ├── types/schedule.ts     # 课程、笔记与教务类型定义
    ├── services/jwParser.ts  # 教务系统 DOM 解析与脚本注入服务
    ├── components/           # UI 基础组件 (星期轴/卡片/金刚区/弹窗)
    └── screens/              # 核心业务页面 (ScheduleScreen 课表主界面)
```

---

## 📄 License

Apache-2.0
