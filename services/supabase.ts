import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dnzrilaojufcvoshtdlw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuenJpbGFvanVmY3Zvc2h0ZGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzM5NTYsImV4cCI6MjA4NTEwOTk1Nn0.YDlagGBg3x-aJLfWug29Mge6BAJo1enNNlvIqMv9-Dc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseTrack {
  id: string;
  title: string;
  duration: number;
  image_url: string;
  audio_url: string;
  modality: string;
  themes: string[];
  intensity: 'gentle' | 'moderate' | 'deep';
  has_lyrics: boolean;
  has_voice: boolean;
  sleep_safe: boolean;
  trip_safe: boolean;
  created_at?: string;
}

export interface SupabaseTheme {
  id: string;
  name: string;
  description: string;
  image_url: string;
  track_count: number;
  gradient_start: string;
  gradient_end: string;
}

export interface SupabaseCollection {
  id: string;
  name: string;
  description: string;
  image_url: string;
  track_ids: string[];
}

export async function fetchTracks(): Promise<SupabaseTrack[]> {
  console.log('[Supabase] Fetching tracks...');
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Error fetching tracks:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch tracks: ${error.message || error.code || 'Unknown error'}`);
    }

    console.log('[Supabase] Fetched tracks:', data?.length || 0);
    return data || [];
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[Supabase] Exception fetching tracks:', errorMessage);
    throw err;
  }
}

export async function fetchThemes(): Promise<SupabaseTheme[]> {
  console.log('[Supabase] Fetching themes...');
  const { data, error } = await supabase
    .from('themes')
    .select('*');

  if (error) {
    console.error('[Supabase] Error fetching themes:', error.message, error.code, error.details);
    throw new Error(`Failed to fetch themes: ${error.message}`);
  }

  console.log('[Supabase] Fetched themes:', data?.length || 0);
  return data || [];
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
