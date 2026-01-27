import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Pause } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAudio } from '@/providers/AudioProvider';
import { formatDuration } from '@/mocks/audio';

export default function MiniPlayer() {
  const router = useRouter();
  const { currentTrack, isPlaying, togglePlayPause, progress, duration } = useAudio();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handlePress = () => {
    router.push('/player');
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      
      <View style={styles.content}>
        <Image source={{ uri: currentTrack.imageUrl }} style={styles.artwork} />
        
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.subtitle}>{formatDuration(progress)} / {formatDuration(duration)}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.playButton} 
          onPress={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isPlaying ? (
            <Pause color={Colors.dark.primary} size={24} fill={Colors.dark.primary} />
          ) : (
            <Play color={Colors.dark.primary} size={24} fill={Colors.dark.primary} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 85,
    left: 0,
    right: 0,
    backgroundColor: Colors.dark.surfaceElevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.dark.border,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 2,
    backgroundColor: Colors.dark.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 14,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: Colors.dark.surface,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  playButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
