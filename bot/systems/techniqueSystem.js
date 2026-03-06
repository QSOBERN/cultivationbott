const db = require('../database');
const techniques = require('../data/techniques');

function unlockTechniques(userId, realmIndex) {
  const unlockable = techniques.filter((t) => t.realmIndex <= realmIndex && Number(t.id.split('_')[1]) % 17 === 0).slice(0, 12);
  const insert = db.prepare('INSERT OR IGNORE INTO techniques (user_id, technique_id, mastery, last_used) VALUES (?, ?, 1, 0)');
  for (const t of unlockable) insert.run(userId, t.id);
  return unlockable;
}

function listTechniques(userId) {
  const rows = db.prepare('SELECT * FROM techniques WHERE user_id = ? ORDER BY technique_id').all(userId);
  return rows.map((r) => {
    const t = techniques.find((x) => x.id === r.technique_id);
    return t ? { ...t, mastery: r.mastery } : null;
  }).filter(Boolean);
}

module.exports = { unlockTechniques, listTechniques };
