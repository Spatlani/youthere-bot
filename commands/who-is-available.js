const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const utils = require('../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('who-is-available')
    .setDescription('Check which team members are currently available'),
  
  async execute(interaction) {
    const availableUsers = utils.getCurrentlyAvailableUsers();
    
    if (availableUsers.length === 0) {
      return interaction.reply('No team members are currently available.');
    }
    
    const embed = new EmbedBuilder()
      .setTitle('Currently Available Team Members')
      .setColor(0x00FF00)
      .setDescription('The following team members are currently working:')
      .setTimestamp();
    
    for (const user of availableUsers) {
      embed.addFields({
        name: user.username,
        value: `Local time: ${user.localTime} (${user.timezone})`,
        inline: true
      });
    }
    
    await interaction.reply({ embeds: [embed] });
  },
};