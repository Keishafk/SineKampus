import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

const prisma = {
  $queryRaw: async () => [{ '?column?': 1 }],
  $transaction: async () => [[], 0],
  film: { findMany: async () => [], count: async () => 0, findFirst: async () => null },
  genre: { findMany: async () => [] },
  department: { findMany: async () => [] },
  collection: { findMany: async () => [] },
};
const app = createApp({ prisma });

test('GET /api/health reports database connectivity', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.deepEqual(response.body, { status: 'ok', database: 'connected' });
});

test('GET /api/films returns pagination', async () => {
  const response = await request(app).get('/api/films?year=2025').expect(200);
  assert.deepEqual(response.body, {
    data: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  });
});

test('invalid filters and missing films produce safe errors', async () => {
  await request(app).get('/api/films?page=0').expect(400);
  const response = await request(app).get('/api/films/missing').expect(404);
  assert.equal(response.body.error.message, 'Film not found.');
});
