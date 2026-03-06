const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ensurePlayer } = require('../utils/helpers');
const { joinSect } = require('../systems/sectSystem');

module.exports = {
  data: new SlashCommandBuilder().setName('sect').setDescription('Join or create a sect').addStringOption((o) => o.setName('name').setDescription('Sect name').setRequired(true)),
  async execute(interaction) {
    ensurePlayer(interaction.user);
    const sect = joinSect(interaction.user.id, interaction.options.getString('name'));
    const embed = new EmbedBuilder().setTitle('Sect Joined').setDescription(`You are now in ${sect.name}`).setColor(0xf97316);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
