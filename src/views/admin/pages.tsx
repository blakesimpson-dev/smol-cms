import type { Section } from "../../schema";
import { AdminLayout, SectionForm, type FormState } from "./components";

export type Group = { key: string; label: string; path?: string; sections: string[] };

export const Login = ({ error, configured }: { error?: string; configured: boolean }) => (
  <AdminLayout title="Log in">
    <article class="narrow">
      <h1>Log in</h1>
      {configured ? (
        <form method="post" action="/admin/login">
          <label>
            Password
            <input
              type="password"
              name="password"
              autocomplete="current-password"
              required
              autofocus
              aria-invalid={error ? "true" : undefined}
            />
            {error && <small class="error">{error}</small>}
          </label>
          <button type="submit">Log in</button>
        </form>
      ) : (
        <p>
          The admin isn't set up yet. Set <code>ADMIN_PASSWORD</code> and <code>SESSION_SECRET</code> in the Netlify
          environment variables (or in <code>.env</code> for local development), then reload.
        </p>
      )}
    </article>
  </AdminLayout>
);

export const Dashboard = ({ groups }: { groups: Group[] }) => (
  <AdminLayout title="Dashboard" loggedIn>
    <h1>What would you like to edit?</h1>
    <div class="cards">
      {groups.map((g) => (
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

type EditProps = { group: Group; forms: { section: Section; state: FormState }[]; uploadFolder: string };

export const EditGroup = ({ group, forms, uploadFolder }: EditProps) => (
  <AdminLayout title={group.label} loggedIn uploadFolder={uploadFolder}>
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
    {forms.map(({ section, state }) => (
      <SectionForm section={section} state={state} />
    ))}
  </AdminLayout>
);
