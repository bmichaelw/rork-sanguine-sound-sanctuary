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

  console.log('[B2 Direct] ============================================');
  console.log('[B2 Direct] Authorizing account...');
  console.log('[B2 Direct] B2_KEY_ID:', B2_KEY_ID ? `${B2_KEY_ID.substring(0, 8)}...` : 'MISSING');
  console.log('[B2 Direct] B2_APP_KEY:', B2_APP_KEY ? `${B2_APP_KEY.substring(0, 8)}...` : 'MISSING');
  console.log('[B2 Direct] B2_BUCKET_NAME:', B2_BUCKET_NAME);
  
  if (!B2_KEY_ID || !B2_APP_KEY) {
    console.error('[B2 Direct] ❌ CREDENTIALS MISSING');
    throw new Error('Backblaze B2 credentials not configured');
  }

  const credentials = btoa(`${B2_KEY_ID}:${B2_APP_KEY}`);
  console.log('[B2 Direct] Credentials encoded, making request to B2...');
  
  try {
    const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    });

    console.log('[B2 Direct] Auth response status:', response.status);
    console.log('[B2 Direct] Auth response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[B2 Direct] ❌ Authorization failed:', response.status, errorText);
      throw new Error(`B2 authorization failed: ${response.status} - ${errorText}`);
    }

    const data: B2AuthResponse = await response.json();
    console.log('[B2 Direct] ✅ Authorization successful');
    console.log('[B2 Direct] Account ID:', data.accountId);
    console.log('[B2 Direct] API URL:', data.apiUrl);
    console.log('[B2 Direct] Download URL:', data.downloadUrl);
    
    cachedAuth = data;
    authExpiry = Date.now() + 23 * 60 * 60 * 1000;
    
    return data;
  } catch (error: any) {
    console.error('[B2 Direct] ❌ Authorization exception:');
    console.error('[B2 Direct] Error name:', error?.name);
    console.error('[B2 Direct] Error message:', error?.message);
    console.error('[B2 Direct] Error stack:', error?.stack);
    throw error;
  }
}

