const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeitem')
    .setDescription('Remove item from your inventory')
    .addStringOption(opt => opt.setName('item').setDescription('Item name').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const { getUserInv, saveUserInv, getCategory } = require('../index.js');
    const item = interaction.options.getString('item').toLowerCase();
    const amt = interaction.options.getInteger('amount');
    const cat = getCategory(item);
    const userId = interaction.user.id;
    let inv = getUserInv(userId);
    if (!inv[cat] || !inv[cat][item]) {
      return interaction.reply({ content: `❌ **${item}** not found in **${cat}**!`, ephemeral: true });
    }
    inv[cat][item] -= amt;
    if (inv[cat][item] <= 0) delete inv[cat][item];
    if (Object.keys(inv[cat]).length === 0) delete inv[cat];
    saveUserInv(userId, inv);

    await interaction.reply({ content: `✅ Removed **${amt} ${item}** from **${cat}**!`, ephemeral: true });
  }
};