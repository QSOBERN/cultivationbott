const db = require('../database');
const realms = require('../data/realms');

const pathModifiers = {
  'Orthodox Path': { speed: 0.9, breakthrough: 1.15, reputation: 1.2, combat: 1 },
  'Unorthodox Path': { speed: 1.05, breakthrough: 0.95, reputation: 1, combat: 1.05 },
  'Demonic Path': { speed: 1.2, breakthrough: 0.85, reputation: 0.7, combat: 1.2 },
  'Neutral Path': { speed: 1, breakthrough: 1, reputation: 1, combat: 1 }
};

function now() {
  return Date.now();
}

function ensurePlayer(user) {
  const ts = now();
  db.prepare('INSERT OR IGNORE INTO players (user_id, username, created_at, last_active) VALUES (?, ?, ?, ?)').run(user.id, user.username, ts, ts);
  db.prepare('INSERT OR IGNORE INTO cultivation (user_id, last_cultivate_ts) VALUES (?, ?)').run(user.id, ts);
  db.prepare('INSERT OR IGNORE INTO talents (user_id) VALUES (?)').run(user.id);
  db.prepare('UPDATE players SET username = ?, last_active = ? WHERE user_id = ?').run(user.username, ts, user.id);
}

function getPlayer(userId) {
  const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId);
  const cultivation = db.prepare('SELECT * FROM cultivation WHERE user_id = ?').get(userId);
  const talent = db.prepare('SELECT * FROM talents WHERE user_id = ?').get(userId);
  return { player, cultivation, talent };
}

function realmStage(cultivation) {
  const realm = realms[cultivation.realm_index] || realms[0];
  const stage = realm.stages[cultivation.stage_index] || realm.stages[0];
  return { realm, stage };
}

function getPathModifier(pathName) {
  return pathModifiers[pathName] || pathModifiers['Neutral Path'];
}

function formatNumber(num) {
  return Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
}

module.exports = {
  now,
  ensurePlayer,
  getPlayer,
  realmStage,
  getPathModifier,
  formatNumber,
  pathModifiers
};
