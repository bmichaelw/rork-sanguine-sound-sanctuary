import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Track, tracks as allTracks } from '@/mocks/audio';

export interface FlowFilters {
  sleepSafe: boolean;
  tripSafe: boolean;
  noLyrics: boolean;
  noVoice: boolean;
  maxIntensity: 'gentle' | 'moderate' | 'deep';
}

export interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isFlowMode: boolean;
  flowFilters: FlowFilters;
  progress: number;
  duration: number;
}

const defaultFilters: FlowFilters = {
  sleepSafe: false,
  tripSafe: false,
  noLyrics: false,
  noVoice: false,
  maxIntensity: 'deep',
};

const SAVED_TRACKS_KEY = 'audio_saved_tracks';
const MEMBERSHIP_KEY = 'audio_membership';

export const [AudioProvider, useAudio] = createContextHook(() => {
  const queryClient = useQueryClient();
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlowMode, setIsFlowMode] = useState(false);
  const [flowFilters, setFlowFilters] = useState<FlowFilters>(defaultFilters);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const savedTracksQuery = useQuery({
    queryKey: ['savedTracks'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SAVED_TRACKS_KEY);
      return stored ? JSON.parse(stored) as string[] : [];
    },
  });

  const membershipQuery = useQuery({
    queryKey: ['membership'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(MEMBERSHIP_KEY);
      return stored ? JSON.parse(stored) as { isPaid: boolean; tier: string } : { isPaid: false, tier: 'free' };
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const current = savedTracksQuery.data || [];
      const updated = current.includes(trackId) 
        ? current.filter(id => id !== trackId)
        : [...current, trackId];
      await AsyncStorage.setItem(SAVED_TRACKS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['savedTracks'], data);
    },
  });

  const membershipMutation = useMutation({
    mutationFn: async (membership: { isPaid: boolean; tier: string }) => {
      await AsyncStorage.setItem(MEMBERSHIP_KEY, JSON.stringify(membership));
      return membership;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['membership'], data);
    },
  });

  const savedTrackIds = savedTracksQuery.data || [];
  const membership = membershipQuery.data || { isPaid: false, tier: 'free' };

  const getEligibleTracks = useCallback((filters: FlowFilters): Track[] => {
    return allTracks.filter(track => {
      if (filters.sleepSafe && !track.sleepSafe) return false;
      if (filters.tripSafe && !track.tripSafe) return false;
      if (filters.noLyrics && track.hasLyrics) return false;
      if (filters.noVoice && track.hasVoice) return false;
      
      const intensityOrder = ['gentle', 'moderate', 'deep'];
      const maxIndex = intensityOrder.indexOf(filters.maxIntensity);
      const trackIndex = intensityOrder.indexOf(track.intensity);
      if (trackIndex > maxIndex) return false;
      
      return true;
    });
  }, []);

  const enterFlow = useCallback((filters?: Partial<FlowFilters>) => {
    const mergedFilters = { ...flowFilters, ...filters };
    setFlowFilters(mergedFilters);
    setIsFlowMode(true);
    
    const eligible = getEligibleTracks(mergedFilters);
    if (eligible.length > 0) {
      const randomTrack = eligible[Math.floor(Math.random() * eligible.length)];
      setCurrentTrack(randomTrack);
      setDuration(randomTrack.duration);
      setProgress(0);
      setIsPlaying(true);
    }
  }, [flowFilters, getEligibleTracks]);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setDuration(track.duration);
    setProgress(0);
    setIsPlaying(true);
    setIsFlowMode(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const skipToNext = useCallback(() => {
    if (isFlowMode) {
      const eligible = getEligibleTracks(flowFilters);
      const remaining = eligible.filter(t => t.id !== currentTrack?.id);
      if (remaining.length > 0) {
        const next = remaining[Math.floor(Math.random() * remaining.length)];
        setCurrentTrack(next);
        setDuration(next.duration);
        setProgress(0);
      }
    }
  }, [isFlowMode, flowFilters, currentTrack, getEligibleTracks]);

  const exitFlow = useCallback(() => {
    setIsFlowMode(false);
    setIsPlaying(false);
    setCurrentTrack(null);
    setProgress(0);
  }, []);

  const toggleSaveTrack = useCallback((trackId: string) => {
    saveMutation.mutate(trackId);
  }, [saveMutation]);

  const isTrackSaved = useCallback((trackId: string) => {
    return savedTrackIds.includes(trackId);
  }, [savedTrackIds]);

  const setMembership = useCallback((isPaid: boolean, tier: string = 'sanguine') => {
    membershipMutation.mutate({ isPaid, tier });
  }, [membershipMutation]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= duration) {
            if (isFlowMode) {
              skipToNext();
            } else {
              setIsPlaying(false);
            }
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, duration, isFlowMode, skipToNext]);

  return {
    currentTrack,
    isPlaying,
    isFlowMode,
    flowFilters,
    progress,
    duration,
    savedTrackIds,
    membership,
    enterFlow,
    playTrack,
    togglePlayPause,
    skipToNext,
    exitFlow,
    setFlowFilters,
    toggleSaveTrack,
    isTrackSaved,
    setMembership,
    getEligibleTracks,
  };
});

export function useSavedTracks(): Track[] {
  const { savedTrackIds } = useAudio();
  return useMemo(() => {
    return allTracks.filter(track => savedTrackIds.includes(track.id));
  }, [savedTrackIds]);
}
