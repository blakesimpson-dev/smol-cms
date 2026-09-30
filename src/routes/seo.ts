import {Hono} from 'hono';
import {PAGES} from '../content';
import {edgeCache} from '../lib/cache';
import type {AppEnv} from '../lib/env';
import {pageSectionKeys} from '../lib/sections';
import {robotsTxt, sitemapXml} from '../lib/seo';
import {getSections} from '../lib/store';

export const seoRoutes = new Hono<AppEnv>();

seoRoutes.get('/robots.txt', c => {
  edgeCache(c);

  return c.text(robotsTxt(c.var.deploy));
});

seoRoutes.get('/sitemap.xml', async c => {
  const {isProd, siteUrl} = c.var.deploy;
  const entries = await Promise.all(
    PAGES.map(async page => {
      const loaded = await getSections(isProd, pageSectionKeys(page));
      const dates = Object.values(loaded)
        .map(s => s.updatedAt)
        .filter((d): d is string => d !== null)
        .sort();

      return {url: siteUrl + page.path, lastmod: dates.at(-1) ?? null};
    }),
  );
  edgeCache(c);

  return c.body(sitemapXml(entries), 200, {
    'Content-Type': 'application/xml; charset=utf-8',
  });
});
