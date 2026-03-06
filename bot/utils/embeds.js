const { EmbedBuilder } = require('discord.js');
const { formatNumber } = require('./helpers');

function profileEmbed(user, state, realm, stage, talent) {
  return new EmbedBuilder()
    .setTitle(`${user.username} Cultivator Profile`)
    .setColor(0x3b82f6)
    .addFields(
      { name: 'Path', value: state.player.path, inline: true },
      { name: 'Realm', value: realm.name, inline: true },
      { name: 'Stage', value: stage.name, inline: true },
      { name: 'Qi', value: `${formatNumber(state.cultivation.qi)} / ${formatNumber(stage.qiRequired)}`, inline: true },
      { name: 'Spirit Stones', value: formatNumber(state.player.spirit_stones), inline: true },
      { name: 'Reputation', value: formatNumber(state.player.reputation), inline: true },
      { name: 'Talent', value: `Rank ${talent.rank} ${talent.name}`, inline: false }
    )
    .setTimestamp();
}

function cultivationEmbed(user, info) {
  return new EmbedBuilder()
    .setTitle(`${user.username} Cultivation Status`)
    .setColor(0x10b981)
    .setDescription(`Realm ${info.realm.name} ${info.stage.name}`)
    .addFields(
      { name: 'Qi Progress', value: `${formatNumber(info.qi)} / ${formatNumber(info.qiRequired)}`, inline: true },
      { name: 'Qi/s', value: formatNumber(info.qiPerSecond), inline: true },
      { name: 'Cultivating', value: info.isCultivating ? 'Yes' : 'No', inline: true }
    )
    .setFooter({ text: 'Passive gain uses timestamps for offline progression' })
    .setTimestamp();
}

function gachaEmbed(user, result) {
  return new EmbedBuilder()
    .setTitle(`${user.username} Talent Gacha`)
    .setColor(result.upgraded ? 0xf59e0b : 0x6b7280)
    .addFields(
      { name: 'Rolled Talent', value: `Rank ${result.rolled.rank} ${result.rolled.name}`, inline: false },
      { name: 'Current Talent', value: `Rank ${result.current.rank} ${result.current.name}`, inline: false },
      { name: 'Status', value: result.upgraded ? 'Upgraded and equipped' : 'Roll was lower than current', inline: false },
      { name: 'Spirit Stones Left', value: formatNumber(result.spiritStones), inline: true },
      { name: 'Cultivation Boost', value: `${((result.current.bonuses.cultivationSpeed - 1) * 100).toFixed(2)}%`, inline: true },
      { name: 'Damage Boost', value: `${((result.current.bonuses.damage - 1) * 100).toFixed(2)}%`, inline: true }
    )
    .setTimestamp();
}

function combatEmbed(title, log) {
  return new EmbedBuilder()
    .setTitle(title)
    .setColor(0xef4444)
    .addFields(
      { name: 'Damage Dealt', value: formatNumber(log.damageDealt), inline: true },
      { name: 'Damage Taken', value: formatNumber(log.damageTaken), inline: true },
      { name: 'Result', value: log.result, inline: true }
    )
    .setTimestamp();
}

module.exports = { profileEmbed, cultivationEmbed, gachaEmbed, combatEmbed };
