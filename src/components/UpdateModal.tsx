import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../constants/theme';
import { APP_VERSION } from '../constants/version';
import { GitHubReleaseInfo } from '../services/updateService';

interface UpdateModalProps {
  visible: boolean;
  onClose: () => void;
  release: GitHubReleaseInfo | null;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  onClose,
  release,
}) => {
  if (!release) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.centerModalBackdrop}>
        <View style={[styles.updateModalCard, Shadows.card]}>
          <View style={styles.updateHeaderBadge}>
            <View style={styles.updateIconCircle}>
              <Ionicons name="rocket" size={32} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.updateTitle}>发现新版本！</Text>

          <View style={styles.updateVersionTagRow}>
            <View style={styles.updateOldVersionPill}>
              <Text style={styles.updateOldVersionText}>当前 v{APP_VERSION}</Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color="#94A3B8" />
            <View style={styles.updateNewVersionPill}>
              <Text style={styles.updateNewVersionText}>{release.tagName || '最新版'}</Text>
            </View>
          </View>

          {release.publishedAt ? (
            <Text style={styles.updatePublishDate}>发布日期：{release.publishedAt}</Text>
          ) : null}

          <View style={styles.updateLogBox}>
            <Text style={styles.updateLogTitle}>更新日志：</Text>
            <ScrollView style={styles.updateLogScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.updateLogText}>
                {release.body || release.name || '本次更新包含性能提升与体验优化，建议立即升级体验！'}
              </Text>
            </ScrollView>
          </View>

          <View style={styles.updateBtnColumn}>
            <TouchableOpacity
              style={styles.updatePrimaryBtn}
              activeOpacity={0.85}
              onPress={() => {
                if (release.downloadUrl) {
                  Linking.openURL(release.downloadUrl);
                }
                onClose();
              }}
            >
              <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.updatePrimaryBtnText}>立即下载更新 (APK)</Text>
            </TouchableOpacity>

            <View style={styles.updateSecondaryRow}>
              <TouchableOpacity
                style={styles.updateGhostBtn}
                activeOpacity={0.7}
                onPress={() => {
                  if (release.htmlUrl) {
                    Linking.openURL(release.htmlUrl);
                  }
                }}
              >
                <Ionicons name="logo-github" size={16} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={styles.updateGhostBtnText}>GitHub Release</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.updateGhostBtn}
                activeOpacity={0.7}
                onPress={onClose}
              >
                <Text style={styles.updateCloseBtnText}>稍后再说</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  updateModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 24,
  },
  updateHeaderBadge: {
    marginBottom: 12,
  },
  updateIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  updateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  updateVersionTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  updateOldVersionPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  updateOldVersionText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  updateNewVersionPill: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  updateNewVersionText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '800',
  },
  updatePublishDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 12,
  },
  updateLogBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    width: '100%',
    maxHeight: 160,
    marginBottom: 18,
  },
  updateLogTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  updateLogScroll: {
    maxHeight: 120,
  },
  updateLogText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },
  updateBtnColumn: {
    width: '100%',
    gap: 8,
  },
  updatePrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  updatePrimaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  updateSecondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 6,
  },
  updateGhostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  updateGhostBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  updateCloseBtnText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
