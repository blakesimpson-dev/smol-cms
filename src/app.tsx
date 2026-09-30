import {purgeCache} from '@netlify/functions';
import {Hono, type Context} from 'hono';
import {csrf} from 'hono/csrf';
import {trimTrailingSlash} from 'hono/trailing-slash';
import type {z} from 'zod';
import {
  MIN_PASSWORD_LENGTH,
  authConfigured,
  changePassword,
  checkPassword,
  endSession,
  isLoggedIn,
  requireAuth,
  startSession,
} from './auth';
import {uploadRequest} from './cloudinary';
import {deployInfo, type AppEnv} from './env';
import {
  fromForm,
  getFieldDef,
  getSectionDef,
  sectionSchema,
  type Section,
  type SectionData,
} from './schema';
import {pageMeta, robotsTxt, sitemapXml} from './seo';
import {GLOBAL_SECTIONS, PAGES, site, type Page} from './site';
import {getSection, getSections, saveSection} from './store';
import {SectionForm, type FormState} from './views/admin/components';
import {
  Account,
  Dashboard,
  EditGroup,
  Login,
  type AccountErrors,
  type Group,
} from './views/admin/pages';
import {PublicLayout, str} from './views/public/components';
import {NotFound, PageView} from './views/public/pages';

const CACHE_TAG = 'content';
const FAILED_AUTH_DELAY_MS = 750;

const GROUPS: Group[] = [
  ...PAGES.map(p => ({
    key: p.key,
    label: p.label,
    path: p.path,
    sections: p.sections,
  })),
  {key: 'site', label: 'Site-wide', sections: GLOBAL_SECTIONS},
];

function pageSectionKeys(page: Page): string[] {
  return [...page.sections, ...(page.uses ?? [])];
}

// Slows down password guessing
function failedAuthDelay(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, FAILED_AUTH_DELAY_MS));
}

export const app = new Hono<AppEnv>();

app.use(deployInfo);
app.use(trimTrailingSlash());
app.use(async (c, next) => {
  const to = site.redirects[c.req.path];
  if (to) {
    return c.redirect(to, 301);
  }
  await next();
});

function edgeCache(c: Context<AppEnv>): void {
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');
  c.header(
    'Netlify-CDN-Cache-Control',
    'public, durable, s-maxage=31536000, stale-while-revalidate=60',
  );
  c.header('Netlify-Cache-Tag', CACHE_TAG);
}

async function footerProps(isProd: boolean) {
  const footer = (await getSection(isProd, 'site.footer')).data;

  return {text: str(footer.text), email: str(footer.email)};
}

for (const page of PAGES) {
  app.get(page.path, async c => {
    const {isProd} = c.var.deploy;
    const loaded = await getSections(isProd, [
      ...pageSectionKeys(page),
      ...GLOBAL_SECTIONS,
    ]);
    const data = Object.fromEntries(
      Object.entries(loaded).map(([k, v]) => [k, v.data]),
    );
    edgeCache(c);

    return c.html(
      <PublicLayout
        meta={pageMeta(page, data, c.var.deploy)}
        currentPath={page.path}
        footer={await footerProps(isProd)}
      >
        <PageView pageKey={page.key} s={data} />
      </PublicLayout>,
    );
  });
}

app.get('/robots.txt', c => {
  edgeCache(c);

  return c.text(robotsTxt(c.var.deploy));
});

