// Long image lists show one page at a time. Hidden items are still in the
// form, so saving always posts the whole list
const PAGE_SIZE = 12;
// Page buttons shown either side of the current one before a gap (…)
const PAGE_SPREAD = 1;

function pageCount(list) {
  return Math.ceil(list.children.length / PAGE_SIZE);
}

// 1 … 4 5 6 … 9: first, last and the pages around the current one
function pageNumbers(current, pages) {
  const numbers = [];
  for (let n = 1; n <= pages; n++) {
    const near = Math.abs(n - current) <= PAGE_SPREAD;
    if (n === 1 || n === pages || near) {
      numbers.push(n);
    } else if (numbers.at(-1) !== null) {
      numbers.push(null);
    }
  }

  return numbers;
}

function pageButton(page, label, attrs = '') {
  return `<button type="button" class="outline secondary" data-page="${page}" ${attrs}>${label}</button>`;
}

function renderPager(field, current, pages) {
  let pager = field.querySelector('.pager');
  if (!pager) {
    pager = document.createElement('nav');
    pager.className = 'pager';
    pager.setAttribute('aria-label', 'Image pages');
    field.querySelector('.item-list').after(pager);
  }
  const numbers = pageNumbers(current, pages).map(n => {
    if (n === null) {
      return '<span class="gap" aria-hidden="true">…</span>';
    }
    if (n === current) {
      return `<button type="button" aria-current="page" aria-label="Page ${n}" disabled>${n}</button>`;
    }

    return pageButton(n, n, `aria-label="Page ${n}"`);
  });
  pager.innerHTML = [
    pageButton(
      current - 1,
      '‹',
      `aria-label="Previous page" ${current === 1 ? 'disabled' : ''}`,
    ),
    ...numbers,
    pageButton(
      current + 1,
      '›',
      `aria-label="Next page" ${current === pages ? 'disabled' : ''}`,
    ),
  ].join('');
}

export function showPage(field, page) {
  const list = field.querySelector('.item-list');
  const pages = pageCount(list);
  if (pages <= 1) {
    for (const item of list.children) {
      item.hidden = false;
    }
    field.querySelector('.pager')?.remove();
    return;
  }
  const current = Math.min(Math.max(page, 1), pages);
  field.dataset.page = String(current);
  [...list.children].forEach((item, i) => {
    item.hidden = Math.floor(i / PAGE_SIZE) + 1 !== current;
  });
  renderPager(field, current, pages);
}

export function pageOf(item) {
  const index = [...item.parentElement.children].indexOf(item);

  return Math.floor(index / PAGE_SIZE) + 1;
}

export function lastPage(field) {
  return pageCount(field.querySelector('.item-list'));
}
