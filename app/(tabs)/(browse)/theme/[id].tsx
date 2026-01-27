import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Clock, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useAudio } from '@/providers/AudioProvider';
import { tracks, themes, formatDuration } from '@/mocks/audio';

const { width } = Dimensions.get('window');

export default function ThemeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { playTrack, enterFlow } = useAudio();

  const theme = themes.find(t => t.id === id);
  const themeTracks = tracks.filter(track => 
    track.themes.includes(id || '')
  );

  if (!theme) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>Theme not found</Text>
      </View>
    );
  }

  const handlePlayTrack = (track: typeof tracks[0]) => {
    playTrack(track);
    router.push('/player');
  };

  const handlePlayAll = () => {
    if (themeTracks.length > 0) {
      playTrack(themeTracks[0]);
      router.push('/player');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft color={Colors.dark.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Image source={{ uri: theme.imageUrl }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(10,10,15,0.8)', Colors.dark.background]}
            style={styles.heroGradient}
          />
          
          <View style={[styles.heroContent, { paddingTop: insets.top + 60 }]}>
            <Text style={styles.themeName}>{theme.name}</Text>
            <Text style={styles.themeDescription}>{theme.description}</Text>
            
            <TouchableOpacity 
              style={styles.playAllButton}
              onPress={handlePlayAll}
              activeOpacity={0.8}
            >
              <Play size={18} color={Colors.dark.background} fill={Colors.dark.background} />
              <Text style={styles.playAllText}>Play All</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tracksSection}>
          <Text style={styles.sectionLabel}>
            {themeTracks.length} TRACK{themeTracks.length !== 1 ? 'S' : ''}
          </Text>
          
          {themeTracks.map((track, index) => (
            <TouchableOpacity 
              key={track.id}
              style={styles.trackCard}
              onPress={() => handlePlayTrack(track)}
              activeOpacity={0.7}
            >
              <Text style={styles.trackNumber}>{index + 1}</Text>
              
              <Image source={{ uri: track.imageUrl }} style={styles.trackImage} />
              
              <View style={styles.trackContent}>
                <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                <View style={styles.trackMeta}>
                  <Clock size={12} color={Colors.dark.textMuted} />
                  <Text style={styles.trackDuration}>{formatDuration(track.duration)}</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.trackPlayButton}>
                <Play size={16} color={Colors.dark.primary} fill={Colors.dark.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {themeTracks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No tracks in this theme yet</Text>
            </View>
          )}
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  heroSection: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  themeName: {
    ...typography.displayLarge,
    color: Colors.dark.text,
  },
  themeDescription: {
    ...typography.body,
    color: Colors.dark.textSecondary,
    marginTop: 8,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dark.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    marginTop: 24,
    alignSelf: 'flex-start',
  },
  playAllText: {
    ...typography.subtitle,
    color: Colors.dark.background,
    fontWeight: '600' as const,
  },
  tracksSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionLabel: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    marginBottom: 16,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.dark.borderSubtle,
  },
  trackNumber: {
    ...typography.body,
    color: Colors.dark.textMuted,
    width: 24,
    textAlign: 'center',
  },
  trackImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginLeft: 12,
    backgroundColor: Colors.dark.surface,
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
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trackDuration: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    fontSize: 10,
  },
  trackPlayButton: {
    width: 40,
    height: 40,
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
