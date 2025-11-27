const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearjson')
    .setDescription('Clear ALL tracking data (ores, crops, mining, inventory - irreversible!)')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
  async execute(interaction) {
    const { ores, crops, miningStats, defaultOres, defaultCrops, defaultMiningStats, ORES_FILE, CROPS_FILE, MINING_STATS_FILE, TRACKER_ORES_FILE, TRACKER_CROPS_FILE, TRACKER_MINING_FILE, updateEmbed, updateMiningEmbed } = require('../index.js');
    const fs = require('fs');

    // Double confirm buttons (same as before)
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('clear_yes_1').setLabel('Yes').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('clear_no').setLabel('No').setStyle(ButtonStyle.Secondary)
    );

    const msg = await interaction.reply({
      content: '⚠️ Are you sure? This deletes ORES, CROPS, MINING STATS, & ALL USER INVENTORIES forever!',
      components: [row1],
      ephemeral: true,
      fetchReply: true
    });

    const collector1 = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 30000 });
    collector1.on('collect', async i => {
      await i.deferUpdate(); collector1.stop();
      if (i.customId === 'clear_no') return interaction.editReply({ content: '❌ Cancelled.', components: [] });

      // 2nd confirm
      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('clear_yes_2').setLabel('YES, DELETE ALL').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('clear_no').setLabel('No').setStyle(ButtonStyle.Secondary)
      );
      await interaction.editReply({ content: '🔥 FINAL WARNING: Cannot be restored!', components: [row2] });

      const collector2 = msg.createMessageComponentCollector({ filter: i2 => i2.user.id === interaction.user.id, time: 30000 });
      collector2.on('collect', async i2 => {
        await i2.deferUpdate(); collector2.stop();
        if (i2.customId === 'clear_no') return interaction.editReply({ content: '❌ Cancelled.', components: [] });

        // CLEAR ALL
        Object.assign(ores, defaultOres); saveOres(); // Wait, use global saveOres? But since module, use fs
        fs.writeFileSync(ORES_FILE, JSON.stringify(defaultOres, null, 2));
        fs.writeFileSync(CROPS_FILE, JSON.stringify(defaultCrops, null, 2));
        Object.assign(miningStats, defaultMiningStats);
        saveMiningStats();

        // Clear inventories (delete all user files)
        fs.readdirSync(USERS_FOLDER).forEach(file => fs.unlinkSync(path.join(USERS_FOLDER, file)));

        // Update embeds
        [TRACKER_ORES_FILE, TRACKER_CROPS_FILE, TRACKER_MINING_FILE].forEach(trackerFile => {
          const tracker = fs.existsSync(trackerFile) ? JSON.parse(fs.readFileSync(trackerFile)) : null;
          if (tracker?.channelId && tracker.messageId) {
            const ch = interaction.client.channels.cache.get(tracker.channelId);
            if (ch) {
              ch.messages.fetch(tracker.messageId).then(msg => {
                if (trackerFile.includes('ores')) updateEmbed(msg, 'ores');
                else if (trackerFile.includes('crops')) updateEmbed(msg, 'crops');
                else updateMiningEmbed(msg);
              }).catch(() => {});
            }
          }
        });

        await interaction.editReply({ content: '✅ ALL DATA CLEARED! Fresh start. 🧹', components: [] });
      });
      collector2.on('end', () => interaction.editReply({ content: 'Timed out.', components: [] }));
    });
    collector1.on('end', () => interaction.editReply({ content: 'Timed out.', components: [] }));
  }
};