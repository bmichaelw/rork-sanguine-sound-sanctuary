import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Moon, Sparkles, Wind, ChevronDown, ChevronUp, Check, Mic, MicOff, SlidersHorizontal, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useAudio, FlowFilters } from '@/providers/AudioProvider';

export default function ListenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    enterFlow, 
    allModalities,
    allIntentions,
    allSoundscapes,
    allChakras,
    allIntensities,
    getEligibleTracks,
  } = useAudio();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  const [showFilters, setShowFilters] = useState(false);
  const filterHeight = useRef(new Animated.Value(0)).current;

  const [selectedModalityIds, setSelectedModalityIds] = useState<string[]>([]);
  const [selectedIntentionIds, setSelectedIntentionIds] = useState<string[]>([]);
  const [selectedSoundscapeIds, setSelectedSoundscapeIds] = useState<string[]>([]);
  const [selectedChakraIds, setSelectedChakraIds] = useState<string[]>([]);
  const [selectedIntensityIds, setSelectedIntensityIds] = useState<string[]>([]);
  const [sleepSafeFilter, setSleepSafeFilter] = useState(false);
  const [tripSafeFilter, setTripSafeFilter] = useState(false);
  const [voiceFilter, setVoiceFilter] = useState<'all' | 'voice' | 'noVoice'>('all');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedModalityIds.length > 0) count++;
    if (selectedIntentionIds.length > 0) count++;
    if (selectedSoundscapeIds.length > 0) count++;
    if (selectedChakraIds.length > 0) count++;
    if (selectedIntensityIds.length > 0) count++;
    if (sleepSafeFilter) count++;
    if (tripSafeFilter) count++;
    if (voiceFilter !== 'all') count++;
    return count;
  }, [selectedModalityIds, selectedIntentionIds, selectedSoundscapeIds, selectedChakraIds, selectedIntensityIds, sleepSafeFilter, tripSafeFilter, voiceFilter]);

  const currentFilters = useMemo((): Partial<FlowFilters> => {
    const filters: Partial<FlowFilters> = {};
    if (sleepSafeFilter) filters.sleepSafe = true;
    if (tripSafeFilter) filters.tripSafe = true;
    if (voiceFilter === 'noVoice') filters.noVoice = true;
    if (selectedModalityIds.length > 0) filters.modalityIds = selectedModalityIds;
    if (selectedIntentionIds.length > 0) filters.intentionIds = selectedIntentionIds;
    if (selectedSoundscapeIds.length > 0) filters.soundscapeIds = selectedSoundscapeIds;
    if (selectedChakraIds.length > 0) filters.chakraIds = selectedChakraIds;
    return filters;
  }, [sleepSafeFilter, tripSafeFilter, voiceFilter, selectedModalityIds, selectedIntentionIds, selectedSoundscapeIds, selectedChakraIds]);

  const eligibleCount = useMemo(() => {
    const fullFilters: FlowFilters = {
      sleepSafe: sleepSafeFilter,
      tripSafe: tripSafeFilter,
      noWords: false,
      noVoice: voiceFilter === 'noVoice',
      maxIntensityLevel: 10,
      modalityIds: selectedModalityIds,
      intentionIds: selectedIntentionIds,
      soundscapeIds: selectedSoundscapeIds,
      chakraIds: selectedChakraIds,
    };
    return getEligibleTracks(fullFilters).length;
  }, [sleepSafeFilter, tripSafeFilter, voiceFilter, selectedModalityIds, selectedIntentionIds, selectedSoundscapeIds, selectedChakraIds, getEligibleTracks]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [pulseAnim, glowAnim]);

  const toggleFiltersPanel = useCallback(() => {
    const toValue = showFilters ? 0 : 1;
    setShowFilters(!showFilters);
    Animated.timing(filterHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showFilters, filterHeight]);

  const handleEnterFlow = useCallback(() => {
    enterFlow(currentFilters);
    router.push('/player');
  }, [enterFlow, currentFilters, router]);

  const handleQuickFlow = useCallback((filter: string) => {
    setSelectedModalityIds([]);
    setSelectedIntentionIds([]);
    setSelectedSoundscapeIds([]);
    setSelectedChakraIds([]);
    setSelectedIntensityIds([]);
    setSleepSafeFilter(false);
    setTripSafeFilter(false);
    setVoiceFilter('all');
    setExpandedSection(null);
    switch (filter) {
      case 'sleep':
        setSleepSafeFilter(true);
        enterFlow({ sleepSafe: true, maxIntensityLevel: 3 });
        break;
      case 'trip':
        setTripSafeFilter(true);
        enterFlow({ tripSafe: true });
        break;
      case 'breathwork':
        setVoiceFilter('noVoice');
        enterFlow({ noVoice: true });
        break;
      default:
        enterFlow();
    }
    router.push('/player');
  }, [enterFlow, router]);

  const clearAllFilters = useCallback(() => {
    setSelectedModalityIds([]);
    setSelectedIntentionIds([]);
    setSelectedSoundscapeIds([]);
    setSelectedChakraIds([]);
    setSelectedIntensityIds([]);
    setSleepSafeFilter(false);
    setTripSafeFilter(false);
    setVoiceFilter('all');
    setExpandedSection(null);
  }, []);

  const toggleFilter = useCallback((id: string, selected: string[], setSelected: (ids: string[]) => void) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected([...selected, id]);
    }
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  }, []);

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
      <View style={styles.filterSection} key={sectionKey}>
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
            <ChevronUp size={16} color={Colors.dark.textMuted} />
          ) : (
            <ChevronDown size={16} color={Colors.dark.textMuted} />
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
                    <Check size={13} color={Colors.dark.primary} />
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
        colors={[Colors.dark.surfaceGlow, Colors.dark.background, Colors.dark.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>SANGUINE</Text>
          <Text style={styles.subtitle}>Sound Therapy</Text>
        </View>

        <View style={styles.flowSection}>
          <Animated.View style={[styles.flowGlow, { opacity: glowAnim }]} />
          
          <TouchableOpacity 
            style={styles.flowButton}
            onPress={handleEnterFlow}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.flowButtonInner, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={[Colors.dark.primaryGlow, 'transparent']}
                style={styles.flowButtonGradient}
              />
              <Play 
                color={Colors.dark.primary} 
                size={40} 
                fill={Colors.dark.primary}
                strokeWidth={0}
              />
            </Animated.View>
          </TouchableOpacity>
          
          <Text style={styles.flowTitle}>Enter the Flow</Text>
          <Text style={styles.flowDescription}>
            {activeFilterCount > 0
              ? `${eligibleCount} track${eligibleCount !== 1 ? 's' : ''} matching your filters`
              : 'Continuous, uninterrupted listening\ncurated for deep states'}
          </Text>
        </View>

        <View style={styles.quickFilters}>
          <Text style={styles.sectionLabel}>QUICK FLOWS</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity 
              style={styles.filterChip}
              onPress={() => handleQuickFlow('sleep')}
            >
              <Moon color={Colors.dark.textSecondary} size={16} />
              <Text style={styles.filterText}>Sleep Safe</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterChip}
              onPress={() => handleQuickFlow('trip')}
            >
              <Sparkles color={Colors.dark.textSecondary} size={16} />
              <Text style={styles.filterText}>Journey Safe</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterChip}
              onPress={() => handleQuickFlow('breathwork')}
            >
              <Wind color={Colors.dark.textSecondary} size={16} />
              <Text style={styles.filterText}>No Voice</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filtersPanel}>
          <TouchableOpacity 
            style={styles.filtersPanelHeader}
            onPress={toggleFiltersPanel}
            activeOpacity={0.7}
          >
            <View style={styles.filtersPanelTitleRow}>
              <SlidersHorizontal size={18} color={Colors.dark.primary} />
              <Text style={styles.filtersPanelTitle}>Customize Flow</Text>
              {activeFilterCount > 0 && (
                <View style={styles.activeCountBadge}>
                  <Text style={styles.activeCountText}>{activeFilterCount}</Text>
                </View>
              )}
            </View>
            {showFilters ? (
              <ChevronUp size={18} color={Colors.dark.textMuted} />
            ) : (
              <ChevronDown size={18} color={Colors.dark.textMuted} />
            )}
          </TouchableOpacity>

          {showFilters && (
            <View style={styles.filtersContent}>
              <View style={styles.toggleFiltersRow}>
                <TouchableOpacity 
                  style={[styles.toggleChip, sleepSafeFilter && styles.toggleChipActive]}
                  onPress={() => setSleepSafeFilter(!sleepSafeFilter)}
                >
                  <Moon size={14} color={sleepSafeFilter ? Colors.dark.primary : Colors.dark.textMuted} />
                  <Text style={[styles.toggleChipText, sleepSafeFilter && styles.toggleChipTextActive]}>
                    Sleep Safe
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.toggleChip, tripSafeFilter && styles.toggleChipActive]}
                  onPress={() => setTripSafeFilter(!tripSafeFilter)}
                >
                  <Sparkles size={14} color={tripSafeFilter ? Colors.dark.primary : Colors.dark.textMuted} />
                  <Text style={[styles.toggleChipText, tripSafeFilter && styles.toggleChipTextActive]}>
                    Journey Safe
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.toggleChip, voiceFilter === 'voice' && styles.toggleChipActive]}
                  onPress={() => setVoiceFilter(voiceFilter === 'voice' ? 'all' : 'voice')}
                >
                  <Mic size={14} color={voiceFilter === 'voice' ? Colors.dark.primary : Colors.dark.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.toggleChip, voiceFilter === 'noVoice' && styles.toggleChipActive]}
                  onPress={() => setVoiceFilter(voiceFilter === 'noVoice' ? 'all' : 'noVoice')}
                >
                  <MicOff size={14} color={voiceFilter === 'noVoice' ? Colors.dark.primary : Colors.dark.textMuted} />
                </TouchableOpacity>
              </View>

              {renderFilterSection('Modality', 'modality', allModalities, selectedModalityIds, setSelectedModalityIds)}
              {renderFilterSection('Intention', 'intention', allIntentions, selectedIntentionIds, setSelectedIntentionIds)}
              {renderFilterSection('Soundscape', 'soundscape', allSoundscapes, selectedSoundscapeIds, setSelectedSoundscapeIds)}
              {renderFilterSection('Chakra', 'chakra', allChakras, selectedChakraIds, setSelectedChakraIds)}
              {renderFilterSection('Intensity', 'intensity', allIntensities, selectedIntensityIds, setSelectedIntensityIds)}

              {activeFilterCount > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={clearAllFilters}
                  activeOpacity={0.7}
                >
                  <X size={14} color={Colors.dark.error} />
                  <Text style={styles.clearButtonText}>Clear All Filters</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.flowWithFiltersButton, eligibleCount === 0 && styles.flowWithFiltersDisabled]}
                onPress={handleEnterFlow}
                activeOpacity={0.8}
                disabled={eligibleCount === 0}
              >
                <LinearGradient
                  colors={eligibleCount > 0 ? [Colors.dark.primaryGlow, 'rgba(201, 168, 108, 0.05)'] : ['transparent', 'transparent']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <Play size={18} color={eligibleCount > 0 ? Colors.dark.primary : Colors.dark.textMuted} fill={eligibleCount > 0 ? Colors.dark.primary : Colors.dark.textMuted} strokeWidth={0} />
                <Text style={[styles.flowWithFiltersText, eligibleCount === 0 && styles.flowWithFiltersTextDisabled]}>
                  {eligibleCount > 0 
                    ? `Flow with ${eligibleCount} track${eligibleCount !== 1 ? 's' : ''}`
                    : 'No tracks match filters'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Au{"'"}Dio</Text>
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brand: {
    ...typography.displayLarge,
    color: Colors.dark.primary,
    letterSpacing: 8,
  },
  subtitle: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    marginTop: 8,
  },
  flowSection: {
    alignItems: 'center',
    marginBottom: 50,
    position: 'relative',
  },
  flowGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.dark.primary,
    top: -20,
  },
  flowButton: {
    marginBottom: 24,
  },
  flowButtonInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  flowButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  flowTitle: {
    ...typography.title,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  flowDescription: {
    ...typography.bodySmall,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  quickFilters: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterText: {
    ...typography.bodySmall,
    color: Colors.dark.textSecondary,
  },
  filtersPanel: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.borderSubtle,
    overflow: 'hidden',
  },
  filtersPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  filtersPanelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filtersPanelTitle: {
    ...typography.subtitle,
    color: Colors.dark.text,
    fontSize: 15,
  },
  activeCountBadge: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeCountText: {
    ...typography.caption,
    color: Colors.dark.background,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  filtersContent: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    gap: 10,
  },
  toggleFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  toggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.dark.borderSubtle,
  },
  toggleChipActive: {
    backgroundColor: Colors.dark.primaryGlow,
    borderColor: Colors.dark.primary,
  },
  toggleChipText: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    fontSize: 12,
  },
  toggleChipTextActive: {
    color: Colors.dark.primary,
  },
  filterSection: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.borderSubtle,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  filterSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterSectionTitle: {
    ...typography.subtitle,
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  filterBadge: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  filterBadgeText: {
    ...typography.caption,
    color: Colors.dark.background,
    fontSize: 10,
    fontWeight: '600' as const,
  },
  filterOptions: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 5,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.dark.surface,
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  clearButtonText: {
    ...typography.caption,
    color: Colors.dark.error,
    fontSize: 12,
  },
  flowWithFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    overflow: 'hidden',
  },
  flowWithFiltersDisabled: {
    borderColor: Colors.dark.borderSubtle,
    opacity: 0.5,
  },
  flowWithFiltersText: {
    ...typography.subtitle,
    color: Colors.dark.primary,
    fontSize: 15,
  },
  flowWithFiltersTextDisabled: {
    color: Colors.dark.textMuted,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    opacity: 0.5,
  },
});
