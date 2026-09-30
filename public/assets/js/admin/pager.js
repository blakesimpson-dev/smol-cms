// Long image lists show one page at a time. Hidden items are still in the
// form, so saving always posts the whole list
const PAGE_SIZE = 24;

function pageCount(list) {
  return Math.ceil(list.children.length / PAGE_SIZE);
}

function renderPager(field, current, pages) {
  let pager = field.querySelector('.pager');
  if (!pager) {
    pager = document.createElement('nav');
    pager.className = 'pager';
    pager.setAttribute('aria-label', 'Image pages');
    field.querySelector('.item-list').after(pager);
  }
  pager.innerHTML = `
    <button type="button" class="outline secondary" data-page="${current - 1}" aria-label="Previous page" ${current === 1 ? 'disabled' : ''}>‹</button>
    <span>${current} / ${pages}</span>
    <button type="button" class="outline secondary" data-page="${current + 1}" aria-label="Next page" ${current === pages ? 'disabled' : ''}>›</button>`;
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
