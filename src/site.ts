export const site = {
  name: 'cms-lite',
  lang: 'en',
  ogLocale: 'en_GB',
  defaultTitle: 'cms-lite — a tiny CMS template',
  defaultDescription:
    'A minimal site with a password-protected admin for editing content and images.',
  redirects: {} as Record<string, string>,
  support: {
    name: 'your web developer',
    email: '',
    phone: '',
  },
};

export interface Page {
  key: string;
  path: string;
  label: string;
  sections: string[];
  uses?: string[];
  // Search and share tags are inferred from the page content; set these to
  // override the title or description
  title?: string;
  description?: string;
}

export const PAGES: Page[] = [
  {
    key: 'home',
    path: '/',
    label: 'Home',
    sections: ['home.hero', 'home.featured', 'home.contact'],
    uses: ['gallery.main'],
  },
  {
    key: 'gallery',
    path: '/gallery',
    label: 'Gallery',
    sections: ['gallery.main'],
  },
  {key: 'about', path: '/about', label: 'About', sections: ['about.main']},
];

export const GLOBAL_SECTIONS = ['site.footer'];

export interface ContactField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  autocomplete?: string;
  required?: boolean;
}

// Keep in sync with the hidden form in public/thanks/index.html, which is
// what Netlify's form detection reads
export const CONTACT_FORM: {name: string; fields: ContactField[]} = {
  name: 'contact',
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      autocomplete: 'name',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      autocomplete: 'email',
      required: true,
    },
    {name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel'},
    {name: 'message', label: 'Message', type: 'textarea', required: true},
  ],
};
