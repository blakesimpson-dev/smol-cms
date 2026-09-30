import {SITE} from '../../content';
import {CloseIcon} from '../icons';

export const MENU_ID = 'site-menu';

interface MenuPanelProps {
  currentPath: string;
  copyright: string;
}

// A native popover: opening, closing, Esc and focus handling need no script.
// menu.js only closes it when a link targets the current page
export function MenuPanel({currentPath, copyright}: MenuPanelProps) {
  return (
    <div id={MENU_ID} popover="auto" class="menu-panel">
      <button
        type="button"
        class="menu-close"
        popovertarget={MENU_ID}
        popovertargetaction="hide"
        aria-label="Close menu"
      >
        <CloseIcon />
      </button>
      <nav aria-label="Menu">
        <ul>
          {SITE.nav
            .filter(link => link.href !== currentPath)
            .map(link => (
              <li>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          {SITE.cta && (
            <li>
              <a href={SITE.cta.href} class="menu-cta">
                {SITE.cta.label}
              </a>
            </li>
          )}
        </ul>
      </nav>
      <p class="menu-footer">{copyright}</p>
      <script type="module" src="/assets/js/menu.js"></script>
    </div>
  );
}
