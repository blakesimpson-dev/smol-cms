import {purgeCache} from '@netlify/functions';
import type {Context} from 'hono';

const CACHE_TAG = 'content';

// Cached at Netlify's edge until content changes or a new deploy
export function edgeCache(c: Context): void {
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');
  c.header(
    'Netlify-CDN-Cache-Control',
    'public, durable, s-maxage=31536000, stale-while-revalidate=60',
  );
  c.header('Netlify-Cache-Tag', CACHE_TAG);
  // Gallery pages are cached separately; other query strings share an entry
  c.header('Netlify-Vary', 'query=page');
}

export async function purgeContentCache(): Promise<void> {
  try {
    await purgeCache({tags: [CACHE_TAG]});
  } catch (err) {
    // Not available in `netlify dev`, where pages aren't edge-cached anyway
    console.warn('Cache purge skipped:', err);
  }
}
