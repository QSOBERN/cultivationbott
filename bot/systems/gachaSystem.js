const db = require('../database');
const talents = require('../data/talents');

const rollCost = 200;

const weighted = [];
for (let r = 1; r <= 99; r += 1) {
  let chance = 0;
  if (r === 99) chance = 0.05;
  else if (r >= 96) chance = 0.15 - (r - 96) * 0.02;
  else if (r >= 81) chance = 0.5 - (r - 81) * 0.02;
  else if (r >= 61) chance = 1.5 - (r - 61) * 0.03;
  else if (r >= 31) chance = 3.5 - (r - 31) * 0.06;
  else if (r >= 11) chance = 5.5 - (r - 11) * 0.1;
  else chance = 8.5 - (r - 1) * 0.45;
  weighted.push({ rank: r, weight: Math.max(0.02, chance) });
}
const totalWeight = weighted.reduce((a, b) => a + b.weight, 0);

function rollRank() {
  let pick = Math.random() * totalWeight;
  for (const entry of weighted) {
    pick -= entry.weight;
    if (pick <= 0) return entry.rank;
  }
  return 1;
}

function performGacha(userId) {
  const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId);
  if (!player || player.spirit_stones < rollCost) return { error: 'Not enough Spirit Stones' };
  const talentRow = db.prepare('SELECT * FROM talents WHERE user_id = ?').get(userId);
  const rolledRank = rollRank();
  const upgraded = rolledRank > talentRow.rank;
  const nextRank = upgraded ? rolledRank : talentRow.rank;
  db.prepare('UPDATE players SET spirit_stones = spirit_stones - ? WHERE user_id = ?').run(rollCost, userId);
  db.prepare('UPDATE talents SET rank = ?, best_rank = MAX(best_rank, ?), rolls = rolls + 1 WHERE user_id = ?').run(nextRank, rolledRank, userId);
  const newPlayer = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId);
  return {
    rolled: talents[rolledRank - 1],
    current: talents[nextRank - 1],
    upgraded,
    spiritStones: newPlayer.spirit_stones
  };
}

module.exports = { performGacha, rollCost, weighted };
