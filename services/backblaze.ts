import CryptoJS from 'crypto-js';

const B2_KEY_ID = process.env.EXPO_PUBLIC_B2_KEY_ID || '';
const B2_APP_KEY = process.env.EXPO_PUBLIC_B2_APP_KEY || '';
const B2_BUCKET_NAME = process.env.EXPO_PUBLIC_B2_BUCKET_NAME || 'SST-Sound-Library-Audio';
const B2_ENDPOINT = 's3.us-east-005.backblazeb2.com';

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

async function testBucketAccess(): Promise<{ success: boolean; message: string }> {
  console.log('[B2 Test] Testing bucket accessibility...');
  
  try {
    const testUrl = `https://${B2_ENDPOINT}/${B2_BUCKET_NAME}/`;
    console.log('[B2 Test] Test URL:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'HEAD',
    });
    
    console.log('[B2 Test] Response status:', response.status);
    
    if (response.status === 0) {
      return {
        success: false,
        message: 'CORS not configured: The browser blocked the request. You must add CORS rules to your B2 bucket.'
      };
    }
    
    return { success: true, message: 'Bucket is accessible' };
  } catch (error: any) {
    console.error('[B2 Test] Error:', error?.message);
    if (error?.message?.includes('Failed to fetch')) {
      return {
        success: false,
        message: 'CORS ERROR: Your B2 bucket must have CORS rules configured to allow browser uploads.'
      };
    }
    return { success: false, message: error?.message || 'Unknown error' };
  }
}

