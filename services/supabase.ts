import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://dnzrilaojufcvoshtdlw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuenJpbGFvanVmY3Zvc2h0ZGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzM5NTYsImV4cCI6MjA4NTEwOTk1Nn0.YDlagGBg3x-aJLfWug29Mge6BAJo1enNNlvIqMv9-Dc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: AsyncStorage,
    storageKey: 'supabase-auth',
    flowType: 'pkce',
    detectSessionInUrl: Platform.OS === 'web',
    lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
      return await fn();
    },
  },
});

function isAbortError(err: any): boolean {
  if (!err) return false;
  const errorMessage = String(err?.message || err || '');
  return err?.name === 'AbortError' || 
    errorMessage.toLowerCase().includes('abort') ||
    errorMessage.includes('AbortError') ||
    errorMessage.includes('signal');
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      if (i > 0) {
        console.log(`[Supabase] Retry attempt ${i + 1}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
      return await fn();
    } catch (err: any) {
      lastError = err;
      const errorMessage = String(err?.message || err || '');
      const isAbort = isAbortError(err);
      const isNetworkError = err instanceof TypeError && errorMessage.includes('Failed to fetch');
      const isRetryable = isAbort || isNetworkError;
      
      console.log(`[Supabase] Attempt ${i + 1} failed:`, errorMessage, 'Retryable:', isRetryable);
      
      if (i < retries - 1 && isRetryable) {
        continue;
      }
      
      throw err;
    }
  }
  
  throw lastError || new Error('Retry failed');
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
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('modalities')
      .select('*');

    if (error) {
      if (isAbortError(error)) {
        return [];
      }
      console.error('[Supabase] Error fetching modalities:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch modalities: ${error.message}`);
    }

    console.log('[Supabase] Fetched modalities:', data?.length || 0);
    return data || [];
  });
}

export async function fetchIntentions(): Promise<SupabaseIntention[]> {
  console.log('[Supabase] Fetching intentions...');
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('intentions')
      .select('*');

    if (error) {
      if (isAbortError(error)) {
        return [];
      }
      console.error('[Supabase] Error fetching intentions:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch intentions: ${error.message}`);
    }

    console.log('[Supabase] Fetched intentions:', data?.length || 0);
    return data || [];
  });
}

export async function fetchSoundscapes(): Promise<SupabaseSoundscape[]> {
  console.log('[Supabase] Fetching soundscapes...');
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('soundscapes')
      .select('*');

    if (error) {
      if (isAbortError(error)) {
        return [];
      }
      console.error('[Supabase] Error fetching soundscapes:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch soundscapes: ${error.message}`);
    }

    console.log('[Supabase] Fetched soundscapes:', data?.length || 0);
    return data || [];
  });
}

export async function fetchChakras(): Promise<SupabaseChakra[]> {
  console.log('[Supabase] Fetching chakras...');
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('chakras')
      .select('*');

    if (error) {
      if (isAbortError(error)) {
        return [];
      }
      console.error('[Supabase] Error fetching chakras:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch chakras: ${error.message}`);
    }

    console.log('[Supabase] Fetched chakras:', data?.length || 0);
    return data || [];
  });
}

export async function fetchIntensities(): Promise<SupabaseIntensity[]> {
  console.log('[Supabase] Fetching intensities...');
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('intensities')
      .select('id, name');

    if (error) {
      if (isAbortError(error)) {
        return [];
      }
      console.error('[Supabase] Error fetching intensities:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch intensities: ${error.message}`);
    }

    console.log('[Supabase] Fetched intensities:', data?.length || 0);
    return data || [];
  });
}

