const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('inventory').setDescription('Show your inventory'),
  async execute(interaction) {
    const { getUserInv } = require('../index.js');
    const inv = getUserInv(interaction.user.id);
    const fields = Object.entries(inv).map(([cat, items]) => {
      const sorted = Object.entries(items ?? {}).sort(([a, ac], [b, bc]) => bc - ac || a.localeCompare(b));
      const list = sorted.map(([i, c]) => `${i} x${c}`).join('\n') || 'None';
      return { name: `${cat.charAt(0).toUpperCase() + cat.slice(1)}:`, value: list, inline: false };
    });

    const embed = new EmbedBuilder()
      .setTitle(`🎒 ${interaction.user.username}'s Inventory`)
      .setColor(0x2ecc71)
      .addFields(fields)
      .setFooter({ text: `Last Updated: ${new Date().toLocaleString()}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};