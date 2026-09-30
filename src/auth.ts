import { createHash, timingSafeEqual } from "node:crypto";
import type { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { env, type AppEnv } from "./env";

const COOKIE = "cms_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Auth is disabled (and /admin shows a setup message) until both variables are set. */
export const authConfigured = () => Boolean(env("ADMIN_PASSWORD") && env("SESSION_SECRET"));

const digest = (s: string) => createHash("sha256").update(s).digest();

export function checkPassword(input: string): boolean {
  const expected = env("ADMIN_PASSWORD");
  if (!expected) return false;
  return timingSafeEqual(digest(input), digest(expected));
}

const secure = (c: Context) => new URL(c.req.url).protocol === "https:";

export async function startSession(c: Context<AppEnv>) {
  // The cookie value is its own expiry, so a copied cookie stops working after MAX_AGE.
  const expires = Date.now() + MAX_AGE * 1000;
  await setSignedCookie(c, COOKIE, String(expires), env("SESSION_SECRET")!, {
    path: "/admin",
    httpOnly: true,
    secure: secure(c),
    sameSite: "Lax",
    maxAge: MAX_AGE,
  });
}

export function endSession(c: Context<AppEnv>) {
  deleteCookie(c, COOKIE, { path: "/admin", secure: secure(c) });
}

export async function isLoggedIn(c: Context<AppEnv>): Promise<boolean> {
  const secret = env("SESSION_SECRET");
  if (!secret || !env("ADMIN_PASSWORD")) return false;
  const value = await getSignedCookie(c, secret, COOKIE);
  return typeof value === "string" && Number(value) > Date.now();
}

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  if (await isLoggedIn(c)) return next();
  if (c.req.header("HX-Request")) {
    // Session expired mid-edit: make htmx do a full-page redirect.
    c.header("HX-Redirect", "/admin/login");
    return c.body(null, 401);
  }
  // fetch() calls (e.g. the upload signature) need a status they can detect, not a redirect.
  if (c.req.method !== "GET") return c.body(null, 401);
  return c.redirect("/admin/login");
});