export async function fetchTracks(): Promise<SupabaseTrack[]> {
  console.log('[Supabase] Fetching tracks with nested selects...');
  return withRetry(async () => {
    const [tracksResult, intensitiesResult] = await Promise.all([
      supabase
        .from('tracks')
        .select(`
          *,
          track_modalities(modality_id, modalities(id, name, image_url)),
          track_intentions(intention_id, intentions(id, name)),
          track_soundscapes(soundscape_id, soundscapes(id, name)),
          track_chakras(chakra_id, chakras(id, name))
        `),
      supabase.from('intensities').select('id, name')
    ]);

    if (tracksResult.error) {
      if (isAbortError(tracksResult.error)) {
        return [];
      }
      console.error('[Supabase] Error fetching tracks:', JSON.stringify(tracksResult.error, null, 2));
      throw new Error(`Failed to fetch tracks: ${tracksResult.error.message || tracksResult.error.code || 'Unknown error'}`);
    }

    const intensitiesMap = new Map<string, SupabaseIntensity>();
    (intensitiesResult.data || []).forEach((i: SupabaseIntensity) => intensitiesMap.set(i.id, i));

    console.log('[Supabase] Raw nested data sample:', JSON.stringify(tracksResult.data?.[0], null, 2));

    const transformedTracks: SupabaseTrack[] = (tracksResult.data || []).map((track: any) => ({
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
      modalities: (track.track_modalities || []).map((tm: any) => tm.modalities).filter(Boolean),
      intentions: (track.track_intentions || []).map((ti: any) => ti.intentions).filter(Boolean),
      soundscapes: (track.track_soundscapes || []).map((ts: any) => ts.soundscapes).filter(Boolean),
      chakras: (track.track_chakras || []).map((tc: any) => tc.chakras).filter(Boolean),
    }));

    console.log('[Supabase] Fetched tracks:', transformedTracks.length);
    if (transformedTracks.length > 0) {
      const sample = transformedTracks[0];
      console.log('[Supabase] Sample track data:', {
        title: sample.title,
        intensity: sample.intensity?.name,
        modalities: sample.modalities?.length || 0,
        intentions: sample.intentions?.length || 0,
        soundscapes: sample.soundscapes?.length || 0,
        chakras: sample.chakras?.length || 0,
      });
    }
    return transformedTracks;
  });
}

export async function fetchTracksByModality(modalityId: string): Promise<SupabaseTrack[]> {
  console.log('[Supabase] Fetching tracks for modality:', modalityId);
  return withRetry(async () => {
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
    
    const [tracksResult, intensitiesResult] = await Promise.all([
      supabase
        .from('tracks')
        .select(`
          *,
          track_modalities(modality_id, modalities(id, name, image_url)),
          track_intentions(intention_id, intentions(id, name)),
          track_soundscapes(soundscape_id, soundscapes(id, name)),
          track_chakras(chakra_id, chakras(id, name))
        `)
        .in('id', trackIds),
      supabase.from('intensities').select('id, name')
    ]);

    if (tracksResult.error) {
      if (isAbortError(tracksResult.error)) {
        return [];
      }
      console.error('[Supabase] Error fetching tracks:', JSON.stringify(tracksResult.error, null, 2));
      throw new Error(`Failed to fetch tracks: ${tracksResult.error.message}`);
    }

    const intensitiesMap = new Map<string, SupabaseIntensity>();
    (intensitiesResult.data || []).forEach((i: SupabaseIntensity) => intensitiesMap.set(i.id, i));

    const transformedTracks: SupabaseTrack[] = (tracksResult.data || []).map((track: any) => ({
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
      modalities: (track.track_modalities || []).map((tm: any) => tm.modalities).filter(Boolean),
      intentions: (track.track_intentions || []).map((ti: any) => ti.intentions).filter(Boolean),
      soundscapes: (track.track_soundscapes || []).map((ts: any) => ts.soundscapes).filter(Boolean),
      chakras: (track.track_chakras || []).map((tc: any) => tc.chakras).filter(Boolean),
    }));

    console.log('[Supabase] Fetched tracks for modality:', transformedTracks.length);
    return transformedTracks;
  });
}

export interface LibraryStats {
  totalTracks: number;
  tracksPerModality: { name: string; count: number }[];
}

