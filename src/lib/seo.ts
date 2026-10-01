import {SITE} from '../content';
import type {ImageValue, Page, SectionData} from '../content/types';
import type {Meta} from '../components/document';
import {imgUrl} from './images';
import {pageHref} from './pagination';
import type {Deploy} from './env';
import {getSectionDef, pageSectionKeys} from './sections';
import {img, imgs, str} from './values';

const DESCRIPTION_LENGTH = 155;

const XML_ESCAPES: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
};

function excerpt(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= DESCRIPTION_LENGTH) {
    return flat;
  }
  const cut = flat.slice(0, DESCRIPTION_LENGTH);

  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

// The first text block and first image on the page, in section order
function leadContent(
  page: Page,
  data: Record<string, SectionData>,
): {text: string; image: ImageValue | null} {
  let text = '';
  let image: ImageValue | null = null;
  for (const key of pageSectionKeys(page)) {
    const section = getSectionDef(key);
    const values = data[key] as SectionData | undefined;
    if (!section || !values) {
      continue;
    }
    for (const f of section.fields) {
      if (!text && f.type === 'textarea') {
        text = str(values[f.name]);
      } else if (!image && f.type === 'image') {
        image = img(values[f.name]);
      } else if (!image && f.type === 'images') {
        image = imgs(values[f.name])[0] ?? null;
      }
    }
  }

  return {text, image};
}

export function pageMeta(
  page: Page,
  data: Record<string, SectionData>,
  deploy: Deploy,
  pageNumber = 1,
): Meta {
  const isHome = page.path === '/';
  const lead = leadContent(page, data);
  const title =
    page.title ?? (isHome ? SITE.defaultTitle : `${page.label} · ${SITE.name}`);

  return {
    // Later pages of a paginated view are separate pages for search engines
    title: pageNumber > 1 ? `${title} · Page ${String(pageNumber)}` : title,
    description:
      page.description ?? (excerpt(lead.text) || SITE.defaultDescription),
    canonical: deploy.siteUrl + pageHref(page.path, pageNumber),
    image: lead.image
      ? imgUrl(lead.image.id, {width: 1200, height: 630})
      : undefined,
    imageAlt: lead.image?.alt,
    // Template example: replace with the site's real structured data
    jsonLd: isHome
      ? {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE.name,
          url: deploy.siteUrl + '/',
        }
      : undefined,
  };
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, ch => XML_ESCAPES[ch] ?? ch);
}

export function sitemapXml(
  entries: Array<{url: string; lastmod: string | null}>,
): string {
  const urls = entries
    .map(e => {
      const lastmod = e.lastmod
        ? `    <lastmod>${e.lastmod.slice(0, 10)}</lastmod>\n`
        : '';

      return `  <url>\n    <loc>${escapeXml(e.url)}</loc>\n${lastmod}  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(deploy: Deploy): string {
  if (!deploy.isProd) {
    return 'User-agent: *\nDisallow: /\n';
  }

  return `User-agent: *\nDisallow: /admin\n\nSitemap: ${deploy.siteUrl}/sitemap.xml\n`;
}
