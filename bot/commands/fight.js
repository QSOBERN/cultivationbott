const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ensurePlayer, getPlayer } = require('../utils/helpers');
const { npcCombat } = require('../systems/combatSystem');
const { combatEmbed } = require('../utils/embeds');

const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('fight:attack').setLabel('Attack').setStyle(ButtonStyle.Danger),
  new ButtonBuilder().setCustomId('fight:technique').setLabel('Use Technique').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('fight:defend').setLabel('Defend').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('fight:flee').setLabel('Flee').setStyle(ButtonStyle.Secondary)
);

module.exports = {
  data: new SlashCommandBuilder().setName('fight').setDescription('Fight an NPC opponent'),
  async execute(interaction) {
    ensurePlayer(interaction.user);
    await interaction.reply({ content: 'Combat started', components: [row], ephemeral: true });
  },
  async handleButton(interaction, action) {
    if (action === 'flee') return interaction.reply({ content: 'You fled combat.', ephemeral: true });
    const state = getPlayer(interaction.user.id);
    const outcome = npcCombat(state);
    await interaction.reply({ embeds: [combatEmbed(`Combat ${action}`, outcome)], ephemeral: true });
  }
};
