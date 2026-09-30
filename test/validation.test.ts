import assert from 'node:assert/strict';
import {test} from 'node:test';
import {SECTIONS} from '../src/content';
import type {Section} from '../src/content/types';
import {defaults} from '../src/lib/sections';
import {fieldErrors, sectionSchema} from '../src/lib/validation';

const SECTION: Section = {
  key: 'test',
  label: 'Test',
  fields: [
    {name: 'heading', label: 'Heading', type: 'text', required: true},
    {name: 'when', label: 'Date', type: 'date'},
    {name: 'gallery', label: 'Gallery', type: 'images'},
    {
      name: 'quotes',
      label: 'Quotes',
      type: 'list',
      itemLabel: 'Testimonial',
      fields: [{name: 'quote', label: 'Quote', type: 'text', required: true}],
    },
  ],
};

function errorsFor(values: Record<string, unknown>): Record<string, string> {
  const result = sectionSchema(SECTION).safeParse(values);
  if (result.success) {
    throw new Error('Expected validation to fail');
  }

  return fieldErrors(SECTION, result.error);
}

const IMAGE = {id: 'a', alt: 'An image', width: 10, height: 10};

test('every bundled default passes its own validation', () => {
  for (const section of SECTIONS) {
    const result = sectionSchema(section).safeParse(defaults(section));
    assert.ok(result.success, `defaults for ${section.key} are invalid`);
  }
});

test('errors name the item they belong to', () => {
  const errors = errorsFor({
    heading: '',
    when: '1 May',
    gallery: [IMAGE, {...IMAGE, alt: ''}],
    quotes: [{quote: ''}],
  });

  assert.equal(errors.heading, 'Required');
  assert.equal(errors.when, 'Enter a valid date');
  assert.match(errors.gallery, /^Image 2: /);
  assert.equal(errors.quotes, 'Testimonial 1: Required');
});

test('image ids that could point at another host are rejected', () => {
  for (const id of ['//evil.example/x', 'https://evil.example/x', 'a/../b']) {
    const errors = errorsFor({heading: 'Hi', gallery: [{...IMAGE, id}]});
    assert.equal(errors.gallery, 'Image 1: Invalid image');
  }
});

test('local default paths and Cloudinary ids are accepted', () => {
  const result = sectionSchema(SECTION).safeParse({
    heading: 'Hi',
    when: '2025-05-01',
    gallery: [
      {...IMAGE, id: '/assets/images/defaults/hero'},
      {...IMAGE, id: 'smol-cms/production/Screen Shot_ab12'},
    ],
    quotes: [],
  });

  assert.ok(result.success);
});
