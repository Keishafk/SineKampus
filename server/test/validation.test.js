import test from 'node:test';
import assert from 'node:assert/strict';
import { filmQuerySchema, parse } from '../src/validation.js';

test('film query applies pagination defaults', () => {
  assert.deepEqual(parse(filmQuerySchema, {}), { page: 1, limit: 20 });
});

test('film query coerces supported filters', () => {
  assert.deepEqual(parse(filmQuerySchema, {
    search: 'love', genre: 'Drama', department: 'College of Education', year: '2025', page: '2', limit: '5',
  }), {
    search: 'love', genre: 'Drama', department: 'College of Education', year: 2025, page: 2, limit: 5,
  });
});

test('film query rejects invalid pagination and unknown fields', () => {
  assert.throws(() => parse(filmQuerySchema, { page: '0' }), /Invalid request parameters/);
  assert.throws(() => parse(filmQuerySchema, { unexpected: 'value' }), /Invalid request parameters/);
});
