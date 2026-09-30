interface PageHeadProps {
  title: string;
  viewHref?: string;
}

export function PageHead({title, viewHref}: PageHeadProps) {
  return (
    <div class="page-head">
      <a href="/admin" class="back-link">
        ← Dashboard
      </a>
      <div class="page-title-row">
        <h1>{title}</h1>
        {viewHref && (
          <a href={viewHref} target="_blank" role="button" class="outline">
            View page ↗
          </a>
        )}
      </div>
    </div>
  );
}
