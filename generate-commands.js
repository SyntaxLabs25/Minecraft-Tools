const fs = require('fs');

// ORES (UPDATED - + mining stats)
const ores = ["Coal","Charcoal","Iron","Copper","Gold","Emerald","Lapuz","Diamon","Quartz","Amethest","Netherite Scrap","Netherite"];
ores.forEach(ore => {
  const name = ore.toLowerCase().replace(/ /g, '');
  const fileName = name + '.js';
  const displayName = ore === "Amethest" ? "Amethyst" : ore;
  const cmdName = ore === "Netherite Scrap" ? "netheritescrap" : name;

  const content = `const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('${cmdName}')
    .setDescription('Add ${displayName}')
    .addIntegerOption(o => o.setName('amount').setDescription('Amount').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const { ores, ORES_FILE, TRACKER_ORES_FILE, updateEmbed, updateMiningStats, TRACKER_MINING_FILE, updateMiningEmbed } = require('../index.js');
    const fs = require('fs');
    const amount = interaction.options.getInteger('amount');
    ores['${ore}'] += amount;
    fs.writeFileSync(ORES_FILE, JSON.stringify(ores, null, 2));
    updateMiningStats(amount);
    await interaction.reply({ content: \`✅ +**\${amount} \${displayName}** (Total: **\${ores['${ore}'].toLocaleString()}**)\`, ephemeral: true });

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
};`;

  fs.writeFileSync(`./commands/${fileName}`, content);
  console.log(`Ore: ${fileName}`);
});

// CROPS (FIXED - Escaped templates)
const cropsList = ["Wheat","Potatoes","Carrots","Melons","Pumpkins","Sugar Cane"];
cropsList.forEach(crop => {
  const name = crop.toLowerCase().replace(' ', '');
  const fileName = name + '.js';
  const cmdName = crop === "Sugar Cane" ? 'sugarcane' : name;

  const content = `const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('${cmdName}')
    .setDescription('Add ${crop}')
    .addIntegerOption(o => o.setName('amount').setDescription('Amount').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const { crops, CROPS_FILE, TRACKER_CROPS_FILE, updateEmbed } = require('../index.js');
    const fs = require('fs');
    const amount = interaction.options.getInteger('amount');
    crops['${crop}'] += amount;
    fs.writeFileSync(CROPS_FILE, JSON.stringify(crops, null, 2));
    await interaction.reply({ content: \`✅ +**\${amount} ${crop}** (Total: **\${crops['${crop}'].toLocaleString()}**)\`, ephemeral: true });

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
};`;

  fs.writeFileSync(`./commands/${fileName}`, content);
  console.log(`Crop: ${fileName}`);
});

console.log('✅ All generated!');