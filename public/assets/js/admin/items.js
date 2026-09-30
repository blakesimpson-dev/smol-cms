import {refresh} from './form_state.js';
import {lastPage, pageOf, showPage} from './pager.js';

export function remaining(field) {
  const max = Number(field.dataset.max) || Infinity;

  return max - field.querySelector('.item-list').children.length;
}

export function newItem(field) {
  const template = field.querySelector('template');
  const item = template.content.firstElementChild.cloneNode(true);
  field.querySelector('.item-list').append(item);
  showPage(field, lastPage(field));

  return item;
}

export function moveItem(item, direction) {
  if (direction === 'up' && item.previousElementSibling) {
    item.previousElementSibling.before(item);
  } else if (direction === 'down' && item.nextElementSibling) {
    item.nextElementSibling.after(item);
  }
  // Moving past the edge of a page follows the item to its new page
  const field = item.closest('fieldset');
  showPage(field, pageOf(item));
  item.querySelector(`[data-move="${direction}"]`).focus();
  refresh(item.closest('form'));
}

export function removeItem(item) {
  const form = item.closest('form');
  const field = item.closest('fieldset');
  const page = pageOf(item);
  const thumb = item.querySelector('.thumb');
  if (thumb?.src.startsWith('blob:')) {
    URL.revokeObjectURL(thumb.src);
  }
  item.remove();
  showPage(field, page);
  refresh(form);
}

export function addListItem(field) {
  if (remaining(field) <= 0) {
    alert('This list is full. Remove an item first.');
    return;
  }
  newItem(field).querySelector('input, textarea').focus();
  refresh(field.closest('form'));
}
