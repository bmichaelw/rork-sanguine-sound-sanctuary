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

export const tracks: Track[] = [
  {
    id: '1',
    title: 'Temple of Stillness',
    duration: 180,
    imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    modality: 'Ambient Drone',
    themes: ['meditation', 'stillness'],
    intensity: 'gentle',
    hasLyrics: false,
    hasVoice: false,
    sleepSafe: true,
    tripSafe: true,
  },
  {
    id: '2',
    title: 'Golden Hour Descent',
    duration: 210,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    modality: 'Sound Bath',
    themes: ['transition', 'release'],
    intensity: 'moderate',
    hasLyrics: false,
    hasVoice: true,
    sleepSafe: true,
    tripSafe: true,
  },
  {
    id: '3',
    title: 'Ceremonial Waters',
    duration: 240,
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    modality: 'Ceremony',
    themes: ['ceremony', 'purification'],
    intensity: 'deep',
    hasLyrics: false,
    hasVoice: true,
    sleepSafe: false,
    tripSafe: true,
  },
  {
    id: '4',
    title: 'Breath of Stars',
    duration: 195,
    imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    modality: 'Breathwork',
    themes: ['breathwork', 'expansion'],
    intensity: 'moderate',
    hasLyrics: false,
    hasVoice: true,
    sleepSafe: false,
    tripSafe: true,
  },
  {
    id: '5',
    title: 'Into the Void',
    duration: 225,
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    modality: 'Deep Drone',
    themes: ['dissolution', 'void'],
    intensity: 'deep',
    hasLyrics: false,
    hasVoice: false,
    sleepSafe: true,
    tripSafe: true,
  },
  {
    id: '6',
    title: 'Lullaby for the Soul',
    duration: 165,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    modality: 'Sleep Music',
    themes: ['sleep', 'comfort'],
    intensity: 'gentle',
    hasLyrics: true,
    hasVoice: true,
    sleepSafe: true,
    tripSafe: false,
  },
  {
    id: '7',
    title: 'Sacred Geometry',
    duration: 200,
    imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    modality: 'Binaural',
    themes: ['focus', 'clarity'],
    intensity: 'moderate',
    hasLyrics: false,
    hasVoice: false,
    sleepSafe: false,
    tripSafe: true,
  },
  {
    id: '8',
    title: 'Earth Mother',
    duration: 185,
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    modality: 'Nature Sounds',
    themes: ['grounding', 'nature'],
    intensity: 'gentle',
    hasLyrics: false,
    hasVoice: false,
    sleepSafe: true,
    tripSafe: true,
  },
];

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
