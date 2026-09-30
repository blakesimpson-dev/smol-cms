import type {FieldValue, ImageValue, ListItem} from '../content/types';

function isImage(item: ImageValue | ListItem): item is ImageValue {
  return 'id' in item && 'alt' in item;
}

export function str(v: FieldValue | undefined): string {
  return typeof v === 'string' ? v : '';
}

export function img(v: FieldValue | undefined): ImageValue | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
}

export function imgs(v: FieldValue | undefined): ImageValue[] {
  return Array.isArray(v) ? v.filter(isImage) : [];
}

export function list(v: FieldValue | undefined): ListItem[] {
  return Array.isArray(v)
    ? v.filter((item): item is ListItem => !isImage(item))
    : [];
}