async function getBucketId(auth: B2AuthResponse): Promise<string> {
  if (auth.allowed?.bucketId) {
    console.log('[B2 Direct] ✅ Using bucketId from auth response:', auth.allowed.bucketId);
    return auth.allowed.bucketId;
  }

  console.log('[B2 Direct] Fetching bucket list...');
  console.log('[B2 Direct] API URL:', auth.apiUrl);
  
  try {
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

    console.log('[B2 Direct] List buckets response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[B2 Direct] ❌ Failed to list buckets:', response.status, errorText);
      throw new Error(`Failed to list B2 buckets: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[B2 Direct] Buckets found:', data.buckets?.length || 0);
    const bucket = data.buckets?.find((b: B2Bucket) => b.bucketName === B2_BUCKET_NAME);
    
    if (!bucket) {
      console.error('[B2 Direct] ❌ Bucket not found:', B2_BUCKET_NAME);
      console.error('[B2 Direct] Available buckets:', data.buckets?.map((b: B2Bucket) => b.bucketName).join(', '));
      throw new Error(`Bucket "${B2_BUCKET_NAME}" not found`);
    }

    console.log('[B2 Direct] ✅ Found bucket:', bucket.bucketId);
    return bucket.bucketId;
  } catch (error: any) {
    console.error('[B2 Direct] ❌ Get bucket exception:');
    console.error('[B2 Direct] Error name:', error?.name);
    console.error('[B2 Direct] Error message:', error?.message);
    throw error;
  }
}

async function getUploadUrl(auth: B2AuthResponse, bucketId: string): Promise<B2UploadUrlResponse> {
  console.log('[B2 Direct] Getting upload URL...');
  console.log('[B2 Direct] Bucket ID:', bucketId);
  
  try {
    const response = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        'Authorization': auth.authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bucketId }),
    });

    console.log('[B2 Direct] Get upload URL response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[B2 Direct] ❌ Failed to get upload URL:', response.status, errorText);
      throw new Error(`Failed to get B2 upload URL: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[B2 Direct] ✅ Upload URL obtained');
    console.log('[B2 Direct] Upload URL:', data.uploadUrl?.substring(0, 50) + '...');
    return data;
  } catch (error: any) {
    console.error('[B2 Direct] ❌ Get upload URL exception:');
    console.error('[B2 Direct] Error name:', error?.name);
    console.error('[B2 Direct] Error message:', error?.message);
    throw error;
  }
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
  console.log('[B2 Direct] ============================================');
  console.log('[B2 Direct] STARTING UPLOAD');
  console.log('[B2 Direct] File name:', fileName);
  console.log('[B2 Direct] File size:', file.size, 'bytes', '(', (file.size / 1024 / 1024).toFixed(2), 'MB )');
  console.log('[B2 Direct] Content type:', contentType);
  console.log('[B2 Direct] Blob type:', file.type);
  console.log('[B2 Direct] ============================================');
  
  if (file.size === 0) {
    console.error('[B2 Direct] ❌ File is empty!');
    throw new Error('File is empty');
  }

  const MAX_SIZE = 500 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    console.error('[B2 Direct] ❌ File too large:', file.size, 'bytes');
    throw new Error(`File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB`);
  }

  try {
    console.log('[B2 Direct] Step 1/6: Authorizing account...');
    onProgress?.(5);
    const auth = await authorizeAccount();
    console.log('[B2 Direct] ✅ Step 1/6 complete');
    
    console.log('[B2 Direct] Step 2/6: Getting bucket ID...');
    onProgress?.(10);
    const bucketId = await getBucketId(auth);
    console.log('[B2 Direct] ✅ Step 2/6 complete');
    
    console.log('[B2 Direct] Step 3/6: Getting upload URL...');
    onProgress?.(15);
    const uploadUrl = await getUploadUrl(auth, bucketId);
    console.log('[B2 Direct] ✅ Step 3/6 complete');
    
    console.log('[B2 Direct] Step 4/6: Reading file and computing SHA1...');
    onProgress?.(20);
    const arrayBuffer = await file.arrayBuffer();
    console.log('[B2 Direct] ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');
    
    const sha1Hash = computeSha1(arrayBuffer);
    console.log('[B2 Direct] SHA1 hash:', sha1Hash);
    
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const finalFileName = `${timestamp}_${safeFileName}`;
    console.log('[B2 Direct] Final filename:', finalFileName);
    console.log('[B2 Direct] ✅ Step 4/6 complete');
    
    console.log('[B2 Direct] Step 5/6: Uploading to B2...');
    console.log('[B2 Direct] Upload URL:', uploadUrl.uploadUrl);
    console.log('[B2 Direct] Headers:');
    console.log('[B2 Direct]   X-Bz-File-Name:', encodeURIComponent(finalFileName));
    console.log('[B2 Direct]   Content-Type:', contentType);
    console.log('[B2 Direct]   Content-Length:', arrayBuffer.byteLength);
    console.log('[B2 Direct]   X-Bz-Content-Sha1:', sha1Hash);
    onProgress?.(30);
    
    const uploadStartTime = Date.now();
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
    const uploadEndTime = Date.now();
    const uploadDuration = (uploadEndTime - uploadStartTime) / 1000;

    console.log('[B2 Direct] Upload response received in', uploadDuration.toFixed(2), 'seconds');
    console.log('[B2 Direct] Response status:', uploadResponse.status);
    console.log('[B2 Direct] Response ok:', uploadResponse.ok);
    console.log('[B2 Direct] Response status text:', uploadResponse.statusText);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('[B2 Direct] ❌ Upload failed!');
      console.error('[B2 Direct] Status:', uploadResponse.status);
      console.error('[B2 Direct] Error:', errorText);
      
      if (uploadResponse.status === 401) {
        console.log('[B2 Direct] Clearing cached auth due to 401');
        cachedAuth = null;
        authExpiry = 0;
      }
      
      throw new Error(`B2 upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('[B2 Direct] ✅ Step 5/6 complete');
    console.log('[B2 Direct] Upload result:', JSON.stringify(uploadResult, null, 2));
    
    console.log('[B2 Direct] Step 6/6: Constructing public URL...');
    const publicUrl = `https://f005.backblazeb2.com/file/${B2_BUCKET_NAME}/${finalFileName}`;
    console.log('[B2 Direct] ✅ Step 6/6 complete');
    console.log('[B2 Direct] ============================================');
    console.log('[B2 Direct] ✅✅✅ UPLOAD SUCCESSFUL ✅✅✅');
    console.log('[B2 Direct] Public URL:', publicUrl);
    console.log('[B2 Direct] Total time:', uploadDuration.toFixed(2), 'seconds');
    console.log('[B2 Direct] Upload speed:', ((file.size / 1024 / 1024) / uploadDuration).toFixed(2), 'MB/s');
    console.log('[B2 Direct] ============================================');
    
    onProgress?.(100);
    return publicUrl;
  } catch (error: any) {
    console.error('[B2 Direct] ============================================');
    console.error('[B2 Direct] ❌❌❌ UPLOAD FAILED ❌❌❌');
    console.error('[B2 Direct] Error type:', typeof error);
    console.error('[B2 Direct] Error name:', error?.name);
    console.error('[B2 Direct] Error message:', error?.message);
    console.error('[B2 Direct] Error code:', error?.code);
    console.error('[B2 Direct] Error stack:', error?.stack);
    console.error('[B2 Direct] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('[B2 Direct] ============================================');
    
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError') || error?.name === 'TypeError') {
      console.error('[B2 Direct] This is a network/fetch error');
      console.error('[B2 Direct] Possible causes:');
      console.error('[B2 Direct]   - Network connectivity issues');
      console.error('[B2 Direct]   - CORS issues (web only)');
      console.error('[B2 Direct]   - Request timeout');
      console.error('[B2 Direct]   - SSL/TLS certificate issues');
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
