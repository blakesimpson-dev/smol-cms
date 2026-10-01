// Pages before and after the current one shown in a pager before a gap
const PAGE_SPREAD = 1;

export interface Paged<T> {
  items: T[];
  page: number;
  pages: number;
}

// `?page=` as a positive whole number; missing means page 1, junk is null
export function parsePage(raw: string | undefined): number | null {
  if (raw === undefined) {
    return 1;
  }

  return /^[1-9]\d{0,5}$/.test(raw) ? Number(raw) : null;
}

export function pageCount(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size));
}

export function paginate<T>(items: T[], page: number, size: number): Paged<T> {
  return {
    items: items.slice((page - 1) * size, page * size),
    page,
    pages: pageCount(items.length, size),
  };
}

// Page 1 is the bare path, so it has a single URL
export function pageHref(path: string, page: number): string {
  return page === 1 ? path : `${path}?page=${String(page)}`;
}

// First, last and the pages around the current one; null marks a gap,
// e.g. 1 … 4 5 6 … 9
export function pageNumbers(
  current: number,
  pages: number,
): Array<number | null> {
  const numbers: Array<number | null> = [];
  for (let n = 1; n <= pages; n++) {
    if (n === 1 || n === pages || Math.abs(n - current) <= PAGE_SPREAD) {
      numbers.push(n);
    } else if (numbers.at(-1) !== null) {
      numbers.push(null);
    }
  }

  return numbers;
}
