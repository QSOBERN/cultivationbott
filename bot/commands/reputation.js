const { SlashCommandBuilder } = require('discord.js');
const { ensurePlayer, getPlayer } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder().setName('reputation').setDescription('View your reputation'),
  async execute(interaction) {
    ensurePlayer(interaction.user);
    const state = getPlayer(interaction.user.id);
    await interaction.reply({ content: `Reputation ${state.player.reputation}`, ephemeral: true });
  }
};
