import type {Child} from 'hono/jsx';
import {SITE} from '../../content';
import {Document} from '../document';
import {MenuIcon} from '../icons';

const HTMX = '/assets/js/vendor/htmx.min.js';
// htmx's injected indicator <style> would be blocked by the CSP
const HTMX_CONFIG = JSON.stringify({includeIndicatorStyles: false});
const MENU_ID = 'admin-menu';

interface AdminLayoutProps {
  title: string;
  loggedIn?: boolean;
  children?: Child;
}

function Scripts() {
  return (
    <>
      <meta name="htmx-config" content={HTMX_CONFIG} />
      <script src={HTMX} defer></script>
      <script type="module" src="/assets/js/admin/main.js"></script>
    </>
  );
}

function AccountLinks() {
  return (
    <>
      <li>
        <a href="/" target="_blank">
          View site ↗
        </a>
      </li>
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
  );
}

// Phones get the same links in a dropdown, using a native popover
function AccountMenu() {
  return (
    <>
      <ul class="admin-links">
        <AccountLinks />
      </ul>
      <button
        type="button"
        class="admin-menu-toggle"
        popovertarget={MENU_ID}
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>
      <ul id={MENU_ID} popover="auto" class="admin-menu">
        <AccountLinks />
      </ul>
    </>
  );
}

export function AdminLayout({title, loggedIn, children}: AdminLayoutProps) {
  return (
    <Document
      meta={{title: `${title} · ${SITE.name} admin`, noindex: true}}
      stylesheet="/assets/css/admin.css"
      head={loggedIn && <Scripts />}
    >
      <body>
        <header class="container">
          <nav>
            <ul>
              <li>
                <a href="/admin" class="contrast brand">
                  {SITE.name}
                </a>
              </li>
            </ul>
            {loggedIn ? (
              <AccountMenu />
            ) : (
              <ul>
                <li>
                  <a href="/" target="_blank">
                    View site ↗
                  </a>
                </li>
              </ul>
            )}
          </nav>
        </header>
        <main class="container">{children}</main>
      </body>
    </Document>
  );
}
