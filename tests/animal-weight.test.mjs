import test from 'node:test';
import assert from 'node:assert/strict';
import { syncAnimalCurrentWeight } from '../lib/animal-weight.mjs';
test('uses latest measurement for cached weight', async () => {
  let update;
  const tx = { growthLog: { findFirst: async (query) => {
    assert.deepEqual(query.orderBy, [{ date: 'desc' }, { id: 'desc' }]);
    return { weight: 950 };
  } }, animal: { update: async (data) => { update = data; } } };
  await syncAnimalCurrentWeight(tx, 7);
  assert.deepEqual(update, { where: { id: 7 }, data: { currentWeight: 950 } });
});
test('rejects loss of last measurement so caller transaction rolls back', async () => {
  const tx = { growthLog: { findFirst: async () => null },
    animal: { update: async () => assert.fail('must not store a stale weight') } };
  await assert.rejects(syncAnimalCurrentWeight(tx, 7), /LAST_WEIGHT/);
});
