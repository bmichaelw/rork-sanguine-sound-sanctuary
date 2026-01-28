import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Track, Modality, Intention, Soundscape, Chakra, Intensity } from '@/mocks/audio';
import { 
  fetchTracks, 
  fetchModalities, 
  fetchIntentions, 
  fetchSoundscapes, 
  fetchChakras, 
  fetchIntensities,
  SupabaseTrack,
  SupabaseModality,
  SupabaseIntention,
  SupabaseSoundscape,
  SupabaseChakra,
  SupabaseIntensity,
} from '@/services/supabase';

function transformModality(m: SupabaseModality): Modality {
  return {
    id: m.id,
    name: m.name,
    description: m.description,
    imageUrl: m.image_url,
  };
}

function transformIntention(i: SupabaseIntention): Intention {
  return {
    id: i.id,
    name: i.name,
    description: i.description,
  };
}

function transformSoundscape(s: SupabaseSoundscape): Soundscape {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
  };
}

function transformChakra(c: SupabaseChakra): Chakra {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
  };
}

function transformIntensity(i: SupabaseIntensity): Intensity {
  return {
    id: i.id,
    name: i.name,
    level: i.level,
    description: i.description,
  };
}

function transformTrack(track: SupabaseTrack): Track {
  return {
    id: track.id,
    title: track.title,
    duration: track.duration,
    imageUrl: track.image_url,
    audioUrl: track.audio_url,
    intensityId: track.intensity_id,
    intensity: track.intensity ? transformIntensity(track.intensity) : null,
    channeled: track.channeled,
    voice: track.voice,
    words: track.words,
    sleepSafe: track.sleep_safe,
    tripSafe: track.trip_safe,
    containsDissonance: track.contains_dissonance,
    modalities: (track.modalities || []).map(transformModality),
    intentions: (track.intentions || []).map(transformIntention),
    soundscapes: (track.soundscapes || []).map(transformSoundscape),
    chakras: (track.chakras || []).map(transformChakra),
  };
}

export interface FlowFilters {
  sleepSafe: boolean;
  tripSafe: boolean;
  noWords: boolean;
  noVoice: boolean;
  maxIntensityLevel: number;
  modalityIds: string[];
  intentionIds: string[];
  soundscapeIds: string[];
  chakraIds: string[];
}

export interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isFlowMode: boolean;
  flowFilters: FlowFilters;
  progress: number;
  duration: number;
  isLoading: boolean;
  isBuffering: boolean;
}

const defaultFilters: FlowFilters = {
  sleepSafe: false,
  tripSafe: false,
  noWords: false,
  noVoice: false,
  maxIntensityLevel: 10,
  modalityIds: [],
  intentionIds: [],
  soundscapeIds: [],
  chakraIds: [],
};

const SAVED_TRACKS_KEY = 'audio_saved_tracks';
const MEMBERSHIP_KEY = 'audio_membership';

