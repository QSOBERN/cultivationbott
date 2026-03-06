const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ensurePlayer } = require('../utils/helpers');
const { listTechniques } = require('../systems/techniqueSystem');

module.exports = {
  data: new SlashCommandBuilder().setName('techniques').setDescription('List unlocked techniques'),
  async execute(interaction) {
    ensurePlayer(interaction.user);
    const list = listTechniques(interaction.user.id).slice(0, 25);
    const embed = new EmbedBuilder().setTitle('Techniques').setColor(0x8b5cf6);
    embed.setDescription(list.length ? list.map((t) => `${t.name} | ${t.type} | M${t.mastery}/${t.masteryCap}`).join('\n') : 'No techniques yet');
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
