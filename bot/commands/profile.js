const { SlashCommandBuilder } = require('discord.js');
const { ensurePlayer, getPlayer, realmStage } = require('../utils/helpers');
const { profileEmbed } = require('../utils/embeds');
const talents = require('../data/talents');

module.exports = {
  data: new SlashCommandBuilder().setName('profile').setDescription('Show your cultivation profile'),
  async execute(interaction) {
    ensurePlayer(interaction.user);
    const state = getPlayer(interaction.user.id);
    const rs = realmStage(state.cultivation);
    const talent = talents[state.talent.rank - 1] || talents[0];
    await interaction.reply({ embeds: [profileEmbed(interaction.user, state, rs.realm, rs.stage, talent)] });
  }
};
