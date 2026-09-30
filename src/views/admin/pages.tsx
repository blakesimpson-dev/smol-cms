import type {Section} from '../../schema';
import {site} from '../../site';
import {AdminLayout, Help, SectionForm, type FormState} from './components';

export interface Group {
  key: string;
  label: string;
  path?: string;
  sections: string[];
}

function SupportContact() {
  const {name, email, phone} = site.support;

  return (
    <p>
      Contact {name}
      {email && (
        <>
          {' at '}
          <a href={`mailto:${email}`}>{email}</a>
        </>
      )}
      {phone && (
        <>
          {email ? ' or ' : ' on '}
          <a href={`tel:${phone}`}>{phone}</a>
        </>
      )}{' '}
      to reset it. You'll get a temporary password to log in with, then you can
      choose a new one under Account.
    </p>
  );
}

export function Login({
  error,
  configured,
}: {
  error?: string;
  configured: boolean;
}) {
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
          <p>
            The admin isn't set up yet. Set <code>ADMIN_PASSWORD</code> and{' '}
            <code>SESSION_SECRET</code> in the Netlify environment variables (or
            in <code>.env</code> for local development), then reload.
          </p>
        )}
      </article>
    </AdminLayout>
  );
}

export function Dashboard({groups}: {groups: Group[]}) {
  return (
    <AdminLayout title="Dashboard" loggedIn>
      <h1>What would you like to edit?</h1>
      <div class="cards">
        {groups.map(g => (
          <a href={`/admin/edit/${g.key}`} class="card">
            <article>
              <strong>{g.label}</strong>
              {g.path && (
                <>
                  <br />
                  <small>{g.path}</small>
                </>
              )}
            </article>
          </a>
        ))}
      </div>
    </AdminLayout>
  );
}

interface EditProps {
  group: Group;
  forms: Array<{section: Section; state: FormState}>;
}

export function EditGroup({group, forms}: EditProps) {
  return (
    <AdminLayout title={group.label} loggedIn>
      <nav aria-label="breadcrumb">
        <ul>
          <li>
            <a href="/admin">Dashboard</a>
          </li>
          <li>{group.label}</li>
        </ul>
      </nav>
      <hgroup>
        <h1>{group.label}</h1>
        {group.path && (
          <p>
            <a href={group.path} target="_blank">
              View page ↗
            </a>
          </p>
        )}
      </hgroup>
      {forms.map(({section, state}) => (
        <SectionForm section={section} state={state} />
      ))}
    </AdminLayout>
  );
}

export interface AccountErrors {
  current?: string;
  password?: string;
  confirm?: string;
}

export function Account({
  errors = {},
  saved,
  minLength,
}: {
  errors?: AccountErrors;
  saved?: boolean;
  minLength: number;
}) {
  return (
    <AdminLayout title="Account" loggedIn>
      <nav aria-label="breadcrumb">
        <ul>
          <li>
            <a href="/admin">Dashboard</a>
          </li>
          <li>Account</li>
        </ul>
      </nav>
      <h1>Account</h1>
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
              minlength={minLength}
              aria-invalid={errors.password ? 'true' : undefined}
            />
            <Help
              text={`At least ${String(minLength)} characters.`}
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
            <button type="submit">Change password</button>
            <span role="status">{saved && <ins>Password changed ✓</ins>}</span>
          </footer>
        </article>
      </form>
    </AdminLayout>
  );
}
