import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Upload,
  Music,
  Users,
  BarChart3,
  ChevronRight,
  Shield,
  TrendingUp,
  Layers,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { fetchLibraryStats } from '@/services/supabase';
import { useAuth } from '@/providers/AuthProvider';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const statsQuery = useQuery({
    queryKey: ['library-stats'],
    queryFn: fetchLibraryStats,
    staleTime: 60000,
  });

  const totalTracks = statsQuery.data?.totalTracks ?? 0;
  const topModalities = statsQuery.data?.tracksPerModality?.slice(0, 5) ?? [];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(201, 168, 108, 0.08)', Colors.dark.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.35 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeRow}>
            <View style={styles.adminIcon}>
              <Shield color={Colors.dark.primary} size={20} />
            </View>
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeLabel}>ADMIN PANEL</Text>
              <Text style={styles.welcomeName}>
                {user?.email?.split('@')[0] ?? 'Admin'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.uploadCard}
          onPress={() => router.push('/(tabs)/(upload)/upload' as any)}
          activeOpacity={0.85}
          testID="admin-upload-button"
        >
          <LinearGradient
            colors={[Colors.dark.primary, Colors.dark.primaryMuted]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.uploadCardInner}>
            <View style={styles.uploadIconCircle}>
              <Upload color={Colors.dark.background} size={24} />
            </View>
            <View style={styles.uploadCardText}>
              <Text style={styles.uploadCardTitle}>Upload New Track</Text>
              <Text style={styles.uploadCardSub}>Add audio to the library</Text>
            </View>
            <ChevronRight color={Colors.dark.background} size={22} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>LIBRARY OVERVIEW</Text>

        {statsQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.dark.primary} size="large" />
            <Text style={styles.loadingText}>Loading stats...</Text>
          </View>
        ) : statsQuery.error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Failed to load library stats</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => statsQuery.refetch()}
              activeOpacity={0.7}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: 'rgba(201, 168, 108, 0.12)' }]}>
                  <Music color={Colors.dark.primary} size={20} />
                </View>
                <Text style={styles.statNumber}>{totalTracks}</Text>
                <Text style={styles.statDesc}>Total Tracks</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: 'rgba(139, 126, 200, 0.12)' }]}>
                  <Layers color={Colors.dark.accent} size={20} />
                </View>
                <Text style={styles.statNumber}>{topModalities.length}</Text>
                <Text style={styles.statDesc}>Modalities</Text>
              </View>
            </View>

            {topModalities.length > 0 && (
              <View style={styles.modalityCard}>
                <View style={styles.modalityHeader}>
                  <TrendingUp color={Colors.dark.primary} size={18} />
                  <Text style={styles.modalityTitle}>Tracks by Modality</Text>
                </View>
                {topModalities.map((mod, idx) => {
                  const maxCount = topModalities[0]?.count || 1;
                  const barWidth = Math.max((mod.count / maxCount) * 100, 8);
                  return (
                    <View key={mod.name} style={styles.modalityRow}>
                      <View style={styles.modalityRank}>
                        <Text style={styles.modalityRankText}>{idx + 1}</Text>
                      </View>
                      <View style={styles.modalityInfo}>
                        <View style={styles.modalityLabelRow}>
                          <Text style={styles.modalityName}>{mod.name}</Text>
                          <Text style={styles.modalityCount}>{mod.count}</Text>
                        </View>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                width: `${barWidth}%`,
                                backgroundColor: idx === 0 ? Colors.dark.primary : Colors.dark.accent,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>

        <View style={styles.actionsList}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/(tabs)/(upload)/upload' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(201, 168, 108, 0.12)' }]}>
              <Upload color={Colors.dark.primary} size={18} />
            </View>
            <Text style={styles.actionText}>Upload Track</Text>
            <ChevronRight color={Colors.dark.textMuted} size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/(tabs)/(browse)' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(126, 200, 139, 0.12)' }]}>
              <BarChart3 color={Colors.dark.success} size={18} />
            </View>
            <Text style={styles.actionText}>Browse Library</Text>
            <ChevronRight color={Colors.dark.textMuted} size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, styles.actionRowLast]}
            onPress={() => router.push('/(tabs)/(account)' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(139, 126, 200, 0.12)' }]}>
              <Users color={Colors.dark.accent} size={18} />
            </View>
            <Text style={styles.actionText}>Account Settings</Text>
            <ChevronRight color={Colors.dark.textMuted} size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  adminIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    flex: 1,
  },
  welcomeLabel: {
    ...typography.caption,
    color: Colors.dark.primary,
    fontSize: 10,
  },
  welcomeName: {
    ...typography.title,
    color: Colors.dark.text,
    marginTop: 2,
  },
  uploadCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 28,
  },
  uploadCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 20,
    gap: 14,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCardText: {
    flex: 1,
  },
  uploadCardTitle: {
    ...typography.subtitle,
    color: Colors.dark.background,
    fontSize: 17,
    fontWeight: '700' as const,
  },
  uploadCardSub: {
    ...typography.bodySmall,
    color: 'rgba(10,10,15,0.6)',
    marginTop: 2,
  },
  sectionLabel: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    marginBottom: 14,
    fontSize: 11,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    ...typography.bodySmall,
    color: Colors.dark.textMuted,
  },
  errorCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200,126,126,0.2)',
    marginBottom: 28,
  },
  errorText: {
    ...typography.body,
    color: Colors.dark.error,
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.dark.surfaceElevated,
  },
  retryText: {
    ...typography.subtitle,
    color: Colors.dark.primary,
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  statDesc: {
    ...typography.bodySmall,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  modalityCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 28,
  },
  modalityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  modalityTitle: {
    ...typography.subtitle,
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  modalityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  modalityRank: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalityRankText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.dark.textSecondary,
  },
  modalityInfo: {
    flex: 1,
  },
  modalityLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalityName: {
    ...typography.bodySmall,
    color: Colors.dark.text,
    fontSize: 14,
  },
  modalityCount: {
    ...typography.bodySmall,
    color: Colors.dark.textMuted,
    fontSize: 13,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.surfaceElevated,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionsList: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.dark.borderSubtle,
  },
  actionRowLast: {
    borderBottomWidth: 0,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    ...typography.subtitle,
    color: Colors.dark.text,
    fontSize: 15,
    flex: 1,
  },
  bottomSpacer: {
    height: 20,
  },
});
