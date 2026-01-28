import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dnzrilaojufcvoshtdlw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuenJpbGFvanVmY3Zvc2h0ZGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzM5NTYsImV4cCI6MjA4NTEwOTk1Nn0.YDlagGBg3x-aJLfWug29Mge6BAJo1enNNlvIqMv9-Dc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  level: number;
  description: string | null;
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
  contains_dissonance: boolean;
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
      .select('*')
      .order('level', { ascending: true });

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
    const { data, error } = await supabase
      .from('tracks')
      .select(`
        id,
        title,
        duration,
        image_url,
        audio_url,
        intensity_id,
        channeled,
        voice,
        words,
        sleep_safe,
        trip_safe,
        contains_dissonance,
        intensity:intensities(id, name, level, description),
        track_modalities(modality:modalities(id, name, description, image_url)),
        track_intentions(intention:intentions(id, name, description)),
        track_soundscapes(soundscape:soundscapes(id, name, description)),
        track_chakras(chakra:chakras(id, name, description))
      `);

    if (error) {
      console.error('[Supabase] Error fetching tracks:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch tracks: ${error.message || error.code || 'Unknown error'}`);
    }

    const transformedTracks: SupabaseTrack[] = (data || []).map((track: any) => ({
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
      contains_dissonance: track.contains_dissonance ?? false,
      intensity: track.intensity || null,
      modalities: (track.track_modalities || [])
        .map((tm: any) => tm.modality)
        .filter(Boolean),
      intentions: (track.track_intentions || [])
        .map((ti: any) => ti.intention)
        .filter(Boolean),
      soundscapes: (track.track_soundscapes || [])
        .map((ts: any) => ts.soundscape)
        .filter(Boolean),
      chakras: (track.track_chakras || [])
        .map((tc: any) => tc.chakra)
        .filter(Boolean),
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
    const { data: trackIds, error: joinError } = await supabase
      .from('track_modalities')
      .select('track_id')
      .eq('modality_id', modalityId);

    if (joinError) {
      console.error('[Supabase] Error fetching track_modalities:', JSON.stringify(joinError, null, 2));
      throw new Error(`Failed to fetch track modalities: ${joinError.message}`);
    }

    if (!trackIds || trackIds.length === 0) {
      console.log('[Supabase] No tracks found for modality:', modalityId);
      return [];
    }

    const ids = trackIds.map(t => t.track_id);
    
    const { data, error } = await supabase
      .from('tracks')
      .select(`
        id,
        title,
        duration,
        image_url,
        audio_url,
        intensity_id,
        channeled,
        voice,
        words,
        sleep_safe,
        trip_safe,
        contains_dissonance,
        intensity:intensities(id, name, level, description),
        track_modalities(modality:modalities(id, name, description, image_url)),
        track_intentions(intention:intentions(id, name, description)),
        track_soundscapes(soundscape:soundscapes(id, name, description)),
        track_chakras(chakra:chakras(id, name, description))
      `)
      .in('id', ids);

    if (error) {
      console.error('[Supabase] Error fetching tracks:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch tracks: ${error.message}`);
    }

    const transformedTracks: SupabaseTrack[] = (data || []).map((track: any) => ({
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
      contains_dissonance: track.contains_dissonance ?? false,
      intensity: track.intensity || null,
      modalities: (track.track_modalities || [])
        .map((tm: any) => tm.modality)
        .filter(Boolean),
      intentions: (track.track_intentions || [])
        .map((ti: any) => ti.intention)
        .filter(Boolean),
      soundscapes: (track.track_soundscapes || [])
        .map((ts: any) => ts.soundscape)
        .filter(Boolean),
      chakras: (track.track_chakras || [])
        .map((tc: any) => tc.chakra)
        .filter(Boolean),
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
