import {
  createHash,
  randomBytes,
  scrypt,
  timingSafeEqual,
  type BinaryLike,
} from 'node:crypto';
import type {Context} from 'hono';
import {deleteCookie, getSignedCookie, setSignedCookie} from 'hono/cookie';
import {createMiddleware} from 'hono/factory';
import {env, type AppEnv} from './env';
import {getAuthRecord, saveAuthRecord} from './store';

const COOKIE = 'cms_session';
const MAX_AGE = 60 * 60 * 24 * 7;
const KEY_LENGTH = 64;
const FAILED_AUTH_DELAY_MS = 750;
export const MIN_PASSWORD_LENGTH = 12;

// Slows down password guessing
export function failedAuthDelay(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, FAILED_AUTH_DELAY_MS));
}

export function authConfigured(): boolean {
  return Boolean(env('ADMIN_PASSWORD') && env('SESSION_SECRET'));
}

function derive(password: string, salt: BinaryLike): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (err, key) => {
      if (err) {
        reject(err);
      } else {
        resolve(key);
      }
    });
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);

  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

async function verifyHash(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':');
  if (!salt || !key) {
    return false;
  }
  const expected = Buffer.from(key, 'hex');
  const actual = await derive(password, Buffer.from(salt, 'hex'));

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function sha256(s: string): Buffer {
  return createHash('sha256').update(s).digest();
}

// A password changed in the admin takes precedence; deleting it restores the
// ADMIN_PASSWORD env var, which is how a forgotten password gets reset
export async function checkPassword(
  isProd: boolean,
  input: string,
): Promise<boolean> {
  const record = await getAuthRecord(isProd);
  if (record) {
    return verifyHash(input, record.hash);
  }
  const expected = env('ADMIN_PASSWORD');
  if (!expected) {
    return false;
  }

  return timingSafeEqual(sha256(input), sha256(expected));
}

export async function changePassword(
  isProd: boolean,
  password: string,
): Promise<number> {
  const record = await getAuthRecord(isProd);
  const version = (record?.version ?? 0) + 1;
  await saveAuthRecord(isProd, {hash: await hashPassword(password), version});

  return version;
}

function isSecure(c: Context): boolean {
  return new URL(c.req.url).protocol === 'https:';
}

async function currentVersion(isProd: boolean): Promise<number> {
  return (await getAuthRecord(isProd))?.version ?? 0;
}

export async function startSession(
  c: Context<AppEnv>,
  version?: number,
): Promise<void> {
  const secret = env('SESSION_SECRET');
  if (!secret) {
    throw new Error('SESSION_SECRET is not set');
  }

  // The value carries its own expiry, so a copied cookie stops working after
  // MAX_AGE, and the password version, so changing the password signs out
  // other devices
  const expires = Date.now() + MAX_AGE * 1000;
  const v = version ?? (await currentVersion(c.var.deploy.isProd));
  await setSignedCookie(c, COOKIE, `${String(expires)}.${String(v)}`, secret, {
    path: '/admin',
    httpOnly: true,
    secure: isSecure(c),
    sameSite: 'Lax',
    maxAge: MAX_AGE,
  });
}

export function endSession(c: Context<AppEnv>): void {
  deleteCookie(c, COOKIE, {path: '/admin', secure: isSecure(c)});
}

export async function isLoggedIn(c: Context<AppEnv>): Promise<boolean> {
  const secret = env('SESSION_SECRET');
  if (!secret || !env('ADMIN_PASSWORD')) {
    return false;
  }
  const value = await getSignedCookie(c, secret, COOKIE);
  if (typeof value !== 'string') {
    return false;
  }
  const [expires, version] = value.split('.').map(Number);

  return (
    expires > Date.now() &&
    version === (await currentVersion(c.var.deploy.isProd))
  );
}

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  if (await isLoggedIn(c)) {
    await next();
    return;
  }
  // Saves and uploads get a status, not a redirect, so an expired session
  // doesn't navigate away from unsaved edits; the page shows a message
  if (c.req.method !== 'GET' || c.req.header('HX-Request')) {
    return c.body(null, 401);
  }

  return c.redirect('/admin/login');
});
