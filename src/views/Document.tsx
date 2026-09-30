import type { Child } from "hono/jsx";
import { raw } from "hono/html";
import { site } from "../site";

export const PICO_CSS = "https://cdn.jsdelivr.net/npm/@picocss/pico@2.1.1/css/pico.min.css";

export type Meta = {
  title: string;
  description?: string;
  /** Absolute canonical URL (public pages only) */
  canonical?: string;
  /** Absolute share image URL */
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  jsonLd?: object;
};

/** Structured data for search engines. `<` is escaped so content can't close the script tag. */
export const JsonLd = ({ data }: { data: object }) => (
  <script type="application/ld+json">{raw(JSON.stringify(data).replace(/</g, "\\u003c"))}</script>
);

export const Document = ({ meta, head, children }: { meta: Meta; head?: Child; children?: Child }) => (
  <>
    {raw("<!doctype html>")}
    <html lang={site.lang}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{meta.title}</title>
        {meta.description && <meta name="description" content={meta.description} />}
        {meta.noindex && <meta name="robots" content="noindex, nofollow" />}
        {meta.canonical && (
          <>
            <link rel="canonical" href={meta.canonical} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={site.name} />
            <meta property="og:locale" content={site.ogLocale} />
            <meta property="og:url" content={meta.canonical} />
            <meta property="og:title" content={meta.title} />
            {meta.description && <meta property="og:description" content={meta.description} />}
            {meta.image && <meta property="og:image" content={meta.image} />}
            {meta.image && <meta property="og:image:width" content="1200" />}
            {meta.image && <meta property="og:image:height" content="630" />}
            {meta.imageAlt && <meta property="og:image:alt" content={meta.imageAlt} />}
            <meta name="twitter:card" content={meta.image ? "summary_large_image" : "summary"} />
          </>
        )}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="stylesheet" href={PICO_CSS} />
        <link rel="stylesheet" href="/assets/site.css" />
        {meta.jsonLd && <JsonLd data={meta.jsonLd} />}
        {head}
      </head>
      {children}
    </html>
  </>
);
