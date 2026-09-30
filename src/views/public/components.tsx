import type { Child } from "hono/jsx";
import type { FieldValue, ImageValue } from "../../schema";
import { imgUrl, srcset } from "../../cloudinary";
import { PAGES, site } from "../../site";
import { Document, type Meta } from "../Document";

// Accessors for loosely typed section data.
export const str = (v: FieldValue | undefined): string => (typeof v === "string" ? v : "");
export const img = (v: FieldValue | undefined): ImageValue | null =>
  v && typeof v === "object" && !Array.isArray(v) ? v : null;
export const imgs = (v: FieldValue | undefined): ImageValue[] => (Array.isArray(v) ? v : []);

/** Plain text → paragraphs (blank line) and line breaks (single newline). */
export const Paragraphs = ({ text }: { text: string }) => (
  <>
    {text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => (
        <p>
          {p.split("\n").map((line, i) => (
            <>
              {i > 0 && <br />}
              {line}
            </>
          ))}
        </p>
      ))}
  </>
);

type ImageProps = {
  image: ImageValue;
  /** The `sizes` attribute, e.g. "(min-width: 1024px) 50vw, 100vw" */
  sizes?: string;
  /** Set on the main above-the-fold image only */
  priority?: boolean;
  maxWidth?: number;
};

/** Responsive Cloudinary image with intrinsic dimensions to avoid layout shift. */
export const CldImage = ({ image, sizes = "100vw", priority, maxWidth }: ImageProps) => (
  <img
    src={imgUrl(image.id, { width: Math.min(maxWidth ?? 1200, image.width || 1200) })}
    srcset={srcset(image, maxWidth)}
    sizes={sizes}
    alt={image.alt}
    width={image.width || undefined}
    height={image.height || undefined}
    loading={priority ? "eager" : "lazy"}
    decoding="async"
    fetchpriority={priority ? "high" : undefined}
  />
);

type LayoutProps = { meta: Meta; currentPath: string; footer: { text: string; email: string }; children?: Child };

export const PublicLayout = ({ meta, currentPath, footer, children }: LayoutProps) => (
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
            {PAGES.map((p) => (
              <li>
                <a href={p.path} aria-current={p.path === currentPath ? "page" : undefined}>
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
              {" · "}
              <a href={`mailto:${footer.email}`}>{footer.email}</a>
            </>
          )}
        </small>
      </footer>
    </body>
  </Document>
);
