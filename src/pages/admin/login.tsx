import {AdminLayout} from '../../components/admin/layout';
import {SupportContact} from '../../components/admin/support_contact';

interface LoginProps {
  error?: string;
  configured: boolean;
}

function NotConfigured() {
  return (
    <p>
      The admin isn't set up yet. Set <code>ADMIN_PASSWORD</code> and{' '}
      <code>SESSION_SECRET</code> in the Netlify environment variables (or in{' '}
      <code>.env</code> for local development), then reload.
    </p>
  );
}

export function Login({error, configured}: LoginProps) {
  return (
    <AdminLayout title="Log in">
      <article class="narrow">
        <h1>Log in</h1>
        {configured ? (
          <>
            <form method="post" action="/admin/login">
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  autocomplete="current-password"
                  required
                  autofocus
                  aria-invalid={error ? 'true' : undefined}
                />
                {error && <small class="error">{error}</small>}
              </label>
              <button type="submit">Log in</button>
            </form>
            <details>
              <summary>Forgot password?</summary>
              <SupportContact />
            </details>
          </>
        ) : (
          <NotConfigured />
        )}
      </article>
    </AdminLayout>
  );
}
