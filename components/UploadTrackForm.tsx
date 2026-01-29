import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Upload,
  Music,
  Image as ImageIcon,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import {
  fetchModalities,
  fetchIntentions,
  fetchSoundscapes,
  fetchChakras,
  fetchIntensities,
  uploadFileToStorage,
  createTrack,
  UploadTrackData,
  SupabaseModality,
  SupabaseIntention,
  SupabaseSoundscape,
  SupabaseChakra,
  SupabaseIntensity,
} from '@/services/supabase';

interface UploadTrackFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface SelectedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export default function UploadTrackForm({ onClose, onSuccess }: UploadTrackFormProps) {
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [audioFile, setAudioFile] = useState<SelectedFile | null>(null);
  const [imageFile, setImageFile] = useState<SelectedFile | null>(null);
  const [intensityId, setIntensityId] = useState<string | null>(null);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);
  const [selectedSoundscapes, setSelectedSoundscapes] = useState<string[]>([]);
  const [selectedChakras, setSelectedChakras] = useState<string[]>([]);
  
  const [channeled, setChanneled] = useState(false);
  const [voice, setVoice] = useState(false);
  const [words, setWords] = useState(false);
  const [sleepSafe, setSleepSafe] = useState(false);
  const [tripSafe, setTripSafe] = useState(false);
  const [containsDissonance, setContainsDissonance] = useState(false);
  
  const [expandedSection, setExpandedSection] = useState<string | null>('modalities');
  const [showIntensityPicker, setShowIntensityPicker] = useState(false);

  const { data: modalities = [] } = useQuery<SupabaseModality[]>({
    queryKey: ['modalities'],
    queryFn: fetchModalities,
  });

  const { data: intentions = [] } = useQuery<SupabaseIntention[]>({
    queryKey: ['intentions'],
    queryFn: fetchIntentions,
  });

  const { data: soundscapes = [] } = useQuery<SupabaseSoundscape[]>({
    queryKey: ['soundscapes'],
    queryFn: fetchSoundscapes,
  });

  const { data: chakras = [] } = useQuery<SupabaseChakra[]>({
    queryKey: ['chakras'],
    queryFn: fetchChakras,
  });

  const { data: intensities = [] } = useQuery<SupabaseIntensity[]>({
    queryKey: ['intensities'],
    queryFn: fetchIntensities,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error('Title is required');
      if (!audioFile) throw new Error('Audio file is required');
      if (!imageFile) throw new Error('Cover image is required');
      if (!duration || isNaN(parseInt(duration))) throw new Error('Valid duration is required');

      console.log('[Upload] Starting upload process...');
      
      const timestamp = Date.now();
      const audioPath = `tracks/${timestamp}_${audioFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const imagePath = `covers/${timestamp}_${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      console.log('[Upload] Fetching audio file...');
      const audioResponse = await fetch(audioFile.uri);
      const audioBlob = await audioResponse.blob();
      
      console.log('[Upload] Fetching image file...');
      const imageResponse = await fetch(imageFile.uri);
      const imageBlob = await imageResponse.blob();

      console.log('[Upload] Uploading audio to storage...');
      const audioUrl = await uploadFileToStorage('audio', audioPath, audioBlob, audioFile.mimeType);
      
      console.log('[Upload] Uploading image to storage...');
      const imageUrl = await uploadFileToStorage('images', imagePath, imageBlob, imageFile.mimeType);

      const trackData: UploadTrackData = {
        title: title.trim(),
        duration: parseInt(duration),
        intensity_id: intensityId,
        channeled,
        voice,
        words,
        sleep_safe: sleepSafe,
        trip_safe: tripSafe,
        contains_dissonance: containsDissonance,
        modality_ids: selectedModalities,
        intention_ids: selectedIntentions,
        soundscape_ids: selectedSoundscapes,
        chakra_ids: selectedChakras,
      };

      console.log('[Upload] Creating track record...');
      const track = await createTrack(trackData, audioUrl, imageUrl);
      console.log('[Upload] Track created successfully:', track.id);
      
      return track;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      queryClient.invalidateQueries({ queryKey: ['libraryStats'] });
      Alert.alert('Success', 'Track uploaded successfully!', [
        { text: 'OK', onPress: onSuccess }
      ]);
    },
    onError: (error) => {
      console.error('[Upload] Error:', error);
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'An error occurred');
    },
  });

  const pickAudioFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('[Upload] Audio file selected:', asset.name);
        setAudioFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || 'audio/mpeg',
          size: asset.size,
        });
      }
    } catch (error) {
      console.error('[Upload] Error picking audio file:', error);
      Alert.alert('Error', 'Failed to select audio file');
    }
  }, []);

  const pickImageFile = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('[Upload] Image file selected:', asset.uri);
        setImageFile({
          uri: asset.uri,
          name: asset.fileName || `cover_${Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (error) {
      console.error('[Upload] Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  }, []);

  const toggleSelection = useCallback((
    id: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  }, []);

  const selectedIntensity = intensities.find(i => i.id === intensityId);

  const renderMultiSelect = (
    title: string,
    sectionKey: string,
    items: { id: string; name: string }[],
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={() => toggleSection(sectionKey)}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>
          {title} {selected.length > 0 && `(${selected.length})`}
        </Text>
        {expandedSection === sectionKey ? (
          <ChevronUp color={Colors.dark.textMuted} size={20} />
        ) : (
          <ChevronDown color={Colors.dark.textMuted} size={20} />
        )}
      </TouchableOpacity>
      
      {expandedSection === sectionKey && (
        <View style={styles.checkboxGrid}>
          {items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.checkboxItem,
                selected.includes(item.id) && styles.checkboxItemSelected
              ]}
              onPress={() => toggleSelection(item.id, selected, setSelected)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                selected.includes(item.id) && styles.checkboxChecked
              ]}>
                {selected.includes(item.id) && (
                  <Check color={Colors.dark.background} size={12} strokeWidth={3} />
                )}
              </View>
              <Text style={[
                styles.checkboxLabel,
                selected.includes(item.id) && styles.checkboxLabelSelected
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderToggle = (label: string, value: boolean, onValueChange: (v: boolean) => void) => (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
        thumbColor={Colors.dark.text}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload New Track</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X color={Colors.dark.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter track title"
            placeholderTextColor={Colors.dark.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Audio File *</Text>
          <TouchableOpacity style={styles.filePicker} onPress={pickAudioFile} activeOpacity={0.7}>
            <Music color={audioFile ? Colors.dark.primary : Colors.dark.textMuted} size={24} />
            <Text style={[styles.filePickerText, audioFile && styles.filePickerTextSelected]}>
              {audioFile ? audioFile.name : 'Select audio file (MP3, M4A)'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cover Image *</Text>
          <TouchableOpacity style={styles.filePicker} onPress={pickImageFile} activeOpacity={0.7}>
            {imageFile ? (
              <Image source={{ uri: imageFile.uri }} style={styles.imagePreview} />
            ) : (
              <ImageIcon color={Colors.dark.textMuted} size={24} />
            )}
            <Text style={[styles.filePickerText, imageFile && styles.filePickerTextSelected]}>
              {imageFile ? imageFile.name : 'Select cover image (1:1 ratio)'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration (seconds) *</Text>
          <TextInput
            style={styles.textInput}
            value={duration}
            onChangeText={setDuration}
            placeholder="Enter duration in seconds"
            placeholderTextColor={Colors.dark.textMuted}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Intensity</Text>
          <TouchableOpacity 
            style={styles.dropdown} 
            onPress={() => setShowIntensityPicker(!showIntensityPicker)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownText, !selectedIntensity && styles.dropdownPlaceholder]}>
              {selectedIntensity?.name || 'Select intensity'}
            </Text>
            <ChevronDown color={Colors.dark.textMuted} size={20} />
          </TouchableOpacity>
          
          {showIntensityPicker && (
            <View style={styles.dropdownList}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setIntensityId(null);
                  setShowIntensityPicker(false);
                }}
              >
                <Text style={styles.dropdownItemText}>None</Text>
              </TouchableOpacity>
              {intensities.map(intensity => (
                <TouchableOpacity
                  key={intensity.id}
                  style={[
                    styles.dropdownItem,
                    intensityId === intensity.id && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    setIntensityId(intensity.id);
                    setShowIntensityPicker(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    intensityId === intensity.id && styles.dropdownItemTextSelected
                  ]}>
                    {intensity.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {renderMultiSelect('Modalities', 'modalities', modalities, selectedModalities, setSelectedModalities)}
        {renderMultiSelect('Intentions', 'intentions', intentions, selectedIntentions, setSelectedIntentions)}
        {renderMultiSelect('Soundscapes', 'soundscapes', soundscapes, selectedSoundscapes, setSelectedSoundscapes)}
        {renderMultiSelect('Chakras', 'chakras', chakras, selectedChakras, setSelectedChakras)}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Properties</Text>
          <View style={styles.togglesContainer}>
            {renderToggle('Channeled', channeled, setChanneled)}
            {renderToggle('Voice', voice, setVoice)}
            {renderToggle('Words', words, setWords)}
            {renderToggle('Sleep Safe', sleepSafe, setSleepSafe)}
            {renderToggle('Trip Safe', tripSafe, setTripSafe)}
            {renderToggle('Contains Dissonance', containsDissonance, setContainsDissonance)}
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>

      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, uploadMutation.isPending && styles.submitButtonDisabled]}
          onPress={() => uploadMutation.mutate()}
          disabled={uploadMutation.isPending}
          activeOpacity={0.8}
        >
          {uploadMutation.isPending ? (
            <>
              <ActivityIndicator color={Colors.dark.text} size="small" />
              <Text style={styles.submitButtonText}>Uploading...</Text>
            </>
          ) : (
            <>
              <Upload color={Colors.dark.text} size={20} />
              <Text style={styles.submitButtonText}>Upload Track</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
  },
  filePickerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  filePickerTextSelected: {
    color: Colors.dark.text,
  },
  imagePreview: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  dropdownPlaceholder: {
    color: Colors.dark.textMuted,
  },
  dropdownList: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.dark.primaryGlow,
  },
  dropdownItemText: {
    fontSize: 15,
    color: Colors.dark.text,
  },
  dropdownItemTextSelected: {
    color: Colors.dark.primary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  checkboxItemSelected: {
    backgroundColor: Colors.dark.primaryGlow,
    borderColor: Colors.dark.primary,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.dark.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  checkboxLabelSelected: {
    color: Colors.dark.text,
    fontWeight: '500',
  },
  togglesContainer: {
    marginTop: 12,
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  toggleLabel: {
    fontSize: 15,
    color: Colors.dark.text,
  },
  footer: {
    height: 40,
  },
  submitContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    padding: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
});
