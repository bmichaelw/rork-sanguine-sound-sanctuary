import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Upload, Music, Shield } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

export default function UploadScreen() {
  const { user, isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDenied}>
          <Shield color={Colors.dark.error} size={64} strokeWidth={1.5} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You don't have permission to access this page.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Upload color={Colors.dark.primary} size={32} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>Admin Upload</Text>
        <Text style={styles.subtitle}>
          Upload new tracks and manage content
        </Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userInfoLabel}>Logged in as</Text>
        <Text style={styles.userInfoEmail}>{user?.email}</Text>
        <View style={styles.adminBadge}>
          <Shield color={Colors.dark.success} size={14} />
          <Text style={styles.adminBadgeText}>Admin</Text>
        </View>
      </View>

      <View style={styles.uploadSection}>
        <TouchableOpacity style={styles.uploadButton} activeOpacity={0.8}>
          <Music color={Colors.dark.text} size={24} strokeWidth={1.5} />
          <Text style={styles.uploadButtonText}>Upload Track</Text>
          <Text style={styles.uploadButtonSubtext}>
            Add a new meditation track
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Upload Guidelines</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoBullet}>•</Text>
          <Text style={styles.infoText}>
            Audio files should be in MP3 or M4A format
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoBullet}>•</Text>
          <Text style={styles.infoText}>
            Include cover art (1:1 aspect ratio, minimum 500x500px)
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoBullet}>•</Text>
          <Text style={styles.infoText}>
            Add appropriate tags for modalities, intentions, and soundscapes
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.dark.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  userInfoLabel: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginBottom: 4,
  },
  userInfoEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(126, 200, 139, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  adminBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.success,
  },
  uploadSection: {
    marginBottom: 32,
  },
  uploadButton: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 12,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoBullet: {
    fontSize: 14,
    color: Colors.dark.primary,
    marginRight: 10,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark.text,
    marginTop: 20,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
});
