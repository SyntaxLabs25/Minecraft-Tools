const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sugarcane')
    .setDescription('Add Sugar Cane')
    .addIntegerOption(o => o.setName('amount').setDescription('Amount').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const { crops, CROPS_FILE, TRACKER_CROPS_FILE, updateEmbed } = require('../index.js');
    const fs = require('fs');
    const amount = interaction.options.getInteger('amount');
    crops['Sugar Cane'] += amount;
    fs.writeFileSync(CROPS_FILE, JSON.stringify(crops, null, 2));
    await interaction.reply({ content: `✅ +**${amount} Sugar Cane** (Total: **${crops['Sugar Cane'].toLocaleString()}**)`, ephemeral: true });

    const tracker = fs.existsSync(TRACKER_CROPS_FILE) ? JSON.parse(fs.readFileSync(TRACKER_CROPS_FILE)) : null;
    if (tracker?.channelId) {
      const ch = interaction.client.channels.cache.get(tracker.channelId);
      if (ch) {
        try {
          const msg = await ch.messages.fetch(tracker.messageId);
          await updateEmbed(msg, 'crops');
        } catch (e) { console.log('Crop embed update failed'); }
      }
    }
  }
};