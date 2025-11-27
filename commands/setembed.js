// commands/setembed.js (UPDATED - Requires moved inside execute to fix circular dependency)
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setembed')
    .setDescription('Set up the ore tracker embed in this channel')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  async execute(interaction) {
    const { TRACKER_FILE, updateEmbed } = require('../index.js');

    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle('🪨 Minecraft Ore Tracker')
      .setDescription('Setting up tracker... No ores yet!')
      .setColor(0x2ecc71)
      .setFooter({ text: 'Last Updated: Just now' })
      .setTimestamp();

    const message = await interaction.channel.send({ embeds: [embed] });

    // Save message info
    const tracker = {
      channelId: interaction.channel.id,
      messageId: message.id
    };
    fs.writeFileSync(TRACKER_FILE, JSON.stringify(tracker, null, 2));

    await updateEmbed(message); // Initial update

    await interaction.editReply({ content: `✅ Ore tracker embed set! Use ore commands to update it.\nMessage: ${message.url}` });
  }
};