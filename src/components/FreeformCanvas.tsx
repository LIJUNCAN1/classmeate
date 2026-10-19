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
}

export interface DrawingStroke {
  points: StrokePoint[];
  color: string;
  width: number;
}

interface FreeformCanvasProps {
  courseName: string;
  initialTitle?: string;
  onClose: () => void;
  onSave: (data: { title: string; notesCount: number; strokesCount: number }) => void;
}

export const FreeformCanvas: React.FC<FreeformCanvasProps> = ({
  courseName,
  initialTitle,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44
  );

  const [title, setTitle] = useState(initialTitle || `${courseName} · 脑力激荡`);

  // 便签纸列表 (类似图1中的黄色、粉色、青色彩色便利贴)
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([
    {
      id: 'sn-1',
      text: '随堂核心假设：\n偏导数连续 => 全微分必定存在',
      color: '#FEF08A', // 经典便利黄
      x: 36,
      y: 90,
    },
    {
      id: 'sn-2',
      text: '大作业分组分工：\n• 需求建模\n• 架构草图\n• 答辩汇报',
      color: '#FBCFE8', // 浪漫粉
      x: 220,
      y: 120,
    },
    {
      id: 'sn-3',
      text: '周五考试考点速记！',
      color: '#BAE6FD', // 天空青
      x: 80,
      y: 290,
    },
  ]);

  // 手绘笔迹
  const [strokes, setStrokes] = useState<DrawingStroke[]>([
    // 初始示例笔迹
    {
      points: [
        { x: 30, y: 50 },
        { x: 120, y: 55 },
        { x: 200, y: 48 },
      ],
      color: '#1E293B',
      width: 4,
    },
  ]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[]>([]);

  // 画笔工具栏状态 (仿苹果 Apple Pencil 悬浮工具坞)
  const [selectedTool, setSelectedTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [activeColor, setActiveColor] = useState<string>('#1E293B');

  const colorPalette = [
    '#1E293B', // 黑
    '#EF4444', // 红
    '#3B82F6', // 蓝
    '#10B981', // 绿
    '#F59E0B', // 黄
    '#8B5CF6', // 紫
  ];

  // 添加新便签
  const handleAddStickyNote = (color: string = '#FEF08A') => {
    const newNote: StickyNote = {
      id: `sn-${Date.now()}`,
      text: '点击输入便签要点...',
      color,
      x: Math.floor(Math.random() * 120) + 40,
      y: Math.floor(Math.random() * 200) + 160,
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
    if (strokes.length > 0) {
      setStrokes((prev) => prev.slice(0, -1));
    }
  };

  // 清空画板
  const handleClearAll = () => {
    setStrokes([]);
  };

  // 画板手势 (PanResponder)
  const canvasPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (selectedTool === 'eraser') {
          // 擦除附近笔迹
          setStrokes((prev) =>
            prev.filter(
              (s) =>
                !s.points.some(
                  (pt) => Math.hypot(pt.x - locationX, pt.y - locationY) < 20
                )
            )
          );
        } else {
          setCurrentStroke([{ x: locationX, y: locationY }]);
        }
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (selectedTool === 'eraser') {
          setStrokes((prev) =>
            prev.filter(
              (s) =>
                !s.points.some(
                  (pt) => Math.hypot(pt.x - locationX, pt.y - locationY) < 20
                )
            )
          );
        } else {
          setCurrentStroke((prev) => [...prev, { x: locationX, y: locationY }]);
        }
      },
      onPanResponderRelease: () => {
        if (selectedTool !== 'eraser' && currentStroke.length > 0) {
          const width = selectedTool === 'highlighter' ? 14 : 3.5;
          const strokeColor =
            selectedTool === 'highlighter' ? activeColor + '70' : activeColor;
          setStrokes((prev) => [
            ...prev,
            { points: currentStroke, color: strokeColor, width },
          ]);
          setCurrentStroke([]);
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* 顶部操作条（完全复刻图1的 Apple Freeform 导航栏） */}
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
              placeholder="无边记项目名称"
            />
            <Text style={styles.canvasCourseTag}>📚 {courseName} · 无边记无限画布</Text>
          </View>
        </View>

        <View style={styles.navRight}>
          <TouchableOpacity onPress={handleUndo} style={styles.navActionBtn}>
            <Ionicons name="arrow-undo-outline" size={20} color="#4B5563" />
          </TouchableOpacity>

          {/* 添加便利贴快捷按钮 */}
          <TouchableOpacity
            onPress={() => handleAddStickyNote('#FEF08A')}
            style={styles.addStickyBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="copy-outline" size={16} color="#B45309" style={{ marginRight: 3 }} />
            <Text style={styles.addStickyBtnText}>+便签</Text>
          </TouchableOpacity>

          {/* 完成保存按钮 */}
          <TouchableOpacity
            style={styles.finishBtn}
            onPress={() => {
              onSave({
                title,
                notesCount: stickyNotes.length,
                strokesCount: strokes.length,
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

        {/* 绘制已保存的手绘线段 */}
        {strokes.map((stroke, sIdx) => (
          <React.Fragment key={sIdx}>
            {stroke.points.map((pt, pIdx) => (
              <View
                key={pIdx}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: pt.x - stroke.width / 2,
                  top: pt.y - stroke.width / 2,
                  width: stroke.width,
                  height: stroke.width,
                  borderRadius: stroke.width / 2,
                  backgroundColor: stroke.color,
                }}
              />
            ))}
          </React.Fragment>
        ))}

        {/* 绘制当前正在画的一笔 */}
        {currentStroke.map((pt, idx) => (
          <View
            key={`curr-${idx}`}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: pt.x - 2,
              top: pt.y - 2,
              width: selectedTool === 'highlighter' ? 12 : 4,
              height: selectedTool === 'highlighter' ? 12 : 4,
              borderRadius: 3,
              backgroundColor: activeColor,
            }}
          />
        ))}

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

  // 仿苹果 Apple Pencil 悬浮画笔坞
  floatingApplePencilDock: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 99,
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
});
