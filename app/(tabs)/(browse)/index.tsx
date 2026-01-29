import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Clock, Mic, MicOff, ChevronDown, ChevronUp, Check, LayoutGrid, List } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useAudio } from '@/providers/AudioProvider';
import { formatDuration, Track } from '@/mocks/audio';

const { width } = Dimensions.get('window');

export default function BrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    playTrack, 
    allTracks, 
    allModalities,
    allIntentions,
    allSoundscapes,
    allChakras,
    allIntensities,
    isLoadingTracks,
    isLoadingFilters,
  } = useAudio();
  
  const [selectedModalityIds, setSelectedModalityIds] = useState<string[]>([]);
  const [selectedIntentionIds, setSelectedIntentionIds] = useState<string[]>([]);
  const [selectedSoundscapeIds, setSelectedSoundscapeIds] = useState<string[]>([]);
  const [selectedChakraIds, setSelectedChakraIds] = useState<string[]>([]);
  const [selectedIntensityIds, setSelectedIntensityIds] = useState<string[]>([]);
  
  const [sleepSafeFilter, setSleepSafeFilter] = useState(false);
  const [tripSafeFilter, setTripSafeFilter] = useState(false);
  const [voiceFilter, setVoiceFilter] = useState<'all' | 'voice' | 'noVoice'>('all');

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const toggleFilter = (id: string, selected: string[], setSelected: (ids: string[]) => void) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const filteredTracks = useMemo(() => {
    return allTracks.filter((track: Track) => {
      if (selectedModalityIds.length > 0) {
        const trackModalityIds = track.modalities.map(m => m.id);
        if (!selectedModalityIds.some(id => trackModalityIds.includes(id))) {
          return false;
        }
      }

      if (selectedIntentionIds.length > 0) {
        const trackIntentionIds = track.intentions.map(i => i.id);
        if (!selectedIntentionIds.some(id => trackIntentionIds.includes(id))) {
          return false;
        }
      }

      if (selectedSoundscapeIds.length > 0) {
        const trackSoundscapeIds = track.soundscapes.map(s => s.id);
        if (!selectedSoundscapeIds.some(id => trackSoundscapeIds.includes(id))) {
          return false;
        }
      }

      if (selectedChakraIds.length > 0) {
        const trackChakraIds = track.chakras.map(c => c.id);
        if (!selectedChakraIds.some(id => trackChakraIds.includes(id))) {
          return false;
        }
      }

      if (selectedIntensityIds.length > 0) {
        if (!track.intensity || !selectedIntensityIds.includes(track.intensity.id)) {
          return false;
        }
      }
      
      if (sleepSafeFilter && !track.sleepSafe) return false;
      if (tripSafeFilter && !track.tripSafe) return false;
      
      if (voiceFilter === 'voice' && !track.voice) return false;
      if (voiceFilter === 'noVoice' && track.voice) return false;

      return true;
    });
  }, [allTracks, selectedModalityIds, selectedIntentionIds, selectedSoundscapeIds, selectedChakraIds, selectedIntensityIds, sleepSafeFilter, tripSafeFilter, voiceFilter]);

  const handlePlayTrack = (track: Track) => {
    playTrack(track);
    router.push('/player');
  };

  const handleModalityPress = (modalityId: string) => {
    router.push(`/theme/${modalityId}`);
  };

  const isLoading = isLoadingTracks || isLoadingFilters;

  const renderFilterSection = (
    title: string,
    sectionKey: string,
    items: { id: string; name: string }[],
    selectedIds: string[],
    setSelectedIds: (ids: string[]) => void
  ) => {
    const isExpanded = expandedSection === sectionKey;
    const hasSelection = selectedIds.length > 0;

    return (
      <View style={styles.filterSection}>
        <TouchableOpacity 
          style={styles.filterSectionHeader}
          onPress={() => toggleSection(sectionKey)}
          activeOpacity={0.7}
        >
          <View style={styles.filterSectionTitleRow}>
            <Text style={styles.filterSectionTitle}>{title}</Text>
            {hasSelection && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedIds.length}</Text>
              </View>
            )}
          </View>
          {isExpanded ? (
            <ChevronUp size={18} color={Colors.dark.textMuted} />
          ) : (
            <ChevronDown size={18} color={Colors.dark.textMuted} />
          )}
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.filterOptions}>
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.filterOption, isSelected && styles.filterOptionSelected]}
                  onPress={() => toggleFilter(item.id, selectedIds, setSelectedIds)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextSelected]}>
                    {item.name}
                  </Text>
                  {isSelected && (
                    <Check size={14} color={Colors.dark.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.surfaceGlow, Colors.dark.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.3 }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Browse</Text>
        <Text style={styles.subtitle}>Explore the sanctuary</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.dark.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            <View style={styles.modalitiesSection}>
              <Text style={styles.sectionLabel}>MODALITIES</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.modalitiesScroll}
              >
                {allModalities.map((modality) => (
                  <TouchableOpacity 
                    key={modality.id}
                    style={styles.modalityCard}
                    onPress={() => handleModalityPress(modality.id)}
                    activeOpacity={0.8}
                  >
                    {modality.imageUrl ? (
                      <Image source={{ uri: modality.imageUrl }} style={styles.modalityImage} />
                    ) : (
                      <View style={[styles.modalityImage, styles.modalityPlaceholder]} />
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.85)']}
                      style={styles.modalityGradient}
                    />
                    <View style={styles.modalityContent}>
                      <Text style={styles.modalityName}>{modality.name}</Text>
                      {modality.description && (
                        <Text style={styles.modalityDescription} numberOfLines={2}>
                          {modality.description}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filtersContainer}>
              <Text style={styles.sectionLabel}>FILTERS</Text>
              
              <View style={styles.quickFilters}>
                <TouchableOpacity 
                  style={[styles.quickFilter, sleepSafeFilter && styles.quickFilterActive]}
                  onPress={() => setSleepSafeFilter(!sleepSafeFilter)}
                >
                  <Text style={[styles.quickFilterText, sleepSafeFilter && styles.quickFilterTextActive]}>
                    Sleep Safe
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.quickFilter, tripSafeFilter && styles.quickFilterActive]}
                  onPress={() => setTripSafeFilter(!tripSafeFilter)}
                >
                  <Text style={[styles.quickFilterText, tripSafeFilter && styles.quickFilterTextActive]}>
                    Journey Safe
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.quickFilter, voiceFilter === 'voice' && styles.quickFilterActive]}
                  onPress={() => setVoiceFilter(voiceFilter === 'voice' ? 'all' : 'voice')}
                >
                  <Mic size={14} color={voiceFilter === 'voice' ? Colors.dark.primary : Colors.dark.textMuted} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.quickFilter, voiceFilter === 'noVoice' && styles.quickFilterActive]}
                  onPress={() => setVoiceFilter(voiceFilter === 'noVoice' ? 'all' : 'noVoice')}
                >
                  <MicOff size={14} color={voiceFilter === 'noVoice' ? Colors.dark.primary : Colors.dark.textMuted} />
                </TouchableOpacity>
              </View>

              {renderFilterSection('Intention', 'intention', allIntentions, selectedIntentionIds, setSelectedIntentionIds)}
              {renderFilterSection('Soundscape', 'soundscape', allSoundscapes, selectedSoundscapeIds, setSelectedSoundscapeIds)}
              {renderFilterSection('Chakra', 'chakra', allChakras, selectedChakraIds, setSelectedChakraIds)}
              {renderFilterSection('Intensity', 'intensity', allIntensities, selectedIntensityIds, setSelectedIntensityIds)}
            </View>

            <View style={styles.tracksSection}>
              <View style={styles.tracksSectionHeader}>
                <Text style={styles.sectionLabelInline}>
                  {filteredTracks.length} TRACK{filteredTracks.length !== 1 ? 'S' : ''}
                </Text>
                <View style={styles.viewToggle}>
                  <TouchableOpacity
                    style={[styles.viewToggleButton, viewMode === 'card' && styles.viewToggleButtonActive]}
                    onPress={() => setViewMode('card')}
                  >
                    <LayoutGrid size={16} color={viewMode === 'card' ? Colors.dark.primary : Colors.dark.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
                    onPress={() => setViewMode('list')}
                  >
                    <List size={16} color={viewMode === 'list' ? Colors.dark.primary : Colors.dark.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {viewMode === 'card' ? (
                <View style={styles.cardGrid}>
                  {filteredTracks.map((track: Track) => (
                    <TouchableOpacity 
                      key={track.id}
                      style={styles.cardItem}
                      onPress={() => handlePlayTrack(track)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: track.imageUrl }} style={styles.cardImage} />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.cardGradient}
                      />
                      <View style={styles.cardContent}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{track.title}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.cardPlayButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          playTrack(track);
                        }}
                      >
                        <Play size={16} color={Colors.dark.text} fill={Colors.dark.text} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                filteredTracks.map((track: Track) => (
                <TouchableOpacity 
                    key={track.id}
                    style={styles.listItem}
                    onPress={() => handlePlayTrack(track)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.listContent}>
                      <Text style={styles.listTitle} numberOfLines={1}>{track.title}</Text>
                      <View style={styles.listPills}>
                        {track.modalities.slice(0, 1).map(m => (
                          <View key={m.id} style={styles.listPill}>
                            <Text style={styles.listPillText}>{m.name}</Text>
                          </View>
                        ))}
                        {track.intensity && (
                          <View style={[styles.listPill, styles.listPillIntensity]}>
                            <Text style={styles.listPillText}>{track.intensity.name}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.listPlayButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        playTrack(track);
                      }}
                    >
                      <Play size={16} color={Colors.dark.primary} fill={Colors.dark.primary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}

              {filteredTracks.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No tracks match your filters</Text>
                </View>
              )}
            </View>
          </>
        )}
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
  content: {
    paddingBottom: 120,
  },
  title: {
    ...typography.displayMedium,
    color: Colors.dark.text,
    paddingHorizontal: 20,
  },
  subtitle: {
    ...typography.body,
    color: Colors.dark.textMuted,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 30,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: Colors.dark.textMuted,
    marginTop: 12,
  },
  sectionLabel: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  modalitiesSection: {
    marginBottom: 30,
  },
  modalitiesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  modalityCard: {
    width: width * 0.65,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
  },
  modalityImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  modalityPlaceholder: {
    backgroundColor: Colors.dark.surfaceElevated,
  },
  modalityGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  modalityContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  modalityName: {
    ...typography.subtitle,
    color: Colors.dark.text,
    fontSize: 18,
  },
  modalityDescription: {
    ...typography.bodySmall,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  filtersContainer: {
    marginBottom: 24,
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  quickFilter: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.borderSubtle,
  },
  quickFilterActive: {
    backgroundColor: Colors.dark.primaryGlow,
    borderColor: Colors.dark.primary,
  },
  quickFilterText: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    fontSize: 11,
  },
  quickFilterTextActive: {
    color: Colors.dark.primary,
  },
  filterSection: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.borderSubtle,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  filterSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterSectionTitle: {
    ...typography.subtitle,
    color: Colors.dark.text,
    fontSize: 14,
  },
  filterBadge: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  filterBadgeText: {
    ...typography.caption,
    color: Colors.dark.background,
    fontSize: 10,
    fontWeight: '600' as const,
  },
  filterOptions: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 6,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.dark.surfaceElevated,
  },
  filterOptionSelected: {
    backgroundColor: Colors.dark.primaryGlow,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  filterOptionText: {
    ...typography.body,
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  filterOptionTextSelected: {
    color: Colors.dark.primary,
  },
  tracksSection: {
    paddingHorizontal: 20,
  },
  tracksSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabelInline: {
    ...typography.caption,
    color: Colors.dark.textMuted,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.dark.borderSubtle,
  },
  viewToggleButton: {
    padding: 6,
    borderRadius: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: Colors.dark.surfaceElevated,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardItem: {
    width: (width - 52) / 2,
    height: (width - 52) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardTitle: {
    ...typography.subtitle,
    color: Colors.dark.text,
    fontSize: 14,
  },
  cardPlayButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.borderSubtle,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    ...typography.subtitle,
    color: Colors.dark.text,
    fontSize: 15,
    marginBottom: 6,
  },
  listPills: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  listPill: {
    backgroundColor: Colors.dark.surface,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.borderSubtle,
  },
  listPillIntensity: {
    backgroundColor: Colors.dark.primaryGlow,
    borderColor: Colors.dark.primary,
  },
  listPillText: {
    ...typography.caption,
    color: Colors.dark.textSecondary,
    fontSize: 11,
  },
  listPlayButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: Colors.dark.textMuted,
  },
});
