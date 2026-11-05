// Feed is matched to each animal's measured interval (first, last].
export function calculateEfficiency(growthRecords, feedingRecords) {
  const groups = new Map();
  for (const record of growthRecords) {
    if (!groups.has(record.animal_id)) groups.set(record.animal_id, []);
    groups.get(record.animal_id).push(record);
  }
  const windows = new Map();
  let gain = 0;
  for (const [id, records] of groups) {
    records.sort((a, b) => new Date(a.date) - new Date(b.date) || a.id - b.id);
    const first = records[0], last = records.at(-1);
    if (new Date(last.date) <= new Date(first.date)) continue;
    windows.set(id, [new Date(first.date), new Date(last.date)]);
    gain += last.weight - first.weight;
  }
  let food = 0;
  for (const record of feedingRecords) {
    const window = windows.get(record.animal_id);
    const date = new Date(record.date);
    if (window && date > window[0] && date <= window[1]) food += record.quantity;
  }
  return { food, gain, count: windows.size,
    ica: food > 0 && gain > 0 ? food / (gain / 1000) : null };
}
