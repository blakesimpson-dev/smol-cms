import {SITE} from '../../content';
import {MenuIcon} from '../icons';
import {MENU_ID, MenuPanel} from './menu_panel';

interface SiteHeaderProps {
  currentPath: string;
  copyright: string;
  overlay?: boolean;
}

export function SiteHeader({currentPath, copyright, overlay}: SiteHeaderProps) {
  return (
    <header class={overlay ? 'site-header overlay' : 'site-header'}>
      <nav class="container">
        <ul>
          <li>
            <a href="/" class="logo">
              <img
                src={SITE.logo.src}
                alt={SITE.logo.alt}
                width={SITE.logo.width}
                height={SITE.logo.height}
              />
            </a>
          </li>
        </ul>
        <ul class="nav-links">
          {SITE.nav.map(link => (
            <li>
              <a
                href={link.href}
                aria-current={link.href === currentPath ? 'page' : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
          {SITE.cta && (
            <li>
              <a href={SITE.cta.href} role="button">
                {SITE.cta.label}
              </a>
            </li>
          )}
        </ul>
        <button
          type="button"
          class="menu-toggle"
          popovertarget={MENU_ID}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
      </nav>
      <MenuPanel currentPath={currentPath} copyright={copyright} />
    </header>
  );
}