app.get('/sitemap.xml', async c => {
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

app.notFound(async c => {
  if (c.req.path.startsWith('/admin')) {
    return c.text('Not found', 404);
  }

  return c.html(
    <PublicLayout
      meta={{title: `Page not found · ${site.name}`, noindex: true}}
      currentPath=""
      footer={await footerProps(c.var.deploy.isProd)}
    >
      <NotFound />
    </PublicLayout>,
    404,
  );
});

const admin = new Hono<AppEnv>();

admin.use(csrf());
admin.use(async (c, next) => {
  await next();
  c.header('Cache-Control', 'no-store');
  c.header('X-Robots-Tag', 'noindex, nofollow');
});

admin.get('/login', async c => {
  if (await isLoggedIn(c)) {
    return c.redirect('/admin');
  }

  return c.html(<Login configured={authConfigured()} />);
});

admin.post('/login', async c => {
  const body = await c.req.parseBody();
  const password = typeof body.password === 'string' ? body.password : '';
  const valid =
    authConfigured() && (await checkPassword(c.var.deploy.isProd, password));
  if (!valid) {
    await failedAuthDelay();
    return c.html(
      <Login configured={authConfigured()} error="Incorrect password" />,
      401,
    );
  }
  await startSession(c);

  return c.redirect('/admin');
});

admin.post('/logout', c => {
  endSession(c);

  return c.redirect('/admin/login');
});

admin.use('*', requireAuth);

admin.get('/', c => c.html(<Dashboard groups={GROUPS} />));

admin.get('/edit/:group', async c => {
  const group = GROUPS.find(g => g.key === c.req.param('group'));
  if (!group) {
    return c.notFound();
  }
  const loaded = await getSections(c.var.deploy.isProd, group.sections);
  const forms = group.sections
    .map(key => getSectionDef(key))
    .filter((s): s is Section => s !== undefined)
    .map(section => ({
      section,
      state: {
        values: loaded[section.key].data,
        updatedAt: loaded[section.key].updatedAt,
      },
    }));

  return c.html(<EditGroup group={group} forms={forms} />);
});

function fieldErrors(
  section: Section,
  error: z.ZodError,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const [name, index] = issue.path;
    const key = String(name);
    if (key in out) {
      continue;
    }
    const field = getFieldDef(section, key);
    const itemLabel = field?.type === 'list' ? field.itemLabel : 'Image';
    out[key] =
      typeof index === 'number'
        ? `${itemLabel} ${String(index + 1)}: ${issue.message}`
        : issue.message;
  }

  return out;
}

admin.post('/sections/:key', async c => {
  const key = c.req.param('key');
  const section = getSectionDef(key);
  if (!section) {
    return c.notFound();
  }
  const {isProd} = c.var.deploy;

  const values = fromForm(section, await c.req.parseBody({all: true}));
  const result = sectionSchema(section).safeParse(values);
  let state: FormState;
  if (result.success) {
    await saveSection(isProd, key, result.data as SectionData);
    try {
      await purgeCache({tags: [CACHE_TAG]});
    } catch (err) {
      // Not available in `netlify dev`, where pages aren't edge-cached anyway
      console.warn('Cache purge skipped:', err);
    }
    state = {values: result.data, saved: true};
  } else {
    state = {values, errors: fieldErrors(section, result.error)};
  }

  if (c.req.header('HX-Request')) {
    return c.html(<SectionForm section={section} state={state} />);
  }
  const group = GROUPS.find(g => g.sections.includes(key));

  return c.redirect(group ? `/admin/edit/${group.key}` : '/admin');
});

admin.post('/upload-signature', c => {
  const request = uploadRequest(c.var.deploy.isProd);
  if (!request) {
    return c.json({error: "Image uploads aren't configured"}, 500);
  }

  return c.json(request);
});

admin.get('/account', c => c.html(<Account minLength={MIN_PASSWORD_LENGTH} />));

admin.post('/account', async c => {
  const {isProd} = c.var.deploy;
  const body = await c.req.parseBody();
  function field(name: string): string {
    const v = body[name];
    return typeof v === 'string' ? v : '';
  }

  const errors: AccountErrors = {};
  if (!(await checkPassword(isProd, field('current')))) {
    await failedAuthDelay();
    errors.current = 'Incorrect password';
  }
  if (field('password').length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${String(MIN_PASSWORD_LENGTH)} characters`;
  } else if (field('password') !== field('confirm')) {
    errors.confirm = "The passwords don't match";
  }
  if (Object.keys(errors).length > 0) {
    return c.html(
      <Account errors={errors} minLength={MIN_PASSWORD_LENGTH} />,
      400,
    );
  }

  const version = await changePassword(isProd, field('password'));
  await startSession(c, version);

  return c.html(<Account saved minLength={MIN_PASSWORD_LENGTH} />);
});

app.route('/admin', admin);
