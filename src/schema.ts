import {z} from 'zod';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface ImageValue {
  id: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  featured?: boolean;
}

export type ListItem = Record<string, string>;

interface BaseField {
  name: string;
  label: string;
  help?: string;
  required?: boolean;
}

export interface TextField extends BaseField {
  type: 'text' | 'textarea' | 'date';
  max?: number;
  default?: string;
}

interface ImageField extends BaseField {
  type: 'image';
  captions?: boolean;
}

interface ImagesField extends BaseField {
  type: 'images';
  max?: number;
  captions?: boolean;
  featured?: boolean;
}

interface ListField extends BaseField {
  type: 'list';
  itemLabel: string;
  max?: number;
  fields: TextField[];
}

export type Field = TextField | ImageField | ImagesField | ListField;

export interface Section {
  key: string;
  label: string;
  description?: string;
  fields: Field[];
}

export type FieldValue = string | ImageValue | ImageValue[] | ListItem[] | null;
export type SectionData = Record<string, FieldValue>;

export const SECTIONS: Section[] = [
  {
    key: 'home.hero',
    label: 'Hero',
    description: 'The large banner at the top of the home page.',
    fields: [
      {
        name: 'heading',
        label: 'Heading',
        type: 'text',
        required: true,
        max: 80,
        default: 'Welcome',
      },
      {
        name: 'intro',
        label: 'Intro text',
        type: 'textarea',
        max: 600,
        default:
          'This text is editable in the admin. Leave a blank line between paragraphs.',
      },
      {name: 'image', label: 'Hero image', type: 'image'},
    ],
  },
  {
    key: 'home.featured',
    label: 'Featured work',
    description:
      'Shows the gallery images marked "Show on home page". Choose them on the Gallery page.',
    fields: [
      {
        name: 'heading',
        label: 'Heading',
        type: 'text',
        max: 80,
        default: 'Featured work',
      },
    ],
  },
  {
    key: 'home.contact',
    label: 'Contact',
    fields: [
      {
        name: 'heading',
        label: 'Heading',
        type: 'text',
        max: 80,
        default: 'Get in touch',
      },
      {
        name: 'intro',
        label: 'Intro text',
        type: 'textarea',
        max: 600,
        default: "Send a message and we'll get back to you.",
      },
    ],
  },
  {
    key: 'gallery.main',
    label: 'Gallery',
    fields: [
      {
        name: 'heading',
        label: 'Heading',
        type: 'text',
        required: true,
        max: 80,
        default: 'Gallery',
      },
      {name: 'intro', label: 'Intro text', type: 'textarea', max: 600},
      {
        name: 'images',
        label: 'Images',
        type: 'images',
        max: 200,
        captions: true,
        featured: true,
      },
    ],
  },
  {
    key: 'about.main',
    label: 'About',
    fields: [
      {
        name: 'heading',
        label: 'Heading',
        type: 'text',
        required: true,
        max: 80,
        default: 'About',
      },
      {
        name: 'body',
        label: 'Body',
        type: 'textarea',
        max: 5000,
        default: 'Tell visitors about yourself.',
      },
      {name: 'image', label: 'Photo', type: 'image'},
      {
        name: 'testimonials',
        label: 'Testimonials',
        type: 'list',
        itemLabel: 'Testimonial',
        max: 20,
        fields: [
          {
            name: 'quote',
            label: 'Quote',
            type: 'textarea',
            required: true,
            max: 600,
          },
          {
            name: 'author',
            label: 'Name',
            type: 'text',
            required: true,
            max: 80,
          },
          {name: 'date', label: 'Date', type: 'date'},
        ],
      },
    ],
  },
  {
    key: 'site.footer',
    label: 'Footer',
    fields: [
      {
        name: 'text',
        label: 'Footer text',
        type: 'text',
        max: 200,
        default: '© cms-lite',
      },
      {name: 'email', label: 'Contact email', type: 'text', max: 200},
    ],
  },
];

export function getSectionDef(key: string): Section | undefined {
  return SECTIONS.find(s => s.key === key);
}

export function getFieldDef(section: Section, name: string): Field | undefined {
  return section.fields.find(f => f.name === name);
}

