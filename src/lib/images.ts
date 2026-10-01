import type {ImageValue} from '../content/types';
import {cloudName} from './cloudinary';

const CLOUDINARY_WIDTHS = [320, 480, 640, 800, 1200, 1600, 2400];

// Local defaults ship as `<id>-<width>.jpg` in these widths
const LOCAL_WIDTHS = [800, 1600, 2400];

interface UrlOpts {
  width?: number;
  height?: number;
}

function isLocal(id: string): boolean {
  return id.startsWith('/');
}

function localUrl(id: string, width = 1600): string {
  const variant = LOCAL_WIDTHS.find(w => w >= width) ?? 2400;

  return `${id}-${String(variant)}.jpg`;
}

export function imgUrl(id: string, {width, height}: UrlOpts = {}): string {
  if (isLocal(id)) {
    return localUrl(id, width);
  }
  const t = ['f_auto', 'q_auto'];
  if (width) {
    t.push(`w_${String(width)}`);
  }
  if (height) {
    t.push(`h_${String(height)}`, 'c_fill', 'g_auto');
  }

  return `https://res.cloudinary.com/${cloudName() ?? ''}/image/upload/${t.join(',')}/${id}`;
}

// Height for a width at the given aspect ratio (width / height), so
// Cloudinary crops server-side instead of the browser discarding pixels
export function heightFor(width: number, aspect?: number): number | undefined {
  return aspect ? Math.round(width / aspect) : undefined;
}

export function srcset(
  img: ImageValue,
  maxWidth = 2400,
  aspect?: number,
): string {
  const limit = Math.min(maxWidth, img.width || maxWidth);
  const widths = isLocal(img.id)
    ? LOCAL_WIDTHS.filter(w => w <= limit)
    : CLOUDINARY_WIDTHS.filter(w => w < limit).concat(limit);

  return widths
    .map(w => {
      const url = imgUrl(img.id, {width: w, height: heightFor(w, aspect)});

      return `${url} ${String(w)}w`;
    })
    .join(', ');
}