export async function uploadToB2(
  file: Blob,
  fileName: string,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  console.log('[B2 S3] ============================================');
  console.log('[B2 S3] STARTING S3-COMPATIBLE UPLOAD');
  console.log('[B2 S3] File name:', fileName);
  console.log('[B2 S3] File size:', file.size, 'bytes', '(', (file.size / 1024 / 1024).toFixed(2), 'MB )');
  console.log('[B2 S3] Content type:', contentType);
  console.log('[B2 S3] Endpoint:', B2_ENDPOINT);
  console.log('[B2 S3] Bucket:', B2_BUCKET_NAME);
  console.log('[B2 S3] ============================================');
  
  if (!B2_KEY_ID || !B2_APP_KEY) {
    throw new Error('B2 credentials not configured');
  }

  if (file.size === 0) {
    throw new Error('File is empty');
  }

  const MAX_SIZE = 500 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB`);
  }

  console.log('[B2 S3] Running pre-flight check...');
  const accessTest = await testBucketAccess();
  console.log('[B2 S3] Pre-flight result:', accessTest.message);
  
  if (!accessTest.success) {
    console.error('[B2 S3] ❌ Pre-flight check failed!');
    console.error('[B2 S3]');
    console.error('[B2 S3] ⚠️  CORS CONFIGURATION REQUIRED ⚠️');
    console.error('[B2 S3]');
    console.error('[B2 S3] Your Backblaze B2 bucket needs CORS configured.');
    console.error('[B2 S3]');
    console.error('[B2 S3] HOW TO FIX:');
    console.error('[B2 S3] 1. Go to: https://secure.backblaze.com/b2_buckets.htm');
    console.error('[B2 S3] 2. Click on bucket:', B2_BUCKET_NAME);
    console.error('[B2 S3] 3. Click "Bucket Settings"');
    console.error('[B2 S3] 4. Scroll to "CORS Rules" section');
    console.error('[B2 S3] 5. Click "Add a CORS Rule"');
    console.error('[B2 S3] 6. Paste this JSON:');
    console.error('[B2 S3]');
    console.error('[B2 S3] {');
    console.error('[B2 S3]   "corsRuleName": "allowWebUpload",');
    console.error('[B2 S3]   "allowedOrigins": ["*"],');
    console.error('[B2 S3]   "allowedOperations": ["s3_put", "s3_get", "s3_head"],');
    console.error('[B2 S3]   "allowedHeaders": ["*"],');
    console.error('[B2 S3]   "exposeHeaders": ["ETag", "x-amz-request-id"],');
    console.error('[B2 S3]   "maxAgeSeconds": 3600');
    console.error('[B2 S3] }');
    console.error('[B2 S3]');
    console.error('[B2 S3] 7. Click "Save"');
    console.error('[B2 S3] 8. Wait 1-2 minutes for changes to propagate');
    console.error('[B2 S3] 9. Try uploading again');
    console.error('[B2 S3]');
    throw new Error(`❌ CORS NOT CONFIGURED: Your B2 bucket "${B2_BUCKET_NAME}" must have CORS rules. Check the debug logs above for step-by-step instructions.`);
  }

  try {
    onProgress?.(10);
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const finalFileName = `${timestamp}_${safeFileName}`;
    console.log('[B2 S3] Final filename:', finalFileName);
    
    onProgress?.(20);
    console.log('[B2 S3] Reading file...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('[B2 S3] File read, size:', arrayBuffer.byteLength);
    
    onProgress?.(30);
    console.log('[B2 S3] Computing content MD5...');
    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
    const md5Hash = CryptoJS.MD5(wordArray);
    const contentMD5 = CryptoJS.enc.Base64.stringify(md5Hash);
    console.log('[B2 S3] MD5:', contentMD5);
    
    const dateString = new Date().toUTCString();
    const stringToSign = `PUT\n${contentMD5}\n${contentType}\n${dateString}\n/${B2_BUCKET_NAME}/${finalFileName}`;
    console.log('[B2 S3] String to sign:', stringToSign);
    
    const signature = CryptoJS.HmacSHA1(stringToSign, B2_APP_KEY);
    const authorizationHeader = `AWS ${B2_KEY_ID}:${CryptoJS.enc.Base64.stringify(signature)}`;
    
    const uploadUrl = `https://${B2_ENDPOINT}/${B2_BUCKET_NAME}/${finalFileName}`;
    console.log('[B2 S3] Upload URL:', uploadUrl);
    console.log('[B2 S3] Authorization:', authorizationHeader.substring(0, 30) + '...');
    console.log('[B2 S3] Date:', dateString);
    console.log('[B2 S3] Content-MD5:', contentMD5);
    
    onProgress?.(40);
    console.log('[B2 S3] Starting upload...');
    const uploadStartTime = Date.now();
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': authorizationHeader,
        'Content-Type': contentType,
        'Content-MD5': contentMD5,
        'Date': dateString,
        'x-amz-acl': 'public-read',
      },
      body: arrayBuffer,
    });
    
    const uploadEndTime = Date.now();
    const uploadDuration = (uploadEndTime - uploadStartTime) / 1000;

    console.log('[B2 S3] Upload complete in', uploadDuration.toFixed(2), 'seconds');
    console.log('[B2 S3] Response status:', uploadResponse.status, uploadResponse.statusText);
    console.log('[B2 S3] Response headers:');
    uploadResponse.headers.forEach((value, key) => {
      console.log(`[B2 S3]   ${key}: ${value}`);
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('[B2 S3] ❌ Upload failed!');
      console.error('[B2 S3] Status:', uploadResponse.status);
      console.error('[B2 S3] Error body:', errorText);
      
      if (uploadResponse.status === 0 || errorText.includes('CORS')) {
        throw new Error(`CORS ERROR: Your B2 bucket "${B2_BUCKET_NAME}" needs CORS configuration. See console logs for details.`);
      }
      
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const publicUrl = `https://f005.backblazeb2.com/file/${B2_BUCKET_NAME}/${finalFileName}`;
    console.log('[B2 S3] ============================================');
    console.log('[B2 S3] ✅✅✅ UPLOAD SUCCESSFUL ✅✅✅');
    console.log('[B2 S3] Public URL:', publicUrl);
    console.log('[B2 S3] Upload speed:', ((file.size / 1024 / 1024) / uploadDuration).toFixed(2), 'MB/s');
    console.log('[B2 S3] ============================================');
    
    onProgress?.(100);
    return publicUrl;
  } catch (error: any) {
    console.error('[B2 S3] ============================================');
    console.error('[B2 S3] ❌❌❌ UPLOAD FAILED ❌❌❌');
    console.error('[B2 S3] Error:', error?.message);
    console.error('[B2 S3] Error name:', error?.name);
    console.error('[B2 S3] ============================================');
    
    if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
      console.error('[B2 S3] This is a CORS/network error!');
      console.error('[B2 S3]');
      console.error('[B2 S3] ACTION REQUIRED:');
      console.error('[B2 S3] 1. Go to Backblaze B2 Console');
      console.error('[B2 S3] 2. Select bucket:', B2_BUCKET_NAME);
      console.error('[B2 S3] 3. Go to "Bucket Settings" > "CORS Rules"');
      console.error('[B2 S3] 4. Add this CORS rule:');
      console.error('[B2 S3]');
      console.error('[B2 S3] {');
      console.error('[B2 S3]   "corsRuleName": "allowWebUpload",');
      console.error('[B2 S3]   "allowedOrigins": ["*"],');
      console.error('[B2 S3]   "allowedOperations": ["s3_put", "s3_post", "s3_get"],');
      console.error('[B2 S3]   "allowedHeaders": ["*"],');
      console.error('[B2 S3]   "exposeHeaders": ["ETag"],');
      console.error('[B2 S3]   "maxAgeSeconds": 3600');
      console.error('[B2 S3] }');
      console.error('[B2 S3]');
      throw new Error(`CORS ERROR: Cannot upload from browser. Your B2 bucket "${B2_BUCKET_NAME}" must have CORS configured. Check the debug logs for instructions.`);
    }
    
    throw error;
  }
}

export function clearB2AuthCache() {
  console.log('[B2 Direct] Clearing auth cache');
  cachedAuth = null;
  authExpiry = 0;
}
