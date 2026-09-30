import type {Child} from 'hono/jsx';
import type {FieldValue, ImageValue, ListItem} from '../../schema';
import {imgUrl, srcset} from '../../cloudinary';
import {CONTACT_FORM, PAGES, site} from '../../site';
import {Document, type Meta} from '../document';

export function str(v: FieldValue | undefined): string {
  return typeof v === 'string' ? v : '';
}

export function img(v: FieldValue | undefined): ImageValue | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
}

function isImage(item: ImageValue | ListItem): item is ImageValue {
  return 'id' in item && 'alt' in item;
}

export function imgs(v: FieldValue | undefined): ImageValue[] {
  return Array.isArray(v) ? v.filter(isImage) : [];
}

export function list(v: FieldValue | undefined): ListItem[] {
  return Array.isArray(v)
    ? v.filter((item): item is ListItem => !isImage(item))
    : [];
}

export function Paragraphs({text}: {text: string}) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <>
      {paragraphs.map(p => (
        <p>
          {p.split('\n').map((line, i) => (
            <>
              {i > 0 && <br />}
              {line}
            </>
          ))}
        </p>
      ))}
    </>
  );
}

interface ImageProps {
  image: ImageValue;
  sizes?: string;
  priority?: boolean;
  maxWidth?: number;
}

export function CldImage({
  image,
  sizes = '100vw',
  priority,
  maxWidth,
}: ImageProps) {
  const width = Math.min(maxWidth ?? 1200, image.width || 1200);

  return (
    <img
      src={imgUrl(image.id, {width})}
      srcset={srcset(image, maxWidth)}
      sizes={sizes}
      alt={image.alt}
      width={image.width || undefined}
      height={image.height || undefined}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={priority ? 'high' : undefined}
    />
  );
}

// Each link opens the full image, so the grid works without JavaScript
export function GalleryGrid({
  images,
  captions,
}: {
  images: ImageValue[];
  captions?: boolean;
}) {
  return (
    <>
      <div class="gallery" data-lightbox>
        {images.map(image => (
          <figure>
            <a
              href={imgUrl(image.id, {width: 2400})}
              data-caption={image.caption}
            >
              <CldImage
                image={image}
                sizes="(min-width: 768px) 33vw, 100vw"
                maxWidth={1200}
              />
            </a>
            {captions && image.caption && (
              <figcaption>{image.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
      <script src="/assets/lightbox.js" defer></script>
    </>
  );
}

// Netlify Forms handles the POST: /thanks is a static page, which is where
// the form definition gets detected at deploy time
export function ContactForm() {
  return (
    <form
      name={CONTACT_FORM.name}
      method="post"
      action="/thanks"
      data-netlify="true"
      netlify-honeypot="bot-field"
      class="contact-form"
    >
      <input type="hidden" name="form-name" value={CONTACT_FORM.name} />
      <p hidden>
        <label>
          Leave this empty: <input name="bot-field" tabindex={-1} />
        </label>
      </p>
      {CONTACT_FORM.fields.map(f => (
        <label>
          {f.label}
          {f.required && ' *'}
          {f.type === 'textarea' ? (
            <textarea name={f.name} rows={5} required={f.required}></textarea>
          ) : (
            <input
              type={f.type}
              name={f.name}
              autocomplete={f.autocomplete}
              required={f.required}
            />
          )}
        </label>
      ))}
      <button type="submit">Send message</button>
    </form>
  );
}

interface LayoutProps {
  meta: Meta;
  currentPath: string;
  footer: {text: string; email: string};
  children?: Child;
}

export function PublicLayout({
  meta,
  currentPath,
  footer,
  children,
}: LayoutProps) {
  return (
    <Document meta={meta}>
      <body>
        <header class="container">
          <nav>
            <ul>
              <li>
                <a href="/" class="contrast">
                  <strong>{site.name}</strong>
                </a>
              </li>
            </ul>
            <ul>
              {PAGES.map(p => (
                <li>
                  <a
                    href={p.path}
                    aria-current={p.path === currentPath ? 'page' : undefined}
                  >
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main class="container">{children}</main>
        <footer class="container">
          <small>
            {footer.text}
            {footer.email && (
              <>
                {' · '}
                <a href={`mailto:${footer.email}`}>{footer.email}</a>
              </>
            )}
          </small>
        </footer>
      </body>
    </Document>
  );
}
