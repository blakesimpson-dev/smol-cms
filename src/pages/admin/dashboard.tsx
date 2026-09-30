import {AdminLayout} from '../../components/admin/layout';
import type {AdminGroup} from '../../lib/sections';

export function Dashboard({groups}: {groups: AdminGroup[]}) {
  return (
    <AdminLayout title="Dashboard" loggedIn>
      <h1>What would you like to edit?</h1>
      <div class="cards">
        {groups.map(g => (
          <a href={`/admin/edit/${g.key}`} class="card">
            <article>
              <span class="card-title">{g.label}</span>
              {g.path && <span class="card-path">{g.path}</span>}
            </article>
          </a>
        ))}
      </div>
    </AdminLayout>
  );
}
