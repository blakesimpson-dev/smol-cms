import {SITE} from '../../content';

export interface FooterContent {
  text: string;
  email: string;
}

export function SiteFooter({text, email}: FooterContent) {
  return (
    <footer class="site-footer">
      <div class="container">
        <p>{text}</p>
        <nav aria-label="Footer">
          <ul>
            {SITE.nav.map(link => (
              <li>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
            {email && (
              <li>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
