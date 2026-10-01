import assert from 'node:assert/strict';
import {test} from 'node:test';
import {PAGES, SECTIONS} from '../src/content';
import type {Page, SectionData} from '../src/content/types';
import {defaults} from '../src/lib/sections';
import {pageMeta, robotsTxt} from '../src/lib/seo';

const DEPLOY = {isProd: true, siteUrl: 'https://example.com'};

function homeData(intro: string): Record<string, SectionData> {
  const data = Object.fromEntries(SECTIONS.map(s => [s.key, defaults(s)]));
  data['home.hero'] = {...data['home.hero'], intro};

  return data;
}

function page(key: string): Page {
  const found = PAGES.find(p => p.key === key);
  assert.ok(found);

  return found;
}

test('description is inferred from the first text block, cut at a word', () => {
  const home = {...page('home'), description: undefined};
  const meta = pageMeta(home, homeData('word '.repeat(60)), DEPLOY);

  assert.ok(meta.description);
  assert.ok(meta.description.length <= 156);
  assert.ok(meta.description.endsWith('word…'));
});

test('title and description overrides in pages.json win', () => {
  const custom = {...page('home'), title: 'Custom', description: 'Override'};
  const meta = pageMeta(custom, homeData('Ignored'), DEPLOY);

  assert.equal(meta.title, 'Custom');
  assert.equal(meta.description, 'Override');
});

test('canonical url and share image come from the page', () => {
  const meta = pageMeta(page('gallery'), homeData(''), DEPLOY);

  assert.equal(meta.canonical, 'https://example.com/gallery');
  assert.ok(meta.image?.startsWith('/assets/images/defaults/gallery-1'));
});

test('later pages of a paginated view get their own title and canonical', () => {
  const meta = pageMeta(page('gallery'), homeData(''), DEPLOY, 2);

  assert.equal(meta.canonical, 'https://example.com/gallery?page=2');
  assert.match(meta.title, / · Page 2$/);
});

test('previews are kept out of search engines', () => {
  assert.equal(
    robotsTxt({...DEPLOY, isProd: false}),
    'User-agent: *\nDisallow: /\n',
  );
  assert.match(robotsTxt(DEPLOY), /Disallow: \/admin/);
});
