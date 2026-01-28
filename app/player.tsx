import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  SkipForward, 
  Heart,
  Volume2,
  Repeat,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useAudio } from '@/providers/AudioProvider';
import { formatDuration } from '@/mocks/audio';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    currentTrack, 
    isPlaying, 
    isFlowMode,
    togglePlayPause, 
    skipToNext,
    seekTo,
    progress,
    duration,
    isLoading,
    isBuffering,
    toggleSaveTrack,
    isTrackSaved,
  } = useAudio();

  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const breatheAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const artworkScale = useRef(new Animated.Value(1)).current;

  const handleProgressBarLayout = (event: LayoutChangeEvent) => {
    setProgressBarWidth(event.nativeEvent.layout.width);
  };

  const handleSeek = (event: GestureResponderEvent) => {
    if (progressBarWidth === 0 || duration === 0) return;
    
    const locationX = event.nativeEvent.locationX;
    const percentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
    const newPosition = Math.floor(percentage * duration);
    
    setSeekPosition(newPosition);
    setIsSeeking(true);
  };

  const handleSeekRelease = () => {
    if (isSeeking) {
      console.log('[Player] Seeking to:', seekPosition);
      seekTo(seekPosition);
      setIsSeeking(false);
    }
  };

  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.08,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    if (isPlaying) {
      breathe.start();
      pulse.start();
    }

    return () => {
      breathe.stop();
      pulse.stop();
    };
  }, [isPlaying, breatheAnim, pulseAnim]);

  useEffect(() => {
    Animated.spring(artworkScale, {
      toValue: isPlaying ? 1 : 0.95,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [isPlaying, artworkScale]);

  const handlePlayPause = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    togglePlayPause();
  };

  const handleSkip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    skipToNext();
  };

  const handleSave = () => {
    if (currentTrack) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      toggleSaveTrack(currentTrack.id);
    }
  };

  if (!currentTrack) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>No track playing</Text>
      </View>
    );
  }

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const isSaved = isTrackSaved(currentTrack.id);

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: currentTrack.imageUrl }} 
        style={styles.backgroundImage}
        blurRadius={50}
      />
      <LinearGradient
        colors={['rgba(10,10,15,0.7)', 'rgba(10,10,15,0.95)', Colors.dark.background]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronDown color={Colors.dark.textSecondary} size={28} />
        </TouchableOpacity>
        
        {isFlowMode && (
          <View style={styles.flowBadge}>
            <Repeat color={Colors.dark.primary} size={12} />
            <Text style={styles.flowBadgeText}>Flow Mode</Text>
          </View>
        )}
        
        <View style={styles.placeholder} />
      </View>

      <View style={styles.artworkContainer}>
        <Animated.View style={[styles.artworkGlow, { opacity: pulseAnim }]} />
        <Animated.View 
          style={[
            styles.artworkWrapper,
            { 
              transform: [
                { scale: Animated.multiply(artworkScale, breatheAnim) }
              ] 
            }
          ]}
        >
          <Image source={{ uri: currentTrack.imageUrl }} style={styles.artwork} />
        </Animated.View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{currentTrack.title}</Text>
        <Text style={styles.modality}>{currentTrack.modalities.map(m => m.name).join(', ') || 'Sound Therapy'}</Text>
        
        <View style={styles.tags}>
          {currentTrack.sleepSafe && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Sleep Safe</Text>
            </View>
          )}
          {currentTrack.tripSafe && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Journey Safe</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleSeek}
          onPressOut={handleSeekRelease}
          onLayout={handleProgressBarLayout}
          style={styles.progressBarTouchable}
        >
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${isSeeking ? (seekPosition / duration) * 100 : progressPercent}%` }]} />
            <View style={[styles.progressThumb, { left: `${isSeeking ? (seekPosition / duration) * 100 : progressPercent}%` }]} />
          </View>
        </TouchableOpacity>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatDuration(isSeeking ? seekPosition : progress)}</Text>
          <Text style={styles.timeText}>{formatDuration(duration)}</Text>
        </View>
        {isBuffering && (
          <View style={styles.bufferingContainer}>
            <ActivityIndicator size="small" color={Colors.dark.primary} />
            <Text style={styles.bufferingText}>Buffering...</Text>
          </View>
        )}
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 40 }]}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleSave}
        >
          <Heart 
            color={isSaved ? Colors.dark.primary : Colors.dark.textMuted} 
            size={24}
            fill={isSaved ? Colors.dark.primary : 'transparent'}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.playButton}
          onPress={handlePlayPause}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[Colors.dark.primaryGlow, 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.dark.primary} />
          ) : isPlaying ? (
            <Pause color={Colors.dark.primary} size={36} fill={Colors.dark.primary} />
          ) : (
            <Play color={Colors.dark.primary} size={36} fill={Colors.dark.primary} />
          )}
        </TouchableOpacity>

        {isFlowMode ? (
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleSkip}
          >
            <SkipForward color={Colors.dark.textMuted} size={24} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.secondaryButton}>
            <Volume2 color={Colors.dark.textMuted} size={24} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dark.primaryGlow,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  flowBadgeText: {
    ...typography.caption,
    color: Colors.dark.primary,
    fontSize: 10,
  },
  placeholder: {
    width: 44,
  },
  artworkContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  artworkGlow: {
    position: 'absolute',
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.375,
    backgroundColor: Colors.dark.primary,
  },
  artworkWrapper: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 30,
  },
  title: {
    ...typography.displayMedium,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  modality: {
    ...typography.body,
    color: Colors.dark.textMuted,
    marginTop: 8,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  tag: {
    backgroundColor: Colors.dark.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.borderSubtle,
  },
  tagText: {
    ...typography.caption,
    color: Colors.dark.textMuted,
    fontSize: 9,
  },
  progressContainer: {
    paddingHorizontal: 40,
    marginTop: 30,
  },
  progressBarTouchable: {
    paddingVertical: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.dark.surface,
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.primary,
    marginLeft: -6,
  },
  bufferingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  bufferingText: {
    ...typography.caption,
    color: Colors.dark.textMuted,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  timeText: {
    ...typography.bodySmall,
    color: Colors.dark.textMuted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginTop: 30,
  },
  secondaryButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  emptyText: {
    ...typography.body,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginTop: 100,
  },
});
