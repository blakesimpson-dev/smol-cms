import {z} from 'zod';
import type {Field, Section, TextField} from '../content/types';
import {getFieldDef} from './sections';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Cloudinary public ids, or local paths for the bundled defaults. Anything
// that could point at another host (`//`, a scheme) or escape a path is out
const UNSAFE_IMAGE_ID = /^\/\/|:|\.\.|["'<>\\]/;

const IMAGE_SCHEMA = z.object({
  id: z
    .string()
    .min(1)
    .refine(id => !UNSAFE_IMAGE_ID.test(id), 'Invalid image'),
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
        ? IMAGE_SCHEMA.nullable().refine(v => v !== null, 'Required')
        : IMAGE_SCHEMA.nullable();
    case 'images': {
      let s = z.array(IMAGE_SCHEMA);
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

// First message per field, prefixed with the item for repeated fields
export function fieldErrors(
  section: Section,
  error: z.ZodError,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const [name, index] = issue.path;
    const key = String(name);
    if (key in out) {
      continue;
    }
    const field = getFieldDef(section, key);
    const itemLabel = field?.type === 'list' ? field.itemLabel : 'Image';
    out[key] =
      typeof index === 'number'
        ? `${itemLabel} ${String(index + 1)}: ${issue.message}`
        : issue.message;
  }

  return out;
}
