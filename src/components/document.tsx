import type {Child} from 'hono/jsx';
import {raw} from 'hono/html';
import {SITE} from '../content';

const PICO_CSS = '/assets/css/vendor/pico.min.css';
const HEADING_FONT = '/assets/fonts/poppins-latin-700-normal.woff2';

export interface Meta {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  jsonLd?: object;
}

export function JsonLd({data}: {data: object}) {
  // Escape `<` so content can't close the script tag
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return <script type="application/ld+json">{raw(json)}</script>;
}

function SocialMeta({meta, canonical}: {meta: Meta; canonical: string}) {
  return (
    <>
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={SITE.ogLocale} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={meta.title} />
      {meta.description && (
        <meta property="og:description" content={meta.description} />
      )}
      {meta.image && (
        <>
          <meta property="og:image" content={meta.image} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
        </>
      )}
      {meta.imageAlt && (
        <meta property="og:image:alt" content={meta.imageAlt} />
      )}
      <meta
        name="twitter:card"
        content={meta.image ? 'summary_large_image' : 'summary'}
      />
    </>
  );
}

interface DocumentProps {
  meta: Meta;
  stylesheet: string;
  head?: Child;
  children?: Child;
}

export function Document({meta, stylesheet, head, children}: DocumentProps) {
  return (
    <>
      {raw('<!doctype html>')}
      <html lang={SITE.lang} data-theme="light">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{meta.title}</title>
          {meta.description && (
            <meta name="description" content={meta.description} />
          )}
          {meta.noindex && <meta name="robots" content="noindex, nofollow" />}
          {meta.canonical && (
            <SocialMeta meta={meta} canonical={meta.canonical} />
          )}
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link
            rel="preload"
            href={HEADING_FONT}
            as="font"
            type="font/woff2"
            crossorigin=""
          />
          <link rel="stylesheet" href={PICO_CSS} />
          <link rel="stylesheet" href="/assets/css/base.css" />
          <link rel="stylesheet" href={stylesheet} />
          {meta.jsonLd && <JsonLd data={meta.jsonLd} />}
          {head}
        </head>
        {children}
      </html>
    </>
  );
}
