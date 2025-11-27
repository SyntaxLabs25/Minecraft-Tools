const { SlashCommandBuilder } = require('discord.js');
const ms = require('ms'); // Add dependency: npm install ms

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set an AFK reminder (e.g., for smelting or cooking)')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Time until reminder (e.g., 10m, 5h, 30s)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('what')
        .setDescription('What to remind you about (e.g., check the furnace)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const timeStr = interaction.options.getString('time');
    const what = interaction.options.getString('what');
    const timeMs = ms(timeStr);

    if (!timeMs) {
      return interaction.reply({ content: '❌ Invalid time format! Use like 10m, 5h, 30s.', ephemeral: true });
    }

    await interaction.reply({ content: `✅ Reminder set for ${timeStr}: "${what}"`, ephemeral: true });

    // Set timer - DM user when done (no persistence across restarts)
    setTimeout(async () => {
      try {
        await interaction.user.send(`🔔 Reminder: ${what}! (Set ${timeStr} ago)`);
      } catch (err) {
        console.log('Failed to DM user for reminder:', err.message);
        // Fallback to channel if DM fails
        if (interaction.channel) {
          interaction.channel.send(`🔔 <@${interaction.user.id}>: Reminder: ${what}! (Set ${timeStr} ago)`);
        }
      }
    }, timeMs);
  }
};