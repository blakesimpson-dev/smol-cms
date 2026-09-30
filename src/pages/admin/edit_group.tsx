import type {Section} from '../../content/types';
import {AdminLayout} from '../../components/admin/layout';
import {PageHead} from '../../components/admin/page_head';
import {SectionForm, type FormState} from '../../components/admin/section_form';
import type {AdminGroup} from '../../lib/sections';

interface EditGroupProps {
  group: AdminGroup;
  forms: Array<{section: Section; state: FormState}>;
}

export function EditGroup({group, forms}: EditGroupProps) {
  return (
    <AdminLayout title={group.label} loggedIn>
      <PageHead title={group.label} viewHref={group.path} />
      {forms.map(({section, state}) => (
        <SectionForm section={section} state={state} />
      ))}
    </AdminLayout>
  );
}
