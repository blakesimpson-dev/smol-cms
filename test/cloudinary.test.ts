import assert from 'node:assert/strict';
import {test} from 'node:test';
import {signParams} from '../src/lib/cloudinary';

test('signParams matches the example in the Cloudinary docs', () => {
  const params = {
    public_id: 'sample_image',
    timestamp: '1315060510',
    eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop',
  };

  assert.equal(
    signParams(params, 'abcd'),
    'bfd09f95f331f558cbd1320e67aa8d488770583e',
  );
});

test('signParams ignores empty values', () => {
  assert.equal(
    signParams({timestamp: '1', folder: '', tags: undefined}, 'x'),
    signParams({timestamp: '1'}, 'x'),
  );
});