export async function fetchLibraryStats(): Promise<LibraryStats> {
  console.log('[Supabase] Fetching library stats...');
  return withRetry(async () => {
    const [tracksResult, modalitiesResult, trackModalitiesResult] = await Promise.all([
      supabase.from('tracks').select('id', { count: 'exact', head: true }),
      supabase.from('modalities').select('id, name'),
      supabase.from('track_modalities').select('modality_id'),
    ]);

    const totalTracks = tracksResult.count || 0;
    
    const modalityCountMap = new Map<string, number>();
    (trackModalitiesResult.data || []).forEach((tm: any) => {
      const current = modalityCountMap.get(tm.modality_id) || 0;
      modalityCountMap.set(tm.modality_id, current + 1);
    });

    const tracksPerModality = (modalitiesResult.data || []).map((m: any) => ({
      name: m.name,
      count: modalityCountMap.get(m.id) || 0,
    })).sort((a, b) => b.count - a.count);

    console.log('[Supabase] Library stats:', { totalTracks, modalitiesCount: tracksPerModality.length });
    return { totalTracks, tracksPerModality };
  });
}

export async function fetchCollections(): Promise<SupabaseCollection[]> {
  console.log('[Supabase] Fetching collections...');
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*');

    if (error) {
      if (isAbortError(error)) {
        return [];
      }
      console.error('[Supabase] Error fetching collections:', error.message, error.code, error.details);
      throw new Error(`Failed to fetch collections: ${error.message}`);
    }

    console.log('[Supabase] Fetched collections:', data?.length || 0);
    return data || [];
  });
}

export interface UploadTrackData {
  title: string;
  duration: number;
  intensity_id: string | null;
  channeled: boolean;
  voice: boolean;
  words: boolean;
  sleep_safe: boolean;
  trip_safe: boolean;
  contains_dissonance: boolean;
  modality_ids: string[];
  intention_ids: string[];
  soundscape_ids: string[];
  chakra_ids: string[];
}

