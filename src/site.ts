// Site-wide settings. A fork of the template edits this file, together with schema.ts and the public views.

export const site = {
  name: "cms-lite",
  lang: "en",
  /** Open Graph locale, e.g. en_GB */
  ogLocale: "en_GB",
  defaultTitle: "cms-lite — a tiny CMS template",
  defaultDescription: "A minimal site with a password-protected admin for editing content and images.",
  /** Old path → new path. Served as 301s, e.g. to preserve rankings from a previous site. */
  redirects: {} as Record<string, string>,
};

export type Page = {
  key: string;
  path: string;
  /** Label for navigation and the admin dashboard */
  label: string;
  /** Section keys (from schema.ts) edited on this page's admin screen */
  sections: string[];
};

// Each page automatically gets an SEO section keyed `seo.<page key>`.
export const PAGES: Page[] = [
  { key: "home", path: "/", label: "Home", sections: ["home.hero", "home.gallery"] },
  { key: "about", path: "/about", label: "About", sections: ["about.main"] },
];

/** Sections rendered on every page (header/footer); edited under "Site-wide" in the admin. */
export const GLOBAL_SECTIONS = ["site.footer"];
