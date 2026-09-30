import {PAGES, SECTIONS, SITE} from '../content';
import type {Field, Page, Section, SectionData} from '../content/types';

export interface AdminGroup {
  key: string;
  label: string;
  path?: string;
  sections: string[];
}

export const ADMIN_GROUPS: AdminGroup[] = [
  ...PAGES.map(p => ({
    key: p.key,
    label: p.label,
    path: p.path,
    sections: p.sections,
  })),
  {key: 'site', label: 'Site-wide', sections: SITE.globalSections},
];

export function getSectionDef(key: string): Section | undefined {
  return SECTIONS.find(s => s.key === key);
}

export function getFieldDef(section: Section, name: string): Field | undefined {
  return section.fields.find(f => f.name === name);
}

export function pageSectionKeys(page: Page): string[] {
  return [...page.sections, ...(page.uses ?? [])];
}

export function defaults(section: Section): SectionData {
  const data: SectionData = {};
  for (const f of section.fields) {
    if (f.type === 'images' || f.type === 'list') {
      data[f.name] = f.default ?? [];
    } else if (f.type === 'image') {
      data[f.name] = f.default ?? null;
    } else {
      data[f.name] = f.default ?? '';
    }
  }

  return data;
}
