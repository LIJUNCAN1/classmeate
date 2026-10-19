import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ToolsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44
  );

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  // 还原图1的 4 个核心常用工具
  const primaryTools = [
    {
      id: 'classroom',
      title: '口令教室',
      desc: '输入课堂口令秒进会议与互动',
      icon: 'key-outline',
      color: Colors.accentPurple,
      bgColor: Colors.accentPurpleLight,
    },
    {
      id: 'mistakes',
      title: '错题本',
      desc: '随堂错题拍照与AI解析归纳',
      icon: 'book-outline',
      color: Colors.accentBlue,
      bgColor: Colors.accentBlueLight,
    },
    {
      id: 'assessment',
      title: '学力测评',
      desc: '学期阶段性知识掌握度检测',
      icon: 'school-outline',
      color: Colors.accentAmber,
      bgColor: Colors.accentAmberLight,
    },
    {
      id: 'import',
      title: '教务自动识别',
      desc: '后台免密嗅探高校教务课表',
      icon: 'sync-circle-outline',
      color: Colors.primary,
      bgColor: Colors.primaryLight,
      badge: '已启用',
    },
  ];

  // 扩展校园生活与学习工具
  const campusTools = [
    { id: 'gpa', title: '绩点GPA换算', icon: 'calculator-outline' },
    { id: 'rooms', title: '空闲自习室查询', icon: 'business-outline' },
    { id: 'schedule_setting', title: '全校作息时间表', icon: 'alarm-outline' },
    { id: 'ics_export', title: '导出日历到手机系统', icon: 'share-social-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* 顶部标题区 */}
      <View style={[styles.heroHeader, { paddingTop: topPadding + 10 }]}>
        <Text style={styles.headerTitle}>工具箱与服务</Text>
        <Text style={styles.headerSub}>学习辅助、教务同步与校园生活工具集成</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 自动识别教务课表状态卡片 */}
        <View style={[styles.autoSyncCard, Shadows.card]}>
          <View style={styles.autoSyncHeader}>
            <View style={styles.autoSyncTitleGroup}>
              <View style={styles.autoSyncIconCircle}>
                <Ionicons name="flash" size={16} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.autoSyncTitle}>教务课表智能自动识别</Text>
                <Text style={styles.autoSyncStatusText}>
                  {autoSyncEnabled ? '● 自动监测中 · 无需每次手动点击' : '○ 已暂停自动同步'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.toggleSwitch,
                autoSyncEnabled ? styles.toggleSwitchOn : styles.toggleSwitchOff,
              ]}
              onPress={() => setAutoSyncEnabled(!autoSyncEnabled)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.switchThumb,
                  autoSyncEnabled ? styles.switchThumbOn : styles.switchThumbOff,
                ]}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.autoSyncTip}>
            当检测到登录校园网、教务系统或打开课表网页时，Classmeate 会在后台自动完成 DOM 嗅探与节次匹配，无需手动点按。
          </Text>
        </View>

        {/* 常用工具网格 (来自图1的完整还原并美化) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>核心常用工具</Text>
        </View>

        <View style={styles.toolGrid}>
          {primaryTools.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.toolCard, Shadows.card]}
              activeOpacity={0.7}
            >
              <View style={[styles.toolIconWrapper, { backgroundColor: t.bgColor }]}>
                <Ionicons name={t.icon as any} size={24} color={t.color} />
                {t.badge && (
                  <View style={styles.toolBadge}>
                    <Text style={styles.toolBadgeText}>{t.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.toolTitle}>{t.title}</Text>
              <Text style={styles.toolDesc} numberOfLines={2}>
                {t.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 更多校园实用工具 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>校园学习工具</Text>
        </View>

        <View style={[styles.listCard, Shadows.card]}>
          {campusTools.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.listItem,
                idx < campusTools.length - 1 && styles.listItemBorder,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.listItemLeft}>
                <Ionicons name={item.icon as any} size={20} color={Colors.textSecondary} />
                <Text style={styles.listItemTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 4,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  autoSyncCard: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  autoSyncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  autoSyncTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  autoSyncIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoSyncTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  autoSyncStatusText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  toggleSwitch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchOn: {
    backgroundColor: Colors.primary,
  },
  toggleSwitchOff: {
    backgroundColor: '#E5E7EB',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
  switchThumbOff: {
    alignSelf: 'flex-start',
  },
  autoSyncTip: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  toolCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  toolIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  toolBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Rounded.pill,
  },
  toolBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  toolDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  listCard: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
});
