const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const items = require('../data/items');
const db = require('../database');
const { ensurePlayer } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder().setName('shop').setDescription('Buy simple items').addIntegerOption((o) => o.setName('id').setDescription('Item number').setRequired(true)),
  async execute(interaction) {
    ensurePlayer(interaction.user);
    const num = interaction.options.getInteger('id');
    const id = `item_${num}`;
    const item = items.find((x) => x.id === id);
    if (!item) return interaction.reply({ content: 'Invalid item', ephemeral: true });
    const player = db.prepare('SELECT spirit_stones FROM players WHERE user_id = ?').get(interaction.user.id);
    if (player.spirit_stones < item.value) return interaction.reply({ content: 'Not enough Spirit Stones', ephemeral: true });
    db.prepare('UPDATE players SET spirit_stones = spirit_stones - ? WHERE user_id = ?').run(item.value, interaction.user.id);
    db.prepare('INSERT INTO inventory (user_id, item_id, quantity, equipped) VALUES (?, ?, 1, 0) ON CONFLICT(user_id, item_id) DO UPDATE SET quantity = quantity + 1').run(interaction.user.id, item.id);
    const embed = new EmbedBuilder().setTitle('Purchased').setDescription(`${item.name} for ${item.value}`).setColor(0x14b8a6);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
