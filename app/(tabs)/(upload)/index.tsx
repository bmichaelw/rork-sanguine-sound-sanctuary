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
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, Music, ChevronDown, Image as ImageIcon } from 'lucide-react-native';
import Colors from '@/constants/colors';
import {
  supabase,
  fetchModalities,
  fetchIntentions,
  fetchSoundscapes,
  fetchChakras,
  SupabaseModality,
  SupabaseIntention,
  SupabaseSoundscape,
  SupabaseChakra,
} from '@/services/supabase';
import { uploadToB2, testBucketAccess } from '@/services/backblaze';
import MultiSelectSection from '@/components/upload/MultiSelectSection';

interface SelectedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

type ImageInputMode = 'upload' | 'url';

type IntensityValue = 'gentle' | 'moderate' | 'deep' | 'intense';

const INTENSITY_OPTIONS: { value: IntensityValue; label: string }[] = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'deep', label: 'Deep' },
  { value: 'intense', label: 'Intense' },
];

export default function UploadScreen() {
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [audioFile, setAudioFile] = useState<SelectedFile | null>(null);
  const [imageInputMode, setImageInputMode] = useState<ImageInputMode>('upload');
  const [imageFile, setImageFile] = useState<SelectedFile | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isSample, setIsSample] = useState(false);
  const [intensity, setIntensity] = useState<IntensityValue | null>(null);
  const [words, setWords] = useState(false);
  const [voice, setVoice] = useState(false);
  const [sleepSafe, setSleepSafe] = useState(false);
  const [tripSafe, setTripSafe] = useState(false);
  const [channeled, setChanneled] = useState(false);
  const [containsDissonance, setContainsDissonance] = useState(false);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);
  const [selectedSoundscapes, setSelectedSoundscapes] = useState<string[]>([]);
  const [selectedChakras, setSelectedChakras] = useState<string[]>([]);
  
  const [expandedSection, setExpandedSection] = useState<string | null>('modalities');
  const [showIntensityPicker, setShowIntensityPicker] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const { data: modalities = [], isLoading: loadingModalities } = useQuery<SupabaseModality[]>({
    queryKey: ['modalities'],
    queryFn: fetchModalities,
  });

  const { data: intentions = [], isLoading: loadingIntentions } = useQuery<SupabaseIntention[]>({
    queryKey: ['intentions'],
    queryFn: fetchIntentions,
  });

  const { data: soundscapes = [], isLoading: loadingSoundscapes } = useQuery<SupabaseSoundscape[]>({
    queryKey: ['soundscapes'],
    queryFn: fetchSoundscapes,
  });

  const { data: chakras = [], isLoading: loadingChakras } = useQuery<SupabaseChakra[]>({
    queryKey: ['chakras'],
    queryFn: fetchChakras,
  });



  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev, logMessage]);
  }, []);

  const resetForm = useCallback(() => {
    setTitle('');
    setDuration('');
    setAudioFile(null);
    setImageInputMode('upload');
    setImageFile(null);
    setImageUrl('');
    setIsSample(false);
    setIntensity(null);
    setWords(false);
    setVoice(false);
    setSleepSafe(false);
    setTripSafe(false);
    setChanneled(false);
    setContainsDissonance(false);
    setSelectedModalities([]);
    setSelectedIntentions([]);
    setSelectedSoundscapes([]);
    setSelectedChakras([]);
    setUploadStatus('');
    setDebugLogs([]);
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      addLog('Starting upload process...');
      
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      if (!audioFile) {
        throw new Error('Audio file is required');
      }
      if (!duration.trim()) {
        throw new Error('Duration is required (in seconds)');
      }

      const durationInSeconds = parseInt(duration.trim(), 10);
      if (isNaN(durationInSeconds) || durationInSeconds <= 0) {
        throw new Error('Duration must be a valid positive number');
      }

      setUploadStatus('Reading audio file...');
      addLog(`Audio file: ${audioFile.name}, size: ${audioFile.size}, type: ${audioFile.mimeType}`);
      addLog(`Audio URI (first 80 chars): ${audioFile.uri.substring(0, 80)}`);

      let audioBlob: Blob;
      try {
        addLog('Fetching audio file from URI...');
        const audioResponse = await fetch(audioFile.uri);
        addLog(`Fetch response status: ${audioResponse.status} ${audioResponse.statusText}`);
        if (!audioResponse.ok) {
          throw new Error(`Failed to read audio file: ${audioResponse.status}`);
        }
        audioBlob = await audioResponse.blob();
        addLog(`Audio blob created, size: ${audioBlob.size} bytes (${(audioBlob.size / (1024 * 1024)).toFixed(2)} MB)`);
        
        if (audioBlob.size === 0) {
          throw new Error('Audio file is empty');
        }
      } catch (err: any) {
        addLog(`ERROR reading audio file: ${err?.message}`);
        throw new Error('Failed to read audio file. Please try again.');
      }

      setUploadStatus('Uploading audio to Backblaze B2...');
      addLog('Starting B2 upload...');
      addLog(`B2 Config - Bucket: ${process.env.EXPO_PUBLIC_B2_BUCKET_NAME}`);
      addLog(`B2 Config - Key ID exists: ${!!process.env.EXPO_PUBLIC_B2_KEY_ID}`);
      addLog(`B2 Config - App Key exists: ${!!process.env.EXPO_PUBLIC_B2_APP_KEY}`);
      
      let fileUrl: string;
      try {
        fileUrl = await uploadToB2(
          audioBlob,
          audioFile.name,
          audioFile.mimeType,
          (progress) => {
            if (progress < 30) {
              setUploadStatus('Preparing audio upload...');
              addLog(`Upload progress: ${progress}%`);
            } else if (progress < 90) {
              setUploadStatus(`Uploading audio... ${progress}%`);
              if (progress % 20 === 0) addLog(`Upload progress: ${progress}%`);
            } else {
              setUploadStatus('Finalizing audio upload...');
              addLog(`Upload progress: ${progress}%`);
            }
          }
        );
        addLog(`B2 upload SUCCESS! URL: ${fileUrl}`);
      } catch (err: any) {
        addLog(`B2 upload FAILED: ${err?.message}`);
        addLog(`Error details: ${JSON.stringify(err)}`);
        throw new Error(err?.message || 'Failed to upload audio file');
      }

      let finalImageUrl: string | null = null;
      if (imageInputMode === 'upload' && imageFile) {
        setUploadStatus('Uploading image to Backblaze B2...');
        addLog('Uploading image to B2...');
        
        try {
          const imageResponse = await fetch(imageFile.uri);
          if (!imageResponse.ok) {
            throw new Error(`Failed to read image file: ${imageResponse.status}`);
          }
          const imageBlob = await imageResponse.blob();
          addLog(`Image blob created, size: ${imageBlob.size} bytes`);
          
          finalImageUrl = await uploadToB2(
            imageBlob,
            imageFile.name,
            imageFile.mimeType,
            (progress) => {
              if (progress < 30) {
                setUploadStatus('Preparing image upload...');
              } else if (progress < 90) {
                setUploadStatus(`Uploading image... ${progress}%`);
              } else {
                setUploadStatus('Finalizing image upload...');
              }
            }
          );
          addLog(`Image upload SUCCESS! URL: ${finalImageUrl}`);
        } catch (err: any) {
          addLog(`Image upload FAILED: ${err?.message}`);
          throw new Error(`Image upload failed: ${err?.message || 'Unknown error'}`);
        }
      } else if (imageInputMode === 'url' && imageUrl.trim()) {
        finalImageUrl = imageUrl.trim();
        addLog(`Using provided image URL: ${finalImageUrl}`);
      }

      setUploadStatus('Creating track in database...');
      addLog('Creating track record in Supabase...');
      addLog(`Duration: ${durationInSeconds} seconds`);

      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .insert({
          title: title.trim(),
          artist_id: 1,
          file_url: fileUrl,
          image_url: finalImageUrl,
          duration: durationInSeconds,
          is_sample: isSample,
          intensity: intensity,
          words: words,
          voice: voice,
          sleep_safe: sleepSafe,
          trip_safe: tripSafe,
          channeled: channeled,
          contains_dissonance: containsDissonance,
        })
        .select()
        .single();

      if (trackError) {
        addLog(`Track insert ERROR: ${trackError.message}`);
        addLog(`Error details: ${JSON.stringify(trackError)}`);
        throw new Error(`Failed to create track: ${trackError.message}`);
      }

      addLog(`Track created successfully! ID: ${track.id}`);

      setUploadStatus('Saving metadata...');
      addLog('Saving join table entries (modalities, intentions, etc)...');

      const insertPromises = [];

      if (selectedModalities.length > 0) {
        insertPromises.push(
          supabase.from('track_modalities').insert(
            selectedModalities.map(id => ({ track_id: track.id, modality_id: id }))
          )
        );
      }

      if (selectedIntentions.length > 0) {
        insertPromises.push(
          supabase.from('track_intentions').insert(
            selectedIntentions.map(id => ({ track_id: track.id, intention_id: id }))
          )
        );
      }

      if (selectedSoundscapes.length > 0) {
        insertPromises.push(
          supabase.from('track_soundscapes').insert(
            selectedSoundscapes.map(id => ({ track_id: track.id, soundscape_id: id }))
          )
        );
      }

      if (selectedChakras.length > 0) {
        insertPromises.push(
          supabase.from('track_chakras').insert(
            selectedChakras.map(id => ({ track_id: track.id, chakra_id: id }))
          )
        );
      }

      if (insertPromises.length > 0) {
        await Promise.all(insertPromises);
        addLog('Metadata saved successfully!');
      } else {
        addLog('No metadata to save');
      }

      addLog('✅ UPLOAD COMPLETE!');
      return track;
    },
    onSuccess: (track) => {
      addLog(`✅ Success! Track ${track.id} uploaded`);
      setUploadStatus('');
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      queryClient.invalidateQueries({ queryKey: ['libraryStats'] });
      Alert.alert('Success', 'Track uploaded successfully!', [
        { text: 'OK', onPress: resetForm }
      ]);
    },
    onError: (error: any) => {
      addLog(`❌ UPLOAD FAILED: ${error?.message}`);
      setUploadStatus('');
      Alert.alert('Upload Failed', error?.message || 'An error occurred');
    },
  });

  const pickAudioFile = useCallback(async () => {
    console.log('[Upload] Opening audio file picker...');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('[Upload] Audio file selected:', asset.name, 'size:', asset.size);
        setAudioFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || 'audio/mpeg',
          size: asset.size,
        });
      } else {
        console.log('[Upload] Audio file picker cancelled');
      }
    } catch (error: any) {
      console.error('[Upload] Audio file picker error:', error?.message);
      Alert.alert('Error', 'Failed to select audio file');
    }
  }, []);

  const pickImageFile = useCallback(async () => {
    console.log('[Upload] Opening image file picker...');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('[Upload] Image file selected:', asset.name, 'size:', asset.size);
        setImageFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || 'image/jpeg',
          size: asset.size,
        });
      } else {
        console.log('[Upload] Image file picker cancelled');
      }
    } catch (error: any) {
      console.error('[Upload] Image file picker error:', error?.message);
      Alert.alert('Error', 'Failed to select image file');
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

  const testConnection = useCallback(async () => {
    addLog('Testing B2 connection...');
    setConnectionTestResult(null);
    try {
      const result = await testBucketAccess();
      setConnectionTestResult(result);
      addLog(`Test result: ${result.message}`);
      if (result.details) {
        addLog(`Details: ${result.details}`);
      }
    } catch (error: any) {
      addLog(`Test failed: ${error?.message}`);
      setConnectionTestResult({
        success: false,
        message: '❌ Test failed',
        details: error?.message
      });
    }
  }, [addLog]);



  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Upload Track</Text>
          <Text style={styles.headerSubtitle}>Add a new meditation track to the library</Text>
        </View>

        <View style={styles.testSection}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={testConnection}
            activeOpacity={0.7}
          >
            <Text style={styles.testButtonText}>🔍 Test B2 Connection</Text>
          </TouchableOpacity>
        </View>

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
            <View style={styles.filePickerContent}>
              <Text style={[styles.filePickerText, audioFile && styles.filePickerTextSelected]}>
                {audioFile ? audioFile.name : 'Select audio file (.mp3 or .m4a)'}
              </Text>
              {audioFile?.size && (
                <Text style={styles.fileSizeText}>
                  {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Artwork/Image</Text>
          <View style={styles.toggleModeContainer}>
            <TouchableOpacity
              style={[
                styles.toggleModeButton,
                imageInputMode === 'upload' && styles.toggleModeButtonActive,
              ]}
              onPress={() => setImageInputMode('upload')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleModeText,
                  imageInputMode === 'upload' && styles.toggleModeTextActive,
                ]}
              >
                Upload Image
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleModeButton,
                imageInputMode === 'url' && styles.toggleModeButtonActive,
              ]}
              onPress={() => setImageInputMode('url')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleModeText,
                  imageInputMode === 'url' && styles.toggleModeTextActive,
                ]}
              >
                Paste URL
              </Text>
            </TouchableOpacity>
          </View>

          {imageInputMode === 'upload' ? (
            <TouchableOpacity style={styles.filePicker} onPress={pickImageFile} activeOpacity={0.7}>
              <ImageIcon color={imageFile ? Colors.dark.primary : Colors.dark.textMuted} size={24} />
              <View style={styles.filePickerContent}>
                <Text style={[styles.filePickerText, imageFile && styles.filePickerTextSelected]}>
                  {imageFile ? imageFile.name : 'Select image file (.jpg, .png, .webp)'}
                </Text>
                {imageFile?.size && (
                  <Text style={styles.fileSizeText}>
                    {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <TextInput
              style={styles.textInput}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://f005.backblazeb2.com/file/SST-Sound-Library-Audio/..."
              placeholderTextColor={Colors.dark.textMuted}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration * (seconds)</Text>
          <TextInput
            style={styles.textInput}
            value={duration}
            onChangeText={setDuration}
            placeholder="e.g. 754"
            placeholderTextColor={Colors.dark.textMuted}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Track Properties</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Is Sample</Text>
            <Switch
              value={isSample}
              onValueChange={setIsSample}
              trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
              thumbColor={Colors.dark.text}
            />
          </View>
          <View style={[styles.toggleRow, styles.toggleRowSpacing]}>
            <Text style={styles.toggleLabel}>Contains Words</Text>
            <Switch
              value={words}
              onValueChange={setWords}
              trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
              thumbColor={Colors.dark.text}
            />
          </View>
          <View style={[styles.toggleRow, styles.toggleRowSpacing]}>
            <Text style={styles.toggleLabel}>Contains Voice</Text>
            <Switch
              value={voice}
              onValueChange={setVoice}
              trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
              thumbColor={Colors.dark.text}
            />
          </View>
          <View style={[styles.toggleRow, styles.toggleRowSpacing]}>
            <Text style={styles.toggleLabel}>Sleep Safe</Text>
            <Switch
              value={sleepSafe}
              onValueChange={setSleepSafe}
              trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
              thumbColor={Colors.dark.text}
            />
          </View>
          <View style={[styles.toggleRow, styles.toggleRowSpacing]}>
            <Text style={styles.toggleLabel}>Trip Safe</Text>
            <Switch
              value={tripSafe}
              onValueChange={setTripSafe}
              trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
              thumbColor={Colors.dark.text}
            />
          </View>
          <View style={[styles.toggleRow, styles.toggleRowSpacing]}>
            <Text style={styles.toggleLabel}>Channeled</Text>
            <Switch
              value={channeled}
              onValueChange={setChanneled}
              trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
              thumbColor={Colors.dark.text}
            />
          </View>
          <View style={[styles.toggleRow, styles.toggleRowSpacing]}>
            <Text style={styles.toggleLabel}>Contains Dissonance</Text>
            <Switch
              value={containsDissonance}
              onValueChange={setContainsDissonance}
              trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
              thumbColor={Colors.dark.text}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Intensity</Text>
          <TouchableOpacity 
            style={styles.dropdown} 
            onPress={() => setShowIntensityPicker(!showIntensityPicker)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownText, !intensity && styles.dropdownPlaceholder]}>
              {intensity ? INTENSITY_OPTIONS.find(o => o.value === intensity)?.label : 'Select intensity'}
            </Text>
            <ChevronDown color={Colors.dark.textMuted} size={20} />
          </TouchableOpacity>
          
          {showIntensityPicker && (
            <View style={styles.dropdownList}>
              {INTENSITY_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    intensity === option.value && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    setIntensity(option.value);
                    setShowIntensityPicker(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    intensity === option.value && styles.dropdownItemTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <MultiSelectSection
          sectionTitle="Modalities"
          sectionKey="modalities"
          items={modalities}
          selected={selectedModalities}
          setSelected={setSelectedModalities}
          isLoading={loadingModalities}
          expandedSection={expandedSection}
          toggleSection={toggleSection}
          toggleSelection={toggleSelection}
        />
        <MultiSelectSection
          sectionTitle="Intentions"
          sectionKey="intentions"
          items={intentions}
          selected={selectedIntentions}
          setSelected={setSelectedIntentions}
          isLoading={loadingIntentions}
          expandedSection={expandedSection}
          toggleSection={toggleSection}
          toggleSelection={toggleSelection}
        />
        <MultiSelectSection
          sectionTitle="Soundscapes"
          sectionKey="soundscapes"
          items={soundscapes}
          selected={selectedSoundscapes}
          setSelected={setSelectedSoundscapes}
          isLoading={loadingSoundscapes}
          expandedSection={expandedSection}
          toggleSection={toggleSection}
          toggleSelection={toggleSelection}
        />
        <MultiSelectSection
          sectionTitle="Chakras"
          sectionKey="chakras"
          items={chakras}
          selected={selectedChakras}
          setSelected={setSelectedChakras}
          isLoading={loadingChakras}
          expandedSection={expandedSection}
          toggleSection={toggleSection}
          toggleSelection={toggleSelection}
        />

        {debugLogs.length > 0 && (
          <View style={styles.debugContainer}>
            <View style={styles.debugHeader}>
              <Text style={styles.debugTitle}>Upload Logs</Text>
              <TouchableOpacity onPress={() => setDebugLogs([])} activeOpacity={0.7}>
                <Text style={styles.clearLogsButton}>Clear</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.debugLogContainer}
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {debugLogs.map((log, index) => (
                <Text key={index} style={styles.debugLogText}>
                  {log}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}

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
              <Text style={styles.submitButtonText}>{uploadStatus || 'Uploading...'}</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.dark.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
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
    borderWidth: 2,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
  },
  filePickerContent: {
    flex: 1,
  },
  filePickerText: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  filePickerTextSelected: {
    color: Colors.dark.text,
  },
  fileSizeText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  toggleLabel: {
    fontSize: 15,
    color: Colors.dark.text,
  },
  toggleRowSpacing: {
    marginTop: 8,
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
    fontWeight: '500' as const,
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
    fontWeight: '600' as const,
    color: Colors.dark.text,
  },
  toggleModeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  toggleModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleModeButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  toggleModeText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.dark.textMuted,
  },
  toggleModeTextActive: {
    color: Colors.dark.text,
  },
  debugContainer: {
    marginTop: 20,
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.dark.text,
  },
  clearLogsButton: {
    fontSize: 13,
    color: Colors.dark.primary,
    fontWeight: '500' as const,
  },
  debugLogContainer: {
    maxHeight: 250,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 10,
  },
  debugLogText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#00ff00',
    marginBottom: 4,
  },
  testSection: {
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  testButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.dark.text,
  },
  testResult: {
    marginTop: 12,
    borderRadius: 10,
    padding: 14,
    borderWidth: 2,
  },
  testResultSuccess: {
    backgroundColor: '#0a3d2a',
    borderColor: '#14b45c',
  },
  testResultError: {
    backgroundColor: '#3d0a0a',
    borderColor: '#b41414',
  },
  testResultText: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  testResultTextSuccess: {
    color: '#14b45c',
  },
  testResultTextError: {
    color: '#ff4444',
  },
  testResultDetails: {
    fontSize: 13,
    lineHeight: 18,
  },
});
