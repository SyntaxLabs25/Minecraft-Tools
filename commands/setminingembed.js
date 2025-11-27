const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setminingembed')
    .setDescription('Set up the mining stats embed')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),
  async execute(interaction) {
    const { TRACKER_MINING_FILE, updateMiningEmbed } = require('../index.js');

    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle('⛏️ Mining Stats')
      .setDescription('Setting up... No stats yet!')
      .setColor(0x2ecc71)
      .setFooter({ text: 'Last Updated: Just now' })
      .setTimestamp();

    const msg = await interaction.channel.send({ embeds: [embed] });
    fs.writeFileSync(TRACKER_MINING_FILE, JSON.stringify({ channelId: interaction.channel.id, messageId: msg.id }, null, 2));
    await updateMiningEmbed(msg);

    await interaction.editReply({ content: `✅ Mining stats embed set!\n${msg.url}` });
  }
};