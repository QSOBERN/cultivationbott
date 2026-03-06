const db = require('../database');
const techniques = require('../data/techniques');
const items = require('../data/items');
const { combatPower } = require('../utils/calculations');

function equipmentBonus(userId) {
  const equipped = db.prepare('SELECT item_id FROM inventory WHERE user_id = ? AND equipped = 1').all(userId);
  let total = 0;
  for (const row of equipped) {
    const item = items.find((it) => it.id === row.item_id);
    if (item) total += item.power;
  }
  return total;
}

function chooseTechnique(userId, realmIndex) {
  const known = db.prepare('SELECT technique_id, mastery FROM techniques WHERE user_id = ?').all(userId);
  const pool = known.map((k) => {
    const t = techniques.find((x) => x.id === k.technique_id);
    if (!t || t.realmIndex > realmIndex) return null;
    return { ...t, mastery: k.mastery };
  }).filter(Boolean);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function npcCombat(state) {
  const eBonus = equipmentBonus(state.player.user_id);
  const playerPower = combatPower(state.player, state.cultivation, state.talent.rank, eBonus);
  const enemyPower = (state.cultivation.realm_index + 1) * 95 * (0.85 + Math.random() * 0.4);
  const tech = chooseTechnique(state.player.user_id, state.cultivation.realm_index);
  const techMult = tech ? 1 + tech.damageScaling * (tech.mastery / tech.masteryCap) * 0.2 : 1;
  const damageDealt = playerPower * techMult * (0.7 + Math.random() * 0.6);
  const damageTaken = enemyPower * (0.6 + Math.random() * 0.5);
  const win = damageDealt >= damageTaken;
  const stones = win ? Math.floor(50 + Math.random() * 80) : Math.floor(15 + Math.random() * 25);
  const rep = win ? 10 : 2;
  db.prepare('UPDATE players SET spirit_stones = spirit_stones + ?, reputation = reputation + ? WHERE user_id = ?').run(stones, rep, state.player.user_id);
  db.prepare('INSERT INTO combat_logs (user_id, target, result, damage_dealt, damage_taken, ts) VALUES (?, ?, ?, ?, ?, ?)')
    .run(state.player.user_id, 'NPC', win ? 'Victory' : 'Defeat', damageDealt, damageTaken, Date.now());
  return { result: win ? 'Victory' : 'Defeat', damageDealt, damageTaken, stones, rep, tech };
}

module.exports = { npcCombat };
