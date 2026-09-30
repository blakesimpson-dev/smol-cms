import type {Child} from 'hono/jsx';
import {Document, type Meta} from '../document';
import {SiteFooter, type FooterContent} from './site_footer';
import {SiteHeader} from './site_header';

interface PublicLayoutProps {
  meta: Meta;
  currentPath: string;
  footer: FooterContent;
  overlayHeader?: boolean;
  children?: Child;
}

export function PublicLayout({
  meta,
  currentPath,
  footer,
  overlayHeader,
  children,
}: PublicLayoutProps) {
  return (
    <Document meta={meta} stylesheet="/assets/css/public.css">
      <body>
        <SiteHeader
          currentPath={currentPath}
          copyright={footer.text}
          overlay={overlayHeader}
        />
        <main>{children}</main>
        <SiteFooter {...footer} />
      </body>
    </Document>
  );
}
