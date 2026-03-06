const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ensurePlayer, getPlayer, realmStage } = require('../utils/helpers');
const { tickCultivation, setCultivating } = require('../systems/cultivationSystem');
const { cultivationEmbed } = require('../utils/embeds');
const { qiRequired, cultivationGainPerSecond } = require('../utils/calculations');

function controls() {
  return [new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('cultivate:start').setStyle(ButtonStyle.Success).setLabel('Start Cultivation'),
    new ButtonBuilder().setCustomId('cultivate:stop').setStyle(ButtonStyle.Danger).setLabel('Stop Cultivation'),
    new ButtonBuilder().setCustomId('cultivate:check').setStyle(ButtonStyle.Primary).setLabel('Check Progress')
  )];
}

async function render(interaction, state) {
  const rs = realmStage(state.cultivation);
  const qiPerSecond = cultivationGainPerSecond(state.player, state.cultivation, state.talent.rank);
  const embed = cultivationEmbed(interaction.user, {
    realm: rs.realm,
    stage: rs.stage,
    qi: state.cultivation.qi,
    qiRequired: qiRequired(state.cultivation.realm_index, state.cultivation.stage_index),
    qiPerSecond,
    isCultivating: !!state.cultivation.is_cultivating
  });
  return interaction.reply ? interaction.reply({ embeds: [embed], components: controls(), ephemeral: true }) : interaction.update({ embeds: [embed], components: controls() });
}

module.exports = {
  data: new SlashCommandBuilder().setName('cultivate').setDescription('Open cultivation controls'),
  async execute(interaction) {
    ensurePlayer(interaction.user);
    const state = getPlayer(interaction.user.id);
    tickCultivation(state.player, state.cultivation, state.talent.rank);
    const updated = getPlayer(interaction.user.id);
    await render(interaction, updated);
  },
  async handleButton(interaction, action) {
    ensurePlayer(interaction.user);
    const state = getPlayer(interaction.user.id);
    tickCultivation(state.player, state.cultivation, state.talent.rank);
    if (action === 'start') setCultivating(interaction.user.id, true);
    if (action === 'stop') setCultivating(interaction.user.id, false);
    const updated = getPlayer(interaction.user.id);
    await interaction.update({ components: [] });
    await interaction.followUp({ content: `Cultivation action executed: ${action}`, ephemeral: true });
    await interaction.followUp({ ephemeral: true, embeds: [cultivationEmbed(interaction.user, {
      realm: realmStage(updated.cultivation).realm,
      stage: realmStage(updated.cultivation).stage,
      qi: updated.cultivation.qi,
      qiRequired: qiRequired(updated.cultivation.realm_index, updated.cultivation.stage_index),
      qiPerSecond: cultivationGainPerSecond(updated.player, updated.cultivation, updated.talent.rank),
      isCultivating: !!updated.cultivation.is_cultivating
    })], components: controls() });
  }
};
