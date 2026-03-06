const realms = require('../data/realms');
const talents = require('../data/talents');
const { getPathModifier } = require('./helpers');

function qiRequired(realmIndex, stageIndex) {
  const base = 100 + realmIndex * 80;
  const stageMult = 1 + stageIndex * 0.35;
  return Math.floor(base * stageMult);
}

function cultivationGainPerSecond(player, cultivation, talentRank) {
  const realm = realms[cultivation.realm_index] || realms[0];
  const talent = talents[talentRank - 1] || talents[0];
  const path = getPathModifier(player.path);
  const injured = cultivation.injury_until > Date.now() ? 0.5 : 1;
  return realm.baseQiPerSecond * cultivation.cultivation_speed * talent.bonuses.qiGeneration * path.speed * injured;
}

function breakthroughChance(player, cultivation, talentRank) {
  const talent = talents[talentRank - 1] || talents[0];
  const path = getPathModifier(player.path);
  const base = 0.55;
  const realmPenalty = Math.max(0, cultivation.realm_index - 10) * 0.003;
  const chance = base + talent.bonuses.breakthroughBoost + (path.breakthrough - 1) * 0.2 - realmPenalty;
  return Math.max(0.05, Math.min(0.98, chance));
}

function combatPower(player, cultivation, talentRank, equipmentBonus = 0) {
  const realmValue = (cultivation.realm_index + 1) * 70;
  const stageValue = (cultivation.stage_index + 1) * 30;
  const talent = talents[talentRank - 1] || talents[0];
  const path = getPathModifier(player.path);
  return (realmValue + stageValue + equipmentBonus + talent.rank * 4) * talent.bonuses.damage * path.combat;
}

module.exports = {
  qiRequired,
  cultivationGainPerSecond,
  breakthroughChance,
  combatPower
};
