const db = require('../database');
const items = require('../data/items');

function grantStarterItems(userId) {
  const starter = ['item_1', 'item_2', 'item_3', 'item_4'];
  for (const id of starter) {
    db.prepare('INSERT OR IGNORE INTO inventory (user_id, item_id, quantity, equipped) VALUES (?, ?, 1, 0)').run(userId, id);
  }
}

function listInventory(userId) {
  const rows = db.prepare('SELECT * FROM inventory WHERE user_id = ? AND quantity > 0 ORDER BY item_id').all(userId);
  return rows.map((r) => ({ ...r, item: items.find((i) => i.id === r.item_id) })).filter((x) => x.item);
}

module.exports = { grantStarterItems, listInventory };
