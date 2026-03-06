const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const realms = require('../data/realms');

module.exports = {
  data: new SlashCommandBuilder().setName('realm').setDescription('View realm details').addIntegerOption((o) => o.setName('index').setDescription('Realm index 1-56').setRequired(true)),
  async execute(interaction) {
    const idx = interaction.options.getInteger('index') - 1;
    const realm = realms[idx];
    if (!realm) return interaction.reply({ content: 'Invalid realm index', ephemeral: true });
    const embed = new EmbedBuilder().setTitle(realm.name).setDescription(`Base Qi/s ${realm.baseQiPerSecond}`).setColor(0x0ea5e9)
      .addFields(realm.stages.map((s) => ({ name: s.name, value: `Qi ${s.qiRequired} Mult ${s.statMultiplier}` })));
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
