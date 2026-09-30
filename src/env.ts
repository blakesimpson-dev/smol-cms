import type { Context as NetlifyContext } from "@netlify/functions";
import { createMiddleware } from "hono/factory";

export type Deploy = {
  /** True only on the production deploy (not previews, branch deploys or `netlify dev`) */
  isProd: boolean;
  /** Canonical origin without a trailing slash, e.g. https://example.com */
  siteUrl: string;
};

export type AppEnv = {
  Bindings: { netlify?: NetlifyContext };
  Variables: { deploy: Deploy };
};

export const env = (name: string): string | undefined => process.env[name] || undefined;

export const deployInfo = createMiddleware<AppEnv>(async (c, next) => {
  const netlify = c.env?.netlify;
  const isProd = netlify?.deploy.context === "production";
  const siteUrl = (env("SITE_URL") ?? netlify?.site.url ?? new URL(c.req.url).origin).replace(/\/+$/, "");
  c.set("deploy", { isProd, siteUrl });
  await next();
  // Keep preview/branch/dev deploys out of search results.
  if (!isProd) c.header("X-Robots-Tag", "noindex");
});
