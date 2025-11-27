const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');

// Config - Replace these!
const TOKEN = '';
const CLIENT_ID = '';
const GUILD_ID = ''; // Optional for guild-specific

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(`🔄 Registering ${commands.length} slash commands...`);

    // Global or guild
    const route = GUILD_ID ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID) : Routes.applicationCommands(CLIENT_ID);
    const data = await rest.put(route, { body: commands });

    console.log(`✅ Registered ${data.length} commands!`);
  } catch (error) {
    console.error('❌ Failed:', error);
  }
})();