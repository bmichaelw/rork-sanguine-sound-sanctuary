import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Clock, Heart, Disc3 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useAudio, useSavedTracks } from '@/providers/AudioProvider';
import { formatDuration } from '@/mocks/audio';

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { playTrack, toggleSaveTrack, currentTrack, isPlaying, enterFlow } = useAudio();
  const savedTracks = useSavedTracks();

  const handlePlayTrack = (track: typeof savedTracks[0]) => {
    playTrack(track);
    router.push('/player');
  };

  const handleResumeFlow = () => {
    if (currentTrack) {
      router.push('/player');
    } else {
      enterFlow();
      router.push('/player');
    }
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
        <Text style={styles.title}>Your Sanctuary</Text>
        <Text style={styles.subtitle}>Saved sounds for your journey</Text>

        {currentTrack && (
          <TouchableOpacity 
            style={styles.resumeCard}
            onPress={handleResumeFlow}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.dark.primaryGlow, Colors.dark.surface]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.resumeContent}>
              <View style={styles.resumeIcon}>
                <Disc3 color={Colors.dark.primary} size={24} />
              </View>
              <View style={styles.resumeInfo}>
                <Text style={styles.resumeLabel}>Continue Listening</Text>
                <Text style={styles.resumeTitle} numberOfLines={1}>{currentTrack.title}</Text>
              </View>
              <View style={styles.resumePlay}>
                {isPlaying ? (
                  <View style={styles.playingIndicator}>
                    <View style={[styles.playingBar, styles.playingBar1]} />
                    <View style={[styles.playingBar, styles.playingBar2]} />
                    <View style={[styles.playingBar, styles.playingBar3]} />
                  </View>
                ) : (
                  <Play size={20} color={Colors.dark.primary} fill={Colors.dark.primary} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.savedSection}>
          <Text style={styles.sectionLabel}>
            {savedTracks.length} SAVED TRACK{savedTracks.length !== 1 ? 'S' : ''}
          </Text>
          
          {savedTracks.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Heart color={Colors.dark.textMuted} size={40} strokeWidth={1} />
              </View>
              <Text style={styles.emptyTitle}>No saved tracks yet</Text>
              <Text style={styles.emptyDescription}>
                Tap the heart icon on any track to save it to your sanctuary
              </Text>
            </View>
          ) : (
            savedTracks.map((track) => (
              <TouchableOpacity 
                key={track.id}
                style={styles.trackCard}
                onPress={() => handlePlayTrack(track)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: track.imageUrl }} style={styles.trackImage} />
                
                <View style={styles.trackContent}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.trackModality}>{track.modalities.map(m => m.name).join(', ') || 'No modality'}</Text>
                  
                  <View style={styles.trackMeta}>
                    <Clock size={12} color={Colors.dark.textMuted} />
                    <Text style={styles.trackDuration}>{formatDuration(track.duration)}</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.heartButton}
                  onPress={() => toggleSaveTrack(track.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Heart size={20} color={Colors.dark.primary} fill={Colors.dark.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.trackPlayButton}>
                  <Play size={18} color={Colors.dark.primary} fill={Colors.dark.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
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
  resumeCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  resumeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  resumeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeInfo: {
    flex: 1,
    marginLeft: 14,
  },
  resumeLabel: {
    ...typography.caption,
    color: Colors.dark.primary,
    fontSize: 10,
  },
  resumeTitle: {
    ...typography.subtitle,
    color: Colors.dark.text,
    marginTop: 2,
  },
  resumePlay: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 20,
  },
  playingBar: {
    width: 3,
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
  playingBar1: {
    height: 12,
  },
  playingBar2: {
    height: 20,
  },
  playingBar3: {
    height: 8,
  },
  savedSection: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    ...typography.title,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  emptyDescription: {
    ...typography.body,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
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
    gap: 4,
    marginTop: 6,
  },
  trackDuration: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    fontSize: 10,
  },
  heartButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackPlayButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
