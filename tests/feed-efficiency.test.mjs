import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEfficiency } from '../lib/feed-efficiency.mjs';
const growth = (animal_id, weight, date, id = 1) => ({ animal_id, weight, date, id });
const feed = (animal_id, quantity, date) => ({ animal_id, quantity, date });
test('matches feed to measured animals and intervals, including losses', () => {
  const result = calculateEfficiency([
    growth(1, 500, '2026-01-01'), growth(1, 1000, '2026-01-03'),
    growth(2, 600, '2026-01-01'), growth(2, 500, '2026-01-03'),
    growth(3, 500, '2026-01-01'),
  ], [feed(1, 1, '2026-01-02'), feed(2, 1, '2026-01-03'),
    feed(1, 50, '2026-01-01'), feed(1, 50, '2026-01-04'), feed(3, 50, '2026-01-02')]);
  assert.deepEqual(result, { food: 2, gain: 400, count: 2, ica: 5 });
});
test('insufficient measurements and nonpositive gain have no ICA', () => {
  assert.equal(calculateEfficiency([], []).ica, null);
  const result = calculateEfficiency([growth(1, 600, '2026-01-01'), growth(1, 500, '2026-01-03')], [feed(1, 2, '2026-01-02')]);
  assert.equal(result.gain, -100);
  assert.equal(result.ica, null);
});
test('same-date measurements do not create a valid interval', () => {
  assert.equal(calculateEfficiency([growth(1, 500, '2026-01-01', 1), growth(1, 600, '2026-01-01', 2)], []).count, 0);
});
