import { trpcClient } from "@/lib/trpc";

export async function uploadToB2(
  file: Blob,
  fileName: string,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  console.log('[B2] Starting upload via backend:', fileName, 'size:', file.size, 'type:', contentType);
  
  if (file.size === 0) {
    throw new Error('File is empty');
  }

  const MAX_SIZE = 50 * 1024 * 1024; // 50MB limit for base64 transfer
  if (file.size > MAX_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB`);
  }

  try {
    onProgress?.(10);
    
    console.log('[B2] Converting file to base64...');
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Data = btoa(binary);
    
    onProgress?.(30);
    console.log('[B2] Base64 conversion complete, uploading to backend...');
    
    const result = await trpcClient.b2.upload.mutate({
      fileName,
      contentType,
      fileData: base64Data,
    });
    
    onProgress?.(100);
    console.log('[B2] Upload successful:', result.url);
    
    return result.url;
  } catch (error: any) {
    console.error('[B2] Upload error:', error?.message || error);
    
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      throw new Error('Network error during upload. Please check your connection and try again.');
    }
    
    throw error;
  }
}

export function clearB2AuthCache() {
  console.log('[B2] Auth cache is managed by backend');
}
