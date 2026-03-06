const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Show basic commands and how to play'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Cultivation RPG Help')
      .setColor(0x38bdf8)
      .setDescription('Use these commands to begin, progress, and manage your cultivator.')
      .addFields(
        { name: 'Getting Started', value: '`/start` create your character\n`/profile` view character stats\n`/help` show this guide' },
        { name: 'Cultivation', value: '`/cultivate` open start/stop/progress buttons\n`/breakthrough` attempt a manual breakthrough\n`/realm <index>` inspect realm details' },
        { name: 'Talents', value: '`/gacha` roll for higher talent rank with Spirit Stones' },
        { name: 'Combat', value: '`/fight` start button-based NPC combat' },
        { name: 'Growth', value: '`/techniques` list unlocked techniques\n`/inventory` list items\n`/shop <id>` buy items' },
        { name: 'Social', value: '`/sect <name>` join or create a sect\n`/reputation` view reputation\n`/leaderboard` view rankings' }
      )
      .setFooter({ text: 'Tip: keep cultivation running for passive offline Qi gain.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
