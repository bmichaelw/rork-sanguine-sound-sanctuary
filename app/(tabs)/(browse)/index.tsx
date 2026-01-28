import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Clock, Mic, MicOff } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useAudio } from '@/providers/AudioProvider';
import { themes, modalities, formatDuration, Track } from '@/mocks/audio';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'sleep' | 'trip' | 'voice' | 'noVoice';

export default function BrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { playTrack, allTracks, isLoadingTracks } = useAudio();
  
  const [selectedModality, setSelectedModality] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  const filteredTracks = useMemo(() => {
    return allTracks.filter((track: Track) => {
      if (selectedModality !== 'All' && track.modality !== selectedModality) {
        return false;
      }
      
      switch (selectedFilter) {
        case 'sleep':
          return track.sleepSafe;
        case 'trip':
          return track.tripSafe;
        case 'voice':
          return track.hasVoice;
        case 'noVoice':
          return !track.hasVoice;
        default:
          return true;
      }
    });
  }, [allTracks, selectedModality, selectedFilter]);

  const handlePlayTrack = (track: Track) => {
    playTrack(track);
    router.push('/player');
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

        <View style={styles.themesSection}>
          <Text style={styles.sectionLabel}>THEMES</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themesScroll}
          >
            {themes.map((theme) => (
              <TouchableOpacity 
                key={theme.id}
                style={styles.themeCard}
                onPress={() => router.push(`/theme/${theme.id}`)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: theme.imageUrl }} style={styles.themeImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={styles.themeGradient}
                />
                <View style={styles.themeContent}>
                  <Text style={styles.themeName}>{theme.name}</Text>
                  <Text style={styles.themeDescription}>{theme.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filtersSection}>
          <Text style={styles.sectionLabel}>MODALITY</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {modalities.map((modality) => (
              <TouchableOpacity 
                key={modality}
                style={[
                  styles.filterChip,
                  selectedModality === modality && styles.filterChipActive
                ]}
                onPress={() => setSelectedModality(modality)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedModality === modality && styles.filterChipTextActive
                ]}>
                  {modality}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.quickFilters}>
          <TouchableOpacity 
            style={[styles.quickFilter, selectedFilter === 'sleep' && styles.quickFilterActive]}
            onPress={() => setSelectedFilter(selectedFilter === 'sleep' ? 'all' : 'sleep')}
          >
            <Text style={[styles.quickFilterText, selectedFilter === 'sleep' && styles.quickFilterTextActive]}>
              Sleep Safe
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickFilter, selectedFilter === 'trip' && styles.quickFilterActive]}
            onPress={() => setSelectedFilter(selectedFilter === 'trip' ? 'all' : 'trip')}
          >
            <Text style={[styles.quickFilterText, selectedFilter === 'trip' && styles.quickFilterTextActive]}>
              Journey Safe
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickFilter, selectedFilter === 'voice' && styles.quickFilterActive]}
            onPress={() => setSelectedFilter(selectedFilter === 'voice' ? 'all' : 'voice')}
          >
            <Mic size={14} color={selectedFilter === 'voice' ? Colors.dark.primary : Colors.dark.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickFilter, selectedFilter === 'noVoice' && styles.quickFilterActive]}
            onPress={() => setSelectedFilter(selectedFilter === 'noVoice' ? 'all' : 'noVoice')}
          >
            <MicOff size={14} color={selectedFilter === 'noVoice' ? Colors.dark.primary : Colors.dark.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.tracksSection}>
          <Text style={styles.sectionLabel}>
            {filteredTracks.length} TRACK{filteredTracks.length !== 1 ? 'S' : ''}
          </Text>
          
          {filteredTracks.map((track: Track) => (
            <TouchableOpacity 
              key={track.id}
              style={styles.trackCard}
              onPress={() => handlePlayTrack(track)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: track.imageUrl }} style={styles.trackImage} />
              
              <View style={styles.trackContent}>
                <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.trackModality}>{track.modality}</Text>
                
                <View style={styles.trackMeta}>
                  <View style={styles.trackDuration}>
                    <Clock size={12} color={Colors.dark.textMuted} />
                    <Text style={styles.trackDurationText}>{formatDuration(track.duration)}</Text>
                  </View>
                  
                  <View style={styles.trackTags}>
                    {track.sleepSafe && (
                      <View style={styles.trackTag}>
                        <Text style={styles.trackTagText}>Sleep</Text>
                      </View>
                    )}
                    {track.tripSafe && (
                      <View style={styles.trackTag}>
                        <Text style={styles.trackTagText}>Journey</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              
              <TouchableOpacity style={styles.trackPlayButton}>
                <Play size={18} color={Colors.dark.primary} fill={Colors.dark.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
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
  sectionLabel: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  themesSection: {
    marginBottom: 30,
  },
  themesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  themeCard: {
    width: width * 0.65,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
  },
  themeImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  themeGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  themeContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  themeName: {
    ...typography.subtitle,
    color: Colors.dark.text,
  },
  themeDescription: {
    ...typography.bodySmall,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  filtersSection: {
    marginBottom: 16,
  },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.borderSubtle,
  },
  filterChipActive: {
    backgroundColor: Colors.dark.primaryGlow,
    borderColor: Colors.dark.primary,
  },
  filterChipText: {
    ...typography.bodySmall,
    color: Colors.dark.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.dark.primary,
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 30,
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
    fontSize: 10,
  },
  quickFilterTextActive: {
    color: Colors.dark.primary,
  },
  tracksSection: {
    paddingHorizontal: 20,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.borderSubtle,
  },
  trackImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: Colors.dark.surfaceElevated,
  },
  trackContent: {
    flex: 1,
    marginLeft: 14,
  },
  trackTitle: {
    ...typography.subtitle,
    color: Colors.dark.text,
    fontSize: 15,
  },
  trackModality: {
    ...typography.bodySmall,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  trackDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackDurationText: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    fontSize: 10,
  },
  trackTags: {
    flexDirection: 'row',
    gap: 6,
  },
  trackTag: {
    backgroundColor: Colors.dark.surfaceElevated,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  trackTagText: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    fontSize: 9,
  },
  trackPlayButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
