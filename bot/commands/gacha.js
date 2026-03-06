const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ensurePlayer } = require('../utils/helpers');
const { performGacha, rollCost } = require('../systems/gachaSystem');
const { gachaEmbed } = require('../utils/embeds');

const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('gacha:roll').setLabel('Roll Talent').setStyle(ButtonStyle.Primary)
);

module.exports = {
  data: new SlashCommandBuilder().setName('gacha').setDescription('Roll for better talent rank'),
  async execute(interaction) {
    ensurePlayer(interaction.user);
    await interaction.reply({ content: `Each roll costs ${rollCost} Spirit Stones.`, components: [row], ephemeral: true });
  },
  async handleButton(interaction, action) {
    if (action !== 'roll') return;
    ensurePlayer(interaction.user);
    const result = performGacha(interaction.user.id);
    if (result.error) return interaction.reply({ content: result.error, ephemeral: true });
    await interaction.reply({ embeds: [gachaEmbed(interaction.user, result)], components: [row], ephemeral: true });
  }
};