export function defaults(section: Section): SectionData {
  const data: SectionData = {};
  for (const f of section.fields) {
    if (f.type === 'images' || f.type === 'list') {
      data[f.name] = [];
    } else if (f.type === 'image') {
      data[f.name] = null;
    } else {
      data[f.name] = f.default ?? '';
    }
  }

  return data;
}

const imageSchema = z.object({
  id: z.string().min(1),
  alt: z
    .string()
    .trim()
    .min(
      1,
      'Describe the image (alt text) for screen readers and search engines',
    )
    .max(300),
  width: z.coerce.number().int().nonnegative(),
  height: z.coerce.number().int().nonnegative(),
  caption: z.string().trim().max(300).optional(),
  featured: z.boolean().optional(),
});

function textSchema(f: TextField): z.ZodType<string> {
  let s = z
    .string()
    .trim()
    .max(f.max ?? (f.type === 'textarea' ? 5000 : 200));
  if (f.required) {
    s = s.min(1, 'Required');
  }
  if (f.type === 'date') {
    return s.refine(
      v => v === '' || DATE_PATTERN.test(v),
      'Enter a valid date',
    );
  }

  return s;
}

function fieldSchema(f: Field): z.ZodType {
  switch (f.type) {
    case 'text':
    case 'textarea':
    case 'date':
      return textSchema(f);
    case 'image':
      return f.required
        ? imageSchema.nullable().refine(v => v !== null, 'Required')
        : imageSchema.nullable();
    case 'images': {
      let s = z.array(imageSchema);
      if (f.max) {
        s = s.max(f.max, `At most ${String(f.max)} images`);
      }
      if (f.required) {
        s = s.min(1, 'Add at least one image');
      }

      return s;
    }
    case 'list': {
      const item = z.object(
        Object.fromEntries(f.fields.map(sub => [sub.name, textSchema(sub)])),
      );
      let s = z.array(item);
      if (f.max) {
        s = s.max(f.max, `At most ${String(f.max)} items`);
      }
      if (f.required) {
        s = s.min(1, `Add at least one ${f.itemLabel.toLowerCase()}`);
      }

      return s;
    }
  }
}

export function sectionSchema(section: Section) {
  return z.object(
    Object.fromEntries(section.fields.map(f => [f.name, fieldSchema(f)])),
  );
}

type FormBody = Record<string, string | File | Array<string | File>>;

// Repeated fields post one input per item (`<field>.<key>`), zipped by index.
// Featured checkboxes post the image id, since unchecked boxes send nothing
export function fromForm(
  section: Section,
  body: FormBody,
): Record<string, unknown> {
  function all(key: string): string[] {
    const v = body[key] as FormBody[string] | undefined;
    if (v === undefined) {
      return [];
    }

    return (Array.isArray(v) ? v : [v]).filter(
      (x): x is string => typeof x === 'string',
    );
  }

  const out: Record<string, unknown> = {};
  for (const f of section.fields) {
    if (f.type === 'image' || f.type === 'images') {
      const alts = all(`${f.name}.alt`);
      const widths = all(`${f.name}.width`);
      const heights = all(`${f.name}.height`);
      const captions = all(`${f.name}.caption`);
      const featured = new Set(all(`${f.name}.featured`));
      const images = all(`${f.name}.id`)
        .map((id, i) => ({
          id,
          alt: alts[i] ?? '',
          width: widths[i] ?? 0,
          height: heights[i] ?? 0,
          ...(f.captions && {caption: captions[i] ?? ''}),
          ...(f.type === 'images' &&
            f.featured && {featured: featured.has(id)}),
        }))
        .filter(image => image.id !== '');
      out[f.name] = f.type === 'image' ? (images[0] ?? null) : images;
    } else if (f.type === 'list') {
      const columns = f.fields.map(sub => all(`${f.name}.${sub.name}`));
      const count = Math.max(0, ...columns.map(c => c.length));
      out[f.name] = [...Array(count).keys()].map(i =>
        Object.fromEntries(
          f.fields.map((sub, j) => [sub.name, columns[j][i] ?? '']),
        ),
      );
    } else {
      out[f.name] = all(f.name)[0] ?? '';
    }
  }

  return out;
}
