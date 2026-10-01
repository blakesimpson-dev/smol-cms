import {pageHref, pageNumbers} from '../../lib/pagination';

interface PagerProps {
  path: string;
  page: number;
  pages: number;
}

// Plain links, so every page works without JavaScript and can be crawled
export function Pager({path, page, pages}: PagerProps) {
  if (pages <= 1) {
    return null;
  }

  return (
    <nav class="pager" aria-label="Gallery pages">
      {page > 1 ? (
        <a
          href={pageHref(path, page - 1)}
          rel="prev"
          aria-label="Previous page"
        >
          ‹
        </a>
      ) : (
        <span aria-hidden="true">‹</span>
      )}
      {pageNumbers(page, pages).map(n =>
        n === null ? (
          <span class="gap" aria-hidden="true">
            …
          </span>
        ) : (
          <a
            href={pageHref(path, n)}
            aria-label={`Page ${String(n)}`}
            aria-current={n === page ? 'page' : undefined}
          >
            {n}
          </a>
        ),
      )}
      {page < pages ? (
        <a href={pageHref(path, page + 1)} rel="next" aria-label="Next page">
          ›
        </a>
      ) : (
        <span aria-hidden="true">›</span>
      )}
    </nav>
  );
}
