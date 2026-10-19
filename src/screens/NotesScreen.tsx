import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCheckmark } from '../components/AnimatedCheckmark';

export interface NoteItem {
  id: string;
  courseName: string;
  title: string;
  date: string;
  content: string;
  tags: string[];
  hasAudio?: boolean;
  hasImages?: boolean;
}

interface NotesScreenProps {
  initialCourseName?: string;
  onClearInitialCourse?: () => void;
}

export const NotesScreen: React.FC<NotesScreenProps> = ({
  initialCourseName,
  onClearInitialCourse,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44
  );

  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'n1',
      courseName: '成人商务韩语',
      title: '第14周 · 破冰洽谈与敬语句型',
      date: '今天 09:45',
      content: '商务谈判中的开场礼仪；对客委婉语、谦逊语在合同初审时的严谨表述。需要重点注意双方落座顺序与初次交换名片的固定问候套语。',
      tags: ['随堂速记', '音频已转录'],
      hasAudio: true,
      hasImages: true,
    },
    {
      id: 'n2',
      courseName: '高等数学 (AI与数据)',
      title: '第14周 · 多元函数微分学与梯度下降',
      date: '昨天 10:20',
      content: '二阶偏导数对称性几何意义；拉格朗日乘数法在约束极值求解中的工程应用。课堂例题第3道：如何通过海森矩阵判断多元函数鞍点。',
      tags: ['板书拍照', '重点公式'],
      hasAudio: false,
      hasImages: true,
    },
    {
      id: 'n3',
      courseName: 'TOPIK专攻精讲',
      title: '第13周 · 阅读真题主旨归纳速判法',
      date: '6月18日',
      content: '长难句倒装解构；段落首尾呼应词快筛技巧；历年错题第34-37题解析及高频副词总结。',
      tags: ['复习卡片'],
      hasAudio: false,
      hasImages: false,
    },
    {
      id: 'n4',
      courseName: '计算机系统结构',
      title: '第12周 · 指令级并行与流水线冲突',
      date: '6月12日',
      content: '经典五级流水线（IF, ID, EX, MEM, WB）；结构冲突、数据冲突与控制冲突的旁路转发解决机制。',
      tags: ['核心架构', '期末必考'],
      hasAudio: false,
      hasImages: true,
    },
  ]);

  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 编辑/新建笔记模态框状态
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [inputCourseName, setInputCourseName] = useState('高等数学 (AI与数据)');
  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');

  // 如果从外部路由携带 initialCourseName，自动弹出针对该课程的新建笔记窗
  useEffect(() => {
    if (initialCourseName) {
      setInputCourseName(initialCourseName);
      setInputTitle(`第 14 周 · ${initialCourseName} 随堂速记`);
      setInputContent('');
      setEditingNoteId(null);
      setEditorVisible(true);
      if (onClearInitialCourse) {
        onClearInitialCourse();
      }
    }
  }, [initialCourseName]);

  const availableCourses = [
    '高等数学 (AI与数据)',
    '成人商务韩语',
    'TOPIK专攻精讲',
    '计算机系统结构',
    '大学英语写作',
    '数据结构与算法',
    '交互设计与UI艺术',
  ];

  // 课程分类统计
  const courseFolderList = [
    { id: 'all', name: '全部笔记', count: notes.length },
    ...availableCourses.map((cName) => ({
      id: cName,
      name: cName,
      count: notes.filter((n) => n.courseName.includes(cName.slice(0, 4))).length,
    })).filter((item) => item.count > 0 || item.id === selectedFolder),
  ];

  // 筛选后的笔记列表
  const filteredNotes = notes.filter((item) => {
    const matchFolder = selectedFolder === 'all' || item.courseName.includes(selectedFolder.slice(0, 4));
    const matchSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  const handleOpenCreateNew = () => {
    setEditingNoteId(null);
    setInputCourseName(availableCourses[0]);
    setInputTitle('随堂重点知识速记');
    setInputContent('');
    setEditorVisible(true);
  };

  const handleOpenEdit = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setInputCourseName(note.courseName);
    setInputTitle(note.title);
    setInputContent(note.content);
    setEditorVisible(true);
  };

  const handleSaveNote = () => {
    if (!inputTitle.trim()) {
      return;
    }

    if (editingNoteId) {
      // 更新现有笔记
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNoteId
            ? { ...n, courseName: inputCourseName, title: inputTitle, content: inputContent }
            : n
        )
      );
    } else {
      // 新建笔记
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        courseName: inputCourseName,
        title: inputTitle,
        date: '刚刚',
        content: inputContent || '（随堂即时要点速记）',
        tags: ['随堂速记'],
        hasAudio: false,
        hasImages: false,
      };
      setNotes((prev) => [newNote, ...prev]);
    }

    setEditorVisible(false);
  };

  const handleDeleteNote = () => {
    if (editingNoteId) {
      setNotes((prev) => prev.filter((n) => n.id !== editingNoteId));
      setEditorVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 顶部草木绿流体区域 */}
      <View style={[styles.heroHeader, { paddingTop: topPadding + 8 }]}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>随堂知识库</Text>
            <Text style={styles.headerSub}>所有笔记均自动绑定当前课时与周次</Text>
          </View>

          <TouchableOpacity
            style={styles.newNoteBtn}
            onPress={handleOpenCreateNew}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color={Colors.primary} />
            <Text style={styles.newNoteText}>记笔记</Text>
          </TouchableOpacity>
        </View>

        {/* 快捷多模态记录入口（拍照板书 / 录音转写 / 灵感速写） */}
        <View style={styles.quickRecordRow}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => {
              setInputTitle('📷 课堂板书拍照速记');
              setInputContent('【板书图片已录入】\n• 核心推导过程已自动转写为 LaTeX 格式');
              setEditorVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={18} color="#FFFFFF" />
            <Text style={styles.quickActionText}>拍板书/PPT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => {
              setInputTitle('🎙️ 课堂录音语音转文字');
              setInputContent('【语音实时转录文本】：\n老师讲授重点在于课后大作业第二题，要求运用动态规划方法建模...');
              setEditorVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={18} color="#FFFFFF" />
            <Text style={styles.quickActionText}>随堂录音转写</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleOpenCreateNew}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={18} color="#FFFFFF" />
            <Text style={styles.quickActionText}>灵感秒记</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 搜索栏 */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索课程笔记、公式或关键词..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 课程分类水平滑动条 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.folderScroll}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {courseFolderList.map((f) => {
            const isSelected = f.id === selectedFolder;
            return (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.folderPill,
                  isSelected && styles.folderPillSelected,
                ]}
                onPress={() => setSelectedFolder(f.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.folderPillText,
                    isSelected && styles.folderPillTextSelected,
                  ]}
                >
                  {f.name} ({f.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 笔记卡片列表 */}
        <View style={styles.noteList}>
          {filteredNotes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color={Colors.borderSubtle} />
              <Text style={styles.emptyText}>当前分类暂无笔记，点击上方按钮立即记录</Text>
            </View>
          ) : (
            filteredNotes.map((note) => (
              <TouchableOpacity
                key={note.id}
                style={[styles.noteCard, Shadows.card]}
                onPress={() => handleOpenEdit(note)}
                activeOpacity={0.8}
              >
                <View style={styles.noteCardHeader}>
                  <View style={styles.courseTag}>
                    <Ionicons name="bookmark" size={11} color={Colors.primary} />
                    <Text style={styles.courseTagText}>{note.courseName}</Text>
                  </View>
                  <Text style={styles.noteDateText}>{note.date}</Text>
                </View>

                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.notePreview} numberOfLines={3}>
                  {note.content}
                </Text>

                <View style={styles.noteFooter}>
                  <View style={styles.statusIndicatorRow}>
                    <AnimatedCheckmark checked={true} size={15} />
                    <Text style={styles.statusVerifiedText}>已关联对应课表</Text>
                  </View>

                  <View style={styles.tagGroup}>
                    {note.hasAudio && (
                      <Ionicons name="mic" size={14} color={Colors.accentBlue} style={{ marginRight: 4 }} />
                    )}
                    {note.hasImages && (
                      <Ionicons name="image" size={14} color={Colors.accentGold} style={{ marginRight: 4 }} />
                    )}
                    <Ionicons name="create-outline" size={14} color={Colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* 实时笔记编辑器弹窗 */}
      <Modal
        visible={editorVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditorVisible(false)}
      >
        <View style={styles.editorModalRoot}>
          {/* 顶栏控制 */}
          <View style={styles.editorHeader}>
            <TouchableOpacity
              onPress={() => setEditorVisible(false)}
              style={styles.editorCancelBtn}
            >
              <Text style={styles.editorCancelText}>取消</Text>
            </TouchableOpacity>

            <Text style={styles.editorHeaderTitle}>
              {editingNoteId ? '编辑随堂笔记' : '新建随堂笔记'}
            </Text>

            <TouchableOpacity
              onPress={handleSaveNote}
              style={styles.editorSaveBtn}
            >
              <Text style={styles.editorSaveText}>保存</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editorBody} showsVerticalScrollIndicator={false}>
            {/* 课程选择 */}
            <Text style={styles.inputSectionLabel}>关联课程：</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {availableCourses.map((c) => {
                const isSelected = c === inputCourseName;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.coursePickPill,
                      isSelected && styles.coursePickPillActive,
                    ]}
                    onPress={() => setInputCourseName(c)}
                  >
                    <Text
                      style={[
                        styles.coursePickText,
                        isSelected && styles.coursePickTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 笔记标题 */}
            <Text style={styles.inputSectionLabel}>笔记标题：</Text>
            <TextInput
              style={styles.titleInput}
              value={inputTitle}
              onChangeText={setInputTitle}
              placeholder="请输入笔记标题（如：第14周 重点推导）"
              placeholderTextColor={Colors.textMuted}
            />

            {/* 笔记正文 */}
            <Text style={styles.inputSectionLabel}>随堂正文内容：</Text>
            <TextInput
              style={styles.contentTextArea}
              value={inputContent}
              onChangeText={setInputContent}
              placeholder="记录老师上课划的重点、板书公式、课后思考题..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />

            {/* 删除笔记按钮（编辑模式下呈现） */}
            {editingNoteId && (
              <TouchableOpacity
                style={styles.deleteNoteBtn}
                onPress={handleDeleteNote}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={16} color="#FF4D4F" style={{ marginRight: 4 }} />
                <Text style={styles.deleteNoteText}>删除本篇笔记</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroHeader: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 2,
  },
  newNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Rounded.pill,
    gap: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newNoteText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  quickRecordRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: Rounded.md,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    padding: 0,
  },
  scrollContent: {
    flex: 1,
    paddingTop: 12,
  },
  folderScroll: {
    marginBottom: 12,
  },
  folderPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  folderPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  folderPillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  folderPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noteList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 10,
  },
  noteCard: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  noteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Rounded.pill,
    gap: 4,
  },
  courseTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  noteDateText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  notePreview: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: 10,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusVerifiedText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editorModalRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  editorCancelBtn: {
    padding: 4,
  },
  editorCancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  editorHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  editorSaveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
  },
  editorSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editorBody: {
    flex: 1,
    padding: 16,
  },
  inputSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  coursePickPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Rounded.pill,
    marginRight: 8,
  },
  coursePickPillActive: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  coursePickText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  coursePickTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  titleInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  contentTextArea: {
    backgroundColor: '#F9FAFB',
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 180,
    marginBottom: 20,
  },
  deleteNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Rounded.pill,
    backgroundColor: '#FFF1F0',
    marginBottom: 32,
  },
  deleteNoteText: {
    color: '#FF4D4F',
    fontSize: 13,
    fontWeight: '700',
  },
});
