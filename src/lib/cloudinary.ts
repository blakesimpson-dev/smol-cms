import {createHash} from 'node:crypto';
import {env} from './env';

export function cloudName(): string | undefined {
  return env('CLOUDINARY_CLOUD_NAME');
}

export function uploadFolder(isProd: boolean): string {
  const root = env('CLOUDINARY_FOLDER') ?? 'smol-cms';
  return `${root}/${isProd ? 'production' : 'preview'}`;
}

// https://cloudinary.com/documentation/authentication_signatures
export function signParams(
  params: Record<string, unknown>,
  apiSecret: string,
): string {
  const toSign = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(',') : String(v)}`)
    .join('&');

  return createHash('sha1')
    .update(toSign + apiSecret)
    .digest('hex');
}

export function uploadsConfigured(): boolean {
  return Boolean(
    cloudName() && env('CLOUDINARY_API_KEY') && env('CLOUDINARY_API_SECRET'),
  );
}

export interface UploadRequest {
  url: string;
  fields: Record<string, string>;
}

// Signed parameters for one direct browser upload; the secret stays here
export function uploadRequest(isProd: boolean): UploadRequest | null {
  const cloud = cloudName();
  const apiKey = env('CLOUDINARY_API_KEY');
  const secret = env('CLOUDINARY_API_SECRET');
  if (!cloud || !apiKey || !secret) {
    return null;
  }
  const params = {
    folder: uploadFolder(isProd),
    timestamp: String(Math.floor(Date.now() / 1000)),
    unique_filename: 'true',
    use_filename: 'true',
  };

  return {
    url: `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    fields: {...params, api_key: apiKey, signature: signParams(params, secret)},
  };
}
