import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

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
    console.log('[B2 Backend] Using cached authorization');
    return cachedAuth;
  }

  console.log('[B2 Backend] Authorizing account...');
  
  if (!B2_KEY_ID || !B2_APP_KEY) {
    throw new Error('Backblaze B2 credentials not configured');
  }

  const credentials = Buffer.from(`${B2_KEY_ID}:${B2_APP_KEY}`).toString('base64');
  
  const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[B2 Backend] Authorization failed:', response.status, errorText);
    throw new Error(`B2 authorization failed: ${response.status}`);
  }

  const data: B2AuthResponse = await response.json();
  console.log('[B2 Backend] Authorization successful');
  
  cachedAuth = data;
  authExpiry = Date.now() + 23 * 60 * 60 * 1000;
  
  return data;
}

async function getBucketId(auth: B2AuthResponse): Promise<string> {
  if (auth.allowed?.bucketId) {
    return auth.allowed.bucketId;
  }

  console.log('[B2 Backend] Fetching bucket list...');
  
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
    throw new Error(`Failed to list B2 buckets: ${response.status}`);
  }

  const data = await response.json();
  const bucket = data.buckets?.find((b: B2Bucket) => b.bucketName === B2_BUCKET_NAME);
  
  if (!bucket) {
    throw new Error(`Bucket "${B2_BUCKET_NAME}" not found`);
  }

  return bucket.bucketId;
}

async function getUploadUrl(auth: B2AuthResponse, bucketId: string): Promise<B2UploadUrlResponse> {
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
    throw new Error(`Failed to get B2 upload URL: ${response.status}`);
  }

  return response.json();
}

function computeSha1(buffer: Buffer): string {
  const crypto = require('crypto');
  return crypto.createHash('sha1').update(buffer).digest('hex');
}

export const b2Router = createTRPCRouter({
  upload: publicProcedure
    .input(z.object({
      fileName: z.string(),
      contentType: z.string(),
      fileData: z.string(),
    }))
    .mutation(async ({ input }) => {
      console.log('[B2 Backend] Starting upload:', input.fileName);
      
      try {
        const auth = await authorizeAccount();
        const bucketId = await getBucketId(auth);
        const uploadUrl = await getUploadUrl(auth, bucketId);
        
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        const sha1Hash = computeSha1(fileBuffer);
        
        const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const timestamp = Date.now();
        const finalFileName = `${timestamp}_${safeFileName}`;
        
        console.log('[B2 Backend] Uploading:', finalFileName, 'size:', fileBuffer.length);
        
        const uploadResponse = await fetch(uploadUrl.uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': uploadUrl.authorizationToken,
            'X-Bz-File-Name': encodeURIComponent(finalFileName),
            'Content-Type': input.contentType,
            'Content-Length': fileBuffer.length.toString(),
            'X-Bz-Content-Sha1': sha1Hash,
          },
          body: fileBuffer,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('[B2 Backend] Upload failed:', uploadResponse.status, errorText);
          
          if (uploadResponse.status === 401) {
            cachedAuth = null;
            authExpiry = 0;
          }
          
          throw new Error(`B2 upload failed: ${uploadResponse.status}`);
        }

        const publicUrl = `https://f005.backblazeb2.com/file/${B2_BUCKET_NAME}/${finalFileName}`;
        console.log('[B2 Backend] Upload successful:', publicUrl);
        
        return { url: publicUrl, fileName: finalFileName };
      } catch (error: any) {
        console.error('[B2 Backend] Error:', error?.message || error);
        throw error;
      }
    }),
});
