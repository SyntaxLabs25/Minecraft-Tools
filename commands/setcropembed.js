const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setcropsembed')
    .setDescription('Set up the crop tracker embed in this channel')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  async execute(interaction) {
    const { TRACKER_CROPS_FILE, updateEmbed } = require('../index.js');

    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle('🌾 Minecraft Crop Tracker')
      .setDescription('Setting up tracker... No crops yet!')
      .setColor(0x2ecc71)
      .setFooter({ text: 'Last Updated: Just now' })
      .setTimestamp();

    const message = await interaction.channel.send({ embeds: [embed] });

    // Save message info
    const tracker = {
      channelId: interaction.channel.id,
      messageId: message.id
    };
    fs.writeFileSync(TRACKER_CROPS_FILE, JSON.stringify(tracker, null, 2));

    await updateEmbed(message, 'crops'); // Initial update

    await interaction.editReply({ content: `✅ Crop tracker embed set! Use crop commands to update it.\nMessage: ${message.url}` });
  }
};