export const [AudioProvider, useAudio] = createContextHook(() => {
  const queryClient = useQueryClient();

  const tracksQuery = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const supabaseTracks = await fetchTracks();
      return supabaseTracks.map(transformTrack);
    },
    staleTime: 1000 * 60 * 5,
  });

  const modalitiesQuery = useQuery({
    queryKey: ['modalities'],
    queryFn: async () => {
      const data = await fetchModalities();
      return data.map(transformModality);
    },
    staleTime: 1000 * 60 * 10,
  });

  const intentionsQuery = useQuery({
    queryKey: ['intentions'],
    queryFn: async () => {
      const data = await fetchIntentions();
      return data.map(transformIntention);
    },
    staleTime: 1000 * 60 * 10,
  });

  const soundscapesQuery = useQuery({
    queryKey: ['soundscapes'],
    queryFn: async () => {
      const data = await fetchSoundscapes();
      return data.map(transformSoundscape);
    },
    staleTime: 1000 * 60 * 10,
  });

  const chakrasQuery = useQuery({
    queryKey: ['chakras'],
    queryFn: async () => {
      const data = await fetchChakras();
      return data.map(transformChakra);
    },
    staleTime: 1000 * 60 * 10,
  });

  const intensitiesQuery = useQuery({
    queryKey: ['intensities'],
    queryFn: async () => {
      const data = await fetchIntensities();
      return data.map(transformIntensity);
    },
    staleTime: 1000 * 60 * 10,
  });

  const allTracks = useMemo(() => tracksQuery.data || [], [tracksQuery.data]);
  const allModalities = useMemo(() => modalitiesQuery.data || [], [modalitiesQuery.data]);
  const allIntentions = useMemo(() => intentionsQuery.data || [], [intentionsQuery.data]);
  const allSoundscapes = useMemo(() => soundscapesQuery.data || [], [soundscapesQuery.data]);
  const allChakras = useMemo(() => chakrasQuery.data || [], [chakrasQuery.data]);
  const allIntensities = useMemo(() => intensitiesQuery.data || [], [intensitiesQuery.data]);
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlowMode, setIsFlowMode] = useState(false);
  const [flowFilters, setFlowFilters] = useState<FlowFilters>(defaultFilters);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const isFlowModeRef = useRef(isFlowMode);
  const flowFiltersRef = useRef(flowFilters);
  const currentTrackRef = useRef(currentTrack);

  useEffect(() => {
    isFlowModeRef.current = isFlowMode;
  }, [isFlowMode]);

  useEffect(() => {
    flowFiltersRef.current = flowFilters;
  }, [flowFilters]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    const setupAudioMode = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });
        console.log('[AudioProvider] Audio mode configured for background playback');
      } catch (error) {
        console.error('[AudioProvider] Error setting audio mode:', error);
      }
    };
    setupAudioMode();

    return () => {
      if (soundRef.current) {
        console.log('[AudioProvider] Cleanup: unloading sound');
        soundRef.current.unloadAsync();
      }
    };
  }, []);

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

  const savedTrackIds = useMemo(() => savedTracksQuery.data || [], [savedTracksQuery.data]);
  const membership = membershipQuery.data || { isPaid: false, tier: 'free' };

  const getEligibleTracks = useCallback((filters: FlowFilters): Track[] => {
    return allTracks.filter(track => {
      if (filters.sleepSafe && !track.sleepSafe) return false;
      if (filters.tripSafe && !track.tripSafe) return false;
      if (filters.noWords && track.words) return false;
      if (filters.noVoice && track.voice) return false;
      
      if (track.intensity && track.intensity.level > filters.maxIntensityLevel) {
        return false;
      }

      if (filters.modalityIds.length > 0) {
        const trackModalityIds = track.modalities.map(m => m.id);
        if (!filters.modalityIds.some(id => trackModalityIds.includes(id))) {
          return false;
        }
      }

      if (filters.intentionIds.length > 0) {
        const trackIntentionIds = track.intentions.map(i => i.id);
        if (!filters.intentionIds.some(id => trackIntentionIds.includes(id))) {
          return false;
        }
      }

      if (filters.soundscapeIds.length > 0) {
        const trackSoundscapeIds = track.soundscapes.map(s => s.id);
        if (!filters.soundscapeIds.some(id => trackSoundscapeIds.includes(id))) {
          return false;
        }
      }

      if (filters.chakraIds.length > 0) {
        const trackChakraIds = track.chakras.map(c => c.id);
        if (!filters.chakraIds.some(id => trackChakraIds.includes(id))) {
          return false;
        }
      }
      
      return true;
    });
  }, [allTracks]);

  const loadAndPlayTrackRef = useRef<((track: Track) => Promise<void>) | null>(null);

  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('[AudioProvider] Playback error:', status.error);
      }
      return;
    }

    setIsBuffering(status.isBuffering);
    setIsPlaying(status.isPlaying);
    
    const progressSeconds = Math.floor(status.positionMillis / 1000);
    const durationSeconds = Math.floor((status.durationMillis || 0) / 1000);
    
    setProgress(progressSeconds);
    if (status.durationMillis) {
      setDuration(durationSeconds);
    }

    if (status.didJustFinish && !status.isLooping) {
      console.log('[AudioProvider] Track finished');
      if (isFlowModeRef.current) {
        const eligible = getEligibleTracks(flowFiltersRef.current);
        const remaining = eligible.filter(t => t.id !== currentTrackRef.current?.id);
        if (remaining.length > 0) {
          const next = remaining[Math.floor(Math.random() * remaining.length)];
          console.log('[AudioProvider] Flow mode: playing next track:', next.title);
          loadAndPlayTrackRef.current?.(next);
        } else {
          console.log('[AudioProvider] Flow mode: no more eligible tracks');
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    }
  }, [getEligibleTracks]);

  const loadAndPlayTrack = useCallback(async (track: Track) => {
    console.log('[AudioProvider] Loading track:', track.title);
    setIsLoading(true);

    try {
      if (soundRef.current) {
        console.log('[AudioProvider] Unloading previous sound');
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setCurrentTrack(track);
      setProgress(0);
      setDuration(track.duration);

      console.log('[AudioProvider] Creating sound from URL:', track.audioUrl);
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        handlePlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsPlaying(true);
      setIsLoading(false);
      console.log('[AudioProvider] Track loaded and playing');
    } catch (error) {
      console.error('[AudioProvider] Error loading track:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [handlePlaybackStatusUpdate]);

  useEffect(() => {
    loadAndPlayTrackRef.current = loadAndPlayTrack;
  }, [loadAndPlayTrack]);

  const enterFlow = useCallback((filters?: Partial<FlowFilters>) => {
    const mergedFilters = { ...flowFilters, ...filters };
    setFlowFilters(mergedFilters);
    setIsFlowMode(true);
    
    const eligible = getEligibleTracks(mergedFilters);
    if (eligible.length > 0) {
      const randomTrack = eligible[Math.floor(Math.random() * eligible.length)];
      console.log('[AudioProvider] Entering flow mode with track:', randomTrack.title);
      loadAndPlayTrack(randomTrack);
    }
  }, [flowFilters, getEligibleTracks, loadAndPlayTrack]);

  const playTrack = useCallback((track: Track) => {
    console.log('[AudioProvider] Playing single track:', track.title);
    setIsFlowMode(false);
    loadAndPlayTrack(track);
  }, [loadAndPlayTrack]);

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) {
      console.log('[AudioProvider] No sound loaded');
      return;
    }

    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;

      if (status.isPlaying) {
        console.log('[AudioProvider] Pausing');
        await soundRef.current.pauseAsync();
      } else {
        console.log('[AudioProvider] Resuming');
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('[AudioProvider] Error toggling play/pause:', error);
    }
  }, []);

  const skipToNext = useCallback(() => {
    if (isFlowMode) {
      const eligible = getEligibleTracks(flowFilters);
      const remaining = eligible.filter(t => t.id !== currentTrack?.id);
      if (remaining.length > 0) {
        const next = remaining[Math.floor(Math.random() * remaining.length)];
        console.log('[AudioProvider] Skipping to next track:', next.title);
        loadAndPlayTrack(next);
      }
    }
  }, [isFlowMode, flowFilters, currentTrack, getEligibleTracks, loadAndPlayTrack]);

  const seekTo = useCallback(async (positionSeconds: number) => {
    if (!soundRef.current) return;

    try {
      console.log('[AudioProvider] Seeking to:', positionSeconds);
      await soundRef.current.setPositionAsync(positionSeconds * 1000);
    } catch (error) {
      console.error('[AudioProvider] Error seeking:', error);
    }
  }, []);

  const exitFlow = useCallback(async () => {
    console.log('[AudioProvider] Exiting flow mode');
    setIsFlowMode(false);
    setIsPlaying(false);
    setCurrentTrack(null);
    setProgress(0);

    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (error) {
        console.error('[AudioProvider] Error stopping sound:', error);
      }
    }
  }, []);

  const { mutate: saveTrackMutate } = saveMutation;
  const toggleSaveTrack = useCallback((trackId: string) => {
    saveTrackMutate(trackId);
  }, [saveTrackMutate]);

  const isTrackSaved = useCallback((trackId: string) => {
    return savedTrackIds.includes(trackId);
  }, [savedTrackIds]);

  const { mutate: setMembershipMutate } = membershipMutation;
  const setMembership = useCallback((isPaid: boolean, tier: string = 'sanguine') => {
    setMembershipMutate({ isPaid, tier });
  }, [setMembershipMutate]);

  return {
    currentTrack,
    isPlaying,
    isFlowMode,
    flowFilters,
    progress,
    duration,
    isLoading,
    isBuffering,
    savedTrackIds,
    membership,
    enterFlow,
    playTrack,
    togglePlayPause,
    skipToNext,
    seekTo,
    exitFlow,
    setFlowFilters,
    toggleSaveTrack,
    isTrackSaved,
    setMembership,
    getEligibleTracks,
    allTracks,
    allModalities,
    allIntentions,
    allSoundscapes,
    allChakras,
    allIntensities,
    isLoadingTracks: tracksQuery.isLoading,
    isLoadingFilters: modalitiesQuery.isLoading || intentionsQuery.isLoading || soundscapesQuery.isLoading || chakrasQuery.isLoading || intensitiesQuery.isLoading,
    tracksError: tracksQuery.error,
    refetchTracks: tracksQuery.refetch,
  };
});

export function useSavedTracks(): Track[] {
  const { savedTrackIds, allTracks } = useAudio();
  return useMemo(() => {
    return allTracks.filter(track => savedTrackIds.includes(track.id));
  }, [savedTrackIds, allTracks]);
}
