import { purgeCache } from "@netlify/functions";
import { Hono, type Context } from "hono";
import { csrf } from "hono/csrf";
import { trimTrailingSlash } from "hono/trailing-slash";
import type { z } from "zod";
import { checkPassword, authConfigured, endSession, isLoggedIn, requireAuth, startSession } from "./auth";
import { signParams, uploadFolder } from "./cloudinary";
import { deployInfo, env, type AppEnv } from "./env";
import { fromForm, getSectionDef, sectionSchema, type SectionData } from "./schema";
import { pageMeta, robotsTxt, sitemapXml } from "./seo";
import { GLOBAL_SECTIONS, PAGES, site } from "./site";
import { getSection, getSections, saveSection } from "./store";
import { SectionForm, type FormState } from "./views/admin/components";
import { Dashboard, EditGroup, Login, type Group } from "./views/admin/pages";
import { PublicLayout, str } from "./views/public/components";
import { NotFound, PAGE_VIEWS } from "./views/public/pages";

const CACHE_TAG = "content";

export const app = new Hono<AppEnv>();

app.use(deployInfo);
app.use(trimTrailingSlash());
app.use(async (c, next) => {
  const to = site.redirects[c.req.path];
  if (to) return c.redirect(to, 301);
  await next();
});

// ---- Public site --------------------------------------------------------

/** Cache public responses at Netlify's edge until content changes (purged on save) or a new deploy. */
function edgeCache(c: Context<AppEnv>) {
  c.header("Cache-Control", "public, max-age=0, must-revalidate");
  c.header("Netlify-CDN-Cache-Control", "public, durable, s-maxage=31536000, stale-while-revalidate=60");
  c.header("Netlify-Cache-Tag", CACHE_TAG);
}

async function footerProps(isProd: boolean) {
  const footer = (await getSection(isProd, "site.footer")).data;
  return { text: str(footer.text), email: str(footer.email) };
}

for (const page of PAGES) {
  app.get(page.path, async (c) => {
    const { isProd } = c.var.deploy;
    const seoKey = `seo.${page.key}`;
    const loaded = await getSections(isProd, [...page.sections, seoKey, ...GLOBAL_SECTIONS]);
    const data = Object.fromEntries(Object.entries(loaded).map(([k, v]) => [k, v.data]));
    const View = PAGE_VIEWS[page.key];
    edgeCache(c);
    return c.html(
      <PublicLayout meta={pageMeta(page, loaded[seoKey], c.var.deploy)} currentPath={page.path} footer={await footerProps(isProd)}>
        <View s={data} />
      </PublicLayout>,
    );
  });
}

app.get("/robots.txt", (c) => {
  edgeCache(c);
  return c.text(robotsTxt(c.var.deploy));
});

app.get("/sitemap.xml", async (c) => {
  const { isProd, siteUrl } = c.var.deploy;
  const entries = await Promise.all(
    PAGES.map(async (page) => {
      const loaded = await getSections(isProd, [...page.sections, `seo.${page.key}`]);
      const dates = Object.values(loaded)
        .map((s) => s.updatedAt)
        .filter((d): d is string => d !== null)
        .sort();
      return { url: siteUrl + page.path, lastmod: dates.at(-1) ?? null };
    }),
  );
  edgeCache(c);
  return c.body(sitemapXml(entries), 200, { "Content-Type": "application/xml; charset=utf-8" });
});

app.notFound(async (c) => {
  if (c.req.path.startsWith("/admin")) return c.text("Not found", 404);
  return c.html(
    <PublicLayout meta={{ title: `Page not found · ${site.name}`, noindex: true }} currentPath="" footer={await footerProps(c.var.deploy.isProd)}>
      <NotFound />
    </PublicLayout>,
    404,
  );
});

// ---- Admin --------------------------------------------------------------

const admin = new Hono<AppEnv>();

admin.use(csrf());
admin.use(async (c, next) => {
  await next();
  c.header("Cache-Control", "no-store");
  c.header("X-Robots-Tag", "noindex, nofollow");
});

const GROUPS: Group[] = [
  ...PAGES.map((p) => ({ key: p.key, label: p.label, path: p.path, sections: [...p.sections, `seo.${p.key}`] })),
  { key: "site", label: "Site-wide", sections: GLOBAL_SECTIONS },
];

admin.get("/login", async (c) => {
  if (await isLoggedIn(c)) return c.redirect("/admin");
  return c.html(<Login configured={authConfigured()} />);
});

admin.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const password = typeof body.password === "string" ? body.password : "";
  if (!authConfigured() || !checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 750)); // slow down guessing
    return c.html(<Login configured={authConfigured()} error="Incorrect password" />, 401);
  }
  await startSession(c);
  return c.redirect("/admin");
});

admin.post("/logout", (c) => {
  endSession(c);
  return c.redirect("/admin/login");
});

admin.use("*", requireAuth);

admin.get("/", (c) => c.html(<Dashboard groups={GROUPS} />));

admin.get("/edit/:group", async (c) => {
  const group = GROUPS.find((g) => g.key === c.req.param("group"));
  if (!group) return c.notFound();
  const { isProd } = c.var.deploy;
  const loaded = await getSections(isProd, group.sections);
  const forms = group.sections.map((key) => ({
    section: getSectionDef(key)!,
    state: { values: loaded[key].data, updatedAt: loaded[key].updatedAt } satisfies FormState,
  }));
  return c.html(<EditGroup group={group} forms={forms} uploadFolder={uploadFolder(isProd)} />);
});

/** First error message per field, e.g. { image: "Describe the image…" }. */
function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const [field, index] = issue.path;
    const key = String(field);
    if (out[key]) continue;
    out[key] = typeof index === "number" ? `Image ${index + 1}: ${issue.message}` : issue.message;
  }
  return out;
}

admin.post("/sections/:key", async (c) => {
  const key = c.req.param("key");
  const section = getSectionDef(key);
  if (!section) return c.notFound();
  const { isProd } = c.var.deploy;

  const values = fromForm(section, await c.req.parseBody({ all: true }));
  const result = sectionSchema(section).safeParse(values);
  let state: FormState;
  if (result.success) {
    await saveSection(isProd, key, result.data as SectionData);
    try {
      await purgeCache({ tags: [CACHE_TAG] });
    } catch (err) {
      // Not available in `netlify dev`; public pages aren't edge-cached there anyway.
      console.warn("Cache purge skipped:", (err as Error).message);
    }
    state = { values: result.data, saved: true };
  } else {
    state = { values, errors: fieldErrors(result.error) };
  }

  if (c.req.header("HX-Request")) return c.html(<SectionForm section={section} state={state} />);
  // Without JavaScript: go back to the edit screen.
  const group = GROUPS.find((g) => g.sections.includes(key));
  return c.redirect(group ? `/admin/edit/${group.key}` : "/admin");
});

/** Signs Cloudinary Upload Widget requests. Only uploads into this deploy's folder are signed. */
admin.post("/cloudinary-signature", async (c) => {
  const secret = env("CLOUDINARY_API_SECRET");
  if (!secret) return c.json({ error: "Cloudinary isn't configured" }, 500);
  const params = await c.req.json<Record<string, unknown>>();
  if (params.folder !== uploadFolder(c.var.deploy.isProd)) return c.json({ error: "Invalid folder" }, 400);
  return c.json({ signature: signParams(params, secret) });
});

app.route("/admin", admin);
