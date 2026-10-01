import {Hono, type Context} from 'hono';
import {FOOTER_SECTION, PAGES, SITE} from '../content';
import type {SectionData} from '../content/types';
import {PublicLayout} from '../components/public/layout';
import type {FooterContent} from '../components/public/site_footer';
import {edgeCache} from '../lib/cache';
import type {AppEnv} from '../lib/env';
import {parsePage} from '../lib/pagination';
import {pageSectionKeys} from '../lib/sections';
import {pageMeta} from '../lib/seo';
import {getSections} from '../lib/store';
import {str} from '../lib/values';
import {NotFound} from '../pages/public/not_found';
import {PageView, viewPageCount} from '../pages/public/page_view';

export const publicRoutes = new Hono<AppEnv>();

function footerContent(data: Record<string, SectionData>): FooterContent {
  const footer = data[FOOTER_SECTION];

  return {text: str(footer.text), email: str(footer.email)};
}

async function loadData(
  isProd: boolean,
  keys: string[],
): Promise<Record<string, SectionData>> {
  // Global sections come back in the same batch of reads
  const loaded = await getSections(isProd, [...keys, ...SITE.globalSections]);

  return Object.fromEntries(
    Object.entries(loaded).map(([k, v]) => [k, v.data]),
  );
}

for (const page of PAGES) {
  publicRoutes.get(page.path, async c => {
    const raw = c.req.query('page');
    // One URL per page: `?page=1` is the bare path
    if (raw === '1') {
      return c.redirect(page.path, 301);
    }
    const pageNumber = parsePage(raw);
    if (pageNumber === null) {
      return notFound(c);
    }
    const data = await loadData(c.var.deploy.isProd, pageSectionKeys(page));
    if (pageNumber > viewPageCount(page.key, data)) {
      return notFound(c);
    }
    edgeCache(c);

    return c.html(
      <PublicLayout
        meta={pageMeta(page, data, c.var.deploy, pageNumber)}
        currentPath={page.path}
        footer={footerContent(data)}
        overlayHeader={page.path === '/'}
      >
        <PageView page={page} pageNumber={pageNumber} s={data} />
      </PublicLayout>,
    );
  });
}

export async function notFound(c: Context<AppEnv>) {
  if (c.req.path.startsWith('/admin')) {
    return c.text('Not found', 404);
  }
  const data = await loadData(c.var.deploy.isProd, []);

  return c.html(
    <PublicLayout
      meta={{title: `Page not found · ${SITE.name}`, noindex: true}}
      currentPath=""
      footer={footerContent(data)}
    >
      <NotFound />
    </PublicLayout>,
    404,
  );
}
