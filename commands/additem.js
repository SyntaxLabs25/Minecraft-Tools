const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('additem')
    .setDescription('Add item to your inventory')
    .addStringOption(opt => opt.setName('item').setDescription('Item name (e.g. diamond_sword)').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const { getUserInv, saveUserInv, getCategory } = require('../index.js');
    const item = interaction.options.getString('item').toLowerCase();
    const amt = interaction.options.getInteger('amount');
    const cat = getCategory(item);
    const userId = interaction.user.id;
    let inv = getUserInv(userId);
    if (!inv[cat]) inv[cat] = {};
    inv[cat][item] = (inv[cat][item] || 0) + amt;
    saveUserInv(userId, inv);

    await interaction.reply({ content: `✅ Added **${amt} ${item}** to **${cat}**!`, ephemeral: true });
  }
};