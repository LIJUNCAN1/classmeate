import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  TextInput,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

export interface StickyNote {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
}

export interface StrokePoint {
  x: number;
  y: number;
  w?: number;
  t?: number;
}

export interface DrawingStroke {
  points: StrokePoint[];
  color: string;
  width: number;
}

interface FreeformCanvasProps {
  courseName: string;
  initialTitle?: string;
  initialNotes?: StickyNote[];
  initialStrokes?: DrawingStroke[];
  onClose: () => void;
  onSave: (data: { title: string; notes: StickyNote[]; strokes: DrawingStroke[] }) => void;
}

// 真实笔刷压感轮廓曲线算法，计算切向法向量并生成饱满带压感的闭合贝塞尔 Ribbon 曲线
function strokeToOutlinePath(points: StrokePoint[], defaultWidth: number): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    const r = (p.w || defaultWidth) / 2;
    return `M ${p.x - r} ${p.y} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
  }

  const leftPts: { x: number; y: number }[] = [];
  const rightPts: { x: number; y: number }[] = [];

  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    let dx = 0;
    let dy = 0;

    if (i === 0) {
      dx = points[1].x - curr.x;
      dy = points[1].y - curr.y;
    } else if (i === points.length - 1) {
      dx = curr.x - points[i - 1].x;
      dy = curr.y - points[i - 1].y;
    } else {
      dx = points[i + 1].x - points[i - 1].x;
      dy = points[i + 1].y - points[i - 1].y;
    }

    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const halfW = Math.max(1, (curr.w || defaultWidth) / 2);

    leftPts.push({ x: curr.x + nx * halfW, y: curr.y + ny * halfW });
    rightPts.push({ x: curr.x - nx * halfW, y: curr.y - ny * halfW });
  }

  // 沿左侧正向曲线平滑连接
  let d = `M ${leftPts[0].x} ${leftPts[0].y}`;
  for (let i = 1; i < leftPts.length; i++) {
    const midX = (leftPts[i - 1].x + leftPts[i].x) / 2;
    const midY = (leftPts[i - 1].y + leftPts[i].y) / 2;
    d += ` Q ${leftPts[i - 1].x} ${leftPts[i - 1].y}, ${midX} ${midY}`;
  }
  d += ` L ${leftPts[leftPts.length - 1].x} ${leftPts[leftPts.length - 1].y}`;

  // 端点连接至右侧
  d += ` L ${rightPts[rightPts.length - 1].x} ${rightPts[rightPts.length - 1].y}`;

  // 沿右侧反向曲线平滑连接
  for (let i = rightPts.length - 2; i >= 0; i--) {
    const midX = (rightPts[i + 1].x + rightPts[i].x) / 2;
    const midY = (rightPts[i + 1].y + rightPts[i].y) / 2;
    d += ` Q ${rightPts[i + 1].x} ${rightPts[i + 1].y}, ${midX} ${midY}`;
  }
  d += ` L ${rightPts[0].x} ${rightPts[0].y} Z`;

  return d;
}

export const FreeformCanvas: React.FC<FreeformCanvasProps> = ({
  courseName,
  initialTitle,
  initialNotes,
  initialStrokes,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44
  );

  const [title, setTitle] = useState(initialTitle || '');

  // 便签纸列表：全新空白开始，支持用户创建、修改与保存持久化，绝不回退至预设
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(initialNotes || []);

  // 手绘笔迹：全新空白开始，支持真实压感与持久化
  const [strokes, setStrokes] = useState<DrawingStroke[]>(initialStrokes || []);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[]>([]);

  // 画笔工具栏状态 (仿苹果 Apple Pencil 悬浮工具坞)
  const [selectedTool, setSelectedTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [activeColor, setActiveColor] = useState<string>('#1E293B');

  // 关键：解决 PanResponder 闭包陷阱的实时引用
  const strokesRef = useRef<DrawingStroke[]>(strokes);
  strokesRef.current = strokes;
  const currentStrokeRef = useRef<StrokePoint[]>([]);
  const selectedToolRef = useRef(selectedTool);
  selectedToolRef.current = selectedTool;
  const activeColorRef = useRef(activeColor);
  activeColorRef.current = activeColor;

  const colorPalette = [
    '#1E293B', // 黑
    '#EF4444', // 红
    '#3B82F6', // 蓝
    '#10B981', // 绿
    '#F59E0B', // 黄
    '#8B5CF6', // 紫
  ];

  // 双指放大缩小 (Pinch-to-zoom)
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1.0);

  // 当前公历日期
  const dateSubtitle = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  // 添加新便签 (全新空白便签，无预设文字)
  const handleAddStickyNote = (color: string = '#FEF08A') => {
    const newNote: StickyNote = {
      id: `sn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text: '',
      color,
      x: Math.floor(Math.random() * 80) + 40,
      y: Math.floor(Math.random() * 120) + 120,
    };
    setStickyNotes((prev) => [...prev, newNote]);
  };

  // 更新便签内容
  const handleUpdateStickyText = (id: string, text: string) => {
    setStickyNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, text } : n))
    );
  };

  // 删除便签
  const handleDeleteSticky = (id: string) => {
    setStickyNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // 撤销上一笔画
  const handleUndo = () => {
    if (strokesRef.current.length > 0) {
      const nextStrokes = strokesRef.current.slice(0, -1);
      strokesRef.current = nextStrokes;
      setStrokes(nextStrokes);
    }
  };

  // 清空画板
  const handleClearAll = () => {
    strokesRef.current = [];
    setStrokes([]);
  };

  // 画板手势 (支持单指带压感书写涂鸦，双指缩放画布)
  const canvasPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // 双指触控：初始化缩放基准距离
        if (evt.nativeEvent.touches && evt.nativeEvent.touches.length >= 2) {
          const t0 = evt.nativeEvent.touches[0];
          const t1 = evt.nativeEvent.touches[1];
          initialDistanceRef.current = Math.hypot(t0.pageX - t1.pageX, t0.pageY - t1.pageY);
          initialScaleRef.current = zoomScale;
          return;
        }

        const { locationX, locationY } = evt.nativeEvent;
        const tool = selectedToolRef.current;
        if (tool === 'eraser') {
          const updated = strokesRef.current.filter(
            (s) =>
              !s.points.some(
                (pt) => Math.hypot(pt.x - locationX, pt.y - locationY) < 22
              )
          );
          strokesRef.current = updated;
          setStrokes(updated);
        } else {
          const baseW = tool === 'highlighter' ? 14 : 3.5;
          const initialPt: StrokePoint = {
            x: locationX,
            y: locationY,
            w: baseW,
            t: Date.now(),
          };
          currentStrokeRef.current = [initialPt];
          setCurrentStroke([initialPt]);
        }
      },
      onPanResponderMove: (evt) => {
        // 双指触控滑动：动态计算缩放比例
        if (evt.nativeEvent.touches && evt.nativeEvent.touches.length >= 2) {
          const t0 = evt.nativeEvent.touches[0];
          const t1 = evt.nativeEvent.touches[1];
          const dist = Math.hypot(t0.pageX - t1.pageX, t0.pageY - t1.pageY);
          if (initialDistanceRef.current && initialDistanceRef.current > 0) {
            const factor = dist / initialDistanceRef.current;
            const newScale = Math.min(3.0, Math.max(0.6, initialScaleRef.current * factor));
            setZoomScale(Number(newScale.toFixed(2)));
          }
          return;
        }

        const { locationX, locationY } = evt.nativeEvent;
        const tool = selectedToolRef.current;
        if (tool === 'eraser') {
          const updated = strokesRef.current.filter(
            (s) =>
              !s.points.some(
                (pt) => Math.hypot(pt.x - locationX, pt.y - locationY) < 22
              )
          );
          strokesRef.current = updated;
          setStrokes(updated);
        } else {
          const baseW = tool === 'highlighter' ? 14 : 3.5;
          const now = Date.now();
          const pts = currentStrokeRef.current;
          const lastPt = pts.length > 0 ? pts[pts.length - 1] : null;

          let w = baseW;
          if (lastPt) {
            const dist = Math.hypot(locationX - lastPt.x, locationY - lastPt.y);
            if (dist < 1.0) return; // 过滤极小抖动
            const dt = Math.max(10, now - (lastPt.t || now - 16));
            const speed = dist / dt; // 移动速度 (px/ms)

            let speedFactor = 1.0;
            if (tool === 'pen') {
              // 运笔越慢，笔划越浓郁粗厚（压感增强）；运笔飞快甩尾，笔锋变细（毛笔/钢笔真实手感）
              if (speed > 1.2) {
                speedFactor = Math.max(0.5, 1.2 / speed);
              } else if (speed < 0.4) {
                speedFactor = Math.min(1.5, 1.0 + (0.4 - speed) * 1.5);
              }
              const force = evt.nativeEvent.force;
              if (typeof force === 'number' && force > 0) {
                speedFactor *= Math.min(1.8, Math.max(0.5, force * 1.6));
              }
            }
            w = baseW * speedFactor;
            if (lastPt.w) {
              w = lastPt.w * 0.35 + w * 0.65; // 平滑过渡
            }
          }

          const nextPt: StrokePoint = { x: locationX, y: locationY, w, t: now };
          pts.push(nextPt);
          setCurrentStroke([...pts]);
        }
      },
      onPanResponderRelease: () => {
        initialDistanceRef.current = null;
        const tool = selectedToolRef.current;
        const pts = currentStrokeRef.current;
        if (tool !== 'eraser' && pts.length > 0) {
          const baseW = tool === 'highlighter' ? 14 : 3.5;
          const strokeColor =
            tool === 'highlighter'
              ? activeColorRef.current + '70'
              : activeColorRef.current;
          const newStroke: DrawingStroke = {
            points: [...pts],
            color: strokeColor,
            width: baseW,
          };
          const nextStrokes = [...strokesRef.current, newStroke];
          strokesRef.current = nextStrokes;
          setStrokes(nextStrokes);
          currentStrokeRef.current = [];
          setCurrentStroke([]);
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* 顶部操作条（完全复刻图1的 Apple Freeform 导航栏，副标题已按要求换成日期） */}
      <View style={[styles.topNavBar, { paddingTop: topPadding + 4 }]}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.titleGroup}>
            <TextInput
              style={styles.canvasTitleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="无标题无边记"
            />
            {/* 按用户要求：去掉“无边记无限画布”说明，换成日期 */}
            <Text style={styles.canvasCourseTag}>{dateSubtitle}</Text>
          </View>
        </View>

        <View style={styles.navRight}>
          {/* 缩放控制器指示 */}
          <View style={styles.zoomControlRow}>
            <TouchableOpacity
              onPress={() => setZoomScale((s) => Math.max(0.6, Number((s - 0.2).toFixed(1))))}
              style={styles.zoomBtn}
            >
              <Ionicons name="remove" size={13} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setZoomScale(1.0)}>
              <Text style={styles.zoomText}>{Math.round(zoomScale * 100)}%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setZoomScale((s) => Math.min(3.0, Number((s + 0.2).toFixed(1))))}
              style={styles.zoomBtn}
            >
              <Ionicons name="add" size={13} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleUndo} style={styles.navActionBtn}>
            <Ionicons name="arrow-undo-outline" size={18} color="#4B5563" />
          </TouchableOpacity>

          {/* 完成保存按钮 */}
          <TouchableOpacity
            style={styles.finishBtn}
            onPress={() => {
              onSave({
                title,
                notes: stickyNotes,
                strokes,
              });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.finishBtnText}>完成</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 无限点状网格画布主体 */}
      <View style={styles.canvasArea} {...canvasPanResponder.panHandlers}>
        <View style={[styles.canvasScaleContainer, { transform: [{ scale: zoomScale }] }]}>
          {/* 背景点状网格（点阵质感，完全还原图1画纸效果） */}
          <View style={styles.dotGridOverlay} pointerEvents="none">
            {Array.from({ length: 12 }).map((_, rIdx) => (
              <View key={rIdx} style={styles.dotRow}>
                {Array.from({ length: 10 }).map((_, cIdx) => (
                  <View key={cIdx} style={styles.gridDot} />
                ))}
              </View>
            ))}
          </View>

          {/* 真实矢量平滑手绘笔迹 (彻底消除断点与虚线，形成连续饱满实线墨迹并具备压感) */}
          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            {strokes.map((stroke, sIdx) => (
              <Path
                key={`stroke-${sIdx}`}
                d={strokeToOutlinePath(stroke.points, stroke.width)}
                fill={stroke.color}
              />
            ))}
            {currentStroke.length > 0 && (
              <Path
                d={strokeToOutlinePath(
                  currentStroke,
                  selectedTool === 'highlighter' ? 14 : 3.5
                )}
                fill={
                  selectedTool === 'highlighter'
                    ? activeColor + '70'
                    : activeColor
                }
              />
            )}
          </Svg>

          {/* 便签贴纸（黄色、粉色、青色便利贴，如首图真实呈现） */}
          {stickyNotes.map((note) => (
            <View
              key={note.id}
              style={[
                styles.stickyCard,
                {
                  backgroundColor: note.color,
                  left: note.x,
                  top: note.y,
                },
                Shadows.card,
              ]}
            >
              <View style={styles.stickyHeader}>
                <View style={styles.stickyPin} />
                <TouchableOpacity
                  onPress={() => handleDeleteSticky(note.id)}
                  style={styles.stickyDeleteBtn}
                >
                  <Ionicons name="close" size={14} color="#78350F" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.stickyInput}
                value={note.text}
                onChangeText={(txt) => handleUpdateStickyText(note.id, txt)}
                multiline={true}
                placeholder="在此记录想法..."
                placeholderTextColor="#92400E"
              />
            </View>
          ))}
        </View>
      </View>

      {/* ================= 手机端放大缩小控制（放在右下角工具栏上方） ================= */}
      <View style={styles.floatingZoomDock}>
        <TouchableOpacity
          style={styles.zoomIconBtn}
          onPress={() => setZoomScale((z) => Math.min(2.5, +(z + 0.15).toFixed(2)))}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={17} color="#334155" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomResetPill}
          onPress={() => setZoomScale(1.0)}
          activeOpacity={0.7}
        >
          <Text style={styles.zoomResetText}>{Math.round(zoomScale * 100)}%</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomIconBtn}
          onPress={() => setZoomScale((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={17} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* ================= 仿苹果 Apple Pencil 悬浮画笔坞 (Floating Tool Palette) ================= */}
      <View style={[styles.floatingApplePencilDock, Shadows.card]}>
        {/* 工具切换：钢笔 / 荧光笔 / 橡皮 */}
        <View style={styles.toolsRow}>
          <TouchableOpacity
            style={[styles.toolIconBtn, selectedTool === 'pen' && styles.toolIconBtnActive]}
            onPress={() => setSelectedTool('pen')}
          >
            <Ionicons
              name="pencil"
              size={18}
              color={selectedTool === 'pen' ? '#FFFFFF' : '#4B5563'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolIconBtn, selectedTool === 'highlighter' && styles.toolIconBtnActive]}
            onPress={() => setSelectedTool('highlighter')}
          >
            <Ionicons
              name="color-wand"
              size={18}
              color={selectedTool === 'highlighter' ? '#FFFFFF' : '#4B5563'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolIconBtn, selectedTool === 'eraser' && styles.toolIconBtnActive]}
            onPress={() => setSelectedTool('eraser')}
          >
            <Ionicons
              name="cut"
              size={18}
              color={selectedTool === 'eraser' ? '#FFFFFF' : '#4B5563'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.dockDivider} />

        {/* 用户要求：便签按钮放进工具栏里（去掉文字） */}
        <TouchableOpacity
          style={styles.dockStickyBtn}
          onPress={() => handleAddStickyNote('#FEF08A')}
          activeOpacity={0.7}
        >
          <Ionicons name="copy-outline" size={18} color="#D97706" />
        </TouchableOpacity>

        <View style={styles.dockDivider} />

        {/* 调色盘色标 */}
        <View style={styles.paletteRow}>
          {colorPalette.map((col) => (
            <TouchableOpacity
              key={col}
              style={[
                styles.colorDot,
                { backgroundColor: col },
                activeColor === col && styles.colorDotActive,
              ]}
              onPress={() => {
                setActiveColor(col);
                if (selectedTool === 'eraser') setSelectedTool('pen');
              }}
            />
          ))}
        </View>

        <View style={styles.dockDivider} />

        {/* 清屏按钮 */}
        <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={17} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: 4,
    marginRight: 6,
  },
  titleGroup: {
    flex: 1,
  },
  canvasTitleInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
  },
  canvasCourseTag: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navActionBtn: {
    padding: 6,
    borderRadius: Rounded.pill,
    backgroundColor: '#F1F5F9',
  },
  addStickyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Rounded.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  addStickyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  finishBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
  },
  finishBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 画布区域
  canvasArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    position: 'relative',
    overflow: 'hidden',
  },
  dotGridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    justifyContent: 'space-between',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
  },

  // 便签贴纸
  stickyCard: {
    position: 'absolute',
    width: 140,
    minHeight: 110,
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  stickyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stickyPin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  stickyDeleteBtn: {
    padding: 2,
  },
  stickyInput: {
    fontSize: 13,
    lineHeight: 18,
    color: '#1F2937',
    padding: 0,
    textAlignVertical: 'top',
    fontWeight: '500',
  },

  // 手机端放大缩小控制（位于右下角工具栏上方）
  floatingZoomDock: {
    position: 'absolute',
    right: 18,
    bottom: 84,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: Rounded.pill,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 100,
    gap: 4,
  },
  zoomIconBtn: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomResetPill: {
    paddingHorizontal: 4,
  },
  zoomResetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },

  // 仿苹果 Apple Pencil 悬浮画笔坞（用户要求：左右边缘不能超出或者贴在屏幕边缘，便签放进工具栏）
  floatingApplePencilDock: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '92%',
    marginHorizontal: '4%',
    zIndex: 99,
  },
  dockStickyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: Rounded.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  dockStickyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  toolIconBtnActive: {
    backgroundColor: Colors.primary,
  },
  dockDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  colorDotActive: {
    borderWidth: 2,
    borderColor: '#000000',
    transform: [{ scale: 1.15 }],
  },
  clearBtn: {
    padding: 6,
  },
  zoomControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: Rounded.pill,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
  },
  zoomBtn: {
    padding: 2,
  },
  zoomText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  canvasScaleContainer: {
    width: '100%',
    height: '100%',
  },
});
