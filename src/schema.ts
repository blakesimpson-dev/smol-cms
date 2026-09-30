// Content model: every editable section and its fields. The admin forms and validation are generated from this.
import { z } from "zod";
import { PAGES } from "./site";

export type ImageValue = { id: string; alt: string; width: number; height: number };

type BaseField = { name: string; label: string; help?: string; required?: boolean };
export type Field =
  | (BaseField & { type: "text"; max?: number; default?: string })
  | (BaseField & { type: "textarea"; max?: number; default?: string })
  | (BaseField & { type: "image" })
  | (BaseField & { type: "images"; max?: number });

export type Section = { key: string; label: string; description?: string; fields: Field[] };

export type FieldValue = string | ImageValue | ImageValue[] | null;
export type SectionData = Record<string, FieldValue>;

const CONTENT_SECTIONS: Section[] = [
  {
    key: "home.hero",
    label: "Hero",
    description: "The large banner at the top of the home page.",
    fields: [
      { name: "heading", label: "Heading", type: "text", required: true, max: 80, default: "Welcome" },
      {
        name: "intro",
        label: "Intro text",
        type: "textarea",
        max: 600,
        default: "This text is editable in the admin. Leave a blank line between paragraphs.",
      },
      { name: "image", label: "Hero image", type: "image" },
    ],
  },
  {
    key: "home.gallery",
    label: "Gallery",
    fields: [
      { name: "heading", label: "Heading", type: "text", max: 80, default: "Gallery" },
      { name: "images", label: "Images", type: "images", max: 24 },
    ],
  },
  {
    key: "about.main",
    label: "About",
    fields: [
      { name: "heading", label: "Heading", type: "text", required: true, max: 80, default: "About" },
      { name: "body", label: "Body", type: "textarea", max: 5000, default: "Tell visitors about yourself." },
      { name: "image", label: "Photo", type: "image" },
    ],
  },
  {
    key: "site.footer",
    label: "Footer",
    fields: [
      { name: "text", label: "Footer text", type: "text", max: 200, default: "© cms-lite" },
      { name: "email", label: "Contact email", type: "text", max: 200 },
    ],
  },
];

const seoSection = (page: { key: string; label: string }): Section => ({
  key: `seo.${page.key}`,
  label: "Search & sharing",
  description: "How this page appears in Google results and when shared on social media.",
  fields: [
    {
      name: "title",
      label: "Page title",
      type: "text",
      max: 70,
      help: "Shown in the browser tab and search results. Aim for under 60 characters.",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      max: 300,
      help: "One or two sentences shown under the title in search results. Aim for 120–160 characters.",
    },
    { name: "image", label: "Share image", type: "image", help: "Used when the page is shared. Landscape works best." },
  ],
});

export const SECTIONS: Section[] = [...CONTENT_SECTIONS, ...PAGES.map(seoSection)];

export function getSectionDef(key: string): Section | undefined {
  return SECTIONS.find((s) => s.key === key);
}

export function defaults(section: Section): SectionData {
  const data: SectionData = {};
  for (const f of section.fields) {
    if (f.type === "images") data[f.name] = [];
    else if (f.type === "image") data[f.name] = null;
    else data[f.name] = f.default ?? "";
  }
  return data;
}

const imageSchema = z.object({
  id: z.string().min(1),
  alt: z.string().trim().min(1, "Describe the image (alt text) for screen readers and search engines").max(300),
  width: z.coerce.number().int().nonnegative(),
  height: z.coerce.number().int().nonnegative(),
});

function fieldSchema(f: Field): z.ZodType {
  switch (f.type) {
    case "text":
    case "textarea": {
      let s = z.string().trim().max(f.max ?? (f.type === "text" ? 200 : 5000));
      if (f.required) s = s.min(1, "Required");
      return s;
    }
    case "image":
      return f.required ? imageSchema.nullable().refine((v) => v !== null, "Required") : imageSchema.nullable();
    case "images": {
      let s = z.array(imageSchema);
      if (f.max) s = s.max(f.max, `At most ${f.max} images`);
      if (f.required) s = s.min(1, "Add at least one image");
      return s;
    }
  }
}

export function sectionSchema(section: Section) {
  return z.object(Object.fromEntries(section.fields.map((f) => [f.name, fieldSchema(f)])));
}

type FormBody = Record<string, string | File | (string | File)[]>;

/** Converts a submitted form into section data. Image fields post repeated `<name>.id/.alt/.width/.height` inputs. */
export function fromForm(section: Section, body: FormBody): Record<string, unknown> {
  const all = (key: string): string[] => {
    const v = body[key];
    if (v === undefined) return [];
    return (Array.isArray(v) ? v : [v]).filter((x): x is string => typeof x === "string");
  };
  const out: Record<string, unknown> = {};
  for (const f of section.fields) {
    if (f.type === "image" || f.type === "images") {
      const ids = all(`${f.name}.id`);
      const alts = all(`${f.name}.alt`);
      const widths = all(`${f.name}.width`);
      const heights = all(`${f.name}.height`);
      const images = ids.map((id, i) => ({ id, alt: alts[i] ?? "", width: widths[i] ?? 0, height: heights[i] ?? 0 }));
      out[f.name] = f.type === "image" ? (images[0] ?? null) : images;
    } else {
      out[f.name] = all(f.name)[0] ?? "";
    }
  }
  return out;
}