async function uploadWithTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${operation} timed out after ${timeoutMs / 1000} seconds`));
    }, timeoutMs);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (err) {
    clearTimeout(timeoutId!);
    throw err;
  }
}

export async function checkAuthStatus(): Promise<{ authenticated: boolean; userId?: string }> {
  try {
    console.log('[Supabase] Checking auth status...');
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Auth check timeout')), 5000);
    });
    
    const sessionPromise = supabase.auth.getSession();
    
    const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as Awaited<typeof sessionPromise>;
    
    if (error) {
      console.error('[Supabase] Auth check error:', error.message);
      return { authenticated: false };
    }
    if (session?.user) {
      console.log('[Supabase] User authenticated:', session.user.id);
      return { authenticated: true, userId: session.user.id };
    }
    console.log('[Supabase] No active session');
    return { authenticated: false };
  } catch (err: any) {
    console.error('[Supabase] Auth check exception:', err?.message || err);
    return { authenticated: false };
  }
}

export async function uploadFileToStorage(
  bucket: string,
  path: string,
  file: Blob | ArrayBuffer,
  contentType: string
): Promise<string> {
  const fileSize = file instanceof Blob ? file.size : (file as ArrayBuffer).byteLength;
  console.log(`[Supabase] Uploading file to ${bucket}/${path}, size: ${fileSize}, type: ${contentType}...`);
  
  if (fileSize === 0) {
    throw new Error('File is empty. Please select a valid file.');
  }

  console.log('[Supabase] Starting file upload (auth pre-validated by caller)...');

  try {
    console.log('[Supabase] Starting upload via SDK...');
    const startTime = Date.now();
    
    const uploadPromise = supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true,
      });
    
    const timeoutMs = 120000;
    const { data, error } = await uploadWithTimeout(uploadPromise, timeoutMs, 'Upload');
    
    const elapsed = Date.now() - startTime;
    console.log(`[Supabase] Upload completed in ${elapsed}ms`);

    if (error) {
      console.error('[Supabase] Upload error:', JSON.stringify(error, null, 2));
      
      if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        throw new Error('Upload permission denied. Please ensure you are logged in and have upload permissions.');
      }
      if (error.message?.includes('JWT') || error.message?.includes('token')) {
        throw new Error('Authentication expired. Please log in again.');
      }
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    if (!data) {
      throw new Error('Upload completed but no data returned. Please try again.');
    }

    console.log('[Supabase] Upload result:', JSON.stringify(data, null, 2));

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    console.log('[Supabase] File uploaded successfully:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (err: any) {
    console.error('[Supabase] Upload exception:', err?.message || err);
    
    if (err?.message?.includes('timed out')) {
      throw new Error('Upload timed out. The file may be too large or your connection is slow. Please try again.');
    }
    if (err?.message?.includes('bucket') && err?.message?.includes('not found')) {
      throw new Error(`Storage bucket '${bucket}' not found. Please contact support.`);
    }
    if (err?.message?.includes('unauthorized') || err?.message?.includes('not authorized')) {
      throw new Error('Not authorized to upload files. Please log in again.');
    }
    if (err?.message?.includes('Payload too large')) {
      throw new Error('File is too large. Please use a smaller file.');
    }
    if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
      throw new Error('Network error during upload. Please check your connection and try again.');
    }
    throw err;
  }
}

export async function createTrack(
  trackData: UploadTrackData,
  audioUrl: string,
  imageUrl: string
): Promise<SupabaseTrack> {
  console.log('[Supabase] Creating track:', trackData.title);

  const { data: track, error: trackError } = await supabase
    .from('tracks')
    .insert({
      title: trackData.title,
      duration: trackData.duration,
      audio_url: audioUrl,
      image_url: imageUrl,
      intensity_id: trackData.intensity_id,
      channeled: trackData.channeled,
      voice: trackData.voice,
      words: trackData.words,
      sleep_safe: trackData.sleep_safe,
      trip_safe: trackData.trip_safe,
      contains_dissonance: trackData.contains_dissonance,
    })
    .select()
    .single();

  if (trackError) {
    console.error('[Supabase] Error creating track:', JSON.stringify(trackError, null, 2));
    throw new Error(`Failed to create track: ${trackError.message}`);
  }

  console.log('[Supabase] Track created with ID:', track.id);

  const joinTablePromises: Promise<void>[] = [];

  if (trackData.modality_ids.length > 0) {
    const modalityRows = trackData.modality_ids.map(id => ({
      track_id: track.id,
      modality_id: id,
    }));
    joinTablePromises.push(
      (async () => {
        const { error } = await supabase.from('track_modalities').insert(modalityRows);
        if (error) console.error('[Supabase] Error inserting track_modalities:', error);
      })()
    );
  }

  if (trackData.intention_ids.length > 0) {
    const intentionRows = trackData.intention_ids.map(id => ({
      track_id: track.id,
      intention_id: id,
    }));
    joinTablePromises.push(
      (async () => {
        const { error } = await supabase.from('track_intentions').insert(intentionRows);
        if (error) console.error('[Supabase] Error inserting track_intentions:', error);
      })()
    );
  }

  if (trackData.soundscape_ids.length > 0) {
    const soundscapeRows = trackData.soundscape_ids.map(id => ({
      track_id: track.id,
      soundscape_id: id,
    }));
    joinTablePromises.push(
      (async () => {
        const { error } = await supabase.from('track_soundscapes').insert(soundscapeRows);
        if (error) console.error('[Supabase] Error inserting track_soundscapes:', error);
      })()
    );
  }

  if (trackData.chakra_ids.length > 0) {
    const chakraRows = trackData.chakra_ids.map(id => ({
      track_id: track.id,
      chakra_id: id,
    }));
    joinTablePromises.push(
      (async () => {
        const { error } = await supabase.from('track_chakras').insert(chakraRows);
        if (error) console.error('[Supabase] Error inserting track_chakras:', error);
      })()
    );
  }

  await Promise.all(joinTablePromises);
  console.log('[Supabase] All join table rows created');

  return track as SupabaseTrack;
}
