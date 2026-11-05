import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../lib/auth.js', import.meta.url), 'utf8');
const isolated = source.replace(/^import .*;$/gm, '') + '\n//# sourceURL=auth-under-test.js';
async function load(payload, storedUser) {
  globalThis.authMocks = {
    prisma: { user: { findUnique: async ({ where }) => {
      assert.equal(where.id, payload.id);
      return storedUser;
    } } },
    cookies: async () => ({ get: () => ({ value: 'signed-cookie' }) }),
    verifyToken: async () => payload,
    NextResponse: { json: (body, init) => ({ body, ...init }) },
  };
  const prelude = 'const { prisma, cookies, verifyToken, NextResponse } = globalThis.authMocks;';
  return import('data:text/javascript;base64,' + Buffer.from(prelude + isolated + `\n// ${Math.random()}`).toString('base64'));
}
test('demoted administrator is denied even with ADMIN in the signed token', async () => {
  const auth = await load({ id: 1, role: 'ADMIN' }, { id: 1, role: 'OPERATOR' });
  const result = await auth.requireAdmin();
  assert.equal(result.response.status, 403);
});
test('deleted user cannot reuse an unexpired token', async () => {
  const auth = await load({ id: 1, role: 'ADMIN' }, null);
  assert.equal((await auth.requireAuth()).response.status, 401);
});
test('current database role allows an administrator', async () => {
  const auth = await load({ id: 1, role: 'OPERATOR' }, { id: 1, role: 'ADMIN' });
  assert.equal((await auth.requireAdmin()).user.role, 'ADMIN');
});
