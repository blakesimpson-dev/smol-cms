import {Help} from '../../components/admin/help';
import {AdminLayout} from '../../components/admin/layout';
import {PageHead} from '../../components/admin/page_head';
import {MIN_PASSWORD_LENGTH} from '../../lib/auth';

export interface AccountErrors {
  current?: string;
  password?: string;
  confirm?: string;
}

interface AccountProps {
  errors?: AccountErrors;
  saved?: boolean;
}

export function Account({errors = {}, saved}: AccountProps) {
  return (
    <AdminLayout title="Account" loggedIn>
      <PageHead title="Account" />
      <form method="post" action="/admin/account">
        <article>
          <header>
            <strong>Change password</strong>
            <br />
            <small>This signs you out on your other devices.</small>
          </header>
          <label>
            Current password
            <input
              type="password"
              name="current"
              autocomplete="current-password"
              required
              aria-invalid={errors.current ? 'true' : undefined}
            />
            <Help error={errors.current} />
          </label>
          <label>
            New password
            <input
              type="password"
              name="password"
              autocomplete="new-password"
              required
              minlength={MIN_PASSWORD_LENGTH}
              aria-invalid={errors.password ? 'true' : undefined}
            />
            <Help
              text={`At least ${String(MIN_PASSWORD_LENGTH)} characters.`}
              error={errors.password}
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              name="confirm"
              autocomplete="new-password"
              required
              aria-invalid={errors.confirm ? 'true' : undefined}
            />
            <Help error={errors.confirm} />
          </label>
          <footer class="form-footer">
            <span role="status">{saved && <ins>Password changed ✓</ins>}</span>
            <button type="submit">Change password</button>
          </footer>
        </article>
      </form>
    </AdminLayout>
  );
}
