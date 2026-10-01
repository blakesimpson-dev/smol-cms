import assert from 'node:assert/strict';
import {test} from 'node:test';
import {imgUrl, srcset} from '../src/lib/images';

process.env.CLOUDINARY_CLOUD_NAME = 'demo';

test('local defaults use the smallest shipped width that covers the request', () => {
  const id = '/assets/images/defaults/hero';

  assert.equal(imgUrl(id, {width: 600}), `${id}-800.jpg`);
  assert.equal(imgUrl(id, {width: 1200}), `${id}-1600.jpg`);
  assert.equal(imgUrl(id, {width: 5000}), `${id}-2400.jpg`);
});

test('Cloudinary urls carry resize and crop transforms', () => {
  assert.equal(
    imgUrl('folder/photo', {width: 800, height: 600}),
    'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800,h_600,c_fill,g_auto/folder/photo',
  );
});

test('srcset never offers widths beyond the original image', () => {
  const widths = srcset({id: 'a', alt: '', width: 1000, height: 500})
    .split(', ')
    .map(entry => entry.split(' ')[1]);

  assert.deepEqual(widths, ['320w', '480w', '640w', '800w', '1000w']);
});

test('srcset crops every candidate to the requested aspect ratio', () => {
  const entries = srcset(
    {id: 'a', alt: '', width: 3000, height: 4000},
    640,
    4 / 3,
  ).split(', ');

  assert.equal(entries.length, 3);
  assert.match(entries[2], /w_640,h_480,c_fill,g_auto\/a 640w$/);
});
