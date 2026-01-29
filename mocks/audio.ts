export interface Modality {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

export interface Intention {
  id: string;
  name: string;
  description: string | null;
}

export interface Soundscape {
  id: string;
  name: string;
  description: string | null;
}

export interface Chakra {
  id: string;
  name: string;
  description: string | null;
}

export interface Intensity {
  id: string;
  name: string;
}

export interface Track {
  id: string;
  title: string;
  duration: number;
  imageUrl: string;
  audioUrl: string;
  intensityId: string | null;
  intensity: Intensity | null;
  channeled: boolean;
  voice: boolean;
  words: boolean;
  sleepSafe: boolean;
  tripSafe: boolean;
  modalities: Modality[];
  intentions: Intention[];
  soundscapes: Soundscape[];
  chakras: Chakra[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  trackIds: string[];
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
