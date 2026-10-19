import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const NotesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');

  const courseFolders = [
    { id: 'all', name: '全部笔记', count: 8 },
    { id: 'math', name: '高等数学', count: 2 },
    { id: 'korean', name: '商务韩语', count: 3 },
    { id: 'topik', name: 'TOPIK专攻', count: 1 },
    { id: 'algo', name: '算法结构', count: 2 },
  ];

  const noteItems = [
    {
      id: 'n1',
      courseName: '成人商务韩语',
      title: '第14周 · 破冰洽谈与敬语句型',
      date: '今天 09:45',
      preview: '商务谈判中的开场礼仪；对客委婉语、谦逊语在合同初审时的严谨表述...',
      tags: ['随堂速记', '音频已转录'],
      hasAudio: true,
      hasImages: true,
    },
    {
      id: 'n2',
      courseName: '高等数学 (AI与数据)',
      title: '第14周 · 多元函数微分学与梯度下降',
      date: '昨天 10:20',
      preview: '二阶偏导数对称性几何意义；拉格朗日乘数法在约束极值求解中的工程应用...',
      tags: ['板书拍照', '重点公式'],
      hasAudio: false,
      hasImages: true,
    },
    {
      id: 'n3',
      courseName: 'TOPIK专攻精讲',
      title: '第13周 · 阅读真题主旨归纳速判法',
      date: '6月18日',
      preview: '长难句倒装解构；段落首尾呼应词快筛技巧；历年错题第34-37题解析...',
      tags: ['复习卡片'],
      hasAudio: false,
      hasImages: false,
    },
  ];

  return (
    <View style={styles.container}>
      {/* 顶部清新渐变栏 */}
      <View style={[styles.heroHeader, { paddingTop: topPadding + 10 }]}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>随堂知识库</Text>
            <Text style={styles.headerSub}>所有笔记均按课程表周次与课时自动结构化归档</Text>
          </View>

          <TouchableOpacity style={styles.newNoteBtn} activeOpacity={0.8}>
            <Ionicons name="add" size={20} color={Colors.primary} />
            <Text style={styles.newNoteText}>记笔记</Text>
          </TouchableOpacity>
        </View>

        {/* 快速记录三金刚（拍照板书 / 录音转文字 / 极速速记） */}
        <View style={styles.quickRecordRow}>
          <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>拍板书/PPT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
            <Ionicons name="mic-outline" size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>随堂录音转写</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
            <Ionicons name="flash-outline" size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>灵感秒记</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 课程分类滑动条 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.folderScroll}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {courseFolders.map((f) => {
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

        {/* 笔记卡片流 */}
        <View style={styles.noteList}>
          {noteItems.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={[styles.noteCard, Shadows.card]}
              activeOpacity={0.75}
            >
              <View style={styles.noteCardHeader}>
                <View style={styles.courseTag}>
                  <Ionicons name="bookmark" size={11} color={Colors.primary} />
                  <Text style={styles.courseTagText}>{note.courseName}</Text>
                </View>
                <Text style={styles.noteDateText}>{note.date}</Text>
              </View>

              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.notePreview} numberOfLines={2}>
                {note.preview}
              </Text>

              <View style={styles.noteFooter}>
                <View style={styles.tagGroup}>
                  {note.tags.map((t, i) => (
                    <View key={i} style={styles.miniTag}>
                      <Text style={styles.miniTagText}>{t}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.mediaIcons}>
                  {note.hasAudio && (
                    <Ionicons name="mic" size={14} color={Colors.accentBlue} style={{ marginRight: 6 }} />
                  )}
                  {note.hasImages && (
                    <Ionicons name="image" size={14} color={Colors.accentGold} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    marginBottom: 16,
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
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  scrollContent: {
    flex: 1,
    paddingTop: 16,
  },
  folderScroll: {
    marginBottom: 14,
  },
  folderPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
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
  tagGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  miniTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniTagText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  mediaIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
