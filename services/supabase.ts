import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dnzrilaojufcvoshtdlw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuenJpbGFvanVmY3Zvc2h0ZGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzM5NTYsImV4cCI6MjA4NTEwOTk1Nn0.YDlagGBg3x-aJLfWug29Mge6BAJo1enNNlvIqMv9-Dc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
});

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const isNetworkError = err instanceof TypeError && err.message.includes('Failed to fetch');
      if (i === retries - 1 || !isNetworkError) {
        throw err;
      }
      console.log(`[Supabase] Retry ${i + 1}/${retries} after network error...`);
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Retry failed');
}

export interface SupabaseModality {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

export interface SupabaseIntention {
  id: string;
  name: string;
  description: string | null;
}

export interface SupabaseSoundscape {
  id: string;
  name: string;
  description: string | null;
}

export interface SupabaseChakra {
  id: string;
  name: string;
  description: string | null;
}

export interface SupabaseIntensity {
  id: string;
  name: string;
}

export interface SupabaseTrack {
  id: string;
  title: string;
  duration: number;
  image_url: string;
  audio_url: string;
  intensity_id: string | null;
  channeled: boolean;
  voice: boolean;
  words: boolean;
  sleep_safe: boolean;
  trip_safe: boolean;
  intensity?: SupabaseIntensity;
  modalities?: SupabaseModality[];
  intentions?: SupabaseIntention[];
  soundscapes?: SupabaseSoundscape[];
  chakras?: SupabaseChakra[];
}

export interface SupabaseCollection {
  id: string;
  name: string;
  description: string;
  image_url: string;
  track_ids: string[];
}

export async function fetchModalities(): Promise<SupabaseModality[]> {
  console.log('[Supabase] Fetching modalities...');
  try {
    const { data, error } = await supabase
      .from('modalities')
      .select('*');

    if (error) {
      console.error('[Supabase] Error fetching modalities:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch modalities: ${error.message}`);
    }

    console.log('[Supabase] Fetched modalities:', data?.length || 0);
    return data || [];
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[Supabase] Exception fetching modalities:', errorMessage);
    throw err;
  }
}

export async function fetchIntentions(): Promise<SupabaseIntention[]> {
  console.log('[Supabase] Fetching intentions...');
  try {
    const { data, error } = await supabase
      .from('intentions')
      .select('*');

    if (error) {
      console.error('[Supabase] Error fetching intentions:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch intentions: ${error.message}`);
    }

    console.log('[Supabase] Fetched intentions:', data?.length || 0);
    return data || [];
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[Supabase] Exception fetching intentions:', errorMessage);
    throw err;
  }
}

export async function fetchSoundscapes(): Promise<SupabaseSoundscape[]> {
  console.log('[Supabase] Fetching soundscapes...');
  try {
    const { data, error } = await supabase
      .from('soundscapes')
      .select('*');

    if (error) {
      console.error('[Supabase] Error fetching soundscapes:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch soundscapes: ${error.message}`);
    }

    console.log('[Supabase] Fetched soundscapes:', data?.length || 0);
    return data || [];
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[Supabase] Exception fetching soundscapes:', errorMessage);
    throw err;
  }
}

export async function fetchChakras(): Promise<SupabaseChakra[]> {
  console.log('[Supabase] Fetching chakras...');
  try {
    const { data, error } = await supabase
      .from('chakras')
      .select('*');

    if (error) {
      console.error('[Supabase] Error fetching chakras:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch chakras: ${error.message}`);
    }

    console.log('[Supabase] Fetched chakras:', data?.length || 0);
    return data || [];
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[Supabase] Exception fetching chakras:', errorMessage);
    throw err;
  }
}

export async function fetchIntensities(): Promise<SupabaseIntensity[]> {
  console.log('[Supabase] Fetching intensities...');
  try {
    const { data, error } = await supabase
      .from('intensities')
      .select('id, name');

    if (error) {
      console.error('[Supabase] Error fetching intensities:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch intensities: ${error.message}`);
    }

    console.log('[Supabase] Fetched intensities:', data?.length || 0);
    return data || [];
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[Supabase] Exception fetching intensities:', errorMessage);
    throw err;
  }
}

export async function fetchTracks(): Promise<SupabaseTrack[]> {
  console.log('[Supabase] Fetching tracks...');
  try {
    const { data: tracksData, error: tracksError } = await supabase
      .from('tracks')
      .select('id, title, duration, image_url, audio_url, intensity_id, channeled, voice, words, sleep_safe, trip_safe');

    if (tracksError) {
      console.error('[Supabase] Error fetching tracks:', JSON.stringify(tracksError, null, 2));
      throw new Error(`Failed to fetch tracks: ${tracksError.message || tracksError.code || 'Unknown error'}`);
    }

    const trackIds = (tracksData || []).map((t: any) => t.id);
    if (trackIds.length === 0) {
      return [];
    }

    const [modalitiesRes, intentionsRes, soundscapesRes, chakrasRes, intensitiesRes] = await Promise.all([
      supabase.from('track_modalities').select('track_id, modality_id').in('track_id', trackIds),
      supabase.from('track_intentions').select('track_id, intention_id').in('track_id', trackIds),
      supabase.from('track_soundscapes').select('track_id, soundscape_id').in('track_id', trackIds),
      supabase.from('track_chakras').select('track_id, chakra_id').in('track_id', trackIds),
      supabase.from('intensities').select('id, name'),
    ]);

    const [allModalities, allIntentions, allSoundscapes, allChakras] = await Promise.all([
      supabase.from('modalities').select('id, name, description, image_url'),
      supabase.from('intentions').select('id, name, description'),
      supabase.from('soundscapes').select('id, name, description'),
      supabase.from('chakras').select('id, name, description'),
    ]);

    const modalitiesMap = new Map((allModalities.data || []).map((m: any) => [m.id, m]));
    const intentionsMap = new Map((allIntentions.data || []).map((i: any) => [i.id, i]));
    const soundscapesMap = new Map((allSoundscapes.data || []).map((s: any) => [s.id, s]));
    const chakrasMap = new Map((allChakras.data || []).map((c: any) => [c.id, c]));
    const intensitiesMap = new Map((intensitiesRes.data || []).map((i: any) => [i.id, i]));

    const trackModalitiesMap = new Map<string, any[]>();
    const trackIntentionsMap = new Map<string, any[]>();
    const trackSoundscapesMap = new Map<string, any[]>();
    const trackChakrasMap = new Map<string, any[]>();

    (modalitiesRes.data || []).forEach((tm: any) => {
      const modality = modalitiesMap.get(tm.modality_id);
      if (modality) {
        const arr = trackModalitiesMap.get(tm.track_id) || [];
        arr.push(modality);
        trackModalitiesMap.set(tm.track_id, arr);
      }
    });

    (intentionsRes.data || []).forEach((ti: any) => {
      const intention = intentionsMap.get(ti.intention_id);
      if (intention) {
        const arr = trackIntentionsMap.get(ti.track_id) || [];
        arr.push(intention);
        trackIntentionsMap.set(ti.track_id, arr);
      }
    });

    (soundscapesRes.data || []).forEach((ts: any) => {
      const soundscape = soundscapesMap.get(ts.soundscape_id);
      if (soundscape) {
        const arr = trackSoundscapesMap.get(ts.track_id) || [];
        arr.push(soundscape);
        trackSoundscapesMap.set(ts.track_id, arr);
      }
    });

    (chakrasRes.data || []).forEach((tc: any) => {
      const chakra = chakrasMap.get(tc.chakra_id);
      if (chakra) {
        const arr = trackChakrasMap.get(tc.track_id) || [];
        arr.push(chakra);
        trackChakrasMap.set(tc.track_id, arr);
      }
    });

    const transformedTracks: SupabaseTrack[] = (tracksData || []).map((track: any) => ({
      id: track.id,
      title: track.title,
      duration: track.duration,
      image_url: track.image_url,
      audio_url: track.audio_url,
      intensity_id: track.intensity_id,
      channeled: track.channeled ?? false,
      voice: track.voice ?? false,
      words: track.words ?? false,
      sleep_safe: track.sleep_safe ?? false,
      trip_safe: track.trip_safe ?? false,
      intensity: track.intensity_id ? intensitiesMap.get(track.intensity_id) : undefined,
      modalities: trackModalitiesMap.get(track.id) || [],
      intentions: trackIntentionsMap.get(track.id) || [],
      soundscapes: trackSoundscapesMap.get(track.id) || [],
      chakras: trackChakrasMap.get(track.id) || [],
    }));

    console.log('[Supabase] Fetched tracks:', transformedTracks.length);
    return transformedTracks;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[Supabase] Exception fetching tracks:', errorMessage);
    throw err;
  }
}

export async function fetchTracksByModality(modalityId: string): Promise<SupabaseTrack[]> {
  console.log('[Supabase] Fetching tracks for modality:', modalityId);
  try {
    const { data: trackIdsData, error: joinError } = await supabase
      .from('track_modalities')
      .select('track_id')
      .eq('modality_id', modalityId);

    if (joinError) {
      console.error('[Supabase] Error fetching track_modalities:', JSON.stringify(joinError, null, 2));
      throw new Error(`Failed to fetch track modalities: ${joinError.message}`);
    }

    if (!trackIdsData || trackIdsData.length === 0) {
      console.log('[Supabase] No tracks found for modality:', modalityId);
      return [];
    }

    const trackIds = trackIdsData.map(t => t.track_id);
    
    const { data: tracksData, error: tracksError } = await supabase
      .from('tracks')
      .select('id, title, duration, image_url, audio_url, intensity_id, channeled, voice, words, sleep_safe, trip_safe')
      .in('id', trackIds);

    if (tracksError) {
      console.error('[Supabase] Error fetching tracks:', JSON.stringify(tracksError, null, 2));
      throw new Error(`Failed to fetch tracks: ${tracksError.message}`);
    }

    const [modalitiesRes, intentionsRes, soundscapesRes, chakrasRes, intensitiesRes] = await Promise.all([
      supabase.from('track_modalities').select('track_id, modality_id').in('track_id', trackIds),
      supabase.from('track_intentions').select('track_id, intention_id').in('track_id', trackIds),
      supabase.from('track_soundscapes').select('track_id, soundscape_id').in('track_id', trackIds),
      supabase.from('track_chakras').select('track_id, chakra_id').in('track_id', trackIds),
      supabase.from('intensities').select('id, name'),
    ]);

    const [allModalities, allIntentions, allSoundscapes, allChakras] = await Promise.all([
      supabase.from('modalities').select('id, name, description, image_url'),
      supabase.from('intentions').select('id, name, description'),
      supabase.from('soundscapes').select('id, name, description'),
      supabase.from('chakras').select('id, name, description'),
    ]);

    const modalitiesMap = new Map((allModalities.data || []).map((m: any) => [m.id, m]));
    const intentionsMap = new Map((allIntentions.data || []).map((i: any) => [i.id, i]));
    const soundscapesMap = new Map((allSoundscapes.data || []).map((s: any) => [s.id, s]));
    const chakrasMap = new Map((allChakras.data || []).map((c: any) => [c.id, c]));
    const intensitiesMap = new Map((intensitiesRes.data || []).map((i: any) => [i.id, i]));

    const trackModalitiesMap = new Map<string, any[]>();
    const trackIntentionsMap = new Map<string, any[]>();
    const trackSoundscapesMap = new Map<string, any[]>();
    const trackChakrasMap = new Map<string, any[]>();

    (modalitiesRes.data || []).forEach((tm: any) => {
      const modality = modalitiesMap.get(tm.modality_id);
      if (modality) {
        const arr = trackModalitiesMap.get(tm.track_id) || [];
        arr.push(modality);
        trackModalitiesMap.set(tm.track_id, arr);
      }
    });

    (intentionsRes.data || []).forEach((ti: any) => {
      const intention = intentionsMap.get(ti.intention_id);
      if (intention) {
        const arr = trackIntentionsMap.get(ti.track_id) || [];
        arr.push(intention);
        trackIntentionsMap.set(ti.track_id, arr);
      }
    });

    (soundscapesRes.data || []).forEach((ts: any) => {
      const soundscape = soundscapesMap.get(ts.soundscape_id);
      if (soundscape) {
        const arr = trackSoundscapesMap.get(ts.track_id) || [];
        arr.push(soundscape);
        trackSoundscapesMap.set(ts.track_id, arr);
      }
    });

    (chakrasRes.data || []).forEach((tc: any) => {
      const chakra = chakrasMap.get(tc.chakra_id);
      if (chakra) {
        const arr = trackChakrasMap.get(tc.track_id) || [];
        arr.push(chakra);
        trackChakrasMap.set(tc.track_id, arr);
      }
    });

    const transformedTracks: SupabaseTrack[] = (tracksData || []).map((track: any) => ({
      id: track.id,
      title: track.title,
      duration: track.duration,
      image_url: track.image_url,
      audio_url: track.audio_url,
      intensity_id: track.intensity_id,
      channeled: track.channeled ?? false,
      voice: track.voice ?? false,
      words: track.words ?? false,
      sleep_safe: track.sleep_safe ?? false,
      trip_safe: track.trip_safe ?? false,
      intensity: track.intensity_id ? intensitiesMap.get(track.intensity_id) : undefined,
      modalities: trackModalitiesMap.get(track.id) || [],
      intentions: trackIntentionsMap.get(track.id) || [],
      soundscapes: trackSoundscapesMap.get(track.id) || [],
      chakras: trackChakrasMap.get(track.id) || [],
    }));

    console.log('[Supabase] Fetched tracks for modality:', transformedTracks.length);
    return transformedTracks;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[Supabase] Exception fetching tracks by modality:', errorMessage);
    throw err;
  }
}

export async function fetchCollections(): Promise<SupabaseCollection[]> {
  console.log('[Supabase] Fetching collections...');
  const { data, error } = await supabase
    .from('collections')
    .select('*');

  if (error) {
    console.error('[Supabase] Error fetching collections:', error.message, error.code, error.details);
    throw new Error(`Failed to fetch collections: ${error.message}`);
  }

  console.log('[Supabase] Fetched collections:', data?.length || 0);
  return data || [];
}
