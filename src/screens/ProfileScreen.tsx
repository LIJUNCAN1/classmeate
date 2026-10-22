import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  Modal,
} from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScheduleSettingsDrawer } from '../components/ScheduleSettingsDrawer';
import { ImportModal } from '../components/ImportModal';
import { loadScheduleData, saveScheduleData } from '../services/scheduleStorage';
import { Course } from '../types/schedule';
import { repairCourse } from '../services/jwParser';

interface ProfileScreenProps {
  onNavigateToTab?: (tabId: 'schedule' | 'notes' | 'tools' | 'profile') => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigateToTab }) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (RNStatusBar.currentHeight || 36) : 44);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [courseCount, setCourseCount] = useState(12);

  useEffect(() => {
    loadScheduleData().then((data) => {
      if (data && data.courses) {
        setCourseCount(data.courses.length);
      }
    });
  }, []);

  const handleImportSuccess = (courses: Course[], semesterName?: string) => {
    const repaired = courses.map(repairCourse);
    saveScheduleData(repaired, semesterName || '2026-2027 第1学期');
    setCourseCount(repaired.length);
    setToastMessage(`🎉 已成功导入 ${repaired.length} 门课程！`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <View style={styles.container}>
      {/* 顶部英雄背景区域 */}
      <View style={[styles.heroHeader, { paddingTop: topPadding + 10 }]}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>个人中心</Text>
        </View>

        {/* 用户信息卡片 */}
        <View style={[styles.profileCard, Shadows.card]}>
          <Image
            source={require('../../assets/splash-monster.png')}
            style={styles.avatarMonster}
            resizeMode="contain"
          />
          <View style={styles.profileInfoCol}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>课星球同学</Text>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>第 7 周</Text>
              </View>
            </View>
            <Text style={styles.userSubText}>2026-2027 第1学期 · 已排课 {courseCount} 门</Text>
          </View>
        </View>
      </View>

      {/* 提示 Toast */}
      {toastMessage && (
        <View style={styles.toastFloatBar}>
          <Ionicons name="information-circle" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 快捷管理 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>课表与显示偏好</Text>
        </View>

        <View style={[styles.cardGroup, Shadows.card]}>
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.7}
            onPress={() => setSettingsVisible(true)}
          >
            <View style={[styles.itemIconWrap, { backgroundColor: '#EDFAEF' }]}>
              <Ionicons name="options-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.itemContentCol}>
              <Text style={styles.itemTitle}>周课表显示设置</Text>
              <Text style={styles.itemDesc}>非本周课显示方式 · 叠放与标签 · 半透明</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.7}
            onPress={() => setImportVisible(true)}
          >
            <View style={[styles.itemIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="sync-circle-outline" size={20} color="#2563EB" />
            </View>
            <View style={styles.itemContentCol}>
              <Text style={styles.itemTitle}>重新导入学期课表</Text>
              <Text style={styles.itemDesc}>智能识别高校教务网 HTML / 文本排课</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 快捷导航 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>快捷工具与数据</Text>
        </View>

        <View style={[styles.cardGroup, Shadows.card]}>
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.7}
            onPress={() => onNavigateToTab?.('tools')}
          >
            <View style={[styles.itemIconWrap, { backgroundColor: '#FDF4FF' }]}>
              <Ionicons name="cube-outline" size={20} color="#9333EA" />
            </View>
            <View style={styles.itemContentCol}>
              <Text style={styles.itemTitle}>桌面小组件配置</Text>
              <Text style={styles.itemDesc}>300° 圆形线条进度环 · 实时放学倒计时</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.7}
            onPress={() => onNavigateToTab?.('notes')}
          >
            <View style={[styles.itemIconWrap, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="document-text-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.itemContentCol}>
              <Text style={styles.itemTitle}>随堂速记与无边记画板</Text>
              <Text style={styles.itemDesc}>Apple Notes 速记 · 点阵画布与画笔</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 应用信息 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>关于应用</Text>
        </View>

        <View style={[styles.cardGroup, Shadows.card]}>
          <View style={styles.cardItem}>
            <View style={[styles.itemIconWrap, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="information-circle-outline" size={20} color="#64748B" />
            </View>
            <View style={styles.itemContentCol}>
              <Text style={styles.itemTitle}>课星球</Text>
              <Text style={styles.itemDesc}>AI 智能高校排课与随堂助手 · v1.0.8 (Release)</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>已脱机保护</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 设置抽屉 */}
      <ScheduleSettingsDrawer
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        currentMode="hide"
        onModeChange={() => {
          setToastMessage('已更新非本周课显示模式');
          setTimeout(() => setToastMessage(null), 2500);
        }}
        onReimport={() => {
          setSettingsVisible(false);
          setImportVisible(true);
        }}
      />

      {/* 导入弹窗 */}
      <ImportModal
        visible={importVisible}
        onClose={() => setImportVisible(false)}
        onImportSuccess={handleImportSuccess}
        semesterName="2026-2027 第1学期"
      />
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
    paddingBottom: 24,
  },
  headerTitleRow: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarMonster: {
    width: 52,
    height: 52,
    marginRight: 14,
  },
  profileInfoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgePill: {
    backgroundColor: '#EDFAEF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Rounded.pill,
    borderWidth: 1,
    borderColor: '#A6F4C5',
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  userSubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  toastFloatBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Rounded.pill,
    gap: 6,
  },
  toastText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748B',
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemContentCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemDesc: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F1F5F9',
    marginLeft: 68,
  },
  statusPill: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Rounded.pill,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
});
