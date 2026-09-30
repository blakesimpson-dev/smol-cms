# cms-lite

A tiny CMS template: a public site plus a password-protected `/admin` where one editor fills in a few forms and uploads images. It's built to be forked for real sites.

- **[Hono](https://hono.dev)** on a single Netlify Function: routing and server-rendered HTML with `hono/jsx` (JSX syntax, no React)
- **[htmx](https://htmx.org)** in the admin: forms save in place
- **[Pico CSS](https://picocss.com)**: classless styling with no build step
- **[Netlify Blobs](https://docs.netlify.com/blobs/overview/)**: content storage (one JSON document per section)
- **[Cloudinary](https://cloudinary.com)**: image hosting. The admin resizes photos in the browser and uploads them directly, signed by the server. Pages resize images through the URL
- **[Netlify Forms](https://docs.netlify.com/forms/setup/)**: the contact form

## Local development

```sh
npm install
cp .env.example .env   # fill in the values
npm run dev            # netlify dev → http://localhost:8888, admin at /admin
npm run preview        # production build served on http://localhost:8899
npm run build          # the full Netlify build, locally
```

The scripts use the Netlify CLI (`npm i -g netlify-cli`).

Checks (Google TypeScript style via ESLint + Prettier):

```sh
npm run lint
npm run typecheck
npm run format         # or format:check
```

The Netlify build runs `lint` and `typecheck`.

Blobs run locally under `netlify dev`, so no Netlify account is needed for development. Uploads need a (free) Cloudinary account.

## Deploy

1. Push to a Git repo and create a Netlify site from it (or run `netlify init`).
2. Set the variables from `.env.example` in **Site configuration → Environment variables**.
3. Under **Forms**, click **Enable form detection** (it's off by default on new sites), then redeploy.
4. Deploy. The site runs at `https://<site>.netlify.app`, with no custom domain needed for testing.

### Deploy contexts

|                       | Production                    | Deploy preview / branch deploy / `netlify dev` |
| --------------------- | ----------------------------- | ---------------------------------------------- |
| Content (Blobs store) | `content`                     | `content-preview` (a separate sandbox)         |
| Cloudinary folder     | `<folder>/production`         | `<folder>/preview`                             |
| Indexing              | allowed (`/admin` disallowed) | `noindex` + `robots.txt` disallows everything  |

Env vars can be scoped per context in the Netlify UI (e.g. a different admin password for previews).

When a custom domain is added, set it as the primary domain in Netlify and set `SITE_URL` to it.

## How it works

- `src/site.ts`: site name, default meta, pages, redirects, the contact form fields, and the support contact shown under "Forgot password?"
- `src/schema.ts`: sections and their fields. The admin forms and validation are generated from it. Field types:
  - `text`, `textarea`, `date`
  - `image`, `images`: with optional `captions`, and `featured` for a "Show on home page" tick box
  - `list`: a repeatable group of text/date fields, e.g. testimonials
- `src/views/public/pages.tsx`: one view per page. A page reads its own `sections` plus any it `uses` (e.g. the home page shows featured gallery images).
- `src/app.tsx`: routes (public pages, `robots.txt`, `sitemap.xml`, admin)
- Search and share tags are inferred from each page's content: title from the page label, description from the first text block, image from the first image. Override `title`/`description` per page in `site.ts`.
- Public pages are cached on Netlify's CDN and purged whenever content is saved.

### Contact form

`ContactForm` posts to `/thanks`, a static page. Netlify detects the form from the hidden copy in `public/thanks/index.html`, so keep its fields in sync with `CONTACT_FORM` in `site.ts`. Submissions appear under **Forms** in Netlify, where email notifications are set up.

### Admin password

`ADMIN_PASSWORD` is the initial password. Changing it under **Account** stores a hashed password in Blobs, which takes precedence and signs out other devices.

To reset a forgotten password, delete the stored one so `ADMIN_PASSWORD` applies again, then send that to the editor so they can choose a new one:

```sh
netlify blobs:delete content admin-auth          # production
netlify blobs:delete content-preview admin-auth  # previews
```

## Using this as a template

Clone it and push to a new private repo, keeping this repo as a remote so template updates can be merged later. Don't use GitHub's "Use this template" button: it creates an unrelated history.

```sh
git clone git@github.com:blakesimpson-dev/cms-lite.git my-site && cd my-site
git remote rename origin template
git remote add origin <new-repo-url>
git push -u origin main
# later: git pull template main
```

Then:

1. **Replace** the example sections in `src/schema.ts` and the pages in `src/site.ts` and `src/views/public/pages.tsx`.
2. **Edit** `src/site.ts`: name, `lang`/`ogLocale`, default title and description, `support` contact, contact form fields, and `redirects` (e.g. old URLs from a previous site → 301).
3. **Replace** the `WebSite` JSON-LD in `src/seo.ts` with the site's real structured data (e.g. `LocalBusiness`, `Organization` or `Person`).
4. **Replace** `public/favicon.svg` and adjust `public/assets/site.css` (or [customise Pico](https://picocss.com/docs/css-variables)).
5. **Set** env vars, including `SITE_URL` once the domain exists.
6. **After launch:** verify the domain in Google Search Console and Bing Webmaster Tools, and submit `/sitemap.xml`.

## Known limitations

- A single shared admin password (rotate `SESSION_SECRET` to sign everyone out).
- Removing an image in the admin doesn't delete it from Cloudinary.
