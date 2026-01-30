import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { X } from 'lucide-react-native';
import { supabase } from '@/services/supabase';
import Colors from '@/constants/colors';

interface TestUploadPanelProps {
  onClose: () => void;
}

export default function TestUploadPanel({ onClose }: TestUploadPanelProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[TestUpload] ${message}`);
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const pickAndUpload = async () => {
    setLogs([]);
    addLog('Starting file picker...');

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      addLog(`Picker result: ${JSON.stringify(result)}`);

      if (result.canceled) {
        addLog('User cancelled picker');
        return;
      }

      const file = result.assets[0];
      addLog(`Selected file: ${file.name}`);
      addLog(`File URI: ${file.uri}`);
      addLog(`File size: ${file.size} bytes`);
      addLog(`File type: ${file.mimeType}`);

      setUploading(true);

      const fileName = `test_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      addLog(`Upload path: audio/${fileName}`);

      let fileData: Blob | ArrayBuffer;

      if (Platform.OS === 'web') {
        addLog('Web platform: fetching file as blob...');
        const response = await fetch(file.uri);
        fileData = await response.blob();
        addLog(`Blob size: ${(fileData as Blob).size}`);
      } else {
        addLog('Native platform: fetching file as arraybuffer...');
        const response = await fetch(file.uri);
        fileData = await response.arrayBuffer();
        addLog(`ArrayBuffer size: ${(fileData as ArrayBuffer).byteLength}`);
      }

      addLog('Starting Supabase upload...');
      const startTime = Date.now();

      const { data, error } = await supabase.storage
        .from('audio')
        .upload(fileName, fileData, {
          contentType: file.mimeType || 'audio/mpeg',
          upsert: true,
        });

      const elapsed = Date.now() - startTime;
      addLog(`Upload took ${elapsed}ms`);

      if (error) {
        addLog(`UPLOAD ERROR: ${JSON.stringify(error, null, 2)}`);
        return;
      }

      addLog(`UPLOAD SUCCESS!`);
      addLog(`Data: ${JSON.stringify(data, null, 2)}`);

      const { data: urlData } = supabase.storage
        .from('audio')
        .getPublicUrl(fileName);

      addLog(`Public URL: ${urlData.publicUrl}`);

    } catch (err: any) {
      addLog(`EXCEPTION: ${err?.message || String(err)}`);
      addLog(`Stack: ${err?.stack || 'no stack'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Supabase Storage Test</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X color={Colors.dark.text} size={24} />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Raw upload to 'audio' bucket</Text>

      <TouchableOpacity
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={pickAndUpload}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          {uploading ? 'Uploading...' : 'Pick Audio & Upload'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => setLogs([])}
      >
        <Text style={styles.clearButtonText}>Clear Logs</Text>
      </TouchableOpacity>

      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text
            key={index}
            style={[
              styles.logText,
              log.includes('ERROR') && styles.logError,
              log.includes('SUCCESS') && styles.logSuccess,
            ]}
          >
            {log}
          </Text>
        ))}
        {logs.length === 0 && (
          <Text style={styles.placeholder}>Logs will appear here...</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.dark.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: Colors.dark.primaryMuted,
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.dark.background,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  clearButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButtonText: {
    color: Colors.dark.textMuted,
    fontSize: 14,
  },
  logContainer: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 12,
  },
  logText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  logError: {
    color: Colors.dark.error,
  },
  logSuccess: {
    color: Colors.dark.success,
  },
  placeholder: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
