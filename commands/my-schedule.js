const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const utils = require('../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('my-schedule')
    .setDescription('View your own availability schedule'),
  
  async execute(interaction) {
    const userData = await utils.getUserAvailability(interaction.user.id);
    
    if (!userData) {
      return interaction.reply({
        content: 'You haven\'t set your availability schedule yet. Use `/set-availability` to set it up.',
        ephemeral: true
      });
    }
    
    const userLocalTime = moment().tz(userData.timezone).format('YYYY-MM-DD HH:mm:ss');
    const isAvailable = await utils.isUserCurrentlyAvailable(interaction.user.id);
    
    const embed = new EmbedBuilder()
      .setTitle('Your Availability Schedule')
      .setColor(isAvailable ? 0x00FF00 : 0xFF0000)
      .setDescription(`Current status: ${isAvailable ? '✅ Available' : '❌ Not available'}`)
      .addFields({
        name: 'Your Local Time',
        value: `${userLocalTime} (${userData.timezone})`,
        inline: false
      });
    
    // Add weekly schedule
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of days) {
      const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
      let scheduleText = 'Not available';
      
      if (userData.schedule[day] && userData.schedule[day].length > 0) {
        scheduleText = userData.schedule[day].join(', ');
      }
      
      embed.addFields({
        name: capitalizedDay,
        value: scheduleText,
        inline: true
      });
    }
    
    embed.setFooter({ text: `Last updated: ${new Date(userData.updatedAt).toLocaleString()}` });
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};