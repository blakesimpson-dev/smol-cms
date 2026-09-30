import type {Field, Section} from '../../content/types';
import {SITE} from '../../content';
import {ImageField} from './image_field';
import {ListField} from './list_field';
import {TextInput} from './text_input';

export interface FormState {
  values: Record<string, unknown>;
  errors?: Record<string, string>;
  saved?: boolean;
  updatedAt?: string | null;
}

interface FieldInputProps {
  field: Field;
  value: unknown;
  error?: string;
}

function FieldInput({field, value, error}: FieldInputProps) {
  switch (field.type) {
    case 'image':
    case 'images':
      return <ImageField field={field} value={value} error={error} />;
    case 'list':
      return <ListField field={field} value={value} error={error} />;
    default:
      return (
        <TextInput
          field={field}
          name={field.name}
          value={value}
          error={error}
        />
      );
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(SITE.ogLocale.replace('_', '-'), {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function SaveStatus({state}: {state: FormState}) {
  const hasErrors = Object.keys(state.errors ?? {}).length > 0;
  if (state.saved) {
    return null;
  }
  if (hasErrors) {
    return <del>Not saved — please fix the highlighted fields.</del>;
  }

  return state.updatedAt ? (
    <small>Last saved {formatDate(state.updatedAt)}</small>
  ) : null;
}

export function SectionForm({
  section,
  state,
}: {
  section: Section;
  state: FormState;
}) {
  const url = `/admin/sections/${section.key}`;
  const hasErrors = Object.keys(state.errors ?? {}).length > 0;

  // data-unsaved keeps Save enabled when a rejected form comes back;
  // data-saved makes the idle button read "Saved ✓" instead of "Up to date"
  return (
    <form
      method="post"
      action={url}
      hx-post={url}
      hx-target="this"
      hx-swap="outerHTML"
      hx-disabled-elt="find button[type=submit]"
      data-section-form
      data-unsaved={hasErrors ? '' : undefined}
      data-saved={state.saved ? '' : undefined}
    >
      <article>
        <header>
          <strong>{section.label}</strong>
          {section.description && (
            <>
              <br />
              <small>{section.description}</small>
            </>
          )}
        </header>
        {section.fields.map(f => (
          <FieldInput
            field={f}
            value={state.values[f.name]}
            error={state.errors?.[f.name]}
          />
        ))}
        <footer class="form-footer">
          <span role="status">
            <SaveStatus state={state} />
          </span>
          <button type="submit">Save</button>
        </footer>
      </article>
    </form>
  );
}
