import contactForm from './contact_form.json';
import pages from './pages.json';
import sections from './sections.json';
import site from './site.json';
import {
  CONTACT_FORM_SCHEMA,
  PAGE_SCHEMA,
  SECTION_SCHEMA,
  SITE_SCHEMA,
} from './types';

// Parsed at startup so a mistake in the JSON fails loudly with its path
export const SITE = SITE_SCHEMA.parse(site);
export const PAGES = PAGE_SCHEMA.array().parse(pages);
export const SECTIONS = SECTION_SCHEMA.array().parse(sections);
export const CONTACT_FORM = CONTACT_FORM_SCHEMA.parse(contactForm);

// The footer component reads this global section's `text` and `email` fields
export const FOOTER_SECTION = 'site.footer';

function referenceProblems(): string[] {
  const problems: string[] = [];
  const sectionKeys = new Set(SECTIONS.map(s => s.key));
  if (sectionKeys.size !== SECTIONS.length) {
    problems.push('sections.json has duplicate section keys');
  }
  if (new Set(PAGES.map(p => p.key)).size !== PAGES.length) {
    problems.push('pages.json has duplicate page keys');
  }
  for (const page of PAGES) {
    for (const key of [...page.sections, ...(page.uses ?? [])]) {
      if (!sectionKeys.has(key)) {
        problems.push(
          `pages.json: "${page.key}" uses unknown section "${key}"`,
        );
      }
    }
  }
  for (const key of SITE.globalSections) {
    if (!sectionKeys.has(key)) {
      problems.push(`site.json: unknown global section "${key}"`);
    }
  }
  if (!SITE.globalSections.includes(FOOTER_SECTION)) {
    problems.push(`site.json: globalSections must include "${FOOTER_SECTION}"`);
  }

  return problems;
}

const problems = referenceProblems();
if (problems.length > 0) {
  throw new Error(`Invalid content config:\n- ${problems.join('\n- ')}`);
}
