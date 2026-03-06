const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');
const realms = require('../data/realms');

const OWNER_USERNAME = 'rjd5271';

function isOwner(interaction) {
  return interaction.user.username === OWNER_USERNAME;
}

function denyEmbed() {
  return new EmbedBuilder()
    .setTitle('Access Denied')
    .setColor(0xef4444)
    .setDescription('Only the bot owner can use this command.');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Owner-only admin controls')
    .addSubcommand((s) => s.setName('addstones').setDescription('Add Spirit Stones to a player')
      .addUserOption((o) => o.setName('target').setDescription('Target user').setRequired(true))
      .addIntegerOption((o) => o.setName('amount').setDescription('Amount to add').setRequired(true)))
    .addSubcommand((s) => s.setName('addreputation').setDescription('Add reputation to a player')
      .addUserOption((o) => o.setName('target').setDescription('Target user').setRequired(true))
      .addIntegerOption((o) => o.setName('amount').setDescription('Amount to add').setRequired(true)))
    .addSubcommand((s) => s.setName('setrealm').setDescription('Set realm and stage for a player')
      .addUserOption((o) => o.setName('target').setDescription('Target user').setRequired(true))
      .addIntegerOption((o) => o.setName('realm').setDescription(`Realm index 1-${realms.length}`).setRequired(true))
      .addIntegerOption((o) => o.setName('stage').setDescription('Stage index 1-4').setRequired(true)))
    .addSubcommand((s) => s.setName('settalent').setDescription('Set talent rank for a player')
      .addUserOption((o) => o.setName('target').setDescription('Target user').setRequired(true))
      .addIntegerOption((o) => o.setName('rank').setDescription('Talent rank 1-99').setRequired(true)))
    .addSubcommand((s) => s.setName('giveitem').setDescription('Give an item to a player')
      .addUserOption((o) => o.setName('target').setDescription('Target user').setRequired(true))
      .addIntegerOption((o) => o.setName('item').setDescription('Item number from item_<n>').setRequired(true))
      .addIntegerOption((o) => o.setName('quantity').setDescription('Quantity').setRequired(true))),

  async execute(interaction) {
    if (!isOwner(interaction)) {
      await interaction.reply({ embeds: [denyEmbed()], ephemeral: true });
      return;
    }

    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser('target');
    const ts = Date.now();
    db.prepare('INSERT OR IGNORE INTO players (user_id, username, created_at, last_active) VALUES (?, ?, ?, ?)').run(target.id, target.username, ts, ts);
    db.prepare('INSERT OR IGNORE INTO cultivation (user_id, last_cultivate_ts) VALUES (?, ?)').run(target.id, ts);
    db.prepare('INSERT OR IGNORE INTO talents (user_id) VALUES (?)').run(target.id);

    if (sub === 'addstones') {
      const amount = interaction.options.getInteger('amount');
      db.prepare('UPDATE players SET spirit_stones = spirit_stones + ? WHERE user_id = ?').run(amount, target.id);
      await interaction.reply({ content: `Added ${amount} Spirit Stones to ${target.username}.`, ephemeral: true });
      return;
    }

    if (sub === 'addreputation') {
      const amount = interaction.options.getInteger('amount');
      db.prepare('UPDATE players SET reputation = reputation + ? WHERE user_id = ?').run(amount, target.id);
      await interaction.reply({ content: `Added ${amount} reputation to ${target.username}.`, ephemeral: true });
      return;
    }

    if (sub === 'setrealm') {
      const realmInput = interaction.options.getInteger('realm');
      const stageInput = interaction.options.getInteger('stage');
      if (realmInput < 1 || realmInput > realms.length || stageInput < 1 || stageInput > 4) {
        await interaction.reply({ content: `Invalid realm/stage. Realm 1-${realms.length}, stage 1-4.`, ephemeral: true });
        return;
      }
      db.prepare('UPDATE cultivation SET realm_index = ?, stage_index = ?, qi = 0 WHERE user_id = ?').run(realmInput - 1, stageInput - 1, target.id);
      await interaction.reply({ content: `Set ${target.username} to ${realms[realmInput - 1].name} stage ${stageInput}.`, ephemeral: true });
      return;
    }

    if (sub === 'settalent') {
      const rank = interaction.options.getInteger('rank');
      if (rank < 1 || rank > 99) {
        await interaction.reply({ content: 'Invalid rank. Must be 1-99.', ephemeral: true });
        return;
      }
      db.prepare('UPDATE talents SET rank = ?, best_rank = MAX(best_rank, ?) WHERE user_id = ?').run(rank, rank, target.id);
      await interaction.reply({ content: `Set ${target.username} talent rank to ${rank}.`, ephemeral: true });
      return;
    }

    if (sub === 'giveitem') {
      const itemNum = interaction.options.getInteger('item');
      const quantity = interaction.options.getInteger('quantity');
      if (itemNum < 1 || itemNum > 2200 || quantity < 1) {
        await interaction.reply({ content: 'Invalid item or quantity. Item 1-2200, quantity >= 1.', ephemeral: true });
        return;
      }
      const itemId = `item_${itemNum}`;
      db.prepare('INSERT INTO inventory (user_id, item_id, quantity, equipped) VALUES (?, ?, ?, 0) ON CONFLICT(user_id, item_id) DO UPDATE SET quantity = quantity + excluded.quantity').run(target.id, itemId, quantity);
      await interaction.reply({ content: `Gave ${quantity}x ${itemId} to ${target.username}.`, ephemeral: true });
    }
  }
};
