import {Hono} from 'hono';
import type {Section, SectionData} from '../../content/types';
import {SectionForm, type FormState} from '../../components/admin/section_form';
import {purgeContentCache} from '../../lib/cache';
import type {AppEnv} from '../../lib/env';
import {fromForm} from '../../lib/form_data';
import {ADMIN_GROUPS, getSectionDef} from '../../lib/sections';
import {getSections, saveSection} from '../../lib/store';
import {fieldErrors, sectionSchema} from '../../lib/validation';
import {Dashboard} from '../../pages/admin/dashboard';
import {EditGroup} from '../../pages/admin/edit_group';

export const sectionRoutes = new Hono<AppEnv>();

sectionRoutes.get('/', c => c.html(<Dashboard groups={ADMIN_GROUPS} />));

sectionRoutes.get('/edit/:group', async c => {
  const group = ADMIN_GROUPS.find(g => g.key === c.req.param('group'));
  if (!group) {
    return c.notFound();
  }
  const loaded = await getSections(c.var.deploy.isProd, group.sections);
  const forms = group.sections
    .map(key => getSectionDef(key))
    .filter((s): s is Section => s !== undefined)
    .map(section => ({
      section,
      state: {
        values: loaded[section.key].data,
        updatedAt: loaded[section.key].updatedAt,
      },
    }));

  return c.html(<EditGroup group={group} forms={forms} />);
});

sectionRoutes.post('/sections/:key', async c => {
  const key = c.req.param('key');
  const section = getSectionDef(key);
  if (!section) {
    return c.notFound();
  }

  const values = fromForm(section, await c.req.parseBody({all: true}));
  const result = sectionSchema(section).safeParse(values);
  let state: FormState;
  if (result.success) {
    await saveSection(c.var.deploy.isProd, key, result.data as SectionData);
    await purgeContentCache();
    state = {values: result.data, saved: true};
  } else {
    state = {values, errors: fieldErrors(section, result.error)};
  }

  if (c.req.header('HX-Request')) {
    return c.html(<SectionForm section={section} state={state} />);
  }
  const group = ADMIN_GROUPS.find(g => g.sections.includes(key));

  return c.redirect(group ? `/admin/edit/${group.key}` : '/admin');
});
