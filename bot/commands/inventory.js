const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ensurePlayer } = require('../utils/helpers');
const { listInventory } = require('../systems/inventorySystem');

module.exports = {
  data: new SlashCommandBuilder().setName('inventory').setDescription('View inventory'),
  async execute(interaction) {
    ensurePlayer(interaction.user);
    const inv = listInventory(interaction.user.id).slice(0, 25);
    const embed = new EmbedBuilder().setTitle('Inventory').setColor(0x6366f1);
    if (!inv.length) embed.setDescription('Inventory is empty');
    else embed.setDescription(inv.map((x) => `${x.item.name} x${x.quantity} ${x.equipped ? '[E]' : ''}`).join('\n'));
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
