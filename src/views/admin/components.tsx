import type {Child} from 'hono/jsx';
import type {
  Field,
  ImageValue,
  ListItem,
  Section,
  TextField,
} from '../../schema';
import {imgUrl, uploadsConfigured} from '../../cloudinary';
import {site} from '../../site';
import {Document} from '../document';

const HTMX = 'https://unpkg.com/htmx.org@2.0.11/dist/htmx.min.js';

interface AdminLayoutProps {
  title: string;
  loggedIn?: boolean;
  children?: Child;
}

export function AdminLayout({title, loggedIn, children}: AdminLayoutProps) {
  return (
    <Document
      meta={{title: `${title} · ${site.name} admin`, noindex: true}}
      head={
        loggedIn && (
          <>
            <script src={HTMX} defer></script>
            <script src="/assets/admin.js" defer></script>
          </>
        )
      }
    >
      <body class="admin">
        <header class="container">
          <nav>
            <ul>
              <li>
                <a href="/admin" class="contrast">
                  <strong>{site.name}</strong>
                </a>
              </li>
            </ul>
            <ul>
              <li>
                <a href="/" target="_blank">
                  View site ↗
                </a>
              </li>
              {loggedIn && (
                <>
                  <li>
                    <a href="/admin/account">Account</a>
                  </li>
                  <li>
                    <form method="post" action="/admin/logout" class="inline">
                      <button type="submit" class="outline secondary">
                        Log out
                      </button>
                    </form>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </header>
        <main class="container">{children}</main>
      </body>
    </Document>
  );
}

type Values = Record<string, unknown>;

export interface FormState {
  values: Values;
  errors?: Record<string, string>;
  saved?: boolean;
  updatedAt?: string | null;
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function asArray<T>(v: unknown): Array<Partial<T>> {
  if (Array.isArray(v)) {
    return v as Array<Partial<T>>;
  }

  return v && typeof v === 'object' ? [v] : [];
}

export function Help({text, error}: {text?: string; error?: string}) {
  if (error) {
    return <small class="error">{error}</small>;
  }

  return text ? <small>{text}</small> : null;
}

function ItemActions({movable, retry}: {movable?: boolean; retry?: boolean}) {
  return (
    <div class="item-actions">
      {movable && (
        <>
          <button
            type="button"
            class="outline secondary"
            data-move="up"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            class="outline secondary"
            data-move="down"
            aria-label="Move down"
          >
            ↓
          </button>
        </>
      )}
      {retry && (
        <button type="button" class="outline" data-retry hidden>
          Retry
        </button>
      )}
      <button type="button" class="outline secondary" data-remove>
        Remove
      </button>
    </div>
  );
}

interface ImageItemProps {
  name: string;
  image?: Partial<ImageValue>;
  multiple: boolean;
  captions?: boolean;
  featured?: boolean;
}

function ImageItem({
  name,
  image,
  multiple,
  captions,
  featured,
}: ImageItemProps) {
  return (
    <div class="item img-item" data-item>
      <img
        class="thumb"
        src={image?.id ? imgUrl(image.id, {width: 240, height: 160}) : ''}
        alt=""
        width={120}
        height={80}
      />
      <div class="item-fields">
        <input type="hidden" name={`${name}.id`} value={image?.id ?? ''} />
        <input
          type="hidden"
          name={`${name}.width`}
          value={String(image?.width ?? '')}
        />
        <input
          type="hidden"
          name={`${name}.height`}
          value={String(image?.height ?? '')}
        />
        <input
          name={`${name}.alt`}
          value={image?.alt ?? ''}
          placeholder="Describe the image (alt text)"
          aria-label="Alt text"
          required
          maxlength={300}
        />
        {captions && (
          <input
            name={`${name}.caption`}
            value={image?.caption ?? ''}
            placeholder="Caption (optional)"
            aria-label="Caption"
            maxlength={300}
          />
        )}
        {featured && (
          <label class="check">
            <input
              type="checkbox"
              name={`${name}.featured`}
              value={image?.id ?? ''}
              checked={image?.featured}
            />
            Show on home page
          </label>
        )}
        <progress hidden max={100} value={0}></progress>
        <small class="item-status" role="status"></small>
      </div>
      <ItemActions movable={multiple} retry />
    </div>
  );
}

interface FieldProps {
  field: Field;
  value: unknown;
  error?: string;
}

function ImageField({field, value, error}: FieldProps) {
  if (field.type !== 'image' && field.type !== 'images') {
    return null;
  }
  const multiple = field.type === 'images';
  const itemProps = {
    name: field.name,
    multiple,
    captions: field.captions,
    featured: field.type === 'images' && field.featured,
  };
  const max = field.type === 'images' ? field.max : 1;

  return (
    <fieldset
      data-image-field
      data-multiple={String(multiple)}
      data-max={max ? String(max) : undefined}
    >
      <legend>
        {field.label}
        {field.required && ' *'}
      </legend>
      <div class="item-list">
        {asArray<ImageValue>(value).map(image => (
          <ImageItem {...itemProps} image={image} />
        ))}
      </div>
      <template>
        <ImageItem {...itemProps} />
      </template>
      {uploadsConfigured() ? (
        <>
          <input type="file" accept="image/*" multiple={multiple} hidden />
          <button type="button" class="secondary" data-upload>
            {multiple ? 'Upload images' : 'Upload image'}
          </button>
        </>
      ) : (
        <small>
          Image uploads aren't configured (set the CLOUDINARY_* environment
          variables).
        </small>
      )}
      <Help text={field.help} error={error} />
    </fieldset>
  );
}

interface TextInputProps {
  field: TextField;
  name: string;
  value: unknown;
  error?: string;
}

function TextInput({field, name, value, error}: TextInputProps) {
  const common = {
    name,
    required: field.required,
    maxlength: field.type === 'date' ? undefined : field.max,
    'aria-invalid': error ? 'true' : undefined,
  };
  const rows = Math.min(12, Math.max(3, Math.round((field.max ?? 600) / 150)));

  return (
    <label>
      {field.label}
      {field.required && ' *'}
      {field.type === 'textarea' ? (
        <textarea {...common} rows={rows}>
          {asString(value)}
        </textarea>
      ) : (
        <input
          type={field.type === 'date' ? 'date' : 'text'}
          {...common}
          value={asString(value)}
        />
      )}
      <Help text={field.help} error={error} />
    </label>
  );
}

function ListItemRow({
  field,
  item,
}: {
  field: Extract<Field, {type: 'list'}>;
  item?: Partial<ListItem>;
}) {
  return (
    <div class="item list-item" data-item>
      {field.fields.map(sub => (
        <TextInput
          field={sub}
          name={`${field.name}.${sub.name}`}
          value={item?.[sub.name]}
        />
      ))}
      <ItemActions movable />
    </div>
  );
}

function ListField({field, value, error}: FieldProps) {
  if (field.type !== 'list') {
    return null;
  }

  return (
    <fieldset
      data-list-field
      data-max={field.max ? String(field.max) : undefined}
    >
      <legend>
        {field.label}
        {field.required && ' *'}
      </legend>
      <div class="item-list">
        {asArray<ListItem>(value).map(item => (
          <ListItemRow field={field} item={item} />
        ))}
      </div>
      <template>
        <ListItemRow field={field} />
      </template>
      <button type="button" class="secondary" data-add>
        Add {field.itemLabel.toLowerCase()}
      </button>
      <Help text={field.help} error={error} />
    </fieldset>
  );
}

function FieldInput({field, value, error}: FieldProps) {
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
  return new Date(iso).toLocaleString(site.ogLocale.replace('_', '-'), {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
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

  return (
    <form
      method="post"
      action={url}
      hx-post={url}
      hx-target="this"
      hx-swap="outerHTML"
      hx-disabled-elt="find button[type=submit]"
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
          <button type="submit">Save</button>
          <span role="status">
            {state.saved && <ins>Saved ✓</ins>}
            {hasErrors && (
              <del>Not saved — please fix the highlighted fields.</del>
            )}
            {!state.saved && !hasErrors && state.updatedAt && (
              <small>Last saved {formatDate(state.updatedAt)}</small>
            )}
          </span>
        </footer>
      </article>
    </form>
  );
}
