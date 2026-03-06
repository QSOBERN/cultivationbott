const db = require('../database');
const realms = require('../data/realms');
const talents = require('../data/talents');
const { cultivationGainPerSecond, qiRequired } = require('../utils/calculations');

function tickCultivation(player, cultivation, talentRank) {
  const now = Date.now();
  const elapsedSec = Math.max(0, (now - cultivation.last_cultivate_ts) / 1000);
  if (cultivation.is_cultivating) {
    const gain = elapsedSec * cultivationGainPerSecond(player, cultivation, talentRank);
    cultivation.qi += gain;
    cultivation.total_qi += gain;
  }
  cultivation.last_cultivate_ts = now;
  let changed = false;
  while (true) {
    const req = qiRequired(cultivation.realm_index, cultivation.stage_index);
    if (cultivation.qi < req) break;
    cultivation.qi -= req;
    cultivation.stage_index += 1;
    changed = true;
    if (cultivation.stage_index > 3) {
      cultivation.stage_index = 0;
      cultivation.realm_index = Math.min(realms.length - 1, cultivation.realm_index + 1);
    }
  }
  db.prepare('UPDATE cultivation SET qi = ?, total_qi = ?, stage_index = ?, realm_index = ?, last_cultivate_ts = ? WHERE user_id = ?')
    .run(cultivation.qi, cultivation.total_qi, cultivation.stage_index, cultivation.realm_index, cultivation.last_cultivate_ts, cultivation.user_id);
  return { cultivation, changed, talent: talents[talentRank - 1] || talents[0] };
}

function setCultivating(userId, active) {
  db.prepare('UPDATE cultivation SET is_cultivating = ?, last_cultivate_ts = ? WHERE user_id = ?').run(active ? 1 : 0, Date.now(), userId);
}

module.exports = { tickCultivation, setCultivating };
