import type { LoadedSection } from "./store";
import type { Deploy } from "./env";
import { imgUrl } from "./cloudinary";
import { site, type Page } from "./site";
import { img, str } from "./views/public/components";
import type { Meta } from "./views/Document";

/** Meta tags for a public page, from its `seo.<key>` section with site.ts fallbacks. */
export function pageMeta(page: Page, seo: LoadedSection, deploy: Deploy): Meta {
  const isHome = page.path === "/";
  const title = str(seo.data.title) || (isHome ? site.defaultTitle : page.label);
  const shareImage = img(seo.data.image);
  const canonical = deploy.siteUrl + page.path;
  return {
    // Inner pages get the site name appended; the home page title is used as-is.
    title: isHome ? title : `${title} · ${site.name}`,
    description: str(seo.data.description) || site.defaultDescription,
    canonical,
    image: shareImage ? imgUrl(shareImage.id, { width: 1200, height: 630 }) : undefined,
    imageAlt: shareImage?.alt,
    // Replace with the real site's structured data (e.g. LocalBusiness, Organization or Person).
    jsonLd:
      page.path === "/"
        ? { "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: deploy.siteUrl + "/" }
        : undefined,
  };
}

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[ch]!);

export function sitemapXml(entries: { url: string; lastmod: string | null }[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${escapeXml(e.url)}</loc>\n${e.lastmod ? `    <lastmod>${e.lastmod.slice(0, 10)}</lastmod>\n` : ""}  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(deploy: Deploy): string {
  if (!deploy.isProd) return "User-agent: *\nDisallow: /\n";
  return `User-agent: *\nDisallow: /admin\n\nSitemap: ${deploy.siteUrl}/sitemap.xml\n`;
}
