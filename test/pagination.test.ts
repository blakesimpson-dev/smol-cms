import assert from 'node:assert/strict';
import {test} from 'node:test';
import {
  pageCount,
  pageHref,
  pageNumbers,
  paginate,
  parsePage,
} from '../src/lib/pagination';

test('page numbers come from whole positive numbers only', () => {
  assert.equal(parsePage(undefined), 1);
  assert.equal(parsePage('3'), 3);
  for (const junk of ['0', '-1', '1.5', '01', 'abc', '', '9999999']) {
    assert.equal(parsePage(junk), null, junk);
  }
});

test('paginate slices one page and counts at least one page', () => {
  const items = Array.from({length: 40}, (unused, i) => i);
  const last = paginate(items, 3, 18);

  assert.deepEqual(last.items, [36, 37, 38, 39]);
  assert.equal(last.pages, 3);
  assert.equal(pageCount(0, 18), 1);
});

test('page 1 has no query string', () => {
  assert.equal(pageHref('/gallery', 1), '/gallery');
  assert.equal(pageHref('/gallery', 2), '/gallery?page=2');
});

test('pager numbers keep the ends and the current neighbours', () => {
  assert.deepEqual(pageNumbers(1, 3), [1, 2, 3]);
  assert.deepEqual(pageNumbers(5, 9), [1, null, 4, 5, 6, null, 9]);
  assert.deepEqual(pageNumbers(2, 9), [1, 2, 3, null, 9]);
});
