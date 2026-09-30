import type {Section} from '../content/types';

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
