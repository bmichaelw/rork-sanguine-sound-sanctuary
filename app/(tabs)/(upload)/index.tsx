import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { 
  Upload, 
  Music, 
  Shield, 
  BarChart3, 
  TrendingUp, 
  Database,
  ChevronRight,
  Clock,
  TestTube,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { fetchLibraryStats, LibraryStats } from '@/services/supabase';
import UploadTrackForm from '@/components/UploadTrackForm';
import TestUploadPanel from '@/components/TestUploadPanel';

export default function AdminScreen() {
  const { user, isAdmin } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>('stats');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showTestUpload, setShowTestUpload] = useState(false);
  const insets = useSafeAreaInsets();

  const handleOpenUploadForm = () => {
    console.log('[Admin] Upload button pressed, opening form...');
    setShowUploadForm(true);
  };

  const handleCloseUploadForm = () => {
    console.log('[Admin] Closing upload form');
    setShowUploadForm(false);
  };

  const { data: stats, isLoading, refetch, isRefetching } = useQuery<LibraryStats>({
    queryKey: ['libraryStats'],
    queryFn: fetchLibraryStats,
    enabled: isAdmin,
  });

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

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.dark.primary}
          />
        }
      >
      <View style={styles.header}>
        <View style={styles.adminBadgeHeader}>
          <Shield color={Colors.dark.success} size={16} />
          <Text style={styles.adminBadgeHeaderText}>Admin</Text>
        </View>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      {/* Upload Track Section */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('upload')}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIcon, { backgroundColor: 'rgba(99, 179, 237, 0.15)' }]}>
            <Upload color="#63B3ED" size={20} strokeWidth={1.5} />
          </View>
          <Text style={styles.sectionTitle}>Upload Track</Text>
        </View>
        <ChevronRight 
          color={Colors.dark.textMuted} 
          size={20} 
          style={{ transform: [{ rotate: expandedSection === 'upload' ? '90deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {expandedSection === 'upload' && (
        <View style={styles.sectionContent}>
          <TouchableOpacity 
            style={styles.uploadButton} 
            activeOpacity={0.8}
            onPress={handleOpenUploadForm}
          >
            <Music color={Colors.dark.text} size={28} strokeWidth={1.5} />
            <Text style={styles.uploadButtonText}>Upload New Track</Text>
            <Text style={styles.uploadButtonSubtext}>
              Add a new meditation track to the library
            </Text>
          </TouchableOpacity>

          <View style={styles.guidelinesCard}>
            <Text style={styles.guidelinesTitle}>Upload Guidelines</Text>
            <View style={styles.guidelineItem}>
              <View style={styles.guidelineDot} />
              <Text style={styles.guidelineText}>Audio: MP3 or M4A format</Text>
            </View>
            <View style={styles.guidelineItem}>
              <View style={styles.guidelineDot} />
              <Text style={styles.guidelineText}>Cover art: 1:1 ratio, min 500x500px</Text>
            </View>
            <View style={styles.guidelineItem}>
              <View style={styles.guidelineDot} />
              <Text style={styles.guidelineText}>Add modalities, intentions & soundscapes</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.testUploadButton} 
            activeOpacity={0.8}
            onPress={() => setShowTestUpload(true)}
          >
            <TestTube color={Colors.dark.warning} size={20} strokeWidth={1.5} />
            <Text style={styles.testUploadButtonText}>Test Upload (Debug)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Library Stats Section */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('stats')}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIcon, { backgroundColor: 'rgba(126, 200, 139, 0.15)' }]}>
            <Database color={Colors.dark.success} size={20} strokeWidth={1.5} />
          </View>
          <Text style={styles.sectionTitle}>Library Stats</Text>
        </View>
        <ChevronRight 
          color={Colors.dark.textMuted} 
          size={20} 
          style={{ transform: [{ rotate: expandedSection === 'stats' ? '90deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {expandedSection === 'stats' && (
        <View style={styles.sectionContent}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.dark.primary} size="small" />
              <Text style={styles.loadingText}>Loading stats...</Text>
            </View>
          ) : stats ? (
            <>
              <View style={styles.totalTracksCard}>
                <View style={styles.totalTracksIconContainer}>
                  <Music color={Colors.dark.primary} size={24} strokeWidth={1.5} />
                </View>
                <View style={styles.totalTracksInfo}>
                  <Text style={styles.totalTracksLabel}>Total Tracks</Text>
                  <Text style={styles.totalTracksValue}>{stats.totalTracks}</Text>
                </View>
              </View>

              <Text style={styles.modalityStatsTitle}>Tracks by Modality</Text>
              <View style={styles.modalityList}>
                {stats.tracksPerModality.map((modality, index) => (
                  <View key={modality.name} style={styles.modalityItem}>
                    <View style={styles.modalityRank}>
                      <Text style={styles.modalityRankText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.modalityName}>{modality.name}</Text>
                    <View style={styles.modalityCountBadge}>
                      <Text style={styles.modalityCount}>{modality.count}</Text>
                    </View>
                  </View>
                ))}
                {stats.tracksPerModality.length === 0 && (
                  <Text style={styles.emptyText}>No modalities found</Text>
                )}
              </View>
            </>
          ) : (
            <Text style={styles.errorText}>Failed to load stats</Text>
          )}
        </View>
      )}

      {/* Analytics Section */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('analytics')}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIcon, { backgroundColor: 'rgba(237, 137, 54, 0.15)' }]}>
            <BarChart3 color="#ED8936" size={20} strokeWidth={1.5} />
          </View>
          <Text style={styles.sectionTitle}>Analytics</Text>
        </View>
        <ChevronRight 
          color={Colors.dark.textMuted} 
          size={20} 
          style={{ transform: [{ rotate: expandedSection === 'analytics' ? '90deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {expandedSection === 'analytics' && (
        <View style={styles.sectionContent}>
          <View style={styles.comingSoonCard}>
            <View style={styles.comingSoonIconContainer}>
              <TrendingUp color={Colors.dark.textMuted} size={32} strokeWidth={1.5} />
            </View>
            <Text style={styles.comingSoonTitle}>Coming Soon</Text>
            <Text style={styles.comingSoonText}>
              Analytics dashboard with play counts, user engagement metrics, and listening trends will be available in a future update.
            </Text>
            
            <View style={styles.plannedFeatures}>
              <Text style={styles.plannedFeaturesTitle}>Planned Features</Text>
              <View style={styles.plannedFeatureItem}>
                <Clock color={Colors.dark.textMuted} size={14} />
                <Text style={styles.plannedFeatureText}>Total play counts per track</Text>
              </View>
              <View style={styles.plannedFeatureItem}>
                <Clock color={Colors.dark.textMuted} size={14} />
                <Text style={styles.plannedFeatureText}>User engagement metrics</Text>
              </View>
              <View style={styles.plannedFeatureItem}>
                <Clock color={Colors.dark.textMuted} size={14} />
                <Text style={styles.plannedFeatureText}>Popular listening times</Text>
              </View>
              <View style={styles.plannedFeatureItem}>
                <Clock color={Colors.dark.textMuted} size={14} />
                <Text style={styles.plannedFeatureText}>Completion rates by track</Text>
              </View>
            </View>
          </View>
        </View>
      )}

        <View style={styles.footer} />
      </ScrollView>

      {showUploadForm && (
        <View style={[styles.fullScreenOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <UploadTrackForm
            onClose={handleCloseUploadForm}
            onSuccess={() => {
              console.log('[Admin] Upload success, closing form');
              handleCloseUploadForm();
              refetch();
            }}
          />
        </View>
      )}

      {showTestUpload && (
        <View style={[styles.fullScreenOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <TestUploadPanel onClose={() => setShowTestUpload(false)} />
        </View>
      )}
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  adminBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(126, 200, 139, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 5,
    marginBottom: 12,
  },
  adminBadgeHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.success,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginBottom: 2,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  sectionContent: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  uploadButton: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 12,
  },
  uploadButtonSubtext: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  guidelinesCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    padding: 14,
  },
  guidelinesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginBottom: 10,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  guidelineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.dark.primary,
    marginRight: 10,
  },
  guidelineText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  totalTracksCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  totalTracksIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.dark.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalTracksInfo: {
    flex: 1,
  },
  totalTracksLabel: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginBottom: 2,
  },
  totalTracksValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  modalityStatsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginBottom: 12,
  },
  modalityList: {
    gap: 8,
  },
  modalityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    padding: 12,
  },
  modalityRank: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalityRankText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  modalityName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  modalityCountBadge: {
    backgroundColor: Colors.dark.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalityCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.primary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.dark.error,
    textAlign: 'center',
    padding: 16,
  },
  comingSoonCard: {
    alignItems: 'center',
    padding: 20,
  },
  comingSoonIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  plannedFeatures: {
    width: '100%',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
  },
  plannedFeaturesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    marginBottom: 12,
  },
  plannedFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  plannedFeatureText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
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
  footer: {
    height: 20,
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.dark.background,
    zIndex: 1000,
  },
  testUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(237, 137, 54, 0.3)',
  },
  testUploadButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.dark.warning,
  },
});
