# cms-lite

A tiny CMS template: a public site plus a password-protected `/admin` where one editor fills in a few forms and uploads images. It's built to be forked for real sites.

- **[Hono](https://hono.dev)** on a single Netlify Function: routing and server-rendered HTML with `hono/jsx` (JSX syntax, no React)
- **[htmx](https://htmx.org)** in the admin: forms save in place
- **[Pico CSS](https://picocss.com)**: classless styling with no build step
- **[Netlify Blobs](https://docs.netlify.com/blobs/overview/)**: content storage (one JSON document per section)
- **[Cloudinary](https://cloudinary.com)**: image hosting, signed uploads from the browser, resizing through the URL

## Local development

```sh
npm install
cp .env.example .env   # fill in the values
npm run dev            # netlify dev → http://localhost:8888, admin at /admin
```

Blobs run locally under `netlify dev`, so no Netlify account is needed for development. Uploads need a (free) Cloudinary account.

## Deploy

1. Push to a Git repo and create a Netlify site from it (or run `netlify init`).
2. Set the variables from `.env.example` in **Site configuration → Environment variables**.
3. Deploy. The site runs at `https://<site>.netlify.app`, with no custom domain needed for testing.

### Deploy contexts

| | Production | Deploy preview / branch deploy / `netlify dev` |
|---|---|---|
| Content (Blobs store) | `content` | `content-preview` (a separate sandbox) |
| Cloudinary folder | `<folder>/production` | `<folder>/preview` |
| Indexing | allowed (`/admin` disallowed) | `noindex` + `robots.txt` disallows everything |

Env vars can be scoped per context in the Netlify UI (e.g. a different admin password for previews).

When a custom domain is added, set it as the primary domain in Netlify and set `SITE_URL` to it.

## How it works

- `src/site.ts`: site name, default meta, pages, and redirects
- `src/schema.ts`: sections and their fields (`text`, `textarea`, `image`, `images`). The admin forms and validation are generated from it. Each page automatically gets a **Search & sharing** section (title, description, share image).
- `src/views/public/pages.tsx`: one view per page
- `src/app.tsx`: routes (public pages, `robots.txt`, `sitemap.xml`, admin)
- Public pages are cached on Netlify's CDN and purged whenever content is saved.

## Using this as a template

Fork or clone it into a private repo, then:

1. **Replace** the example sections in `src/schema.ts` and the pages in `src/site.ts` and `src/views/public/pages.tsx`.
2. **Edit** `src/site.ts`: name, `lang`/`ogLocale`, default title and description, and `redirects` (e.g. old URLs from a previous site → 301).
3. **Replace** the `WebSite` JSON-LD in `src/seo.ts` with the site's real structured data (e.g. `LocalBusiness`, `Organization` or `Person`).
4. **Replace** `public/favicon.svg` and adjust `public/assets/site.css` (or [customise Pico](https://picocss.com/docs/css-variables)).
5. **Set** env vars, including `SITE_URL` once the domain exists.
6. **After launch:** verify the domain in Google Search Console and Bing Webmaster Tools, and submit `/sitemap.xml`.

## Known limitations

- A single shared admin password (rotate `SESSION_SECRET` to sign everyone out).
- Removing an image in the admin doesn't delete it from Cloudinary.
- Gallery images appear in upload order (no reordering yet).
