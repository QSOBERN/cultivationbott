const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ensurePlayer, getPlayer } = require('../utils/helpers');
const { qiRequired, breakthroughChance } = require('../utils/calculations');
const db = require('../database');

module.exports = {
  data: new SlashCommandBuilder().setName('breakthrough').setDescription('Attempt manual breakthrough'),
  async execute(interaction) {
    ensurePlayer(interaction.user);
    const state = getPlayer(interaction.user.id);
    const req = qiRequired(state.cultivation.realm_index, state.cultivation.stage_index);
    if (state.cultivation.qi < req) return interaction.reply({ content: `Need ${req} Qi to attempt breakthrough.`, ephemeral: true });
    const chance = breakthroughChance(state.player, state.cultivation, state.talent.rank);
    const success = Math.random() < chance;
    if (success) {
      let stage = state.cultivation.stage_index + 1;
      let realm = state.cultivation.realm_index;
      if (stage > 3) {
        stage = 0;
        realm += 1;
      }
      db.prepare('UPDATE cultivation SET qi = qi - ?, stage_index = ?, realm_index = ? WHERE user_id = ?').run(req, stage, realm, interaction.user.id);
      db.prepare('UPDATE players SET reputation = reputation + 25 WHERE user_id = ?').run(interaction.user.id);
    } else {
      const penalty = Math.floor(req * 0.4);
      db.prepare('UPDATE cultivation SET qi = MAX(0, qi - ?), injury_until = ? WHERE user_id = ?').run(penalty, Date.now() + 10 * 60 * 1000, interaction.user.id);
    }
    const embed = new EmbedBuilder().setTitle('Breakthrough Result').setDescription(success ? `Success ${(chance * 100).toFixed(2)}% chance` : `Failure ${(chance * 100).toFixed(2)}% chance`).setColor(success ? 0x22c55e : 0xef4444);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
