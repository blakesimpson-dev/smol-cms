import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {Section} from '../src/content/types';
import {fromForm} from '../src/lib/form_data';

const SECTION: Section = {
  key: 'test',
  label: 'Test',
  fields: [
    {name: 'heading', label: 'Heading', type: 'text'},
    {name: 'photo', label: 'Photo', type: 'image'},
    {
      name: 'gallery',
      label: 'Gallery',
      type: 'images',
      captions: true,
      featured: true,
    },
    {
      name: 'quotes',
      label: 'Quotes',
      type: 'list',
      itemLabel: 'Quote',
      fields: [
        {name: 'quote', label: 'Quote', type: 'textarea'},
        {name: 'author', label: 'Name', type: 'text'},
      ],
    },
  ],
};

test('repeated inputs are zipped into images, in order', () => {
  const out = fromForm(SECTION, {
    heading: 'Hello',
    'gallery.id': ['a', 'b'],
    'gallery.alt': ['First', 'Second'],
    'gallery.width': ['100', '200'],
    'gallery.height': ['50', '60'],
    'gallery.caption': ['One', ''],
    'gallery.featured': 'b',
  });

  assert.equal(out.heading, 'Hello');
  assert.equal(out.photo, null);
  assert.deepEqual(out.gallery, [
    {
      id: 'a',
      alt: 'First',
      width: '100',
      height: '50',
      caption: 'One',
      featured: false,
    },
    {
      id: 'b',
      alt: 'Second',
      width: '200',
      height: '60',
      caption: '',
      featured: true,
    },
  ]);
});

test('rows still uploading (no id yet) are dropped', () => {
  const out = fromForm(SECTION, {
    'photo.id': '',
    'photo.alt': '',
    'gallery.id': ['', 'b'],
    'gallery.alt': ['', 'Second'],
  });

  assert.equal(out.photo, null);
  assert.equal((out.gallery as unknown[]).length, 1);
});

test('list fields become one object per item', () => {
  const out = fromForm(SECTION, {
    'quotes.quote': ['Great', 'Lovely'],
    'quotes.author': ['Sam', 'Alex'],
  });

  assert.deepEqual(out.quotes, [
    {quote: 'Great', author: 'Sam'},
    {quote: 'Lovely', author: 'Alex'},
  ]);
});
