const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');
const { sectLeaderboard } = require('../systems/sectSystem');

module.exports = {
  data: new SlashCommandBuilder().setName('leaderboard').setDescription('Player and sect rankings'),
  async execute(interaction) {
    const players = db.prepare('SELECT username, reputation, spirit_stones FROM players ORDER BY reputation DESC, spirit_stones DESC LIMIT 10').all();
    const sects = sectLeaderboard();
    const embed = new EmbedBuilder().setTitle('Leaderboards').setColor(0xeab308)
      .addFields(
        { name: 'Players', value: players.length ? players.map((p, i) => `${i + 1}. ${p.username} Rep ${p.reputation} Stones ${p.spirit_stones}`).join('\n') : 'No players' },
        { name: 'Sects', value: sects.length ? sects.map((s, i) => `${i + 1}. ${s.name} Rep ${s.reputation}`).join('\n') : 'No sects' }
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
