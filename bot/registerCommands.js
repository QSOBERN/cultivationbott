const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('./config.json');

const commands = [];
for (const file of fs.readdirSync(path.join(__dirname, 'commands')).filter((f) => f.endsWith('.js'))) {
  const cmd = require(path.join(__dirname, 'commands', file));
  commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);

async function main() {
  if (config.guildId && config.guildId !== 'PUT_GUILD_ID_HERE') {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
  } else {
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
  }
  console.log(`Registered ${commands.length} commands`);
}

main();
