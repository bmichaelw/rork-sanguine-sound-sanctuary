import CryptoJS from 'crypto-js';

const B2_KEY_ID = process.env.EXPO_PUBLIC_B2_KEY_ID || '';
const B2_APP_KEY = process.env.EXPO_PUBLIC_B2_APP_KEY || '';
const B2_BUCKET_NAME = process.env.EXPO_PUBLIC_B2_BUCKET_NAME || 'SST-Sound-Library-Audio';

interface B2AuthResponse {
  accountId: string;
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  allowed: {
    bucketId?: string;
    bucketName?: string;
  };
}

interface B2UploadUrlResponse {
  bucketId: string;
  uploadUrl: string;
  authorizationToken: string;
}

interface B2Bucket {
  bucketId: string;
  bucketName: string;
}

let cachedAuth: B2AuthResponse | null = null;
let authExpiry: number = 0;

async function authorizeAccount(): Promise<B2AuthResponse> {
  if (cachedAuth && Date.now() < authExpiry) {
    console.log('[B2 Direct] Using cached authorization');
    return cachedAuth;
  }

  console.log('[B2 Direct] Authorizing account...');
  
  if (!B2_KEY_ID || !B2_APP_KEY) {
    throw new Error('Backblaze B2 credentials not configured');
  }

  const credentials = btoa(`${B2_KEY_ID}:${B2_APP_KEY}`);
  
  const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[B2 Direct] Authorization failed:', response.status, errorText);
    throw new Error(`B2 authorization failed: ${response.status}`);
  }

  const data: B2AuthResponse = await response.json();
  console.log('[B2 Direct] Authorization successful');
  
  cachedAuth = data;
  authExpiry = Date.now() + 23 * 60 * 60 * 1000;
  
  return data;
}

async function getBucketId(auth: B2AuthResponse): Promise<string> {
  if (auth.allowed?.bucketId) {
    console.log('[B2 Direct] Using bucketId from auth response');
    return auth.allowed.bucketId;
  }

  console.log('[B2 Direct] Fetching bucket list...');
  
  const response = await fetch(`${auth.apiUrl}/b2api/v2/b2_list_buckets`, {
    method: 'POST',
    headers: {
      'Authorization': auth.authorizationToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accountId: auth.accountId,
      bucketName: B2_BUCKET_NAME,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[B2 Direct] Failed to list buckets:', response.status, errorText);
    throw new Error(`Failed to list B2 buckets: ${response.status}`);
  }

  const data = await response.json();
  const bucket = data.buckets?.find((b: B2Bucket) => b.bucketName === B2_BUCKET_NAME);
  
  if (!bucket) {
    throw new Error(`Bucket "${B2_BUCKET_NAME}" not found`);
  }

  console.log('[B2 Direct] Found bucket:', bucket.bucketId);
  return bucket.bucketId;
}

async function getUploadUrl(auth: B2AuthResponse, bucketId: string): Promise<B2UploadUrlResponse> {
  console.log('[B2 Direct] Getting upload URL...');
  
  const response = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: 'POST',
    headers: {
      'Authorization': auth.authorizationToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucketId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[B2 Direct] Failed to get upload URL:', response.status, errorText);
    throw new Error(`Failed to get B2 upload URL: ${response.status}`);
  }

  const data = await response.json();
  console.log('[B2 Direct] Upload URL obtained');
  return data;
}

function computeSha1(arrayBuffer: ArrayBuffer): string {
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
  const hash = CryptoJS.SHA1(wordArray);
  return hash.toString(CryptoJS.enc.Hex);
}

export async function uploadToB2(
  file: Blob,
  fileName: string,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  console.log('[B2 Direct] Starting direct upload:', fileName, 'size:', file.size, 'type:', contentType);
  
  if (file.size === 0) {
    throw new Error('File is empty');
  }

  const MAX_SIZE = 500 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB`);
  }

  try {
    onProgress?.(5);
    const auth = await authorizeAccount();
    
    onProgress?.(10);
    const bucketId = await getBucketId(auth);
    
    onProgress?.(15);
    const uploadUrl = await getUploadUrl(auth, bucketId);
    
    onProgress?.(20);
    console.log('[B2 Direct] Reading file and computing SHA1...');
    const arrayBuffer = await file.arrayBuffer();
    const sha1Hash = computeSha1(arrayBuffer);
    
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const finalFileName = `${timestamp}_${safeFileName}`;
    
    console.log('[B2 Direct] Uploading file:', finalFileName, 'SHA1:', sha1Hash);
    onProgress?.(30);
    
    const uploadResponse = await fetch(uploadUrl.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': uploadUrl.authorizationToken,
        'X-Bz-File-Name': encodeURIComponent(finalFileName),
        'Content-Type': contentType,
        'Content-Length': arrayBuffer.byteLength.toString(),
        'X-Bz-Content-Sha1': sha1Hash,
      },
      body: arrayBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('[B2 Direct] Upload failed:', uploadResponse.status, errorText);
      
      if (uploadResponse.status === 401) {
        cachedAuth = null;
        authExpiry = 0;
      }
      
      throw new Error(`B2 upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('[B2 Direct] Upload result:', uploadResult);
    
    const publicUrl = `https://f005.backblazeb2.com/file/${B2_BUCKET_NAME}/${finalFileName}`;
    console.log('[B2 Direct] Upload successful:', publicUrl);
    
    onProgress?.(100);
    return publicUrl;
  } catch (error: any) {
    console.error('[B2 Direct] Upload error:', error?.message || error);
    
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      throw new Error('Network error during upload. Please check your connection and try again.');
    }
    
    throw error;
  }
}

export function clearB2AuthCache() {
  console.log('[B2 Direct] Clearing auth cache');
  cachedAuth = null;
  authExpiry = 0;
}
