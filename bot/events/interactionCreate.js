const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction, client);
      return;
    }
    if (interaction.isButton()) {
      const [scope, action] = interaction.customId.split(':');
      const command = client.commands.get(scope);
      if (command && command.handleButton) {
        await command.handleButton(interaction, action, client);
      }
    }
  }
};
