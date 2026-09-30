import {z} from 'zod';

// Image ids are Cloudinary public ids, or a local path (starting with `/`)
// for defaults shipped in public/assets/images
const IMAGE_VALUE_SCHEMA = z.object({
  id: z.string(),
  alt: z.string(),
  width: z.number(),
  height: z.number(),
  caption: z.string().optional(),
  featured: z.boolean().optional(),
});

const BASE_FIELD = {
  name: z.string(),
  label: z.string(),
  help: z.string().optional(),
  required: z.boolean().optional(),
};

export const TEXT_FIELD_SCHEMA = z.object({
  ...BASE_FIELD,
  type: z.enum(['text', 'textarea', 'date']),
  max: z.number().optional(),
  recommended: z.number().optional(),
  default: z.string().optional(),
});

export const FIELD_SCHEMA = z.discriminatedUnion('type', [
  TEXT_FIELD_SCHEMA,
  z.object({
    ...BASE_FIELD,
    type: z.literal('image'),
    captions: z.boolean().optional(),
    default: IMAGE_VALUE_SCHEMA.optional(),
  }),
  z.object({
    ...BASE_FIELD,
    type: z.literal('images'),
    max: z.number().optional(),
    captions: z.boolean().optional(),
    featured: z.boolean().optional(),
    default: z.array(IMAGE_VALUE_SCHEMA).optional(),
  }),
  z.object({
    ...BASE_FIELD,
    type: z.literal('list'),
    itemLabel: z.string(),
    max: z.number().optional(),
    fields: z.array(TEXT_FIELD_SCHEMA),
    default: z.array(z.record(z.string(), z.string())).optional(),
  }),
]);

export const SECTION_SCHEMA = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string().optional(),
  fields: z.array(FIELD_SCHEMA),
});

export const PAGE_SCHEMA = z.object({
  key: z.string(),
  path: z.string(),
  label: z.string(),
  sections: z.array(z.string()),
  uses: z.array(z.string()).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

const LINK_SCHEMA = z.object({label: z.string(), href: z.string()});

export const SITE_SCHEMA = z.object({
  name: z.string(),
  lang: z.string(),
  ogLocale: z.string(),
  defaultTitle: z.string(),
  defaultDescription: z.string(),
  logo: z.object({
    src: z.string(),
    alt: z.string(),
    width: z.number(),
    height: z.number(),
  }),
  nav: z.array(LINK_SCHEMA),
  cta: LINK_SCHEMA.optional(),
  globalSections: z.array(z.string()),
  support: z.object({name: z.string(), email: z.string(), phone: z.string()}),
  redirects: z.record(z.string(), z.string()),
});

export const CONTACT_FORM_SCHEMA = z.object({
  name: z.string(),
  fields: z.array(
    z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(['text', 'email', 'tel', 'textarea']),
      autocomplete: z.string().optional(),
      required: z.boolean().optional(),
    }),
  ),
});

export type TextField = z.infer<typeof TEXT_FIELD_SCHEMA>;
export type Field = z.infer<typeof FIELD_SCHEMA>;
export type ListFieldDef = Extract<Field, {type: 'list'}>;
export type Section = z.infer<typeof SECTION_SCHEMA>;
export type Page = z.infer<typeof PAGE_SCHEMA>;

export type ImageValue = z.infer<typeof IMAGE_VALUE_SCHEMA>;

export type ListItem = Record<string, string>;
export type FieldValue = string | ImageValue | ImageValue[] | ListItem[] | null;
export type SectionData = Record<string, FieldValue>;
