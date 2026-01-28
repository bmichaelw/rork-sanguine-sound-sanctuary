export interface Track {
  id: string;
  title: string;
  duration: number;
  imageUrl: string;
  audioUrl: string;
  modality: string;
  themes: string[];
  intensity: 'gentle' | 'moderate' | 'deep';
  hasLyrics: boolean;
  hasVoice: boolean;
  sleepSafe: boolean;
  tripSafe: boolean;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  trackCount: number;
  gradient: [string, string];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  trackIds: string[];
}

export const tracks: Track[] = [];

export const themes: Theme[] = [
  {
    id: 'sleep',
    name: 'Sleep',
    description: 'Gentle journeys into rest',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
    trackCount: 12,
    gradient: ['#1a1a2e', '#16213e'],
  },
  {
    id: 'meditation',
    name: 'Meditation',
    description: 'Stillness and presence',
    imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800',
    trackCount: 18,
    gradient: ['#2d132c', '#1a1a2e'],
  },
  {
    id: 'ceremony',
    name: 'Ceremony',
    description: 'Sacred space for deep work',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    trackCount: 8,
    gradient: ['#1a1a2e', '#0f0f1a'],
  },
  {
    id: 'breathwork',
    name: 'Breathwork',
    description: 'Guided breath journeys',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    trackCount: 6,
    gradient: ['#1e3a5f', '#1a1a2e'],
  },
];

export const collections: Collection[] = [
  {
    id: '1',
    name: 'First Journey',
    description: 'A gentle introduction to sound therapy',
    imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800',
    trackIds: ['1', '6', '8'],
  },
  {
    id: '2',
    name: 'Deep Rest',
    description: 'For those nights when sleep feels far',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
    trackIds: ['1', '5', '6', '8'],
  },
  {
    id: '3',
    name: 'Ceremony Preparation',
    description: 'Set and setting for sacred work',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    trackIds: ['2', '3', '4', '5'],
  },
];

export const modalities = [
  'All',
  'Ambient Drone',
  'Sound Bath',
  'Ceremony',
  'Breathwork',
  'Deep Drone',
  'Sleep Music',
  'Binaural',
  'Nature Sounds',
];

export const intensityLevels = ['gentle', 'moderate', 'deep'] as const;

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
