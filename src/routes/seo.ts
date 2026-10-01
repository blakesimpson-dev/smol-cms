import {Hono} from 'hono';
import {PAGES} from '../content';
import {edgeCache} from '../lib/cache';
import type {AppEnv} from '../lib/env';
import {pageHref} from '../lib/pagination';
import {pageSectionKeys} from '../lib/sections';
import {robotsTxt, sitemapXml} from '../lib/seo';
import {getSections} from '../lib/store';
import {viewPageCount} from '../pages/public/page_view';

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
      const data = Object.fromEntries(
        Object.entries(loaded).map(([k, v]) => [k, v.data]),
      );

      const pages = viewPageCount(page.key, data);
      const lastmod = dates.at(-1) ?? null;

      // Every page of a paginated view gets its own entry
      return Array.from({length: pages}, (unused, i) => ({
        url: siteUrl + pageHref(page.path, i + 1),
        lastmod,
      }));
    }),
  );
  edgeCache(c);

  return c.body(sitemapXml(entries.flat()), 200, {
    'Content-Type': 'application/xml; charset=utf-8',
  });
});
