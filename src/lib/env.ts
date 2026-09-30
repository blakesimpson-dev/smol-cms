import type {Context as NetlifyContext} from '@netlify/functions';
import {createMiddleware} from 'hono/factory';

export interface Deploy {
  isProd: boolean;
  siteUrl: string;
}

export interface AppEnv {
  Bindings: {netlify?: NetlifyContext};
  Variables: {deploy: Deploy};
}

export function env(name: string): string | undefined {
  const value = process.env[name];
  return value === '' ? undefined : value;
}

export const deployInfo = createMiddleware<AppEnv>(async (c, next) => {
  const netlify = c.env.netlify;
  const isProd = netlify?.deploy.context === 'production';
  const siteUrl = (
    env('SITE_URL') ??
    netlify?.site.url ??
    new URL(c.req.url).origin
  ).replace(/\/+$/, '');
  c.set('deploy', {isProd, siteUrl});
  await next();
  if (!isProd) {
    c.header('X-Robots-Tag', 'noindex');
  }
});
