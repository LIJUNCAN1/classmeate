import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface QuickAccessGridProps {
  onOpenImport: () => void;
  onOpenNotes?: () => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({
  onOpenImport,
}) => {
  const tools = [
    {
      id: 'classroom',
      title: '口令教室',
      icon: 'key-outline',
      color: Colors.accentPurple,
      bgColor: Colors.accentPurpleLight,
    },
    {
      id: 'mistakes',
      title: '错题本',
      icon: 'book-outline',
      color: Colors.accentBlue,
      bgColor: Colors.accentBlueLight,
    },
    {
      id: 'assessment',
      title: '学力测评',
      icon: 'school-outline',
      color: Colors.accentAmber,
      bgColor: Colors.accentAmberLight,
    },
    {
      id: 'import',
      title: '教务导入',
      icon: 'cloud-download-outline',
      color: Colors.primary,
      bgColor: Colors.primaryLight,
      action: onOpenImport,
      badge: '一键',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>常用工具</Text>
        <TouchableOpacity style={styles.moreBtn}>
          <Text style={styles.moreText}>查看更多</Text>
          <Ionicons name="chevron-forward" size={12} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={[styles.gridSurface, Shadows.card]}>
        {tools.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.gridItem}
            onPress={item.action}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
              {item.badge && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  moreText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  gridSurface: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    paddingVertical: 14,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  gridItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  badgePill: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accentPink,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: Rounded.pill,
  },
  badgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
