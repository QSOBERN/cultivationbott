const db = require('../database');

function joinSect(userId, sectName) {
  let sect = db.prepare('SELECT * FROM sects WHERE name = ?').get(sectName);
  if (!sect) {
    db.prepare('INSERT INTO sects (name, leader_id, reputation, resources, created_at) VALUES (?, ?, 0, 0, ?)').run(sectName, userId, Date.now());
    sect = db.prepare('SELECT * FROM sects WHERE name = ?').get(sectName);
  }
  db.prepare('UPDATE players SET sect_id = ? WHERE user_id = ?').run(sect.id, userId);
  return sect;
}

function sectLeaderboard() {
  return db.prepare('SELECT name, reputation, resources FROM sects ORDER BY reputation DESC, resources DESC LIMIT 10').all();
}

module.exports = { joinSect, sectLeaderboard };
