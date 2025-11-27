const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('diamon')
    .setDescription('Add Diamon')
    .addIntegerOption(o => o.setName('amount').setDescription('Amount').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const { ores, ORES_FILE, TRACKER_ORES_FILE, updateEmbed, updateMiningStats, TRACKER_MINING_FILE, updateMiningEmbed } = require('../index.js');
    const fs = require('fs');
    const amount = interaction.options.getInteger('amount');
    ores['Diamon'] += amount;
    fs.writeFileSync(ORES_FILE, JSON.stringify(ores, null, 2));
    updateMiningStats(amount);
    await interaction.reply({ content: `✅ +**${amount} ${displayName}** (Total: **${ores['Diamon'].toLocaleString()}**)`, ephemeral: true });

    // Update ore embed
    const trackerOres = fs.existsSync(TRACKER_ORES_FILE) ? JSON.parse(fs.readFileSync(TRACKER_ORES_FILE)) : null;
    if (trackerOres?.channelId) {
      const ch = interaction.client.channels.cache.get(trackerOres.channelId);
      if (ch) {
        try {
          const msg = await ch.messages.fetch(trackerOres.messageId);
          await updateEmbed(msg, 'ores');
        } catch (e) { console.log('Ore embed update failed'); }
      }
    }
    // Update mining embed
    const trackerMining = fs.existsSync(TRACKER_MINING_FILE) ? JSON.parse(fs.readFileSync(TRACKER_MINING_FILE)) : null;
    if (trackerMining?.channelId) {
      const channel = interaction.client.channels.cache.get(trackerMining.channelId);
      if (channel) {
        try {
          const msg = await channel.messages.fetch(trackerMining.messageId);
          await updateMiningEmbed(msg);
        } catch (e) { console.log('Mining embed update failed'); }
      }
    }
  }
};