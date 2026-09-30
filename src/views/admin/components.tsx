import type { Child } from "hono/jsx";
import type { Field, ImageValue, Section } from "../../schema";
import { cloudName, imgUrl } from "../../cloudinary";
import { env } from "../../env";
import { site } from "../../site";
import { Document } from "../Document";

const HTMX = "https://unpkg.com/htmx.org@2.0.11/dist/htmx.min.js";
const UPLOAD_WIDGET = "https://upload-widget.cloudinary.com/latest/global/all.js";

type AdminLayoutProps = { title: string; loggedIn?: boolean; uploadFolder?: string; children?: Child };

export const AdminLayout = ({ title, loggedIn, uploadFolder, children }: AdminLayoutProps) => (
  <Document
    meta={{ title: `${title} · ${site.name} admin`, noindex: true }}
    head={
      loggedIn && (
        <>
          <script src={HTMX} defer></script>
          <script src={UPLOAD_WIDGET} defer></script>
          <script src="/assets/admin.js" defer></script>
        </>
      )
    }
  >
    <body
      class="admin"
      data-cloud={cloudName()}
      data-api-key={loggedIn ? env("CLOUDINARY_API_KEY") : undefined}
      data-folder={uploadFolder}
    >
      <header class="container">
        <nav>
          <ul>
            <li>
              <a href="/admin" class="contrast">
                <strong>{site.name}</strong> admin
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
              <li>
                <form method="post" action="/admin/logout" class="inline">
                  <button type="submit" class="outline secondary">
                    Log out
                  </button>
                </form>
              </li>
            )}
          </ul>
        </nav>
      </header>
      <main class="container">{children}</main>
    </body>
  </Document>
);

// ---- Section form -------------------------------------------------------

type Values = Record<string, unknown>;
export type FormState = { values: Values; errors?: Record<string, string>; saved?: boolean; updatedAt?: string | null };

const asString = (v: unknown) => (typeof v === "string" ? v : "");
const asImages = (v: unknown): Partial<ImageValue>[] =>
  Array.isArray(v) ? v : v && typeof v === "object" ? [v as Partial<ImageValue>] : [];

const Help = ({ text, error }: { text?: string; error?: string }) =>
  error ? <small class="error">{error}</small> : text ? <small>{text}</small> : null;

const ImageItem = ({ name, image }: { name: string; image?: Partial<ImageValue> }) => (
  <div class="img-item">
    <img src={image?.id ? imgUrl(image.id, { width: 240, height: 160 }) : ""} alt="" width={120} height={80} />
    <input type="hidden" name={`${name}.id`} value={image?.id ?? ""} />
    <input type="hidden" name={`${name}.width`} value={String(image?.width ?? "")} />
    <input type="hidden" name={`${name}.height`} value={String(image?.height ?? "")} />
    <input
      name={`${name}.alt`}
      value={image?.alt ?? ""}
      placeholder="Describe the image (alt text)"
      aria-label="Alt text"
      required
      maxlength={300}
    />
    <button type="button" class="outline secondary" data-remove>
      Remove
    </button>
  </div>
);

const ImageField = ({ field, value, error }: { field: Field; value: unknown; error?: string }) => {
  const multiple = field.type === "images";
  const max = field.type === "images" ? field.max : 1;
  return (
    <fieldset data-image-field data-multiple={String(multiple)} data-max={max ? String(max) : undefined}>
      <legend>
        {field.label}
        {field.required && " *"}
      </legend>
      <div class="img-list">
        {asImages(value).map((image) => (
          <ImageItem name={field.name} image={image} />
        ))}
      </div>
      <template>
        <ImageItem name={field.name} />
      </template>
      {cloudName() ? (
        <button type="button" class="secondary" data-upload>
          {multiple ? "Add images" : "Upload image"}
        </button>
      ) : (
        <small>Image uploads aren't configured (set the CLOUDINARY_* environment variables).</small>
      )}
      <Help text={field.help} error={error} />
    </fieldset>
  );
};

const FieldInput = ({ field, value, error }: { field: Field; value: unknown; error?: string }) => {
  if (field.type === "image" || field.type === "images") return <ImageField field={field} value={value} error={error} />;
  const common = {
    name: field.name,
    required: field.required,
    maxlength: field.max,
    "aria-invalid": error ? "true" : undefined,
  };
  return (
    <label>
      {field.label}
      {field.required && " *"}
      {field.type === "textarea" ? (
        <textarea {...common} rows={Math.min(12, Math.max(3, Math.round((field.max ?? 600) / 150)))}>
          {asString(value)}
        </textarea>
      ) : (
        <input type="text" {...common} value={asString(value)} />
      )}
      <Help text={field.help} error={error} />
    </label>
  );
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(site.ogLocale.replace("_", "-"), { dateStyle: "medium", timeStyle: "short" });

export const SectionForm = ({ section, state }: { section: Section; state: FormState }) => {
  const url = `/admin/sections/${section.key}`;
  const hasErrors = state.errors && Object.keys(state.errors).length > 0;
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
        {section.fields.map((f) => (
          <FieldInput field={f} value={state.values[f.name]} error={state.errors?.[f.name]} />
        ))}
        <footer class="form-footer">
          <button type="submit">Save</button>
          <span role="status">
            {state.saved && <ins>Saved ✓</ins>}
            {hasErrors && <del>Not saved — please fix the highlighted fields.</del>}
            {!state.saved && !hasErrors && state.updatedAt && (
              <small>Last saved {formatDate(state.updatedAt)}</small>
            )}
          </span>
        </footer>
      </article>
    </form>
  );
};
