const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ensurePlayer, getPlayer } = require('../utils/helpers');
const { grantStarterItems } = require('../systems/inventorySystem');
const { unlockTechniques } = require('../systems/techniqueSystem');

module.exports = {
  data: new SlashCommandBuilder().setName('start').setDescription('Start your cultivation journey'),
  async execute(interaction) {
    ensurePlayer(interaction.user);
    grantStarterItems(interaction.user.id);
    const state = getPlayer(interaction.user.id);
    unlockTechniques(interaction.user.id, state.cultivation.realm_index);
    const embed = new EmbedBuilder()
      .setTitle('Cultivation Journey Started')
      .setDescription('You have begun as a Rank 1 talent cultivator on the Neutral Path.')
      .setColor(0x22c55e);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
