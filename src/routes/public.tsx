import {Hono, type Context} from 'hono';
import {FOOTER_SECTION, PAGES, SITE} from '../content';
import type {SectionData} from '../content/types';
import {PublicLayout} from '../components/public/layout';
import type {FooterContent} from '../components/public/site_footer';
import {edgeCache} from '../lib/cache';
import type {AppEnv} from '../lib/env';
import {pageSectionKeys} from '../lib/sections';
import {pageMeta} from '../lib/seo';
import {getSection, getSections} from '../lib/store';
import {str} from '../lib/values';
import {NotFound} from '../pages/public/not_found';
import {PageView} from '../pages/public/page_view';

export const publicRoutes = new Hono<AppEnv>();

function footerContent(footer: SectionData): FooterContent {
  return {text: str(footer.text), email: str(footer.email)};
}

for (const page of PAGES) {
  publicRoutes.get(page.path, async c => {
    // Global sections (the footer) come back in the same batch of reads
    const loaded = await getSections(c.var.deploy.isProd, [
      ...pageSectionKeys(page),
      ...SITE.globalSections,
    ]);
    const data = Object.fromEntries(
      Object.entries(loaded).map(([k, v]) => [k, v.data]),
    );
    edgeCache(c);

    return c.html(
      <PublicLayout
        meta={pageMeta(page, data, c.var.deploy)}
        currentPath={page.path}
        footer={footerContent(data[FOOTER_SECTION])}
        overlayHeader={page.path === '/'}
      >
        <PageView pageKey={page.key} s={data} />
      </PublicLayout>,
    );
  });
}

export async function notFound(c: Context<AppEnv>) {
  if (c.req.path.startsWith('/admin')) {
    return c.text('Not found', 404);
  }
  const footer = await getSection(c.var.deploy.isProd, FOOTER_SECTION);

  return c.html(
    <PublicLayout
      meta={{title: `Page not found · ${SITE.name}`, noindex: true}}
      currentPath=""
      footer={footerContent(footer.data)}
    >
      <NotFound />
    </PublicLayout>,
    404,
  );
}
