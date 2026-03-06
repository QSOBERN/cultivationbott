const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'cultivation.db'));

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS players (
  user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  path TEXT NOT NULL DEFAULT 'Neutral Path',
  spirit_stones INTEGER NOT NULL DEFAULT 1000,
  reputation INTEGER NOT NULL DEFAULT 0,
  sect_id INTEGER,
  last_active INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cultivation (
  user_id TEXT PRIMARY KEY,
  realm_index INTEGER NOT NULL DEFAULT 0,
  stage_index INTEGER NOT NULL DEFAULT 0,
  qi REAL NOT NULL DEFAULT 0,
  total_qi REAL NOT NULL DEFAULT 0,
  cultivation_speed REAL NOT NULL DEFAULT 1,
  is_cultivating INTEGER NOT NULL DEFAULT 0,
  last_cultivate_ts INTEGER NOT NULL DEFAULT 0,
  injury_until INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES players(user_id)
);

CREATE TABLE IF NOT EXISTS talents (
  user_id TEXT PRIMARY KEY,
  rank INTEGER NOT NULL DEFAULT 1,
  rolls INTEGER NOT NULL DEFAULT 0,
  best_rank INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY(user_id) REFERENCES players(user_id)
);

CREATE TABLE IF NOT EXISTS techniques (
  user_id TEXT NOT NULL,
  technique_id TEXT NOT NULL,
  mastery INTEGER NOT NULL DEFAULT 1,
  last_used INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(user_id, technique_id),
  FOREIGN KEY(user_id) REFERENCES players(user_id)
);

CREATE TABLE IF NOT EXISTS inventory (
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  equipped INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(user_id, item_id),
  FOREIGN KEY(user_id) REFERENCES players(user_id)
);

CREATE TABLE IF NOT EXISTS sects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  leader_id TEXT,
  reputation INTEGER NOT NULL DEFAULT 0,
  resources INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reputation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ts INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS combat_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  target TEXT NOT NULL,
  result TEXT NOT NULL,
  damage_dealt REAL NOT NULL,
  damage_taken REAL NOT NULL,
  ts INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cooldowns (
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY(user_id, key)
);
`);

module.exports = db;
