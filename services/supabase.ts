import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dnzrilaojufcvoshtdlw.supabase.co';
const supabaseAnonKey = 'sb_publishable_iCJX9nBaYhzPHwFM-xFWxg_qiYenXMI';

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
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching tracks:', error);
    throw error;
  }

  console.log('[Supabase] Fetched tracks:', data?.length || 0);
  return data || [];
}

export async function fetchThemes(): Promise<SupabaseTheme[]> {
  console.log('[Supabase] Fetching themes...');
  const { data, error } = await supabase
    .from('themes')
    .select('*');

  if (error) {
    console.error('[Supabase] Error fetching themes:', error);
    throw error;
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
    console.error('[Supabase] Error fetching collections:', error);
    throw error;
  }

  console.log('[Supabase] Fetched collections:', data?.length || 0);
  return data || [];
}
